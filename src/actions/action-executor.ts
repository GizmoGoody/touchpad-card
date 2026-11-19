/**
 * ActionExecutor - Runs the configured Home Assistant action for a recognized interaction.
 *
 * Actions are handed to Home Assistant's own action handler through the `hass-action`
 * event, the same path the tile card and other core cards use. Home Assistant then
 * performs the action, including confirmation dialogs, haptics, and error toasts.
 *
 * Before firing, the card's default entity (`interactions.entity`) is applied the same
 * way the card always has:
 * - toggle and more-info use the default entity first, then the action's own target
 * - perform-action and call-service without any target send the entity in the data
 *
 * @class ActionExecutor
 */
export class ActionExecutor {
  card: any;
  config: any;

  /**
   * @param {TouchpadCard} cardInstance - Parent card, used to read config and fire events
   * @constructor
   */
  constructor(cardInstance) {
    this.card = cardInstance;
    this.config = cardInstance.config;
  }

  /**
   * Runs the action configured for an interaction type, if any.
   *
   * @param {string} interactionType - Recognized interaction type (e.g., 'tap', 'circular_clockwise')
   * @param {Object} [interactionData={}] - Interaction details (unused; kept for the caller's signature)
   * @returns {Promise<void>}
   */
  async executeActionOnly(interactionType, interactionData: any = {}) {
    const actionConfig = this._getActionConfig(interactionType);
    if (!actionConfig || actionConfig.action === 'none') {
      return;
    }

    // Resolve target entity with fallback to default interactions.entity
    const defaultEntity = this.config?.interactions?.entity;
    const targetEntity = actionConfig.target?.entity_id || actionConfig.entity || defaultEntity;

    this._fireAction(actionConfig, targetEntity, defaultEntity);
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
   * Applies the default-entity rules, then fires `hass-action` so Home Assistant
   * performs the action. The action is passed as a tap action because each
   * interaction has exactly one action of its own.
   *
   * @param {Object} actionConfig - The interaction's action configuration
   * @param {string} targetEntity - The action's target, falling back to the default entity
   * @param {string} defaultEntity - The card's default entity, if set
   * @returns {void}
   */
  _fireAction(actionConfig, targetEntity, defaultEntity) {
    const action = { ...actionConfig };
    let entity = targetEntity;

    switch (action.action) {
      case 'toggle':
      case 'more-info':
        // Prefer the card's default entity when available
        entity = defaultEntity || targetEntity;
        delete action.entity;
        break;

      case 'service':
        // Older configurations used 'service'; Home Assistant knows it as 'call-service'
        action.action = 'call-service';
      // falls through
      case 'call-service': {
        // Home Assistant reads 'data' first, then 'service_data'
        const dataKey = action.data ? 'data' : 'service_data';
        if (targetEntity && !action[dataKey]?.entity_id) {
          action[dataKey] = { ...(action[dataKey] || {}), entity_id: targetEntity };
        }
        break;
      }

      case 'perform-action':
        // Add target entity if specified and not already in data or target
        if (targetEntity && !action.data?.entity_id && !action.target?.entity_id) {
          action.data = { ...(action.data || {}), entity_id: targetEntity };
        }
        break;

      case 'url':
        // Accept 'url' as well as Home Assistant's 'url_path'
        if (!action.url_path && action.url) {
          action.url_path = action.url;
        }
        break;
    }

    this.card.dispatchEvent(new CustomEvent('hass-action', {
      bubbles: true,
      composed: true,
      detail: {
        config: { entity, tap_action: action },
        action: 'tap',
      },
    }));
  }

  /**
   * Cleanup method
   */
  cleanup() {
    // Nothing to cleanup
  }

}
