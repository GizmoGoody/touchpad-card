import { getInteractions } from '../utils';

/**
 * DebugLogger - Centralized logging and debugging system for TouchpadCard development.
 * Provides structured, categorized logging with visual icons, performance tracking,
 * and configurable output levels for interaction debugging and troubleshooting.
 * 
 * Features:
 * - Configurable logging levels and categories
 * - Visual emoji icons for interaction types
 * - Performance timing and metrics tracking
 * - Structured log formatting with context
 * - Developer-friendly error reporting
 * - Conditional logging based on configuration
 * 
 * @class DebugLogger
 */
export class DebugLogger {
  // Instance fields (declared for TypeScript; assigned at runtime)
  actionIcons: any;
  category: any;
  config: any;
  enabled: any;
  interactionIcons: any;
  logLevel: any;

  /**
   * Initializes the DebugLogger with configuration-driven logging settings.
   * Sets up logging levels, categories, and interaction type visual representations.
   * 
   * @param {Object} config - TouchpadCard configuration object
   * @param {Object} [config.interactions.debugging] - Debug configuration section
   * @param {boolean} [config.interactions.debugging.logging=false] - Whether logging is enabled
   * @constructor
   */
  constructor(config) {
    this.config = config;
    this.enabled = config?.interactions?.debugging?.logging ?? false;
    this.logLevel = 'info'; // All routine logs are info level
    this.category = '[TouchpadCard]';
    
    // Interaction type icons
    this.interactionIcons = {
      // Tap interactions
      'tap': '🔽',
      'double_tap': '⏬',
      'hold': '✋🏼',
      
      // Linear interactions
      'left': '👈',
      'right': '👉',
      'up': '👆',
      'down': '👇',
      'up_left': '↖️',
      'up_right': '↗️',
      'down_left': '↙️',
      'down_right': '↘️',
      'up_2': '👆',
      'down_2': '👇',
      
      // Circular interactions
      'circular_clockwise': '🔃',
      'circular_counterclockwise': '🔄',
      'double_clockwise': '🔃',
      'double_counterclockwise': '🔄',
      
      // Multi-touch interactions
      'pinch_in': '🤏',
      'pinch_out': '👐'
    };
    
    // Action type icons - based on actual ui_action types
    this.actionIcons = {
      'none': '⚡',
      'toggle': '🔄',
      'more-info': 'ℹ️',
      'navigate': '🧭',
      'service': '⚙️',
      'call_service': '⚙️', // alias for service
      'perform-action': '⚙️',
      'url': '🔗'
    };
  }

  log(level, message, data = null) {
    if (!this.enabled) return;
    
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    if (messageLevelIndex <= currentLevelIndex) {
      const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
      const prefix = `${this.category} [${timestamp}] ${level.toUpperCase()}:`;
      
      if (data) {
        console[level](`${prefix} ${message}`, data);
      } else {
        console[level](`${prefix} ${message}`);
      }
    }
  }

