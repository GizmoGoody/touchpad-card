import { LitElement, html } from 'lit';
import { ActionExecutor } from '../actions/action-executor';
import { cardStyles } from './styles';
import { INTERACTION, TOUCHPAD } from '../const';
import { DebugLogger } from '../debug/debug-logger';
import { FeedbackVisualizer } from '../debug/feedback-visualizer';
import { InteractionRouter } from '../gestures/interaction-router';
import { PointerHandler } from '../gestures/pointer-handler';
import { ElementCache, configCache, rafBatcher } from '../performance';
import { getClampedNumber, getInteractions } from '../utils';

/**
 * TouchpadCard - A custom Home Assistant card with configurable header, touchpad, and overlays. Supports dynamic styling, text, and overlay content from input_text helper, and extensive interaction tuning and configuration using Home Assisting action handling.
 */
export class TouchpadCard extends LitElement {
  // Instance fields (declared for TypeScript; assigned at runtime)
  actionExecutor: any;
  config: any;
  debugLogger: any;
  elementCache: any;
  feedbackVisualizer: any;
  hass: any;
  interactionRouter: any;
  pointerHandler: any;
  resizeObserver: any;


  // =========================================
  // #region STATIC PROPERTIES & CONSTANTS ===
  // =========================================

  /**
   * Defines reactive properties for the LitElement component.
   * These properties trigger re-renders when changed and are used for data binding.
   * 
   * @returns {Object.<string, {type: Function}>} Property definitions with type constructors
   * @static
   */
  static get properties() {
    return {
      /** Home Assistant instance providing entity states and services */
      hass: { type: Object },
      /** Card configuration object containing all settings and options */
      config: { type: Object },
    };
  }

  /**
   * Returns the custom card editor element for Home Assistant UI integration.
   * This enables visual configuration of the card in the Home Assistant interface.
   * 
   * @returns {HTMLElement} The card editor custom element
   * @static
   */
  static getConfigElement() {
    return document.createElement('touchpad-card-editor');
  }
  
  /**
   * Returns a minimal stub configuration for the card picker preview in Home Assistant.
   * This configuration is used to show a representative preview when selecting the card type.
   * 
   * @returns {Object} Basic configuration object for preview rendering
   * @static
   */
  static getStubConfig() {
    return {
      masonry_rows: 4,
      touchpad: {
      },
    };
  }

  /**
   * Defines CSS styles for the card component
   * @returns {CSSResult}
   */
  static get styles() {
    return cardStyles;
  }
  
  // #endregion
  // =========================================

  // ========================================
  // #region LITELEMENT LIFECYCLE METHODS ===
  // ========================================

  /**
   * Called after the first render of the component. Sets up observers, initializes styling,
   * and configures the interaction system for touch/mouse input handling.
   * Observers are used to react to layout changes and update styles accordingly.
   * 
   * @returns {void}
   * @override
   */
  firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    
    // Initialize element cache for performance optimization
    this.elementCache = new ElementCache(this.renderRoot);
    
    // Initialize critical systems immediately
    this.initializeResizeObserver();
    
    // Batch style updates with RAF immediately (critical for layout)
    rafBatcher.schedule(() => {
      this.updateAllDynamicStyles();
    });

