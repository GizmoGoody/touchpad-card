import { INTERACTION } from './const';

// #region ===== UTILITY FUNCTIONS =====

/**
 * Converts value to a number; if value is undefined, not set, or not numeric, returns undefined. 
 * Otherwise, extracts and clamps numeric values between min and max bounds.
 *
 * @param {*} value - Raw config value (number, string, or undefined)
 * @param {number} min - Minimum allowed value (inclusive)
 * @param {number} max - Maximum allowed value (inclusive)
 * @returns {number|undefined} Clamped numeric value within bounds, or undefined if value is invalid or not set
 */
export function getClampedNumber(value, min, max) {
  const numValue = Number(value);
  if (isNaN(numValue)) return undefined;
  return Math.max(min, Math.min(max, numValue));
}

/**
 * Extracts all interaction type objects from INTERACTION constants and returns them as a single flat object.
 * This approach maintains the INTERACTION structure's categorical organization while providing
 * easy access to all interaction types in a unified structure for recognition and processing.
 * 
 * @returns {Object.<string, {mode: string, icon: string}>} All interaction type objects keyed by interaction name
 * @example
 * // Returns: { tap: { mode: 'discrete', icon: 'mdi:gesture-tap' }, ... }
 * const interactions = getInteractions();
 */
export function getInteractions() {
  return ALL_INTERACTIONS;
}

// The INTERACTION constants never change, so the flat lookup is built once at load.
const ALL_INTERACTIONS: Record<string, { mode: string; icon: string }> = {};
Object.values(INTERACTION).forEach(category => {
  Object.entries(category).forEach(([key, value]) => {
    // Only include objects that have interaction properties (mode, etc.)
    if (typeof value === 'object' && value.mode) {
      ALL_INTERACTIONS[key] = value;
    }
  });
});

/**
 * Central configuration resolution system that resolves values using a priority chain:
 * Card Config → Constants → Fallback.
 * 
 * @param {Object} cardConfig - The card configuration object
 * @param {string} category - Interaction category (e.g., 'tap', 'linear', 'multi')
 * @param {string} property - Property name (e.g., 'threshold', 'timer_double')
 * @param {*} constantValue - Default value from INTERACTION constants
 * @param {*} [fallback=constantValue] - Ultimate fallback value if all else fails
 * @returns {*} Resolved configuration value following the priority chain
 * @example
 * // Resolves tap timer with fallback chain
 * const timer = resolveConfigValue(config, 'tap', 'timer_double', INTERACTION.TAP.TIMER_DOUBLE_DEFAULT);
 */
export function resolveConfigValue(cardConfig, category, property, constantValue, fallback = constantValue) {
  // Resolve the value using priority chain
  let resolvedValue;
  
  // First check card config: config.interactions.{category}.tuning.{property}
  const configValue = cardConfig?.interactions?.[category]?.tuning?.[property];
  if (configValue !== undefined && configValue !== null) {
    resolvedValue = configValue;
  }
  // Then use constant value
  else if (constantValue !== undefined && constantValue !== null) {
    resolvedValue = constantValue;
  }
  // Finally use fallback
  else {
    resolvedValue = fallback;
  }

  return resolvedValue;
}

/**
 * Calculates the Euclidean distance between two points in 2D space.
 * 
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point  
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @returns {number} Distance between the points in pixels
 * @example
 * const distance = getDistance(0, 0, 3, 4); // Returns 5
 */
export function getDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the angle between two points in degrees using atan2.
 * Returns angle relative to positive X-axis (0° = right, 90° = down, etc.)
 * 
 * @param {number} x1 - X coordinate of first point (origin)
 * @param {number} y1 - Y coordinate of first point (origin)
 * @param {number} x2 - X coordinate of second point (target)
 * @param {number} y2 - Y coordinate of second point (target)
 * @returns {number} Angle in degrees (-180 to +180 range)
 * @example
 * const angle = getAngle(0, 0, 1, 1); // Returns 45 (degrees)
 */
export function getAngle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
}

/**
 * Normalizes any angle to the 0-360 degree range by handling wrap-around.
 * Useful for consistent angle comparisons and circular calculations.
 * 
 * @param {number} angle - Angle in degrees (can be any range)
 * @returns {number} Normalized angle in 0-360 degree range
 * @example
 * normalizeAngle(-90);  // Returns 270
 * normalizeAngle(450);  // Returns 90
 */
export function normalizeAngle(angle) {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

// #endregion