  /**
   * Logs a complete interaction with collapsible format
   * @param {Object} interactionData - Complete interaction data
   * @param {Object} interactionData.pointer - Pointer information
   * @param {Object} interactionData.interaction - Interaction details
   * @param {Object} interactionData.action - Action configuration
   * @param {Object} interactionData.target - Target information
   */
  logInteraction(interactionData) {
    if (!this.enabled) return;
    
    const {
      pointer = {},
      interaction = {},
      action = {},
      target = {}
    } = interactionData;
    
    // Get icons
    const interactionIcon = this.interactionIcons[interaction.type] || '🎭';
    const actionIcon = this.actionIcons[action.type] || '⚡';
    
    // Format pointer summary for title line
    const rawPointerType = (pointer.type || pointer.pointerType || 'unknown').toString().toLowerCase();
    const pointerEmoji = this.getPointerEmoji(rawPointerType);
    const pointerLabel = this.getPointerLabel(rawPointerType);
    const pointerCount = pointer.pointers || 'unknown';
    const pointerSummary = `${pointerEmoji} ${pointerLabel} (${pointerCount})`;
    
    // Format action summary for title line
    const actionType = (action.action || action.type || 'unknown').replace(/-/g, '_');
    let actionSummary = actionType;
    let showTarget = true;
    
    if (actionType === 'none') {
      actionSummary = 'none';
      showTarget = false; // No target display for none actions
    } else if (actionType === 'perform_action' && action.perform_action) {
      const commandSummary = this.formatSmartCommandSummary(action);
      actionSummary = `${actionType} ${action.perform_action}${commandSummary ? `${commandSummary}` : ''}`;
    } else if ((actionType === 'call_service' || actionType === 'service') && action.service) {
      const commandSummary = this.formatSmartCommandSummary(action);
      actionSummary = `${actionType} ${action.service}${commandSummary ? `${commandSummary}` : ''}`;
    } else if (actionType === 'navigate' && action.navigation_path) {
      actionSummary = `${actionType} ${action.navigation_path}`;
      showTarget = false; // Navigate actions don't use targets
    } else if (actionType === 'url' && (action.url_path || action.url)) {
      actionSummary = `${actionType} ${action.url_path || action.url}`;
      showTarget = false; // URL actions don't use targets
    }
    
    // Format target for title line (only if action is not 'none')
    const targetDisplay = showTarget && target.entity 
      ? (target.isDefault ? `${target.entity} (Default)` : target.entity)
      : '';
    
    // Create summary line with count for continuous interactions
    // Suppress count for linear interactions that completed with exactly one increment
    const linearTypes = new Set(['left','right','up','down','up_left','up_right','down_left','down_right','up_2','down_2']);
    const isLinearType = linearTypes.has(interaction.type);
    const isSingleCompleted = isLinearType && interaction.incrementCount === 1 && interaction.completed;
    let countDisplay = '';
    if (interaction.incrementCount > 0 && !isSingleCompleted) {
      if (interaction.actionsFired !== undefined && interaction.actionsFired !== interaction.incrementCount) {
        // Show actions fired vs total when rate limited
        countDisplay = ` (${interaction.actionsFired}/${interaction.incrementCount})`;
      } else {
        // Show total count when not rate limited or actionsFired equals incrementCount
        countDisplay = ` (${interaction.incrementCount})`;
      }
    }
    
    // Build summary line conditionally
    let summaryLine = `👆🏼 Touchpad Card: ${pointerSummary} → ${interactionIcon}${interaction.type}${countDisplay}`;
    
    // Always show action, but use different icon for none actions
    const displayActionIcon = actionType === 'none' ? '🚫' : actionIcon;
    summaryLine += ` → ${displayActionIcon}${actionSummary}`;
    
    // Only show target for configured actions (not none)
    if (actionType !== 'none' && targetDisplay) {
      summaryLine += ` → 🎯 ${targetDisplay}`;
    }
    
    // Create detailed data object
    const detailData = {
      [`${pointerEmoji} Pointer`]: this.formatPointerData(pointer, interaction),
      '🎭 Interaction': this.formatInteractionData(interaction),
      '⚡ Action': this.formatActionData(action, target)
    };
    
    // Log with collapsible format
    console.groupCollapsed(summaryLine);
    
    Object.entries(detailData).forEach(([category, data]) => {
      if (typeof data === 'string') {
        console.log(`${category}\n${data}`);
      } else {
        console.log(category, data);
      }
    });
    
    console.groupEnd();
  }

  formatTarget(target) {
    if (!target.entity) return 'none';
    const isDefault = target.isDefault || false;
    return isDefault ? `${target.entity} (Default)` : target.entity;
  }

  formatCommandSummary(action) {
    let summary = '';
    
    const actionType = action.action || action.type;
    if (actionType === 'perform_action') {
      const data = action.data || {};
      const target = action.target || {};
      const dataKeys = Object.keys(data);
      const targetKeys = Object.keys(target);
      
      if (dataKeys.length === 0 && targetKeys.length === 0) {
        summary = 'MISSING';
      } else {
        const parts = [];
        if (dataKeys.length > 0) parts.push(`data:${dataKeys.join(',')}`);
        if (targetKeys.length > 0) parts.push(`target:${targetKeys.join(',')}`);
        summary = parts.join(' ');
      }
    } else if (actionType === 'call_service' || actionType === 'service') {
      const data = action.service_data || {};
      const dataKeys = Object.keys(data);
      
      if (dataKeys.length === 0) {
        summary = 'MISSING';
      } else {
        summary = `data:${dataKeys.join(',')}`;
      }
    }
    
    return summary;
  }

  serviceRequiresData(serviceName) {
    // Services that typically work without data
    const noDataServices = [
      'turn_on', 'turn_off', 'toggle', 'reload',
      'restart', 'start', 'stop', 'pause', 'resume',
      'next_track', 'previous_track', 'play', 'pause',
      'volume_up', 'volume_down', 'volume_mute',
      'open_cover', 'close_cover', 'stop_cover',
      'lock', 'unlock', 'arm_home', 'arm_away', 'disarm'
    ];
    
    return !noDataServices.some(service => serviceName.includes(service));
  }