    // Initialize interaction system immediately for responsiveness
    // Removed LAZY_INIT_DELAY to ensure interactions work without delay
    rafBatcher.schedule(() => {
      if (!this.pointerHandler) {
        this.initializeInteractionSystem();
      }
    });
  }

  /**
   * Called when component properties are updated. Refreshes styling and reinitializes
   * systems when configuration changes. Ensures the card adapts to configuration updates
   * and layout changes dynamically.
   * 
   * @param {Map<string, unknown>} changedProperties - Map of changed property names to previous values
   * @returns {void}
   * @override
   */
  updated(changedProperties) {
    super.updated(changedProperties);
    
    // Always run view detection and style updates on any update
    // This ensures Sections preview recalculates when layout changes
    rafBatcher.schedule(() => {
      this.updateAllDynamicStyles();
    });
    
    if (changedProperties.has('config')) {
      // Clear config cache when config changes to ensure fresh lookups
      configCache.clear();
      
      // Update element cache when config changes (in case DOM structure changed)
      this.elementCache?.clear();
      
      // Only reinitialize interaction system if:
      // 1. It was already initialized (pointerHandler exists)
      // 2. The interaction-related config actually changed
      // 3. This is not the initial config setting (oldConfig exists)
      const oldConfig = changedProperties.get('config');
      if (this.pointerHandler && oldConfig && this.hasInteractionConfigChanged(changedProperties)) {
        this.cleanupInteractionSystem();
        // For config changes, initialize immediately since the user is actively configuring
        rafBatcher.schedule(() => {
          this.initializeInteractionSystem();
        });
      }
    }
  }

  /**
   * Compares old and new configuration to determine if interaction-related settings changed.
   * Used to optimize performance by only reinitializing the interaction system when necessary.
   * 
   * @param {Map<string, unknown>} changedProperties - Changed properties map from updated()
   * @returns {boolean} True if interaction configuration has changed, false otherwise
   * @private
   */
  hasInteractionConfigChanged(changedProperties) {
    const oldConfig = changedProperties.get('config');
    const newConfig = this.config;
    
    // If no old config, consider it changed
    if (!oldConfig) return true;
    
    // Compare interaction-related parts of config
    const oldInteractions = JSON.stringify(oldConfig?.interactions || {});
    const newInteractions = JSON.stringify(newConfig?.interactions || {});
    
    return oldInteractions !== newInteractions;
  }

  /**
   * Called when the element is connected (or reconnected) to the DOM.
   * Handles reinitialization after visual editor disconnects/reconnects the component.
   * 
   * @returns {void}
   * @override
   */
  connectedCallback() {
    super.connectedCallback();
    
    // If we have config and hass but no interaction system, and the DOM is ready, reinitialize
    // This handles the case where the visual editor disconnected/reconnected us
    if (this.config && this.hass && !this.pointerHandler) {
      // Check if DOM is rendered before trying to initialize
      const touchpadElement = this.renderRoot?.querySelector('.touchpad') || this.renderRoot?.querySelector('.touchpad-container');
      if (touchpadElement) {
        this.initializeInteractionSystem();
      }
    }
  }

  /**
   * Called when the element is removed from the DOM. Performs cleanup to prevent
   * memory leaks and stops ongoing processes like observers and interaction handlers.
   * 
   * @returns {void}
   * @override
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    
    // Clean up interaction system
    this.cleanupInteractionSystem();
    
    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Clean up config cache periodically (only when components are being destroyed)
    configCache.cleanup();
  }

  // #endregion
  // ========================================

  // =========================================
  // #region CONFIGURATION & SETUP METHODS ===
  // =========================================

  /**
   * Returns the estimated card size for masonry layout calculations.
   * The size is based on the configured number of masonry rows, clamped to valid bounds.
   * 
   * @returns {number} Number of masonry row units this card should occupy
   */
  getCardSize() {
    // Resolve masonry rows from config.masonry_rows
    const configuredRows = this.config?.masonry_rows;
    const rows = getClampedNumber(
      configuredRows !== undefined ? configuredRows : TOUCHPAD.ROWS_DEFAULT,
      TOUCHPAD.ROWS_MIN,
      TOUCHPAD.ROWS_MAX
    );
    return rows ?? TOUCHPAD.ROWS_DEFAULT;
  }

  /**
   * Returns grid layout configuration options for sections view layout.
   * Defines the available grid size constraints and defaults for the card.
   * 
   * @returns {Object} Grid layout options with row/column constraints
   * @returns {number} returns.rows - Default number of rows
   * @returns {number} returns.min_rows - Minimum allowed rows
   * @returns {number} returns.max_rows - Maximum allowed rows  
   * @returns {number} returns.columns - Default number of columns
   * @returns {number} returns.min_columns - Minimum allowed columns
   * @returns {number} returns.max_columns - Maximum allowed columns
   */
  getGridOptions() {
    return {
      rows: TOUCHPAD.ROWS_DEFAULT,
      min_rows: TOUCHPAD.ROWS_MIN,
      max_rows: TOUCHPAD.ROWS_MAX,
      columns: TOUCHPAD.SECTION_COLUMNS_DEFAULT,
      min_columns: TOUCHPAD.SECTION_COLUMNS_MIN,
      max_columns: TOUCHPAD.SECTION_COLUMNS_MAX,
    };
  }

  /**
   * Sets and validates the card configuration. This is the primary method for
   * updating the card's configuration and is called by Home Assistant during setup.
   * 
   * @param {Object} config - The card configuration object from Home Assistant
   * @returns {void}
   * @throws {Error} When configuration validation fails (future enhancement)
   */
  setConfig(config) {
    // Future: Add validation here if needed
    // if (!config.interactions.entity) {
    //   throw new Error("You need to define an entity");
    // }
    this.config = config;
  }

  // #endregion
  // =========================================

  // ==================================
  // #region INITIALIZATION METHODS ===
  // ==================================

  /**
   * Sets up ResizeObserver to monitor layout changes and trigger style updates.
   * The observer watches the touchpad container for size changes and schedules
   * style recalculations to maintain proper appearance across different layouts.
   * 
   * @returns {void}
   * @private
   */
  initializeResizeObserver() {
    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        rafBatcher.schedule(() => {
          this.updateAllDynamicStyles();
        });
      });

      // Use element cache for efficient element access
      const touchpadContainerElement =
        this.elementCache?.get('.touchpad-container') ||
        this.renderRoot.querySelector('.touchpad-container');
      if (touchpadContainerElement) {
        this.resizeObserver.observe(touchpadContainerElement);
      }
    }
  }

  /**
   * Updates all dynamic CSS styles that depend on element dimensions or layout context.
   * This includes responsive sizing, view-specific adjustments, and configuration-driven styling.
   * 
   * @returns {void}
   * @private
   */
  updateAllDynamicStyles() {
    this.setConfigCSSVariables();
  }

  /**
   * Initializes the comprehensive interaction system including pointer handling,
   * gesture recognition, action execution, and visual feedback. This is the core
   * system that enables all touch/mouse interactions on the touchpad.
   * 
   * @returns {void}
   * @private
   */
  initializeInteractionSystem() {
    // Use element cache with fallback selectors for efficient touchpad element access
    const touchpadElement = this.elementCache?.getWithFallback('.touchpad', '.touchpad-container') ||
                           this.renderRoot?.querySelector('.touchpad') ||
                           this.renderRoot?.querySelector('.touchpad-container');
    
    if (!touchpadElement) {
      console.warn('[TouchpadCard] Touchpad element not found for interaction initialization');
      return;
    }

    // Initialize debug logger
    this.debugLogger = new DebugLogger(this.config);

    // Initialize action executor
    this.actionExecutor = new ActionExecutor(this);

    // Initialize feedback visualizer
    this.feedbackVisualizer = new FeedbackVisualizer(this.renderRoot, this.config);

    // Initialize interaction router
    this.interactionRouter = new InteractionRouter(this.config, {
      onInteractionRecognized: this.handleInteractionRecognized.bind(this),
      onActionExecute: this.handleActionExecution.bind(this)
    });

    // Initialize pointer handler
    this.pointerHandler = new PointerHandler(touchpadElement, {
      onPointerStart: this.interactionRouter.onPointerStart.bind(this.interactionRouter),
      onPointerMove: this.interactionRouter.onPointerMove.bind(this.interactionRouter),
      onPointerEnd: this.interactionRouter.onPointerEnd.bind(this.interactionRouter)
    });

  }

  /**
   * Handles recognized interactions by providing visual feedback and preparing interaction data for logging.
   * Called by the InteractionRouter when gestures are successfully detected and classified.
   * 
   * @param {string} interactionType - The type of interaction recognized (e.g., 'tap', 'circular_clockwise')
   * @param {Object} interactionData - Additional data about the interaction (duration, distance, angle, etc.)
   * @returns {void}
   * @private
   */
  handleInteractionRecognized(interactionType, interactionData) {
    // Always show visual feedback for all interactions
    this.feedbackVisualizer.showInteractionFeedback(interactionType, interactionData);
    
  // For continuous interactions, only log when completed
  const isLinearContinuous = Object.keys(INTERACTION.LINEAR).includes(interactionType) && interactionData?.incrementCount > 0;
  const isCircularContinuous = Object.keys(INTERACTION.CIRCULAR).includes(interactionType) && interactionData?.incrementCount > 0;
  const isMultiContinuous = false; // current multi pinch is discrete
  const isContinuousInteraction = isLinearContinuous || isCircularContinuous || isMultiContinuous;
    if (isContinuousInteraction && !interactionData?.completed) {
      return; // Skip logging intermediate continuous interaction events
    }

    // Log all interactions (with or without actions) using a unified logging approach
    this._prepareInteractionLog(interactionType, interactionData);
  }

  /**
   * Prepare interaction data for logging
   * @param {string} interactionType - The type of interaction
   * @param {Object} interactionData - Additional data about the interaction
   */
  _prepareInteractionLog(interactionType, interactionData) {
    if (!this.debugLogger?.enabled) return;

    const actionConfig = this.actionExecutor?._getActionConfig(interactionType);

    let finalTargetEntity = null;
    let isDefault = false;

    if (actionConfig) {
      if (actionConfig.entity) {
        finalTargetEntity = actionConfig.entity;
      } else if (actionConfig.target?.entity_id) {
        finalTargetEntity = actionConfig.target.entity_id;
      } else if (this.config?.interactions?.entity) {
        finalTargetEntity = this.config.interactions.entity;
        isDefault = true;
      }

      // For 'more-info' and 'toggle', always display the default entity when available
      const actionType = (actionConfig.action || '').toLowerCase();
      if ((actionType === 'more-info' || actionType === 'toggle') && this.config?.interactions?.entity) {
        finalTargetEntity = this.config.interactions.entity;
        isDefault = true;
      }
    }

    const logData = {
      pointer: {
        duration: this._calculatePointerDuration(interactionType, interactionData),
        length: this._calculatePointerLength(interactionType, interactionData),
        type: interactionData.pointerType || 'unknown',
        pointers: interactionData.pointers || 'unknown'
      },
      interaction: {
        type: interactionType,
        mode: this.getInteractionMode(interactionType),
        angle: interactionData.angle || null,
        distance: interactionData.distance || null,
        ...interactionData
      },
      action: actionConfig || { action: 'none' },
      target: {
        entity: finalTargetEntity,
        isDefault,
        display: finalTargetEntity || 'none'
      }
    };

    this.debugLogger.logInteraction(logData);
  }

  /**
   * Get interaction mode from INTERACTION constants
   * @param {string} interactionType - The type of interaction
   * @returns {string} The mode ('discrete', 'continuous', or 'unknown')
   */
  getInteractionMode(interactionType) {
    const allInteractions = getInteractions();
    const interactionDef = allInteractions[interactionType];
  return interactionDef?.mode || 'unknown';
  }

  /**
   * Calculate pointer duration for movement interactions
   * @param {string} interactionType - The type of interaction
   * @param {Object} interactionData - The interaction data
   * @returns {number|null} Duration in milliseconds, rounded
   */
  _calculatePointerDuration(interactionType, interactionData) {
    // Always include duration for movement interactions (non-tap categories)
    if (interactionData.duration) {
      return interactionData.duration;
    }

    // For tap and double_tap interactions, duration is N/A
    if (['tap', 'double_tap'].includes(interactionType)) {
      return null;
    }

    // For hold interactions, duration is meaningful and should be reported
    if (interactionType === 'hold') {
      // Hold duration is calculated from pointer down to timer expiration
      if (interactionData.duration) {
        return interactionData.duration;
      }
      return null;
    }

    // For other interactions without duration data, return null
    return null;
  }

  /**
   * Calculate pointer length based on interaction type
   * @param {string} interactionType - The type of interaction
   * @param {Object} interactionData - The interaction data
   * @returns {string|number|null} Length or angle sweep measurement appropriate for interaction type
   */
  _calculatePointerLength(interactionType, interactionData) {
    // For tap interactions, length is N/A
    if (['tap', 'double_tap', 'hold'].includes(interactionType)) {
      return null;
    }

    // For linear interactions: distance from pointer down to pointer up
    const linearTypes = Object.keys(INTERACTION.LINEAR);
    if (linearTypes.includes(interactionType)) {
      return interactionData.distance || null;
    }

    // For circular interactions: total angular sweep in degrees
    const circularTypes = Object.keys(INTERACTION.CIRCULAR);
    if (circularTypes.includes(interactionType)) {
      return interactionData.angularSweep || null;
    }

    // For multi-touch interactions (pinch): distance at start and end
    const multiTypes = Object.keys(INTERACTION.MULTI);
    if (multiTypes.includes(interactionType)) {
      if (interactionData.startDistance !== undefined && interactionData.endDistance !== undefined) {
        return {
          startDistance: interactionData.startDistance,
          endDistance: interactionData.endDistance
        };
      } else if (interactionData.change !== undefined) {
        return { change: interactionData.change };
      }
      return null;
    }

    // Default: return distance if available
    return interactionData.distance ? Math.round(interactionData.distance) : null;
  }

  /**
   * Handles action execution for recognized interactions
   * @param {string} interactionType - The type of interaction
   * @param {Object} interactionData - Additional data about the interaction
   */
  handleActionExecution(interactionType, interactionData) {
    if (!this.actionExecutor) {
      console.warn('[TouchpadCard] ActionExecutor not initialized');
      return;
    }

    // Execute the action asynchronously to avoid blocking the UI
    // Note: Logging is handled in handleInteractionRecognized to ensure consistent logging
    this.actionExecutor.executeActionOnly(interactionType, interactionData)
      .catch(error => {
        console.error('[TouchpadCard] Action execution failed:', error);
      });
  }

  /**
   * Cleans up the interaction system
   * @returns {void}
   */
  cleanupInteractionSystem() {
    // if (this.debugLogger) {
    //   this.debugLogger.log('info', 'Cleaning up interaction system');
    // }

    if (this.pointerHandler) {
      this.pointerHandler.cleanup();
      this.pointerHandler = null;
    }

    if (this.interactionRouter) {
      this.interactionRouter.cleanup();
      this.interactionRouter = null;
    }

    if (this.actionExecutor) {
      this.actionExecutor.cleanup();
      this.actionExecutor = null;
    }

    if (this.feedbackVisualizer) {
      this.feedbackVisualizer.cleanup();
      this.feedbackVisualizer = null;
    }

    // Clean up performance optimization systems
    if (this.elementCache) {
      this.elementCache.clear();
      this.elementCache = null;
    }

    // if (this.debugLogger) {
    //   this.debugLogger.log('info', 'Interaction system cleaned up');
    //   this.debugLogger = null;
    // }
  }

  // #endregion
  // ==================================

  // =================================
  // #region CSS & STYLING METHODS ===
  // =================================

  /**
   * Applies CSS variables for all touchpad styling in a unified manner
   * @param {HTMLElement} touchpadElement - The touchpad element
   * @param {DOMRect} touchpadRectangle - The touchpad's bounding rectangle
   * @param {Object} touchpad - The touchpad config
   * @param {Object} text - The text config
   * @param {Object} icon - The icon config
   * @param {Object} image - The image config
   * @returns {void}
   */
  _applyCSSVariables(touchpadElement, touchpadRectangle, touchpad, text, icon, image) {
    // === TOUCHPAD STYLES ===
    const touchpadColor = typeof touchpad.color === 'string' ? touchpad.color : null;
    if (touchpadColor) {
      this.style.setProperty('--touchpad-card-config-touchpad-color', touchpadColor);
      this.style.setProperty('--touchpad-card-config-touchpad-opacity', this._getOpacity(touchpad.opacity));
    } else {
      this.style.removeProperty('--touchpad-card-config-touchpad-color');
      this.style.setProperty('--touchpad-card-config-touchpad-opacity', this._getOpacity(touchpad.opacity));
    }

    // touchpad.blend: Use config value or auto-set based on the configuration of a custom touchpad color
    // const blendMode = touchpad.blend || (touchpad.color ? 'normal' : 'overlay');
    // this.style.setProperty('--touchpad-card-touchpad-blend-mode', blendMode);

    // touchpad.margin
    const touchpadMargin = getClampedNumber(touchpad.margin, TOUCHPAD.MARGIN_MIN, TOUCHPAD.MARGIN_MAX);
    if (touchpadMargin !== undefined) {
      let marginValue;
      if (this.config?.header?.enabled) {
        marginValue = `0px ${touchpadMargin}% ${touchpadMargin}% ${touchpadMargin}%`;
      } else {
        marginValue = `${touchpadMargin}%`;
      }
      this.style.setProperty('--touchpad-card-config-touchpad-margin', marginValue);
    } else {
      this.style.removeProperty('--touchpad-card-config-touchpad-margin');
    }

    // === BORDER STYLES ===
    // touchpad.border.width
    const borderPercent = getClampedNumber(touchpad.border?.width, TOUCHPAD.BORDER_WIDTH_MIN, TOUCHPAD.BORDER_WIDTH_MAX);
    if (borderPercent !== undefined) {
      const minDimension = Math.min(touchpadRectangle.width, touchpadRectangle.height);
      const borderWidth = (borderPercent / TOUCHPAD.SCALE_FACTOR) * (minDimension / 2);
      this.style.setProperty('--touchpad-card-config-touchpad-border-width', `${borderWidth}px`);
    } else {
      this.style.removeProperty('--touchpad-card-config-touchpad-border-width');
    }

    // TOUCHPAD BORDER RADIUS (calculated dynamically using the touchpad margin % and referencing the --ha-card-border-radius CSS variable, accounting for header)
    const haCard = this.renderRoot.querySelector('ha-card');
    const cardBorderRadius = parseFloat(getComputedStyle(haCard).borderRadius);
    let borderRadiusValue;
    if (touchpadMargin !== undefined && !isNaN(cardBorderRadius)) {
      const touchpadBorderRadius = cardBorderRadius * (1 - touchpadMargin / TOUCHPAD.SCALE_FACTOR);
      if (this.config?.header?.enabled) {
        borderRadiusValue = `0px 0px ${touchpadBorderRadius}px ${touchpadBorderRadius}px`;
      } else {
        borderRadiusValue = `${touchpadBorderRadius}px`;
      }
      this.style.setProperty('--touchpad-card-config-touchpad-border-radius', borderRadiusValue);
    } else {
      this.style.removeProperty('--touchpad-card-config-touchpad-border-radius');
    }

    // touchpad.border.color and .opacity (single token)
    const borderColor = typeof touchpad.border?.color === 'string' ? touchpad.border.color : null;
    if (borderColor) {
      const borderOpacity = this._getOpacity(touchpad.border?.opacity);
      const combined = this._combineToRGBA(borderColor, borderOpacity);
      if (combined) {
        this.style.setProperty('--touchpad-card-config-touchpad-border-color', combined);
      } else {
        this.style.removeProperty('--touchpad-card-config-touchpad-border-color');
      }
    } else {
      this.style.removeProperty('--touchpad-card-config-touchpad-border-color');
    }

    // === ICON STYLES ===
    // touchpad.overlay.graphics.icon.scale
    const iconScalePercent = getClampedNumber(icon.scale, TOUCHPAD.ICON_SCALE_MIN, TOUCHPAD.ICON_SCALE_MAX);
    if (iconScalePercent !== undefined) {
      this.style.setProperty('--touchpad-card-config-touchpad-icon-scale', `${iconScalePercent}%`);
    } else {
      this.style.removeProperty('--touchpad-card-config-touchpad-icon-scale');
    }

    // touchpad.overlay.graphics.icon.color and .opacity (separate)
    const iconColor = typeof icon.color === 'string' ? icon.color : null;
    if (iconColor) {
      this.style.setProperty('--touchpad-card-config-touchpad-icon-color', iconColor);
    } else {
      this.style.removeProperty('--touchpad-card-config-touchpad-icon-color');
    }
    if (iconColor) {
      this.style.setProperty('--touchpad-card-config-touchpad-icon-opacity', this._getOpacity(icon.opacity));
    } else {
      this.style.setProperty('--touchpad-card-config-touchpad-icon-opacity', this._getOpacity(icon.opacity));
    }

    // === IMAGE STYLES ===
    // touchpad.overlay.graphics.image.scale
    const imageScalePercent = getClampedNumber(image.scale, TOUCHPAD.IMAGE_SCALE_MIN, TOUCHPAD.IMAGE_SCALE_MAX);
    if (imageScalePercent !== undefined) {
      this.style.setProperty('--touchpad-card-config-touchpad-image-scale', `${imageScalePercent}%`);
    } else {
      this.style.removeProperty('--touchpad-card-config-touchpad-image-scale');
    }

    // touchpad.overlay.graphics.image.opacity
    this.style.setProperty('--touchpad-card-config-touchpad-image-opacity', this._getOpacity(image.opacity));

    // touchpad.overlay.text.color and .opacity
    const textColor = typeof text?.color === 'string' ? text.color : null;
    if (textColor) {
      this.style.setProperty('--touchpad-card-config-touchpad-text-color', textColor);
    } else {
      this.style.removeProperty('--touchpad-card-config-touchpad-text-color');
    }
    if (textColor) {
      this.style.setProperty('--touchpad-card-config-touchpad-text-opacity', this._getOpacity(text?.opacity));
    } else {
      this.style.setProperty('--touchpad-card-config-touchpad-text-opacity', this._getOpacity(text?.opacity));
    }
  }

  /**
   * Sets default CSS variables for configuration fallbacks
   * @returns {void}
   */
  _setTouchpadDefaults() {
    this.style.setProperty('--touchpad-card-default-margin', `${TOUCHPAD.MARGIN_DEFAULT}%`);
    this.style.setProperty('--touchpad-card-default-border-width', `${TOUCHPAD.BORDER_WIDTH_DEFAULT}px`);
    this.style.setProperty('--touchpad-card-default-icon-scale', `${TOUCHPAD.ICON_SCALE_DEFAULT}%`);
    this.style.setProperty('--touchpad-card-default-image-scale', `${TOUCHPAD.IMAGE_SCALE_DEFAULT}%`);
    this.style.setProperty('--touchpad-card-default-opacity', (TOUCHPAD.OPACITY_DEFAULT / 100).toString());
  }

  /**
   * Converts and sets JavaScript config objects to CSS variables for dynamic styling
   * @returns {void}
   */
  setConfigCSSVariables() {
    // Set default CSS variables first
    this._setTouchpadDefaults();

    // Use element cache for efficient DOM access
    const touchpadElement = this.elementCache?.get('.touchpad') || this.renderRoot.querySelector('.touchpad');
    if (!touchpadElement) return; // Exit if touchpad element not found
    
    const touchpadRectangle = touchpadElement.getBoundingClientRect();

    // JavaScript config object branches
    const touchpad = this.config.touchpad ?? {};
    const overlay = touchpad.overlay ?? {};
    const graphics = overlay.graphics ?? {};
    const text = overlay.text ?? {};
    const icon = graphics.icon ?? {};
    const image = graphics.image ?? {};

    this._applyCSSVariables(touchpadElement, touchpadRectangle, touchpad, text, icon, image);

    // ===== View detection and masonry sizing =====
    const inMasonry = this._isInView('HUI-MASONRY-VIEW');
    const inSections = this._isInView('HUI-SECTION');
    const preferMasonry = inMasonry || !inSections; // prefer Masonry if both/unknown

    // Clamp effective rows and row height
    const configuredRows = this.config?.masonry_rows;
    const rows = getClampedNumber(
      configuredRows !== undefined ? configuredRows : TOUCHPAD.ROWS_DEFAULT,
      TOUCHPAD.ROWS_MIN,
      TOUCHPAD.ROWS_MAX
    ) ?? TOUCHPAD.ROWS_DEFAULT;

    // Row height uses a single constant; do not clamp. Allow config override if provided.
    const configuredRowHeight = this.config?.touchpad?.masonry_row_height;
    const rowHeight = (configuredRowHeight !== undefined && !isNaN(Number(configuredRowHeight)))
      ? Number(configuredRowHeight)
      : TOUCHPAD.MASONRY_ROW_HEIGHT;

  // Resolve effective view: prefer Masonry when both/none are detected
  const isSectionsEffective = inSections && !inMasonry;
  const isMasonryEffective = !isSectionsEffective; // default to Masonry

  // Toggle host classes
  this.classList.toggle('sections-view', isSectionsEffective);
  this.classList.toggle('masonry-view', isMasonryEffective);

    // Always set base variables
    this.style.setProperty('--touchpad-card-masonry-rows', String(rows));
    this.style.setProperty('--touchpad-card-masonry-row-height', String(rowHeight));

    // Set min-height only for Masonry or unknown (safe default)
    if (isMasonryEffective) {
      const minHeightPx = rows * rowHeight;
      this.style.setProperty('--touchpad-card-masonry-min-height', `${minHeightPx}px`);
    } else {
      // Ensure no min-height in Sections view
      this.style.removeProperty('--touchpad-card-masonry-min-height');
    }
  }

  /**
   * Detects whether the card is placed within a given HA view element by traversing shadow roots
   * @param {string} tagName - Uppercase tag name to search for, e.g., 'HUI-MASONRY-VIEW' or 'HUI-SECTION'
   * @returns {boolean}
   */
  _isInView(tagName) {
    let node: any = this;
    const upper = String(tagName || '').toUpperCase();
    try {
      while (node) {
        // Walk host chain across shadow DOM
        const root = node.getRootNode?.();
        const host = root?.host;
        const parent = node.parentElement || host || null;
        // Check current element and host
        const elToCheck = node === this ? host : node;
        if (elToCheck && elToCheck.tagName && String(elToCheck.tagName).toUpperCase() === upper) {
          return true;
        }
        node = parent;
      }
    } catch (_) {
      // Fail-safe: if traversal fails, assume not in this view
    }
    return false;
  }

  // #endregion
  // =================================

  // ===========================
  // #region UTILITY METHODS ===
  // ===========================

  /**
   * Retrieves the opacity value as a decimal string for CSS usage.
   * Handles null/undefined values by returning the default opacity.
   * 
   * @param {number|null|undefined} value - Opacity percentage value from configuration (0-100)
   * @returns {string} Opacity as decimal string (0-1 range) for CSS
   * @private
   */
  _getOpacity(value) {
    const clamped = getClampedNumber(value, TOUCHPAD.OPACITY_MIN, TOUCHPAD.OPACITY_MAX);
    if (clamped === undefined) {
      return (TOUCHPAD.OPACITY_DEFAULT / 100).toString();
    }
    return (clamped / 100).toString();
  }

  /**
   * Combines a color string with an opacity value to create an RGBA color string.
   * Supports RGB, RGBA, HEX, and named colors, converting all to RGBA format.
   * 
   * @param {string} colorString - CSS color value (rgb, rgba, hex, or named color)
   * @param {string} opacityString - Opacity as decimal string (0-1 range)
   * @returns {string} RGBA color string, or empty string if parsing fails
   * @private
   */
  _combineToRGBA(colorString, opacityString) {
    if (!colorString || !opacityString || typeof colorString !== 'string') return '';
    const rgb = colorString.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    const rgba = colorString.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9]*\.?[0-9]+)\s*\)$/i);
    if (rgba) return `rgba(${rgba[1]}, ${rgba[2]}, ${rgba[3]}, ${opacityString})`;
    if (rgb) return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${opacityString})`;
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colorString.trim())) {
      const hex = colorString.trim();
      let r, g, b;
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } else {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
      }
      return `rgba(${r}, ${g}, ${b}, ${opacityString})`;
    }
    const parsed = this._parseToRGB(colorString);
    if (parsed) {
      return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${opacityString})`;
    }
    return '';
  }

  /**
   * Parses any CSS color string to RGB values using browser's color parsing.
   * Creates a temporary DOM element to leverage the browser's native color parsing capabilities.
   * 
   * @param {string} colorString - Any valid CSS color string
   * @returns {Object|null} RGB object with r, g, b properties, or null if parsing fails
   * @returns {number} returns.r - Red component (0-255)
   * @returns {number} returns.g - Green component (0-255) 
   * @returns {number} returns.b - Blue component (0-255)
   * @private
   */
  _parseToRGB(colorString) {
    try {
      const el = document.createElement('span');
      el.style.color = 'transparent';
      el.style.color = colorString;
      (this.renderRoot || document.body).appendChild(el);
      const computed = getComputedStyle(el).color;
      el.remove();
      const rgba = computed.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9]*\.?[0-9]+)\)$/i);
      if (rgba) return { r: parseInt(rgba[1], 10), g: parseInt(rgba[2], 10), b: parseInt(rgba[3], 10) };
      const rgb = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
      if (rgb) return { r: parseInt(rgb[1], 10), g: parseInt(rgb[2], 10), b: parseInt(rgb[3], 10) };
      return null;
    } catch (_) {
      return null;
    }
  }

  /**
   * Retrieves display text for the touchpad overlay from input_text entity or configuration default.
   * Prioritizes the dynamic entity state over the configured default text.
   * Automatically converts \n escape sequences to actual line breaks for multiline display.
   * 
   * @returns {string} Text to display on the touchpad overlay with processed line breaks
   */
  getDisplayText() {
    // Overlay text is now nested under touchpad.overlay.text
    const overlayText = this.config?.touchpad?.overlay?.text ?? {};
    const configText = overlayText.default ?? '';

    // Use the selected input_text entity if provided
    const textEntity = overlayText.entity;
    let entityState = undefined;
    if (textEntity && this.hass?.states[textEntity]) {
      entityState = this.hass.states[textEntity].state;
    }

    let finalText = '';
    if (entityState !== undefined && entityState !== null && entityState.trim() !== '') {
      finalText = entityState;
    } else {
      finalText = configText;
    }

    // Convert \n escape sequences to actual line breaks
    // Also handle \r\n and \r for broader compatibility
    return finalText.replace(/\\n/g, '\n').replace(/\\r\\n/g, '\n').replace(/\\r/g, '\n');
  }

  /**
   * Retrieves graphics icon for the touchpad overlay from input_text entity or configuration default.
   * Prioritizes the dynamic entity state over the configured default icon.
   * 
   * @returns {string|null} Icon identifier string, or null if no icon is configured
   */
  getGraphicIcon() {
    const graphics = this.config?.touchpad?.overlay?.graphics ?? {};
    const iconConfig = graphics.icon ?? {};
    const configIcon = iconConfig.default;
    // Use the selected input_text entity if provided
    const iconEntity = iconConfig.entity;
    let entityState = undefined;
    if (iconEntity && this.hass?.states[iconEntity]) {
      entityState = this.hass.states[iconEntity].state;
    }
    if (entityState !== undefined && entityState !== null && entityState.trim() !== '') {
      return entityState;
    }
    return configIcon;
  }

  /**
   * Cleans interaction data for logging by removing coordinates and timestamps
   * @param {Object} interactionData - Raw interaction data
   * @returns {Object} Cleaned interaction data safe for logging
   */
  cleanInteractionDataForLogging(interactionData) {
    if (!interactionData || typeof interactionData !== 'object') return interactionData;
    
    const cleaned = { ...interactionData };
    
    // Remove position-related objects that contain coordinates/timestamps
    delete cleaned.position;
    delete cleaned.endPosition;
    delete cleaned.center;
    
    // Remove timing data that's only needed for visual feedback, not logging
    delete cleaned.timeSinceLastAction;
    delete cleaned.minInterval;
    
    // For objects that might contain nested position data, clean those too
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] && typeof cleaned[key] === 'object') {
        // Remove x, y, timestamp from any nested objects
        if (cleaned[key].x !== undefined) delete cleaned[key].x;
        if (cleaned[key].y !== undefined) delete cleaned[key].y;
        if (cleaned[key].timestamp !== undefined) delete cleaned[key].timestamp;
      }
    });
    
    return cleaned;
  }

  // #endregion
  // ===========================

  // ==========================
  // #region RENDER METHODS ===
  // ==========================

  /**
   * Renders the complete card interface including optional header and main touchpad area.
   * Uses Lit-html templating to create reactive DOM structure that updates based on configuration changes.
   * 
   * @returns {import('lit').TemplateResult} Complete card template with header, touchpad, feedback, and text overlay
   * @override
   */
  render() {

    // Header configuration
    const header = this.config?.header ?? {};
    const headerEnabled = header.enabled;
    const headerIcon = header.icon;
    const headerName = header.name ?? '';

    // Touchpad configuration
    const touchpadText = this.getDisplayText();

    return html`
      <ha-card role="region" aria-label="Touchpad Card">
        <div class="background" aria-labelledby="info"> <ha-ripple aria-hidden="true" disabled=""></ha-ripple>
        </div>

        ${headerEnabled ? html`
          <div class="header" role="banner" aria-label="Card Header">
            <div class="content">
              ${headerIcon ? html`
                <div class="icon-container">
                  <ha-icon icon="${headerIcon}"></ha-icon>
                </div>
              ` : ''}
              ${headerName ? html`<ha-info>${headerName}</ha-info>` : ''}
            </div>
          </div>
        ` : ''}
        <div class="touchpad-container">
          <div class="touchpad" role="group" aria-label="Touchpad area">
            <ha-ripple aria-hidden="true"></ha-ripple>
            ${this.renderGraphics()}
          </div>
          ${this.config?.interactions?.debugging?.feedback ? html`
            <div class="feedback-container">
              <div class="feedback">
                <div class="continuous-row">
                  <div class="counter-badge action-counter"></div>
                  <div class="rate-limit-bar">
                    <div class="rate-limit-bar-fill"></div>
                  </div>
                  <div class="counter-badge increment-counter"></div>
                </div>
                <ha-icon id="feedback-icon" icon=""></ha-icon>
                <div class="angle-text"></div>
              </div>
            </div>
          ` : ''}
          
          <div class="touchpad-text" aria-label="Touchpad text">
            ${touchpadText}
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * Renders graphics content (icons and/or images) for the touchpad overlay based on configuration.
   * Supports multiple graphics modes: none, icon only, image only, or both icon and image.
   * 
   * @returns {import('lit').TemplateResult} Graphics overlay template or empty template if no graphics
   * @private
   */
  renderGraphics() {
    const graphics = this.config?.touchpad?.overlay?.graphics ?? {};
    const graphicsMode = graphics.mode;
    if (!graphicsMode || graphicsMode === 'none') {
      return html``;
    }
    const graphicsIcon = this.getGraphicIcon();
    const image = graphics.image ?? {};
    return html`
      <div class="graphics-container">
        ${(graphicsMode === 'icon' || graphicsMode === 'both') && graphicsIcon ? html`
          <ha-icon class="graphics-icon" icon="${graphicsIcon}"></ha-icon>
        ` : ''}
        ${(graphicsMode === 'image' || graphicsMode === 'both') && image.image ? html`
          <img class="graphics-image" src="${image.image}" alt="Graphics Image" />
        ` : ''}
      </div>
    `;
  }

  // #endregion
  // ==========================

}
