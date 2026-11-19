import { LitElement, css, html } from 'lit';
import { ICON } from '../const';

/**
 * InteractionActionEditor - Specialized configuration editor for Home Assistant action definitions.
 * Provides streamlined interface for configuring service calls, entity actions, and navigation commands
 * within TouchpadCard interaction configurations. Supports domain/service selection, entity targeting,
 * and dynamic service data configuration.
 * 
 * Features:
 * - Domain and service selection with auto-completion
 * - Entity targeting and validation
 * - Dynamic service data field generation
 * - Home Assistant action type support
 * - Integrated validation and feedback
 * 
 * @class InteractionActionEditor
 * @extends {LitElement}
 */
export class InteractionActionEditor extends LitElement {
  // Instance fields (declared for TypeScript; assigned at runtime)
  _data: any;
  _domainService: any;
  _entity: any;
  _interactions: any;
  _rawData: any;
  config: any;
  hass: any;
  visible: any;


  // =============================
  // #region STATIC PROPERTIES ===
  // =============================

  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      visible: { type: Boolean },
      _domainService: { type: String, state: true },
      _entity: { type: String, state: true },
      _data: { type: Object, state: true }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        --ha-card-border-radius: 12px;
        --ha-card-box-shadow: var(--ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12));
      }

      .editor-container {
        background: var(--card-background-color, var(--ha-card-background));
        border-radius: var(--ha-card-border-radius);
        box-shadow: var(--ha-card-box-shadow);
        padding: 24px;
        margin: 16px 0;
      }

      .editor-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .editor-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .editor-subtitle {
        font-size: 14px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .close-button {
        --mdc-icon-button-size: 40px;
        --mdc-icon-size: 20px;
      }

      .action-section {
        margin-bottom: 24px;
      }

      .data-section {
        margin-bottom: 16px;
        border-top: 1px solid var(--divider-color);
        padding-top: 24px;
      }

      .action-section-title,
      .data-section-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .form-row {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
      }

      .form-row ha-textfield,
      .form-row ha-select {
        flex: 1;
      }

      .action-fields {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 16px;
      }

      .action-fields ha-textfield {
        width: 100%;
      }

      .actions-table {
        border-radius: 8px;
        overflow: hidden;
        background: var(--card-background-color);
      }

      .table-header {
        display: grid;
        grid-template-columns: 1fr 1fr;
        background: var(--secondary-background-color);
        padding: 12px 16px;
        font-weight: 500;
        font-size: 14px;
        color: var(--primary-text-color);
        border-bottom: 1px solid var(--divider-color);
      }

      .table-header div {
        text-align: center;
      }

      .table-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding: 4px 16px;
        align-items: center;
        gap: 16px;
      }

      .table-row:last-child {
        border-bottom: none;
      }

      .interaction-name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--primary-text-color);
      }

      .interaction-icon {
        --mdc-icon-size: 16px;
        color: var(--secondary-text-color);
      }

      .data-field {
        width: 100%;
      }

      .data-field ha-textfield,
      .data-field ha-textarea {
        width: 100%;
      }

      .config-warning-icon {
        --mdc-icon-size: 16px;
        color: var(--warning-color, #ff9800);
        cursor: pointer;
        opacity: 0.9;
        transition: opacity 120ms ease;
      }

      .config-warning-icon:hover { opacity: 1; }

      .data-wrapper { position: relative; }

      .warning-wrapper {
        position: absolute;
        top: 4px;
        right: 4px;
        display: flex;
        align-items: flex-start;
        z-index: 3;
      }

      .warning-wrapper .config-warning-icon {
        background: var(--card-background-color, rgba(0,0,0,0.45));
        border-radius: 50%;
        padding: 2px;
      }

      .warning-wrapper:hover .yaml-tooltip,
      .warning-wrapper:focus-within .yaml-tooltip {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .yaml-tooltip {
        position: absolute;
        top: 26px;
        right: 0;
        display: inline-block;
        width: auto;
        max-width: 600px; /* safety cap */
        background: var(--ha-card-background, var(--card-background-color, #222));
        color: var(--primary-text-color, #fff);
        font-family: var(--code-font-family, monospace);
        font-size: 12px;
        line-height: 1.25;
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        padding: 6px 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.45);
        white-space: pre;
        opacity: 0;
        transform: translateY(-4px);
        transition: opacity 120ms ease, transform 120ms ease;
        pointer-events: none;
        z-index: 20;
      }

      .yaml-tooltip pre {
        margin: 0;
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
      }

      .data {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 16px;
      }

      .data ha-button {
        flex: 1;
        min-width: 0; /* Allow buttons to shrink */
      }

      /* Clear button distinct caution styling */
      ha-button.clear-button::part(base) {
        background: var(--error-color) !important;
        color: var(--text-primary-color, #fff) !important;
      }

      /* Consistent disabled styling for all buttons in data section */
      .data ha-button[disabled]::part(base) {
        background: var(--disabled-color, var(--divider-color)) !important;
        color: var(--disabled-text-color, #888) !important;
        opacity: 0.6;
      }

      .help-text {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 8px;
        line-height: 1.4;
      }

      .empty-state {
        text-align: center;
        padding: 32px 16px;
        color: var(--secondary-text-color);
      }

      .empty-state ha-icon {
        --mdc-icon-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
    `;
  }

  // #endregion
  // =============================

  // ===========================
  // #region LIFECYCLE HOOKS ===
  // ==========================

  /**
   * Initializes the InteractionActionEditor with default state and available interaction configurations.
   * Sets up internal tracking for domain/service selection, entity targeting, and raw data preservation.
   * 
   * @constructor
   */
  constructor() {
    super();
    this.visible = false;
    this._domainService = '';
    this._entity = '';
    this._data = {};
    // Stores the raw text the user typed for each interaction so we can
    // faithfully restore it when reopening without lossy re-formatting.
    this._rawData = {};
    this._interactions = this._getAvailableInteractions();
    // console.log('InteractionActionEditor: Loaded interactions:', this._interactions);
  }

  /**
   * Handles component connection to the DOM and performs initial configuration setup.
   * Initializes editor state based on current configuration when first mounted.
   * 
   * @override
   */
  connectedCallback() {
    super.connectedCallback();
    this._initializeFromConfig();
  }

  /**
   * Handles property updates and triggers configuration reinitialization when needed.
   * Responds to configuration changes by updating internal state and UI elements.
   * 
   * @param {Map<string, *>} changedProperties - Map of changed properties with previous values
   * @override
   */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('config')) {
      this._initializeFromConfig();
    }
    // Also reinitialize when becoming visible to ensure latest config is loaded
    if (changedProperties.has('visible') && this.visible) {
      this._initializeFromConfig();
    }
    // If config changes while editor is visible, sync the entity field
    if (changedProperties.has('config') && this.visible && this.config) {
      const newEntity = this.config.interactions?.entity || '';
      if (newEntity !== this._entity) {
        this._entity = newEntity;
        this.requestUpdate();
      }
    }
  }

  // #endregion
  // ===========================

  // =================================
  // #region CONFIGURATION METHODS ===
  // ================================

  setConfig(config) {
    this.config = { ...config };
    this._initializeFromConfig();
  }

  /**
   * Initialize editor state from current configuration
   */
  _initializeFromConfig() {
    if (!this.config) return;

    // Extract entity from interactions config - syncs with Default Entity in main form
    this._entity = this.config.interactions?.entity || '';

    // Reset domain service and data
    this._domainService = '';
    this._data = {};
    this._rawData = {};

    // First pass: find the common domain.service and entity from existing actions
    let commonService = '';
    let commonEntity = '';
    let serviceCount = 0;
    let entityCount = 0;

    this._interactions.forEach(interaction => {
      const action = this.config.interactions?.[interaction.category]?.[interaction.actionKey];
      
      if (action) {
        // Handle both old call-service format and new perform-action format
        let serviceValue = '';
        if (action.action === 'call-service' && action.service) {
          serviceValue = action.service;
        } else if (action.action === 'perform-action' && action.perform_action) {
          serviceValue = action.perform_action;
        }

        // Count occurrences of each service
        if (serviceValue) {
          if (!commonService) {
            commonService = serviceValue;
            serviceCount = 1;
          } else if (commonService === serviceValue) {
            serviceCount++;
          }
        }

        // Count occurrences of each entity
        const entityValue = action.target?.entity_id;
        if (entityValue) {
          if (!commonEntity) {
            commonEntity = entityValue;
            entityCount = 1;
          } else if (commonEntity === entityValue) {
            entityCount++;
          }
        }
      }
    });

    // Only set QAC values if we found consistent service and entity across actions
    this._domainService = commonService || '';
    this._entity = commonEntity || '';

    // Second pass: only extract data for interactions that match the common service and entity
    this._interactions.forEach(interaction => {
      const action = this.config.interactions?.[interaction.category]?.[interaction.actionKey];
      
      if (action) {
        // Handle both old call-service format and new perform-action format
        let serviceValue = '';
        if (action.action === 'call-service' && action.service) {
          serviceValue = action.service;
        } else if (action.action === 'perform-action' && action.perform_action) {
          serviceValue = action.perform_action;
        }

        const entityValue = action.target?.entity_id;

        // Only include data if this action matches the common service and entity
        if (serviceValue === this._domainService && entityValue === this._entity && action.data) {
          const serialized = this._serializeDataForInput(action.data);
          this._data[interaction.key] = serialized;
          this._rawData[interaction.key] = serialized;
        }
      }
    });
  }

  /**
   * Get all available interactions from INTERACTION constants
   */
  _getAvailableInteractions() {
    const interactions = [];
    
    // Tap interactions
    [
      { key: 'tap', actionKey: 'tap_action' },
      { key: 'double_tap', actionKey: 'double_tap_action' },
      { key: 'hold', actionKey: 'hold_action' }
    ].forEach(({ key, actionKey }) => {
      interactions.push({
        key: actionKey.replace('_action', ''), // Use base key for actions lookup
        actionKey, // Full action key for config
        label: this._formatInteractionLabel(key),
        icon: ICON[key.toUpperCase()] || ICON.TAP,
        category: 'tap'
      });
    });

    // Linear interactions
    [
      { key: 'up', actionKey: 'up_action' },
      { key: 'down', actionKey: 'down_action' },
      { key: 'left', actionKey: 'left_action' },
      { key: 'right', actionKey: 'right_action' },
      { key: 'up_left', actionKey: 'up_left_action' },
      { key: 'up_right', actionKey: 'up_right_action' },
      { key: 'down_left', actionKey: 'down_left_action' },
      { key: 'down_right', actionKey: 'down_right_action' },
      { key: 'up_2', actionKey: 'up_2_action' },
      { key: 'down_2', actionKey: 'down_2_action' }
    ].forEach(({ key, actionKey }) => {
      interactions.push({
        key: actionKey.replace('_action', ''), // Use base key for actions lookup
        actionKey, // Full action key for config
        label: this._formatInteractionLabel(key),
        icon: ICON[('LINEAR_' + key).toUpperCase()] || ICON.LINEAR,
        category: 'linear'
      });
    });

    // Circular interactions
    [
      { key: 'circular_clockwise', actionKey: 'clockwise_action' },
      { key: 'circular_counterclockwise', actionKey: 'counterclockwise_action' },
      { key: 'double_clockwise', actionKey: 'double_clockwise_action' },
      { key: 'double_counterclockwise', actionKey: 'double_counterclockwise_action' }
    ].forEach(({ key, actionKey }) => {
      interactions.push({
        key: actionKey.replace('_action', ''), // Use base key for actions lookup
        actionKey, // Full action key for config
        label: this._formatInteractionLabel(key),
        icon: ICON[(key === 'double_clockwise' ? 'CIRCULAR_DOUBLE_CLOCKWISE' : key === 'double_counterclockwise' ? 'CIRCULAR_DOUBLE_COUNTERCLOCKWISE' : key.toUpperCase())] || ICON.CIRCULAR,
        category: 'circular'
      });
    });

    // Multi interactions
    [
      { key: 'pinch_in', actionKey: 'pinch_in_action' },
      { key: 'pinch_out', actionKey: 'pinch_out_action' }
    ].forEach(({ key, actionKey }) => {
      interactions.push({
        key: actionKey.replace('_action', ''), // Use base key for actions lookup
        actionKey, // Full action key for config
        label: this._formatInteractionLabel(key),
        icon: ICON[('MULTI_' + key).toUpperCase()] || ICON.MULTI,
        category: 'multi'
      });
    });

    return interactions;
  }

  /**
   * Format interaction key into human readable label
   */
  _formatInteractionLabel(key) {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace('Circular ', '');
  }

  // #endregion
  // =================================

  // ==========================
  // #region EVENT HANDLERS ===
  // ==========================

  _handleDomainServiceChange(ev) {
    this._domainService = ev.detail.value;
    this.requestUpdate();
  }

  _handleEntityChange(ev) {
    this._entity = ev.detail.value;
    this.requestUpdate();
  }

  _handleDataChange(ev) {
    const interaction = ev.target.getAttribute('data-interaction');
    const data = ev.target.value;
    
    this._data = {
      ...this._data,
      [interaction]: data
    };
  this._rawData[interaction] = data; // Persist raw user entry
    this.requestUpdate();
  }

  _handleApply() {
    if (!this._domainService.trim()) {
      // Show error - domain.service is required
      console.warn('InteractionActionEditor: domain.service is required');
      return;
    }

    if (!this._entity.trim()) {
      // Show error - entity is required
      console.warn('InteractionActionEditor: entity is required');
      return;
    }

    // Build the updated config
    const updatedConfig = { ...this.config };
    
    // Ensure interactions structure exists
    if (!updatedConfig.interactions) {
      updatedConfig.interactions = {};
    }

    // Set entity if provided
    if (this._entity.trim()) {
      updatedConfig.interactions.entity = this._entity;
    }

    // Apply data to each interaction
    this._interactions.forEach(interaction => {
      const dataValue = this._data[interaction.key];
      
      // Skip interactions that have conflicting configurations (different service/entity)
      // BUT only if their data field is empty (indicating user wants to preserve existing config)
      const conflict = this._getInteractionConfigConflict(interaction);
      if (conflict && (conflict.reasons.serviceDiff || conflict.reasons.entityDiff) && (!dataValue || !dataValue.trim())) {
        // Skip this interaction - it has a different service or entity and user hasn't provided override data
        return;
      }

      // Ensure category exists
      if (!updatedConfig.interactions[interaction.category]) {
        updatedConfig.interactions[interaction.category] = {};
      }
      
      if (dataValue && dataValue.trim()) {
        // Parse the data value - try to parse as YAML/JSON, otherwise use as raw data
        let parsedData;
        try {
          // Try to parse as JSON first
          parsedData = JSON.parse(dataValue);
        } catch {
          try {
            // Try to parse as YAML-like key: value format
            parsedData = this._parseSimpleYaml(dataValue);
          } catch {
            // If parsing fails, use the raw string as command for backward compatibility
            parsedData = { command: dataValue };
          }
        }

        // Set the action using the correct actionKey
        const actionConfig = {
          action: 'perform-action',
          perform_action: this._domainService,
          data: parsedData,
          target: {
            entity_id: this._entity
          }
        };
        
        updatedConfig.interactions[interaction.category][interaction.actionKey] = actionConfig;
      } else {
        // If data field is empty, remove the action configuration
        delete updatedConfig.interactions[interaction.category][interaction.actionKey];
        
        // Clean up empty category objects
        if (Object.keys(updatedConfig.interactions[interaction.category]).length === 0) {
          delete updatedConfig.interactions[interaction.category];
        }
      }
    });

    // Dispatch config change event
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: updatedConfig },
      bubbles: true,
      composed: true
    }));
    // Keep editor open for further edits; do NOT auto-close.
    // Provide subtle visual feedback by forcing an update (could later add toast/snackbar).
    this.requestUpdate();
  }

  _handleClose() {
    this.visible = false;
    this.dispatchEvent(new CustomEvent('editor-closed', {
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Convert data object back to string format for text input
   */
  _serializeDataForInput(data) {
    if (!data) return '';

    // If data is already a string, return as-is
    if (typeof data === 'string') return data;

    // Convert object to deterministic key: value lines
    if (typeof data === 'object') {
      return Object.entries(data)
        .map(([k,v]) => `${k}: ${v}`)
        .join('\n');
    }
    return String(data);
  }

  /**
   * Parse simple YAML-like input (key: value pairs)
   */
  _parseSimpleYaml(input) {
    const result = {};
    const lines = input.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();
      
      if (key && value) {
        // Try to parse value as number, boolean, or keep as string
        let parsedValue = value;
        if (value === 'true') parsedValue = true;
        else if (value === 'false') parsedValue = false;
        else if (!isNaN(value) && !isNaN(parseFloat(value))) parsedValue = parseFloat(value);
        
        result[key] = parsedValue;
      }
    }
    
    return result;
  }

  _handleClear() {
    this._domainService = '';
    this._entity = '';
    this._data = {};
    this._rawData = {};
    this.requestUpdate();
  }

  /**
   * Reset editor to current configuration state
   */
  _handleReset() {
    this._initializeFromConfig();
    this.requestUpdate();
  }

  /**
   * Check if current editor state matches the saved configuration
   */
  _isAtConfigState() {
    if (!this.config) return true;

    // Check if entity matches config
    const configEntity = this.config.interactions?.entity || '';
    if (this._entity !== configEntity) return false;

    // Check if domain service matches any existing action
    let configService = '';
    this._interactions.forEach(interaction => {
      const action = this.config.interactions?.[interaction.category]?.[interaction.actionKey];
      if (action) {
        if (action.action === 'call-service' && action.service) {
          configService = action.service;
        } else if (action.action === 'perform-action' && action.perform_action) {
          configService = action.perform_action;
        }
      }
    });

    if (this._domainService !== configService) return false;

    // Check if data fields match config (only for non-conflicting interactions or ones with user input)
    for (const interaction of this._interactions) {
      const conflict = this._getInteractionConfigConflict(interaction);
      const hasUserInput = this._data[interaction.key] && this._data[interaction.key].trim();
      
      // Skip interactions that have conflicting configurations AND no user input
      if (conflict && (conflict.reasons.serviceDiff || conflict.reasons.entityDiff) && !hasUserInput) {
        // Skip this interaction - it won't be affected by QAC operations
        continue;
      }

      const action = this.config.interactions?.[interaction.category]?.[interaction.actionKey];
      const currentData = this._data[interaction.key] || '';
      const configData = action?.data ? this._serializeDataForInput(action.data) : '';
      
      if (currentData !== configData) return false;
    }

    return true;
  }

  /**
   * Build conflict object for an interaction if existing config differs from current QAC context.
   * Returns null if no differences; otherwise { yaml, reasons }
   */
  _getInteractionConfigConflict(interaction) {
    const action = this.config?.interactions?.[interaction.category]?.[interaction.actionKey];
    if (!action) return null;

    const currentDataStr = this._data[interaction.key] || '';
    let svc = '';
    if (action.action === 'call-service' && action.service) svc = action.service;
    else if (action.action === 'perform-action' && action.perform_action) svc = action.perform_action;
    const ent = action.target?.entity_id;
    const configDataStr = action.data ? this._serializeDataForInput(action.data) : '';

    const serviceDiff = !!(svc && svc !== this._domainService);
    const entityDiff = !!(ent && ent !== this._entity);
    const dataMissing = !!(configDataStr && !currentDataStr);
    if (!(serviceDiff || entityDiff || dataMissing)) return null;

    // Deterministic YAML lines
    const lines = [];
    lines.push(`${interaction.key}:`);
    lines.push(`  action: ${action.action}`);
    if (svc) lines.push(`  ${action.action === 'call-service' ? 'service' : 'perform_action'}: ${svc}`);
    if (ent) {
      lines.push(`  target:`);
      lines.push(`    entity_id: ${ent}`);
    }
    if (action.data && typeof action.data === 'object' && Object.keys(action.data).length) {
      lines.push('  data:');
      Object.keys(action.data).sort().forEach(k => {
        const v = action.data[k];
        const rendered = typeof v === 'object' ? JSON.stringify(v) : v;
        lines.push(`    ${k}: ${rendered}`);
      });
    }

    return { yaml: lines.join('\n'), reasons: { serviceDiff, entityDiff, dataMissing } };
  }

  /** Render a single interaction row
   * 
  */
  _renderInteractionRow(interaction) {
    const conflict = this._getInteractionConfigConflict(interaction);
    const yaml = conflict ? conflict.yaml : '';
    return html`
      <div class="table-row">
        <div class="interaction-name">
          <ha-icon class="interaction-icon" icon=${interaction.icon}></ha-icon>
          ${interaction.label}
        </div>
        <div class="data-field">
          <div class="data-wrapper ${conflict ? 'has-warning' : ''}">
            <ha-textarea
              label="Data"
              .value=${this._data[interaction.key] || ''}
              data-interaction=${interaction.key}
              @input=${this._handleDataChange}
              rows="2"
              autoValidate="false"
            ></ha-textarea>
            ${conflict ? html`<div class="warning-wrapper">
              <ha-icon
                class="config-warning-icon"
                icon="mdi:alert"
                role="img"
                aria-label="Existing configuration differs"
              ></ha-icon>
              <div class="yaml-tooltip" part="yaml-tooltip">
                <pre>${yaml}</pre>
              </div>
            </div>` : ''}
          </div>
        </div>
      </div>`;
  }

  /**
   * Extract domain from service string (format: "domain.service")
   */
  _getServiceDomain() {
    if (!this._domainService || !this._domainService.includes('.')) {
      return null;
    }
    return this._domainService.split('.')[0];
  }

  /**
   * Checks if all QAC editor fields are empty
   */
  _isAllEmpty() {
    return !this._domainService.trim() &&
           !this._entity.trim() &&
           Object.values(this._data).every(data => !data || !data.trim());
  }

  /**
   * Checks if at least one data field is populated (includes conflicting interactions with user input)
   */
  _hasAtLeastOneData() {
    // Count data fields for interactions that would be affected by QAC operations
    return this._interactions.some(interaction => {
      const conflict = this._getInteractionConfigConflict(interaction);
      const hasUserInput = this._data[interaction.key] && this._data[interaction.key].trim();
      
      // Skip interactions that have conflicting configurations AND no user input
      if (conflict && (conflict.reasons.serviceDiff || conflict.reasons.entityDiff) && !hasUserInput) {
        return false; // Don't count this interaction
      }
      
      return hasUserInput;
    });
  }

  // #endregion
  // ========================

  // =====================
  // #region RENDERING ===
  // =====================

  render() {
    if (!this.visible) return html``;

    return html`
      <div class="editor-container">
        <div class="editor-header">
          <div>
            <div class="editor-title">
              <ha-icon icon="${ICON.QUICK}"></ha-icon>
              Quick Action Editor
            </div>
            <div class="editor-subtitle">
              Configure actions for multiple interactions in one form using a common action and entity. These action → data → entity configurations will overwrite any existing individual interaction configurations in the main card and/or yaml configuration.
            </div>
          </div>
        </div>

        <div class="action-section">
          <div class="action-section-title">
            <ha-icon icon="${ICON.ACTION}"></ha-icon>
            Action Configuration
          </div>
          <div class="help-text">
            The action will target the specified entity for all interactions with a valid data string entered in the form below.
          </div>
          <div class="action-fields">
            <div class="field-container">
              <ha-service-picker
                .label=${"Action"}
                .value=${this._domainService}
                @value-changed=${this._handleDomainServiceChange}
                .hass=${this.hass}
                required
              ></ha-service-picker>
              <div class="help-text">The domain.service (e.g., remote.send_command) that will be performed.</div>
            </div>
            <div class="field-container">
              <ha-entity-picker
                .label=${"Default Entity"}
                .value=${this._entity}
                @value-changed=${this._handleEntityChange}
                .hass=${this.hass}
                .includeDomains=${this._getServiceDomain() ? [this._getServiceDomain()] : undefined}
                required
                allow-custom-entity
              >
              </ha-entity-picker>
              <div class="help-text">The default target entity (e.g., remote.apple_tv). Syncs with the Default Entity field in the main card configuration.</div>
            </div>
          </div>
        </div>

        <div class="data-section">
          <div class="data-section-title">
            <ha-icon icon="${ICON.INTERACTION}"></ha-icon>
            Action Data
          </div>
          <div class="data">
            <ha-button class="clear-button" @click=${this._handleClear} .disabled=${this._isAllEmpty()}>
              Clear All
            </ha-button>
            <ha-button @click=${this._handleReset} .disabled=${this._isAtConfigState()}>
              Reset to Config
            </ha-button>
            <ha-button
              raised
              @click=${this._handleApply}
              .disabled=${!this._domainService.trim() || !this._entity.trim() || !this._hasAtLeastOneData() || this._isAtConfigState()}
            >
              Update Config
            </ha-button>
          </div>
          ${this._renderDataTable()}
        </div>
      </div>
    `;
  }

  _renderDataTable() {
    if (this._interactions.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon icon="${ICON.INTERACTION}"></ha-icon>
          <div>No interactions available</div>
        </div>
      `;
    }
    return html`
      <div class="data-table">
        <div class="help-text">
          Enter the data to send with the action for each interaction. Place a single key: value pair (e.g., command: select, brightness_pct: 80) on each line. An empty data field with an unmatched action and entity in the config will display a ⚠️ to indicate it was configured outside of the Quick Action Editor and will be preserved unless data is entered into that data field and applied.
        </div>
        ${this._interactions.map(i => this._renderInteractionRow(i))}
      </div>
    `;
  }

  // #endregion
  // =====================
}
