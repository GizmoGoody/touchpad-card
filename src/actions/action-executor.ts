/**
 * ActionExecutor - Home Assistant action execution engine for TouchpadCard interactions.
 * Handles translation of detected gestures into Home Assistant service calls, entity actions,
 * navigation commands, and other HA integrations. Provides comprehensive error handling,
 * entity resolution, and action validation.
 * 
 * Features:
 * - Full Home Assistant action type support
 * - Entity resolution with fallback handling
 * - Service call validation and execution
 * - Navigation and URL action processing
 * - Error handling with user feedback
 * - Debug logging and performance tracking
 * 
 * @class ActionExecutor
 */
export class ActionExecutor {
  // Instance fields (declared for TypeScript; assigned at runtime)
  card: any;
  config: any;
  debugLogger: any;


  /**
   * Initializes the ActionExecutor with card instance reference and configuration access.
   * Establishes connections to card configuration, debug logging, and Home Assistant instance.
   * 
   * @param {TouchpadCard} cardInstance - Parent TouchpadCard instance with config and HA access
   * @constructor
   */
  constructor(cardInstance) {
    this.card = cardInstance;
    this.config = cardInstance.config;
    this.debugLogger = cardInstance.debugLogger;
  }

  /**
   * Primary execution method for translating interaction types into Home Assistant actions.
   * Resolves action configurations, validates targets, and executes appropriate HA commands.
   * 
   * @param {string} interactionType - Detected interaction type (e.g., 'tap', 'circular_clockwise', 'swipe_up')
   * @param {Object} [interactionData={}] - Additional interaction context and gesture parameters
   * @param {number} [interactionData.value] - Gesture value for proportional actions
   * @param {Object} [interactionData.position] - Interaction position data
   * @returns {Promise<void>} Promise that resolves when action execution completes
   */
  async executeAction(interactionType, interactionData = {}) {
    try {
      const actionConfig = this._getActionConfig(interactionType);
      
      if (!actionConfig || actionConfig.action === 'none') {
        return;
      }

      // Resolve target entity with fallback to default interactions.entity
      const defaultEntity = this.config?.interactions?.entity;
      const targetEntity = actionConfig.target?.entity_id || actionConfig.entity || defaultEntity;

      await this._executeAction(actionConfig, targetEntity);

    } catch (error) {
      this._logError(interactionType, error);
      this._showErrorNotification(interactionType, error);
    }
  }

  /**
   * Executes actions without logging
   * @param {string} interactionType - Type of interaction (e.g., 'tap', 'circular_clockwise')
   * @param {Object} interactionData - Additional interaction data
   */
  async executeActionOnly(interactionType, interactionData = {}) {
    try {
      const actionConfig = this._getActionConfig(interactionType);
      
      if (!actionConfig || actionConfig.action === 'none') {
        return;
      }

      // Resolve target entity with fallback to default interactions.entity
      const defaultEntity = this.config?.interactions?.entity;
      const targetEntity = actionConfig.target?.entity_id || actionConfig.entity || defaultEntity;

      await this._executeAction(actionConfig, targetEntity);

    } catch (error) {
      this._logError(interactionType, error);
      this._showErrorNotification(interactionType, error);
    }
  }

  /**
   * Gets action configuration directly from config
   * @param {string} interactionType - Type of interaction
   * @returns {Object|null} Action configuration or null
   */
  _getActionConfig(interactionType) {
    const actionMap = {
      // Tap interactions
      'tap': this.config?.interactions?.tap?.tap_action,
      'double_tap': this.config?.interactions?.tap?.double_tap_action,
      'hold': this.config?.interactions?.tap?.hold_action,
      
      // Linear interactions
      'left': this.config?.interactions?.linear?.left_action,
      'right': this.config?.interactions?.linear?.right_action,
      'up': this.config?.interactions?.linear?.up_action,
      'down': this.config?.interactions?.linear?.down_action,
      'up_left': this.config?.interactions?.linear?.up_left_action,
      'up_right': this.config?.interactions?.linear?.up_right_action,
      'down_left': this.config?.interactions?.linear?.down_left_action,
      'down_right': this.config?.interactions?.linear?.down_right_action,
      'up_2': this.config?.interactions?.linear?.up_2_action,
      'down_2': this.config?.interactions?.linear?.down_2_action,
      
      // Circular interactions
      'circular_clockwise': this.config?.interactions?.circular?.clockwise_action,
      'circular_counterclockwise': this.config?.interactions?.circular?.counterclockwise_action,
      'double_clockwise': this.config?.interactions?.circular?.double_clockwise_action,
      'double_counterclockwise': this.config?.interactions?.circular?.double_counterclockwise_action,
      
      // Multi-touch interactions
      'pinch_in': this.config?.interactions?.multi?.pinch_in_action,
      'pinch_out': this.config?.interactions?.multi?.pinch_out_action
    };

    return actionMap[interactionType] || null;
  }

