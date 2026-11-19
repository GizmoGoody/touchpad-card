import { LitElement, css, html } from 'lit';
import { ICON, INTERACTION, TOUCHPAD } from '../const';

/**
 * TouchpadCardEditor - Visual configuration editor for the Touchpad Card
 * Provides dynamic form-based configuration interface for Home Assistant
 */
export class TouchpadCardEditor extends LitElement {
  // Instance fields (declared for TypeScript; assigned at runtime)
  _debouncedConfigChange: any;
  _showActionEditor: any;
  config: any;
  hass: any;


  // =================================
  // #region CONSTANTS & SELECTORS ===
  // =================================

  static BOOLEAN_SELECTOR = { boolean: {} };
  static TEXT_SELECTOR = { text: {} };
  static TEXT_MULTILINE_SELECTOR = { text: { multiline: true } };
  static ICON_SELECTOR = { icon: {} };
  static IMAGE_SELECTOR = { image: { debounce: 1000 } };
  static ENTITY_SELECTOR = { entity: {} };
  static INPUT_TEXT_ENTITY_SELECTOR = { entity: { domain: "input_text" } };
  static UI_ACTION_SELECTOR = { 'ui_action': { default_action: 'none' } };
  static UI_COLOR_SELECTOR = { 'ui_color': { include_none: true } };

  // #endregion
  // =================================

  // =============================
  // #region STATIC PROPERTIES ===
  // =============================

  /**
   * Defines reactive properties for the card editor component.
   * These properties enable data binding and trigger re-renders when values change.
   *
   * @returns {Object.<string, {type: Function, state?: boolean}>} Property definitions with types and state flags
   * @static
   */
  static get properties() {
    return {
      /** Home Assistant instance for entity/service access */
      hass: { type: Object },
      /** Current card configuration being edited */
      config: { type: Object },
      /** Internal state for action editor visibility */
      _showActionEditor: { type: Boolean, state: true }
    };
  }

  /**
   * Cache for memoized schema generation to improve editor performance.
   * Stores generated form schemas to avoid recalculation on repeated renders.
   *
   * @type {Map<string, Array>}
   * @static
   * @private
   */
  static _schemaCache = new Map();

  // #endregion
  // =============================

  // ===========================
  // #region LIFECYCLE HOOKS ===
  // ===========================

  constructor() {
    super();
    this._showActionEditor = false;
  }

  // #endregion
  // ==========================

  // =================================
  // #region CONFIGURATION METHODS ===
  // =================================

  /**
   * Sets the editor configuration and initializes internal state.
   *
   * @param {Object} config - Card configuration object to edit
   * @returns {void}
   */
  setConfig(config) {
    this.config = { ...config };
  }