  formatSmartCommandSummary(action) {
    const actionType = (action.action || action.type || '').replace(/-/g, '_');
    
    if (actionType === 'perform_action') {
      const data = action.data || {};
      const dataKeys = Object.keys(data);

      // No data provided - check if service typically requires it
      if (dataKeys.length === 0) {
        const serviceName = action.perform_action || '';
        const serviceRequiresData = this.serviceRequiresData(serviceName);
        return serviceRequiresData ? ' MISSING' : '';
      }

      // Render minimal key=value format (quote strings)
      const asValue = (v) => {
        if (v === null || v === undefined) return 'null';
        if (typeof v === 'string') {
          const safe = v.replace(/"/g, '\\"');
          return `"${safe}"`;
        }
        if (typeof v === 'number' || typeof v === 'boolean') return String(v);
        // For objects/arrays, render a compact placeholder
        try {
          const s = JSON.stringify(v);
          return s.length <= 40 ? s : '{…}';
        } catch (_) {
          return '{…}';
        }
      };

      const pairs = dataKeys.map(k => `${k}=${asValue(data[k])}`);
    if (pairs.length === 1) return ` (${pairs[0]})`;
    return ` (${pairs.join(', ')})`;
      
    } else if (actionType === 'call_service' || actionType === 'service') {
      const data = action.service_data || {};
      const dataKeys = Object.keys(data);

  if (dataKeys.length === 0) return ' N/A';

      const asValue = (v) => {
        if (v === null || v === undefined) return 'null';
        if (typeof v === 'string') {
          const safe = v.replace(/"/g, '\\"');
          return `"${safe}"`;
        }
        if (typeof v === 'number' || typeof v === 'boolean') return String(v);
        try {
          const s = JSON.stringify(v);
          return s.length <= 40 ? s : '{…}';
        } catch (_) {
          return '{…}';
        }
      };

      const pairs = dataKeys.map(k => `${k}=${asValue(data[k])}`);
  if (pairs.length === 1) return ` (${pairs[0]})`;
  return ` (${pairs.join(', ')})`;
    }
    
    return '';
  }

  formatPointerData(pointer, interaction: any = {}) {
    const rawPointerType = (pointer.type || pointer.pointerType || 'unknown').toString().toLowerCase();
    const pointerEmoji = this.getPointerEmoji(rawPointerType);
    const pointerLabel = this.getPointerLabel(rawPointerType);
    const pointerCount = pointer.pointers || 'unknown'; // Report unknown if not specified
    
    // For tap interactions, use N/A for most fields since they don't have meaningful movement
    // Hold interactions have duration, so exclude them from tap interaction check
    const isTapInteraction = interaction.type && ['tap', 'double_tap'].includes(interaction.type);
    
    const duration = isTapInteraction ? 'N/A' : (
      // For hold interactions, duration comes from interaction data
      interaction.type === 'hold' && interaction.duration !== null && interaction.duration !== undefined
        ? `${interaction.duration.toFixed(0)} ms`
        : pointer.duration
          ? `${pointer.duration.toFixed(0)} ms`
          : (pointer.timestamp && pointer.startTime)
            ? `${(pointer.timestamp - pointer.startTime).toFixed(0)} ms`
            : 'N/A'
    );

    // Return as formatted string with reordered fields (no length for non-tap interactions)
    return `• type: ${pointerEmoji} ${pointerLabel}\n• pointers: ${pointerCount}\n• duration: ${duration}`;
  }

  getPointerEmoji(type) {
    switch ((type || '').toLowerCase()) {
      case 'touch':
        return '👆🏼';
      case 'mouse':
        return '🐭';
      case 'pen':
      case 'stylus':
        return '✏️';
      default:
        return '❔';
    }
  }

  getPointerLabel(type) {
    switch ((type || '').toLowerCase()) {
      case 'touch':
        return 'touch';
      case 'mouse':
        return 'mouse';
      case 'pen':
      case 'stylus':
        return 'stylus';
      default:
        return 'unknown';
    }
  }

  formatInteractionData(interaction) {
    // Get interaction mode from INTERACTION constants
    const allInteractions = getInteractions();
    const interactionDef = allInteractions[interaction.type];
    let mode = interactionDef?.mode || 'unknown';
    // Treat linear with increments as continuous for logging, except when
    // it's exactly one increment and the interaction is completed (discrete-equivalent)
    if (interaction.incrementCount > 0) {
      if (!(interaction.incrementCount === 1 && interaction.completed)) {
        mode = 'continuous';
      }
    }
    
    const type = interaction.type || 'unknown';
    
    // For continuous interactions, show continuous data nested under mode
    if (mode === 'continuous' && interaction.incrementCount > 0) {
      const incrementCount = interaction.incrementCount;
      // For linear continuous, actionsFired should reflect actual HA fire events.
      // If not provided by the producer, default to incrementCount.
      const actionsFired = interaction.actionsFired != null ? interaction.actionsFired : incrementCount;
      const rateMaxAction = interaction.rateMaxAction ? `${interaction.rateMaxAction} actions/sec` : 'N/A';
      
      // Calculate angle using the established flow
      let angle = 'N/A';
      const angularSweep = interaction.angularSweep || interaction.currentAngularSweep;
      if (angularSweep !== undefined && angularSweep !== null) {
        angle = `${angularSweep.toFixed(1)}°`;
      }
      
      return `• type: ${type}\n• mode: ${mode}\n  • incrementCount: ${incrementCount}\n  • actionsFired: ${actionsFired}\n  • rateMaxAction: ${rateMaxAction}\n• distance: N/A\n• angle: ${angle}`;
  } else {
      // For discrete interactions, show angle and distance
      const angle = interaction.angle ? `${interaction.angle.toFixed(1)}°` : 'N/A';
      const distance = interaction.distance ? `${interaction.distance.toFixed(1)} px` : 'N/A';
      
  return `• type: ${type}\n• mode: ${mode}\n• distance: ${distance}\n• angle: ${angle}`;
    }
  }

  formatActionData(action, target) {
    if (!action || action.action === 'none') {
      return '• none (ACTION NOT CONFIGURED FOR THIS INTERACTION)';
    }

    const actionType = (action.action || action.type || 'unknown').replace(/-/g, '_');
    let result = `• type: ${actionType}`;

    // Add service information for service-based actions
    if (actionType === 'perform_action' && action.perform_action) {
      result += `\n• service: ${action.perform_action}`;
      
      // Add data section
      const data = action.data || {};
      const dataKeys = Object.keys(data);
      
      // Determine if this service typically requires data
      const serviceName = action.perform_action || '';
      const serviceRequiresData = this.serviceRequiresData(serviceName);
      
      if (dataKeys.length === 0) {
        result += serviceRequiresData ? `\n• data: MISSING` : `\n• data: N/A`;
      } else {
        result += `\n• data:`;
        dataKeys.forEach(key => {
          const value = data[key];
          const displayValue = typeof value === 'string' ? value : JSON.stringify(value);
          result += `\n  • ${key}: ${displayValue}`;
        });
      }
      
      // Add target section
      const targetConfig = action.target || {};
      const targetKeys = Object.keys(targetConfig);
      if (targetKeys.length > 0) {
        result += `\n• target:`;
        targetKeys.forEach(key => {
          const value = targetConfig[key];
          const displayValue = typeof value === 'string' ? value : JSON.stringify(value);
          result += `\n  • ${key}: ${displayValue}`;
        });
      } else if (target.entity) {
        result += `\n• target: ${target.entity}${target.isDefault ? ' (Default)' : ''}`;
      }
    } else if ((actionType === 'call_service' || actionType === 'service') && action.service) {
      result += `\n• service: ${action.service}`;
      
      // Add data section
      const data = action.service_data || {};
      const dataKeys = Object.keys(data);
      
      // Determine if this service typically requires data
      const serviceName = action.service || '';
      const serviceRequiresData = this.serviceRequiresData(serviceName);
      
      if (dataKeys.length === 0) {
        result += serviceRequiresData ? `\n• data: MISSING` : `\n• data: N/A`;
      } else {
        result += `\n• data:`;
        dataKeys.forEach(key => {
          const value = data[key];
          const displayValue = typeof value === 'string' ? value : JSON.stringify(value);
          result += `\n  • ${key}: ${displayValue}`;
        });
      }
      
      if (target.entity) {
        result += `\n• target: ${target.entity}${target.isDefault ? ' (Default)' : ''}`;
      }
    } else if (actionType === 'navigate' && action.navigation_path) {
      result += `\n• navigation_path: ${action.navigation_path}`;
    } else if (actionType === 'url' && (action.url_path || action.url)) {
      result += `\n• url_path: ${action.url_path || action.url}`;
    } else if (actionType === 'toggle' || actionType === 'more-info') {
      if (target.entity) {
        result += `\n• target: ${target.entity}${target.isDefault ? ' (Default)' : ''}`;
      }
    }

    return result;
  }

  formatTargetData(target) {
    if (!target.entity) return 'none';
    
    let result = `• entity: ${target.entity}\n• isDefault: ${target.isDefault || false}\n• entityType: ${target.entityType || 'unknown'}`;
    result += `\n• friendlyName: ${target.friendlyName || target.entity}\n• state: ${target.state || 'unknown'}`;
    
    if (target.attributes && Object.keys(target.attributes).length > 0) {
      const attributesStr = JSON.stringify(target.attributes);
      result += `\n• attributes: ${attributesStr}`;
    } else {
      result += `\n• attributes: {}`;
    }
    
    return result;
  }
}