  /**
   * Executes a Home Assistant action
   * @param {Object} actionConfig - Action configuration
   * @param {string} targetEntity - Target entity ID
   */
  async _executeAction(actionConfig, targetEntity) {
    const actionType = actionConfig.action || 'none';
    const defaultEntity = this.config?.interactions?.entity;

    switch (actionType) {
      case 'toggle':
        // For toggle, prefer the card's default entity when available
        {
          const effectiveEntity = defaultEntity || targetEntity;
          if (!effectiveEntity) throw new Error('Toggle action requires a target entity');
          await this.card.hass.callService('homeassistant', 'toggle', { entity_id: effectiveEntity });
        }
        break;

      case 'more-info':
        // For more-info, prefer the card's default entity when available
        {
          const effectiveEntity = defaultEntity || targetEntity;
          if (!effectiveEntity) throw new Error('More-info action requires a target entity');
          this.card.dispatchEvent(new CustomEvent('hass-more-info', {
            detail: { entityId: effectiveEntity }, bubbles: true, composed: true
          }));
        }
        break;

      case 'navigate':
        const path = actionConfig.navigation_path;
        if (!path) throw new Error('Navigate action requires navigation_path');
        window.history.pushState(null, '', path);
        this.card.dispatchEvent(new CustomEvent('location-changed', {
          detail: { replace: false }, bubbles: true, composed: true
        }));
        break;

      case 'url':
        const url = actionConfig.url_path || actionConfig.url;
        if (!url) throw new Error('URL action requires url_path');
        window.open(url, '_blank');
        break;

      case 'call-service':
      case 'service':
        const service = actionConfig.service;
        if (!service) throw new Error('Service action requires service name');
        
        const [domain, serviceName] = service.split('.');
        if (!domain || !serviceName) throw new Error(`Invalid service format: ${service}`);
        
        let serviceData = { ...(actionConfig.service_data || {}) };
        if (targetEntity && !serviceData.entity_id) {
          serviceData.entity_id = targetEntity;
        }
        
        await this.card.hass.callService(domain, serviceName, serviceData);
        break;

      case 'perform-action':
        const performAction = actionConfig.perform_action;
        if (!performAction) throw new Error('perform-action requires perform_action field');
        
        const [performDomain, performService] = performAction.split('.');
        if (!performDomain || !performService) throw new Error(`Invalid perform_action format: ${performAction}`);
        
        let performData = { ...(actionConfig.data || {}) };
        const performTarget = actionConfig.target || {};
        
        // Add target entity if specified and not already in data
        if (targetEntity && !performData.entity_id && !performTarget.entity_id) {
          performData.entity_id = targetEntity;
        }
        
        await this.card.hass.callService(performDomain, performService, performData, performTarget);
        break;

      case 'none':
        // Do nothing
        break;

      default:
        throw new Error(`Unsupported action type: ${actionType}`);
    }
  }

  /**
   * Logs action errors
   */
  _logError(interactionType, error) {
    if (!this.debugLogger?.enabled) return;
    this.debugLogger.log('error', `❌ Action Error [${interactionType}]: ${error.message}`);
  }

  /**
   * Shows error notification to user
   */
  _showErrorNotification(interactionType, error) {
    const title = `Touchpad Card Action Failed`;
    const message = `${interactionType.replace(/_/g, ' ')} action failed: ${error.message}`;

    this.card.hass.callService('persistent_notification', 'create', {
      title, message, notification_id: `touchpad_card_error_${Date.now()}`
    }).catch(err => console.error('[TouchpadCard] Failed to show notification:', err));
  }

  /**
   * Cleanup method
   */
  cleanup() {
    // Nothing to cleanup
  }

}