  /**
   * Initializes debounced configuration change handler to prevent excessive updates.
   * Creates a debounced function that delays config updates to improve performance
   * when users are actively typing or making rapid changes.
   *
   * @returns {void}
   * @override
   */
  connectedCallback() {
    super.connectedCallback();

    // Create debounced version of config change handler
    this._debouncedConfigChange = this._debounce((config) => {
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config },
          bubbles: true,
          composed: true,
        })
      );
    }, 800); // 800ms delay for config changes
  }

  /**
   * Simple debounce utility function to limit function execution frequency.
   *
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds before execution
   * @returns {Function} Debounced function that delays execution
   * @private
   */
  _debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Returns dynamic configuration schema based on current config state.
   * Uses memoization to cache schemas and improve rendering performance.
   *
   * @param {Object} [config={}] - Current card configuration
   * @returns {Array.<Object>} Configuration schema for ha-form component
   * @static
   */
  static getConfigSchema(config: any = {}) {
    const cacheKey = this._generateCacheKey(config);

    if (this._schemaCache.has(cacheKey)) {
      return this._schemaCache.get(cacheKey);
    }

    const schema = [
      // Root-level layout configuration
      this.createField(
        "masonry_rows",
        `Masonry Rows (${TOUCHPAD.ROWS_DEFAULT})`,
        { number: { min: TOUCHPAD.ROWS_MIN, max: TOUCHPAD.ROWS_MAX, step: 1 } },
        ICON.TOUCHPAD,
        `Masonry view rows (${TOUCHPAD.ROWS_MIN}-${TOUCHPAD.ROWS_MAX}).`
      ),
      ...this.getAppearanceSchema(config),
      ...this.getInteractionSchemas()
    ];

    this._schemaCache.set(cacheKey, schema);
    return schema;
  }

  /**
   * Generates a cache key from the configuration object for schema memoization.
   * Only includes properties that affect schema generation to minimize cache misses.
   *
   * @param {Object} [config={}] - Configuration object to generate key from
   * @returns {string} Stable cache key string for schema lookup
   * @static
   * @private
   */
  static _generateCacheKey(config: any = {}) {
    const relevantConfig = {
      header: config.header,
      touchpad: {
        overlay: {
          graphics: {
            mode: config.touchpad?.overlay?.graphics?.mode
          }
        }
      },
      interactions: {
        debug: config.interactions?.debugging?.logging
      }
    };
    return JSON.stringify(relevantConfig);
  }

  /**
   * Clears the schema cache to force regeneration on next access.
   * Useful when config structure changes significantly and cached schemas become invalid.
   *
   * @returns {void}
   * @static
   */
  static clearSchemaCache() {
    this._schemaCache.clear();
  }

  // #endregion
  // =================================

  // =====================================
  // #region SCHEMA GENERATION HELPERS ===
  // =====================================

  /**
   * Creates a number selector configuration with percentage unit and range constraints.
   *
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @returns {Object} Home Assistant number selector configuration
   * @static
   */
  static createPercentSelector(min, max) {
    return { number: { unit_of_measurement: "%", min, max, step: 1 } };
  }

  /**
   * Creates a standardized expandable section schema object for grouping related fields.
   *
   * @param {string} name - Internal name/key for the expandable section
   * @param {string} title - Display title shown to users
   * @param {string} icon - Material Design icon identifier
   * @param {Array.<Object>} schema - Array of field schemas contained within this section
   * @returns {Object} Expandable section schema for ha-form
   * @static
   */
  static createExpandable(name, title, icon, schema) {
    return { type: "expandable", name, title, icon, schema };
  }

  /**
   * Creates a standardized field schema object for ha-form components.
   * Provides consistent structure for form fields with optional icon and description.
   *
   * @param {string} name - Field name/key for configuration storage
   * @param {string} label - User-visible label for the field
   * @param {Object} selector - Home Assistant form selector object (e.g., { number: {...} }, { boolean: {} })
   * @param {string} [icon] - Optional Material Design icon name
   * @param {string} [description] - Optional helper text/description shown under the field
   * @returns {Object} Standardized field schema object for ha-form
   * @static
   */
  static createField(name, label, selector, icon?, description?) {
    const field: any = { name, label, selector };
    if (icon) field.icon = icon;
    if (description) field.helper = description;
    return field;
  }

  /**
   * Determines whether header configuration fields should be displayed.
   *
   * @param {Object} config - Current card configuration
   * @returns {boolean} True if header is enabled and fields should be shown
   * @static
   */
  static shouldShowHeaderFields(config) {
    return config.header?.enabled === true;
  }

  /**
   * Determines which graphics expandable sections to include based on the selected graphics mode.
   *
   * @param {Object} config - Current card configuration
   * @returns {Array.<Object>} Array of expandable schema objects for graphics configuration
   * @static
   */
  static getGraphicsExpandables(config) {
    const graphicsMode = config.touchpad?.overlay?.graphics?.mode;
    return this.GraphicsModeStrategy[graphicsMode]?.() || [];
  }

  /**
   * Strategy pattern mapping graphics modes to their corresponding expandable sections.
   * Provides a clean way to determine which configuration sections are relevant.
   *
   * @type {Object.<string, Function>}
   * @static
   */
  static GraphicsModeStrategy = {
    "icon": () => [this.getIconExpandable()],
    "image": () => [this.getImageExpandable()],
    "both": () => [this.getIconExpandable(), this.getImageExpandable()],
    "none": () => []
  };

  /**
   * Factory method to create conditional schema
   * @param {Array} baseSchema - Base schema fields
   * @param {Array} conditions - Array of { condition: Function, action: Function }
   * @returns {Array} Combined schema
   */
  static createConditionalSchema(baseSchema, conditions) {
    const schema = [...baseSchema];
    conditions.forEach(({ condition, action }) => {
      if (condition()) {
        schema.push(...action());
      }
    });
    return schema;
  }

  // #endregion
  // =====================================

  // =====================================
  // #region APPEARANCE SCHEMA METHODS ===
  // =====================================

  /**
   * Generates the appearance configuration schema containing header and touchpad settings.
   * Creates expandable sections for organizing visual appearance options in the configuration UI.
   *
   * @param {Object} config - Current card configuration for conditional field visibility
   * @returns {Array.<Object>} Appearance schema containing header and touchpad expandable sections
   * @static
   */
  static getAppearanceSchema(config) {
    return [
      this.createExpandable("header", "Header", ICON.HEADER, this.getHeaderSchema(config)),
      this.createExpandable("touchpad", "Touchpad", ICON.TOUCHPAD, this.getTouchpadSchema(config))
    ];
  }

  /**
   * Generates header configuration schema with fields that adapt based on card configuration.
   * Controls visibility and icon selection options for the card header area.
   *
   * @param {Object} config - Current card configuration for conditional field visibility
   * @returns {Array.<Object>} Header-specific schema fields including title, icon, and state options
   * @static
   */
  static getHeaderSchema(config) {
    return this.createConditionalSchema(
      [this.createField("enabled", "Header", this.BOOLEAN_SELECTOR)],
      [
        {
          condition: () => this.shouldShowHeaderFields(config),
          action: () => [
            this.createField("icon", "Icon", this.ICON_SELECTOR),
            this.createField("name", "Name", this.TEXT_SELECTOR)
          ]
        }
      ]
    );
  }

  /**
   * Generates comprehensive touchpad configuration schema including visual styling and interaction areas.
   * Creates configuration fields for masonry layout, colors, opacity, margins, borders, and overlay content.
   *
   * @param {Object} config - Current card configuration for conditional overlay field generation
   * @returns {Array.<Object>} Complete touchpad schema with appearance controls and expandable sections
   * @static
   */
  static getTouchpadSchema(config) {
    return [
      this.createField("color", "Color", this.UI_COLOR_SELECTOR),
      this.createField("opacity", `Opacity (${TOUCHPAD.OPACITY_DEFAULT}%)`, this.createPercentSelector(TOUCHPAD.OPACITY_MIN, TOUCHPAD.OPACITY_MAX)),
      this.createField("margin", `Margin (${TOUCHPAD.MARGIN_DEFAULT}%)`, this.createPercentSelector(TOUCHPAD.MARGIN_MIN, TOUCHPAD.MARGIN_MAX)),
      this.createExpandable("border", "Border", ICON.BORDER, this.getBorderSchema()),
      this.createExpandable("overlay", "Overlay", ICON.OVERLAY, this.getOverlaySchema(config))
    ];
  }

  /**
   * Generates border configuration schema with styling options for touchpad boundaries.
   * Provides controls for border width, color, opacity, and style properties.
   *
   * @returns {Array.<Object>} Border schema fields for width, color, opacity, and style configuration
   * @static
   */
  static getBorderSchema() {
    return [
      this.createField("width", `Width (${TOUCHPAD.BORDER_WIDTH_DEFAULT}%)`, this.createPercentSelector(TOUCHPAD.BORDER_WIDTH_MIN, TOUCHPAD.BORDER_WIDTH_MAX)),
      this.createField("color", "Color", this.UI_COLOR_SELECTOR),
      this.createField("opacity", `Opacity (${TOUCHPAD.OPACITY_DEFAULT}%)`, this.createPercentSelector(TOUCHPAD.OPACITY_MIN, TOUCHPAD.OPACITY_MAX))
    ];
  }

  /**
   * Generates overlay configuration schema with text and graphics content options.
   * Creates expandable sections for organizing text overlays and graphical elements.
   *
   * @param {Object} config - Current card configuration for conditional graphics options
   * @returns {Array.<Object>} Overlay schema with expandable text and graphics sections
   * @static
   */
  static getOverlaySchema(config) {
    return [
      this.getTextExpandable(),
      this.createExpandable("graphics", "Graphics", ICON.GRAPHICS, this.getGraphicsSchema(config))
    ];
  }

  /**
   * Creates an expandable text configuration section for overlay text styling.
   * Provides comprehensive text appearance controls including entity binding, colors, and opacity.
   *
   * @returns {Object} Expandable text configuration section with entity, styling, and display options
   * @static
   */
  static getTextExpandable() {
    return this.createExpandable("text", "Text", ICON.TEXT, [
      this.createField("entity", "Entity", this.INPUT_TEXT_ENTITY_SELECTOR),
      this.createField("default", "Default", this.TEXT_MULTILINE_SELECTOR),
      this.createField("color", "Color", this.UI_COLOR_SELECTOR),
      this.createField("opacity", `Opacity (${TOUCHPAD.OPACITY_DEFAULT}%)`, this.createPercentSelector(TOUCHPAD.OPACITY_MIN, TOUCHPAD.OPACITY_MAX))
    ]);
  }

  /**
   * Generates graphics configuration schema with dynamic mode selection and conditional icon/image options.
   * Creates mode selector and conditionally displays icon or image expandables based on graphics mode.
   *
   * @param {Object} config - Current card configuration to determine which graphics options to show
   * @returns {Array.<Object>} Graphics schema with mode selector and conditional expandable sections
   * @static
   */
  static getGraphicsSchema(config) {
    const schema = [this.getGraphicsModeSelector()];
    schema.push(...this.getGraphicsExpandables(config));
    return schema;
  }

  /**
   * Creates a graphics mode selector field for choosing between icon and image display modes.
   * Provides dropdown selection for different graphics rendering options.
   *
   * @returns {Object} Graphics mode selector field configuration with icon/image options
   * @static
   */
  static getGraphicsModeSelector() {
    return this.createField("mode", "Graphics Mode", {
      select: {
        options: [
          { value: "none", label: "None" },
          { value: "icon", label: "Icon" },
          { value: "image", label: "Image" },
          { value: "both", label: "Both" }
        ],
        mode: "dropdown"
      }
    });
  }

  /**
   * Creates an expandable icon configuration section for icon overlay styling.
   * Provides comprehensive icon controls including entity binding, scaling, colors, and opacity.
   *
   * @returns {Object} Expandable icon configuration section with entity, appearance, and scaling options
   * @static
   */
  static getIconExpandable() {
    return this.createExpandable("icon", "Icon", ICON.ICON, [
      this.createField("entity", "Entity", this.INPUT_TEXT_ENTITY_SELECTOR),
      this.createField("default", "Default", this.ICON_SELECTOR),
      this.createField("scale", `Scale (${TOUCHPAD.ICON_SCALE_DEFAULT}%)`, this.createPercentSelector(TOUCHPAD.ICON_SCALE_MIN, TOUCHPAD.ICON_SCALE_MAX)),
      this.createField("color", "Color", this.UI_COLOR_SELECTOR),
      this.createField("opacity", `Opacity (${TOUCHPAD.OPACITY_DEFAULT}%)`, this.createPercentSelector(TOUCHPAD.OPACITY_MIN, TOUCHPAD.OPACITY_MAX))
    ]);
  }

  /**
   * Creates an expandable image configuration section for image overlay styling.
   * Provides comprehensive image controls including file selection, scaling, and opacity.
   *
   * @returns {Object} Expandable image configuration section with file path, scaling, and opacity options
   * @static
   */
  static getImageExpandable() {
    return this.createExpandable("image", "Image", ICON.IMAGE, [
      this.createField("image", "Path or File", this.IMAGE_SELECTOR),
      this.createField("scale", `Scale (${TOUCHPAD.IMAGE_SCALE_DEFAULT}%)`, this.createPercentSelector(TOUCHPAD.IMAGE_SCALE_MIN, TOUCHPAD.IMAGE_SCALE_MAX)),
      this.createField("opacity", `Opacity (${TOUCHPAD.OPACITY_DEFAULT}%)`, this.createPercentSelector(TOUCHPAD.OPACITY_MIN, TOUCHPAD.OPACITY_MAX))
    ]);
  }

  // #endregion
  // =====================================

  // ======================================
  // #region INTERACTION SCHEMA METHODS ===
  // ======================================

  /**
   * Generates comprehensive interaction configuration schemas for all touch/mouse input types.
   * Creates expandable interaction section containing entity settings and interaction type configurations.
   *
   * @returns {Array.<Object>} Complete interaction schemas with entity selector and interaction sections
   * @static
   */
  static getInteractionSchemas() {
    return [
      this.createExpandable("interactions", "Interactions", ICON.INTERACTION, [
        this.createExpandable("debugging", "Debugging", ICON.FEEDBACK_DEFAULT, [
          this.createField("feedback", "Interaction Feedback", this.BOOLEAN_SELECTOR),
          this.createField("logging", "Developer Console Logging", this.BOOLEAN_SELECTOR),
        ]),
        this.createField("entity", "Default Entity", this.ENTITY_SELECTOR),
        ...this.getInteractionSections()
      ])
    ];
  }

  /**
   * Generates individual interaction sections for different input types (tap, linear, circular, multi).
   * Creates expandable sections for each interaction category with type-specific configuration options.
   *
   * @returns {Array.<Object>} Interaction section schemas for tap, linear, circular, and multi-touch inputs
   * @static
   */
  static getInteractionSections() {
    return [
      this.createInteractionSection(ICON.TAP, "Tap Interactions", this.getTapInteractionSettings()),
      this.createInteractionSection(ICON.LINEAR, "Linear Interactions", this.getLinearInteractionSettings()),
      this.createInteractionSection(ICON.CIRCULAR, "Circular Interactions", this.getCircularInteractionSettings()),
      this.createInteractionSection(ICON.MULTI, "Multi Interactions", this.getMultiInteractionSettings())
    ];
  }

  /**
   * Creates an interaction configuration section with tuning and action settings.
   * Generates expandable section containing sensitivity tuning and individual action configurations.
   *
   * @param {string} icon - Icon identifier for the section header
   * @param {string} title - Display title for the interaction section
   * @param {Array.<Object>} interactionSettings - Array of interaction setting objects with tuning and actions
   * @returns {Object} Expandable section schema with tuning controls and action expandables
   * @static
   */
  static createInteractionSection(icon, title, interactionSettings) {
    const sectionName = this.getSectionName(title);
    const [tuningSetting, ...actionSettings] = interactionSettings;

    return this.createExpandable(sectionName, title, icon, [
      this.createTuningExpandable(tuningSetting, sectionName),
      ...actionSettings.map(setting => this.createActionField(setting))
    ]);
  }

  /**
   * Maps interaction section display titles to internal configuration section names.
   * Provides translation between user-friendly titles and configuration object keys.
   *
   * @param {string} title - Human-readable section title (e.g., "Tap Interactions")
   * @returns {string} Internal section name for configuration storage (e.g., "tap")
   * @static
   */
  static getSectionName(title) {
    const nameMap = {
      'Tap Interactions': 'tap',
      'Linear Interactions': 'linear',
      'Circular Interactions': 'circular',
      'Multi Interactions': 'multi',
    };
    return nameMap[title] || title.toLowerCase().replace(' ', '_');
  }

  /**
   * Creates a tuning expandable section
   * @param {Object} tuningSetting - Tuning setting object
   * @param {string} sectionName - The section name (tap, linear, circular, multi)
   * @returns {Object} Tuning expandable schema
   */
  static createTuningExpandable(tuningSetting, sectionName) {
    if (tuningSetting.key === 'tuning') {
      switch (sectionName) {
        case 'tap':
          return this.createExpandable(tuningSetting.key, tuningSetting.label, tuningSetting.icon, [
            this.createField(
              'timer_double',
              `Double Tap Timer (${INTERACTION.TAP.TIMER_DOUBLE_DEFAULT} ms)`,
              { number: { min: INTERACTION.TAP.TIMER_DOUBLE_MIN, max: INTERACTION.TAP.TIMER_DOUBLE_MAX, step: 10, unit_of_measurement: 'ms' } },
              ICON.TAP_TIMER_DOUBLE,
              INTERACTION.TAP.TIMER_DOUBLE_DESCRIPTION
            ),
            this.createField(
              'timer_hold',
              `Hold Tap Timer (${INTERACTION.TAP.TIMER_HOLD_DEFAULT} ms)`,
              { number: { min: INTERACTION.TAP.TIMER_HOLD_MIN, max: INTERACTION.TAP.TIMER_HOLD_MAX, step: 10, unit_of_measurement: 'ms' } },
              ICON.TAP_TIMER_HOLD,
              INTERACTION.TAP.TIMER_HOLD_DESCRIPTION
            ),
          ]);
        case 'linear':
          return this.createExpandable(tuningSetting.key, tuningSetting.label, tuningSetting.icon, [
            this.createField(
              'threshold',
              `Threshold (${INTERACTION.LINEAR.THRESHOLD_DEFAULT} px)`,
              { number: { min: INTERACTION.LINEAR.THRESHOLD_MIN, max: INTERACTION.LINEAR.THRESHOLD_MAX, step: 1, unit_of_measurement: 'px' } },
              ICON.LINEAR_DISTANCE,
              INTERACTION.LINEAR.THRESHOLD_DESCRIPTION
            ),
            this.createField(
              'timer',
              `Timer (${INTERACTION.LINEAR.TIMER_DEFAULT} ms)`,
              { number: { min: INTERACTION.LINEAR.TIMER_MIN, max: INTERACTION.LINEAR.TIMER_MAX, step: 10, unit_of_measurement: 'ms' } },
              ICON.LINEAR_TIME,
              INTERACTION.LINEAR.TIMER_DESCRIPTION
            ),
            this.createField(
              'tolerance',
              `Tolerance (${INTERACTION.LINEAR.TOLERANCE_DEFAULT} °)`,
              { number: { min: INTERACTION.LINEAR.TOLERANCE_MIN, max: INTERACTION.LINEAR.TOLERANCE_MAX, step: 0.5, unit_of_measurement: '°' } },
              ICON.LINEAR_DIRECTION,
              INTERACTION.LINEAR.TOLERANCE_DESCRIPTION
            ),
            this.createField(
              'increment',
              `Increment (${INTERACTION.LINEAR.INCREMENT_DEFAULT} ms)`,
              { number: { min: INTERACTION.LINEAR.INCREMENT_MIN, max: INTERACTION.LINEAR.INCREMENT_MAX, step: 10, unit_of_measurement: 'ms' } },
              ICON.LINEAR_TIME,
              INTERACTION.LINEAR.INCREMENT_DESCRIPTION
            ),
            this.createField(
              'settled_timer',
              `Settled Timer (${INTERACTION.LINEAR.SETTLED_TIMER_DEFAULT} ms)`,
              { number: { min: INTERACTION.LINEAR.SETTLED_TIMER_MIN, max: INTERACTION.LINEAR.SETTLED_TIMER_MAX, step: 10, unit_of_measurement: 'ms' } },
              ICON.LINEAR_TIME,
              INTERACTION.LINEAR.SETTLED_TIMER_DESCRIPTION
            ),
            this.createField(
              'settled_radius',
              `Settled Zone Radius (${INTERACTION.LINEAR.SETTLED_RADIUS_DEFAULT} px)`,
              { number: { min: INTERACTION.LINEAR.SETTLED_RADIUS_MIN, max: INTERACTION.LINEAR.SETTLED_RADIUS_MAX, step: 1, unit_of_measurement: 'px' } },
              ICON.LINEAR_DISTANCE,
              INTERACTION.LINEAR.SETTLED_RADIUS_DESCRIPTION
            ),
          ]);
        case 'circular':
          return this.createExpandable(tuningSetting.key, tuningSetting.label, tuningSetting.icon, [
            this.createField(
              'threshold_detection',
              `Detection Threshold (${INTERACTION.CIRCULAR.THRESHOLD_DETECTION_DEFAULT}°)`,
              { number: { min: INTERACTION.CIRCULAR.THRESHOLD_DETECTION_MIN, max: INTERACTION.CIRCULAR.THRESHOLD_DETECTION_MAX, step: 1, unit_of_measurement: '°' } },
              ICON.CIRCULAR_DETECTION,
              INTERACTION.CIRCULAR.THRESHOLD_DETECTION_DESCRIPTION
            ),
            this.createField(
              'threshold_initial',
              `Initial Threshold (${INTERACTION.CIRCULAR.THRESHOLD_INITIAL_DEFAULT}°)`,
              { number: { min: INTERACTION.CIRCULAR.THRESHOLD_INITIAL_MIN, max: INTERACTION.CIRCULAR.THRESHOLD_INITIAL_MAX, step: 5, unit_of_measurement: '°' } },
              ICON.CIRCULAR_INITIAL,
              INTERACTION.CIRCULAR.THRESHOLD_INITIAL_DESCRIPTION
            ),
            this.createField(
              'threshold_increment',
              `Increment Threshold (${INTERACTION.CIRCULAR.THRESHOLD_INCREMENT_DEFAULT}°)`,
              { number: { min: INTERACTION.CIRCULAR.THRESHOLD_INCREMENT_MIN, max: INTERACTION.CIRCULAR.THRESHOLD_INCREMENT_MAX, step: 5, unit_of_measurement: '°' } },
              ICON.CIRCULAR_INCREMENT,
              INTERACTION.CIRCULAR.THRESHOLD_INCREMENT_DESCRIPTION
            ),
            this.createField(
              'rate_action_max',
              `Max Action Rate (${INTERACTION.CIRCULAR.RATE_ACTION_MAX_DEFAULT} actions/sec)`,
              { number: { min: INTERACTION.CIRCULAR.RATE_ACTION_MAX_MIN, max: INTERACTION.CIRCULAR.RATE_ACTION_MAX_MAX, step: 1, unit_of_measurement: '/sec' } },
              ICON.CIRCULAR_INCREMENT,
              INTERACTION.CIRCULAR.RATE_ACTION_MAX_DESCRIPTION
            ),
          ]);
        case 'multi':
          return this.createExpandable(tuningSetting.key, tuningSetting.label, tuningSetting.icon, [
            this.createField(
              'timer',
              `Timer (${INTERACTION.MULTI.TIMER_DEFAULT} ms)`,
              { number: { min: INTERACTION.MULTI.TIMER_MIN, max: INTERACTION.MULTI.TIMER_MAX, step: 10, unit_of_measurement: 'ms' } },
              ICON.MULTI_DISTANCE,
              INTERACTION.MULTI.TIMER_DESCRIPTION
            ),
            this.createField(
              'threshold',
              `Threshold (${INTERACTION.MULTI.THRESHOLD_DEFAULT} px)`,
              { number: { min: INTERACTION.MULTI.THRESHOLD_MIN, max: INTERACTION.MULTI.THRESHOLD_MAX, step: 5, unit_of_measurement: 'px' } },
              ICON.MULTI_DISTANCE,
              INTERACTION.MULTI.THRESHOLD_DESCRIPTION
            ),
            this.createField(
              'ratio',
              `Ratio (${INTERACTION.MULTI.RATIO_DEFAULT})`,
              { number: { min: INTERACTION.MULTI.RATIO_MIN, max: INTERACTION.MULTI.RATIO_MAX, step: 0.1, unit_of_measurement: '' } },
              ICON.MULTI_PRIORITY,
              INTERACTION.MULTI.RATIO_DESCRIPTION
            ),
          ]);
        default:
          return this.createExpandable(tuningSetting.key, tuningSetting.label, tuningSetting.icon, []);
      }
    }
    return this.createExpandable(tuningSetting.key, tuningSetting.label, tuningSetting.icon, []);
  }

  /**
   * Creates an action field with ui_action selector
   * @param {Object} setting - Action setting object
   * @returns {Object} Action field schema
   */
  static createActionField(setting) {
    return this.createField(setting.key, setting.label, this.UI_ACTION_SELECTOR, setting.icon);
  }

  /**
   * Returns tap interaction tuning settings
   * @returns {Array} Tap interaction settings array
   */
  static getTapInteractionSettings() {
    return [
      { key: "tuning", label: "Tuning", icon: ICON.TUNING },
      { key: "tap_action", label: "Tap", icon: ICON.TAP },
      { key: "double_tap_action", label: "Double Tap", icon: ICON.DOUBLE_TAP },
      { key: "hold_action", label: "Hold", icon: ICON.HOLD },
    ];
  }

  /**
   * Returns linear interaction tuning settings
   * @returns {Array} Linear interaction settings array
   */
  static getLinearInteractionSettings() {
    return [
      { key: "tuning", label: "Tuning", icon: ICON.TUNING },
      { key: "up_action", label: "Up", icon: ICON.LINEAR_UP },
      { key: "down_action", label: "Down", icon: ICON.LINEAR_DOWN },
      { key: "left_action", label: "Left", icon: ICON.LINEAR_LEFT },
      { key: "right_action", label: "Right", icon: ICON.LINEAR_RIGHT },
      { key: "up_left_action", label: "Up Left", icon: ICON.LINEAR_UP_LEFT },
      { key: "up_right_action", label: "Up Right", icon: ICON.LINEAR_UP_RIGHT },
      { key: "down_left_action", label: "Down Left", icon: ICON.LINEAR_DOWN_LEFT },
      { key: "down_right_action", label: "Down Right", icon: ICON.LINEAR_DOWN_RIGHT },
      { key: "up_2_action", label: "Up with 2 Fingers", icon: ICON.LINEAR_UP_2 },
      { key: "down_2_action", label: "Down with 2 Fingers", icon: ICON.LINEAR_DOWN_2 },
    ];
  }

  /**
   * Returns circular interaction tuning settings
   * @returns {Array} Circular interaction settings array
   */
  static getCircularInteractionSettings() {
    return [
      { key: "tuning", label: "Tuning", icon: ICON.TUNING },
      { key: "clockwise_action", label: "Clockwise", icon: ICON.CIRCULAR_CLOCKWISE },
      { key: "counterclockwise_action", label: "Counterclockwise", icon: ICON.CIRCULAR_COUNTERCLOCKWISE },
      { key: "double_clockwise_action", label: "Double Tap → Clockwise", icon: ICON.CIRCULAR_DOUBLE_CLOCKWISE },
      { key: "double_counterclockwise_action", label: "Double Tap → Counterclockwise", icon: ICON.CIRCULAR_DOUBLE_COUNTERCLOCKWISE },
    ];
  }

  /**
   * Returns multi-touch interaction tuning settings
   * @returns {Array} Multi-touch interaction settings array
   */
  static getMultiInteractionSettings() {
    return [
      { key: "tuning", label: "Tuning", icon: ICON.TUNING },
      { key: "pinch_in_action", label: "Pinch In", icon: ICON.MULTI_PINCH_IN },
      { key: "pinch_out_action", label: "Pinch Out", icon: ICON.MULTI_PINCH_OUT },
    ];
  }

  // #endregion
  // ======================================

  // ==========================
  // #region EVENT HANDLERS ===
  // ==========================

  /**
   * Computes helper text for form fields
   * @param {Object} schema - Schema field definition
   * @returns {string|undefined} Helper text to display under the field
   */
  _computeHelper = (schema) => {
    return schema.helper || undefined;
  };

  /**
   * Computes label for form fields with localization support
   * @param {Object} schema - Schema field definition
   * @returns {string} Localized or default label
   */
  _computeLabel = (schema) => {
    if (schema.label) return schema.label;

    const name = schema.name || "";
    const localized =
      this.hass?.localize?.(`ui.panel.lovelace.editor.card.generic.${name}`) ||
      this.hass?.localize?.(`ui.panel.lovelace.editor.card.${name}`);

    return localized || (typeof name === "string" ? name : "");
  };

  /**
   * Handles form value changes and dispatches configuration updates with validation and sanitization.
   * Performs automatic cleanup of empty color fields and manages schema cache invalidation.
   *
   * @param {Event} ev - Form value change event from ha-form
   * @param {Object} ev.detail - Event detail containing the updated configuration
   * @param {Object} ev.detail.value - New configuration value
   * @returns {void}
   * @private
   */
  _valueChanged(ev) {
    try {
      if (!ev || !ev.detail) {
        console.warn('TouchpadCardEditor: Invalid event received in _valueChanged');
        return;
      }

      // Work on a copy: the form's value can share nested objects with the saved config
      const config = structuredClone(ev.detail.value ?? {});

      if (typeof config !== 'object') {
        console.error('TouchpadCardEditor: Invalid config type received');
        return;
      }

      const oldCacheKey = this.config ? TouchpadCardEditor._generateCacheKey(this.config) : null;
      const newCacheKey = TouchpadCardEditor._generateCacheKey(config);

      if (oldCacheKey !== newCacheKey) {
        TouchpadCardEditor.clearSchemaCache();
      }

      this._populateDefaultEntityIntoActions(config);

      // Deep-prune empty objects/arrays and blank values so only meaningful keys are saved
      const prunedConfig = TouchpadCardEditor._pruneConfig(config) || {};

      this.config = { ...prunedConfig };

      // Use debounced config change to prevent excessive updates while typing
      this._debouncedConfigChange(this.config);
    } catch (error) {
      console.error('TouchpadCardEditor: Error handling config change:', error);
    }
  }

  /**
   * Automatically populates the default entity into action configurations that lack specific targets.
   * Ensures consistent entity targeting across interactions when a default entity is specified.
   *
   * @param {Object} config - Configuration object to modify in-place
   * @returns {void}
   * @private
   */
  _populateDefaultEntityIntoActions(config) {
    const defaultEntity = config.interactions?.entity;
    if (!defaultEntity) return;

    const interactionCategories = ['tap', 'linear', 'circular', 'multi'];

    interactionCategories.forEach(category => {
      const categoryConfig = config.interactions?.[category];
      if (!categoryConfig) return;

      Object.values(categoryConfig).forEach((actionConfig: any) => {
        if (actionConfig &&
            (actionConfig.action === 'perform-action' || actionConfig.action === 'call-service') &&
            !actionConfig.target?.entity_id &&
            !actionConfig.entity) {

          if (!actionConfig.target) {
            actionConfig.target = {};
          }
          actionConfig.target.entity_id = defaultEntity;
        }
      });
    });
  }

  /**
   * Removes empty objects/arrays and blank values recursively from a config object,
   * while preserving valid falsy primitives (false, 0) and non-empty strings.
   * This keeps the nested structure when it has content, but omits empty skeletons like {}
   * so that only 'type' is required for a minimal saved config.
   * @param {any} value - The value to prune
   * @returns {any} Pruned value, or undefined if empty
   */
  static _pruneConfig(value) {
    // Primitives
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string') return value.trim() === '' ? undefined : value;
    if (typeof value !== 'object') return value; // numbers, booleans, etc.

    // Arrays
    if (Array.isArray(value)) {
      const prunedArr = value
        .map((v) => TouchpadCardEditor._pruneConfig(v))
        .filter((v) => v !== undefined);
      return prunedArr.length > 0 ? prunedArr : undefined;
    }

    // Objects
    const result = {};
    for (const [k, v] of Object.entries(value)) {
      const prunedVal = TouchpadCardEditor._pruneConfig(v);
      if (prunedVal !== undefined) {
        result[k] = prunedVal;
      }
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }

  // #endregion
  // ==========================

  // ==========================
  // #region RENDER METHODS ===
  // ==========================

  /**
   * Renders the configuration form
   * @returns {import('lit').TemplateResult} Lit-html template for editor form
   */
  render() {
    if (!this.hass) return html``;
    return html`
      <div class="editor-container">
        <ha-form
          .hass=${this.hass}
          .data=${this.config ?? {}}
          .schema=${TouchpadCardEditor.getConfigSchema(this.config ?? {})}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${this._valueChanged}
        ></ha-form>

        <div class="quick-config-section">
          <ha-button
            outlined
            @click=${this._toggleQuickActionConfig}
            title="Toggle display of the Quick Action Editor"
            class="quick-config-button"
          >
            <ha-icon icon="${ICON.QUICK}"></ha-icon>
            Quick Action Editor
          </ha-button>
        </div>

        ${this._showActionEditor ? html`
          <touchpad-card-quick-action-editor
            .hass=${this.hass}
            .config=${this.config}
            .visible=${this._showActionEditor}
            @config-changed=${this._handleActionEditorConfigChange}
          ></touchpad-card-quick-action-editor>
        ` : ''}
      </div>
    `;
  }

  // #endregion
  // ==========================

  // ===========================
  // #region ACTION EDITOR ===
  // ===========================

  /**
   * Toggles the quick action editor
   */
  _toggleQuickActionConfig() {
    this._showActionEditor = !this._showActionEditor;
    this.requestUpdate();
  }

  /**
   * Handles config changes from the action editor
   */
  _handleActionEditorConfigChange(event) {
    event.stopPropagation();
    const updatedConfig = event.detail.config;

    // Update our config and dispatch the change
    this.config = updatedConfig;

    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: updatedConfig },
      bubbles: true,
      composed: true
    }));
  }

  // #endregion
  // ===========================

  // ===================
  // #region STYLES ===
  // ===================

  static get styles() {
    return css`
      .editor-container {
        position: relative;
      }

      .quick-config-section {
        padding-top: 4px;
      }

      .quick-config-button {
        width: 100%;
        --ha-button-border-radius: 8px;
      }

      .quick-config-button ha-icon {
        --mdc-icon-size: 16px;
        margin-right: 4px;
      }
    `;
  }

  // #endregion
  // ===================

}
