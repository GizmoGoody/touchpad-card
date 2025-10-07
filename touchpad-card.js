// #region ===== THINGS TO DO =====
//
// More performance optimizations?
// Cleanup/fix CSS (e.g., Edge)
// Standardize function names
// Shadow DOM IAW HA guide?
// Complete/update JSDoc (e.g., InteractionActionEditor)
// Automatic tools for cleanup and standardizing???
//
// #endregion

// #region ===== IMPORTS AND IDENTIFICATION CONSTANTS =====

import { LitElement, html, css } from "https://unpkg.com/lit@2.8.0/index.js?module";

const CARD_VERSION = "0.9.0-beta";
const CARD_TYPE = "touchpad-card";

// #endregion

// #region ===== SHARED CONSTANTS =====

/**
 * Configuration constants for touchpad appearance, layout, and behavior
 * @readonly
 * @enum {number|string}
 */
const TOUCHPAD = {
  /** Default opacity percentage for touchpad elements */
  OPACITY_DEFAULT: 100,
  /** Minimum allowed opacity percentage */
  OPACITY_MIN: 0,
  /** Maximum allowed opacity percentage */
  OPACITY_MAX: 100,

  /** Default margin percentage around touchpad */
  MARGIN_DEFAULT: 0,
  /** Minimum allowed margin percentage */
  MARGIN_MIN: 0,
  /** Maximum allowed margin percentage */
  MARGIN_MAX: 25,

  /** Default border width percentage */
  BORDER_WIDTH_DEFAULT: 0,
  /** Minimum allowed border width percentage */
  BORDER_WIDTH_MIN: 0,
  /** Maximum allowed border width percentage */
  BORDER_WIDTH_MAX: 25,

  /** Default icon scale percentage */
  ICON_SCALE_DEFAULT: 100,
  /** Minimum allowed icon scale percentage */
  ICON_SCALE_MIN: 0,
  /** Maximum allowed icon scale percentage */
  ICON_SCALE_MAX: 200,

  /** Default image scale percentage */
  IMAGE_SCALE_DEFAULT: 100,
  /** Minimum allowed image scale percentage */
  IMAGE_SCALE_MIN: 0,
  /** Maximum allowed image scale percentage */
  IMAGE_SCALE_MAX: 200,

  /** Factor used to convert percentage values to decimal (e.g., margin %, border width %) */
  SCALE_FACTOR: 50,

  /** Duration in milliseconds for feedback display */
  FEEDBACK_DURATION: 2000,
  /** Duration in milliseconds for feedback fade out animation */
  FEEDBACK_FADE_OUT: 200,

  // Section and Masonry Layout Configuration
  /** Default number of rows for masonry layout */
  ROWS_DEFAULT: 4,
  /** Minimum allowed rows for masonry layout */
  ROWS_MIN: 2,
  /** Maximum allowed rows for masonry layout */
  ROWS_MAX: 12,

  /** Default number of columns for sections view */
  SECTION_COLUMNS_DEFAULT: 6,
  /** Minimum allowed columns for sections view */
  SECTION_COLUMNS_MIN: 3,
  /** Maximum allowed columns for sections view */
  SECTION_COLUMNS_MAX: 12,

  /** Row height in pixels for masonry layout calculation */
  MASONRY_ROW_HEIGHT: 56 // Based on sections view row height estimate
};

/**
 * Material Design Icons used throughout the touchpad card interface
 * Organized by category for easy reference and maintenance
 * @readonly
 * @enum {string}
 */
const ICON = {

  // Card
  /** Default card icon */
  CARD_DEFAULT: 'mdi:gesture',

  // Debug and Feedback
  /** Default feedback/debug icon */
  FEEDBACK_DEFAULT: 'mdi:bug',

  // Configuration Sections
  /** Header section icon */
  HEADER: 'mdi:page-layout-header',
  /** Touchpad section icon */
  TOUCHPAD: 'mdi:gesture-tap-button',
  /** Border configuration icon */
  BORDER: 'mdi:border-all-variant',
  /** Overlay configuration icon */
  OVERLAY: 'mdi:image-filter-center-focus',
  /** Graphics configuration icon */
  GRAPHICS: 'mdi:image',
  /** Text configuration icon */
  TEXT: 'mdi:format-text',
  /** Icon configuration icon */
  ICON: 'mdi:arrow-all',
  /** Image configuration icon */
  IMAGE: 'mdi:image-outline',
  /** Interaction configuration icon */
  INTERACTION: 'mdi:gesture',
  /** Tuning configuration icon */
  TUNING: 'mdi:tune',
  /** Linear interactions icon */
  LINEAR: 'mdi:gesture-swipe-horizontal',
  /** Circular interactions icon */
  CIRCULAR: 'mdi:gesture-swipe',
  /** Multi-touch interactions icon */
  MULTI: 'mdi:gesture-two-tap',
  /** Quick actions icon */
  QUICK: 'mdi:magic-staff',
  /** Action configuration icon */
  ACTION: 'mdi:lightning-bolt',

  // Tap Interactions
  /** Single tap gesture icon */
  TAP: 'mdi:gesture-tap',
  /** Double tap gesture icon */
  DOUBLE_TAP: 'mdi:gesture-double-tap',
  /** Hold/long press gesture icon */
  HOLD: 'mdi:gesture-tap-hold',
  
  // Linear Direction Interactions
  /** Left swipe gesture icon */
  LINEAR_LEFT: 'mdi:gesture-swipe-left',
  /** Right swipe gesture icon */
  LINEAR_RIGHT: 'mdi:gesture-swipe-right',
  /** Up swipe gesture icon */
  LINEAR_UP: 'mdi:gesture-swipe-up',
  /** Down swipe gesture icon */
  LINEAR_DOWN: 'mdi:gesture-swipe-down',
  /** Up-left diagonal swipe icon */
  LINEAR_UP_LEFT: 'mdi:arrow-top-left-thick',
  /** Up-right diagonal swipe icon */
  LINEAR_UP_RIGHT: 'mdi:arrow-top-right-thick',
  /** Down-left diagonal swipe icon */
  LINEAR_DOWN_LEFT: 'mdi:arrow-bottom-left-thick',
  /** Down-right diagonal swipe icon */
  LINEAR_DOWN_RIGHT: 'mdi:arrow-bottom-right-thick',
  /** Two-finger up swipe icon */
  LINEAR_UP_2: 'mdi:numeric-2',
  /** Two-finger down swipe icon */
  LINEAR_DOWN_2: 'mdi:numeric-2',

  // Circular Interactions
  /** Clockwise rotation gesture icon */
  CIRCULAR_CLOCKWISE: 'mdi:rotate-right',
  /** Counterclockwise rotation gesture icon */
  CIRCULAR_COUNTERCLOCKWISE: 'mdi:rotate-left',
  /** Double-tap clockwise rotation icon */
  CIRCULAR_DOUBLE_CLOCKWISE: 'mdi:rotate-right-variant',
  /** Double-tap counterclockwise rotation icon */
  CIRCULAR_DOUBLE_COUNTERCLOCKWISE: 'mdi:rotate-left-variant',
  
  // Multi-touch Interactions
  /** Pinch in (zoom out) gesture icon */
  MULTI_PINCH_IN: 'mdi:gesture-pinch',
  /** Pinch out (zoom in) gesture icon */
  MULTI_PINCH_OUT: 'mdi:gesture-spread',
  
  // Tuning Parameter Icons
  /** Distance/threshold measurement icon */
  TAP_DISTANCE: 'mdi:ruler',
  /** Single tap timer icon */
  TAP_TIMER_SINGLE: 'mdi:timer',
  /** Double tap timer icon */
  TAP_TIMER_DOUBLE: 'mdi:timer-sand-empty',
  /** Hold timer icon */
  TAP_TIMER_HOLD: 'mdi:timer-sand',

  /** Linear distance measurement icon */
  LINEAR_DISTANCE: 'mdi:ruler',
  /** Linear timing icon */
  LINEAR_TIME: 'mdi:timer-outline',
  /** Linear direction tolerance icon */
  LINEAR_DIRECTION: 'mdi:arrow-all',

  /** Circular detection threshold icon */
  CIRCULAR_DETECTION: 'mdi:angle-right',
  /** Circular initial threshold icon */
  CIRCULAR_INITIAL: 'mdi:angle-acute',
  /** Circular increment threshold icon */
  CIRCULAR_INCREMENT: 'mdi:angle-obtuse',

  /** Multi-touch distance threshold icon */
  MULTI_DISTANCE: 'mdi:gesture-pinch',
  /** Multi-touch priority ratio icon */
  MULTI_PRIORITY: 'mdi:scale-balance',

};

/**
 * Comprehensive interaction configuration constants with tuning parameters and type definitions
 * Contains timing thresholds, distance measurements, and interaction type metadata for all supported gestures
 * @readonly
 * @namespace
 */
const INTERACTION = {

  /**
   * Tap interaction configuration and timing constants
   * @namespace
   */
  TAP: {

    // Tuning Constants with dynamic descriptions
    /** Minimum duration for single tap recognition (milliseconds) */
    TIMER_SINGLE_MIN: 50,
    /** Default duration for single tap recognition (milliseconds) */
    TIMER_SINGLE_DEFAULT: 100,
    /** Maximum duration for single tap recognition (milliseconds) */
    TIMER_SINGLE_MAX: 500,
    /**
     * Dynamic description for single tap timer
     * @returns {string} Description with current min/max values
     */
    get TIMER_SINGLE_DESCRIPTION() {
      return `Minimum tap duration (${this.TIMER_SINGLE_MIN}-${this.TIMER_SINGLE_MAX} ms) to trigger as a tap.`;
    },

    /** Minimum time between taps for double tap detection (milliseconds) */
    TIMER_DOUBLE_MIN: 100,
    /** Default time between taps for double tap detection (milliseconds) */
    TIMER_DOUBLE_DEFAULT: 300,
    /** Maximum time between taps for double tap detection (milliseconds) */
    TIMER_DOUBLE_MAX: 1000,
    /**
     * Dynamic description for double tap timer
     * @returns {string} Description with current min/max values
     */
    get TIMER_DOUBLE_DESCRIPTION() {
      return `Maximum time (${this.TIMER_DOUBLE_MIN}-${this.TIMER_DOUBLE_MAX} ms) between taps to trigger a double tap.`;
    },

    /** Minimum duration for hold action recognition (milliseconds) */
    TIMER_HOLD_MIN: 500,
    /** Default duration for hold action recognition (milliseconds) */
    TIMER_HOLD_DEFAULT: 800, 
    /** Maximum duration for hold action recognition (milliseconds) */
    TIMER_HOLD_MAX: 2000,
    /**
     * Dynamic description for hold timer
     * @returns {string} Description with current min/max values
     */
    get TIMER_HOLD_DESCRIPTION() {
      return `Minimum tap duration (${this.TIMER_HOLD_MIN}-${this.TIMER_HOLD_MAX} ms) to trigger a hold action.`;
    },

    // Interaction Type Definitions
    /** Single tap interaction metadata */
    tap: { 
      /** Interaction execution mode */
      mode: 'discrete', 
      /** Associated icon */
      icon: ICON.TAP
    },
    /** Double tap interaction metadata */
    double_tap: { 
      /** Interaction execution mode */
      mode: 'discrete', 
      /** Associated icon */
      icon: ICON.DOUBLE_TAP
    },
    /** Hold/long press interaction metadata */
    hold: { 
      /** Interaction execution mode */
      mode: 'discrete', 
      /** Associated icon */
      icon: ICON.HOLD
    }
  },

  /**
   * Linear/swipe interaction configuration and tuning constants
   * @namespace
   */
  LINEAR: {

    // Distance and Movement Thresholds
    /** Minimum distance threshold for linear gesture detection (pixels) */
    THRESHOLD_MIN: 10,
    /** Default distance threshold for linear gesture detection (pixels) */
    THRESHOLD_DEFAULT: 30,
    /** Maximum distance threshold for linear gesture detection (pixels) */
    THRESHOLD_MAX: 100,
    /**
     * Dynamic description for linear threshold
     * @returns {string} Description with current min/max values
     */
    get THRESHOLD_DESCRIPTION() {
      return `Minimum gesture distance (${this.THRESHOLD_MIN}-${this.THRESHOLD_MAX} px) required to no longer register as a tap interaction. Longer pointer movements are linear or circular interaction candidates.`;
    },

    // Timing Configuration
    /** Minimum timer duration for linear interaction latching (milliseconds) */
    TIMER_MIN: 300,
    /** Default timer duration for linear interaction latching (milliseconds) */
    TIMER_DEFAULT: 600,
    /** Maximum timer duration for linear interaction latching (milliseconds) */
    TIMER_MAX: 1000,
    /**
     * Dynamic description for linear timer
     * @returns {string} Description with current min/max values
     */
    get TIMER_DESCRIPTION() {
      return `Duration (${this.TIMER_MIN}-${this.TIMER_MAX} ms) for linear interaction latching. Increase to allow more time for a gesture to be considered for circular interaction classification before latching the gesture as a linear interaction.`;
    },

    // Direction Detection
    /** Minimum angle tolerance for linear direction detection (degrees) */
    TOLERANCE_MIN: 5,
    /** Default angle tolerance for linear direction detection (degrees) */
    TOLERANCE_DEFAULT: 22.5,
    /** Maximum angle tolerance for linear direction detection (degrees) */
    TOLERANCE_MAX: 45,
    /**
     * Dynamic description for linear tolerance
     * @returns {string} Description with current min/max values
     */
    get TOLERANCE_DESCRIPTION() {
      return `Angle tolerance (${this.TOLERANCE_MIN}-${this.TOLERANCE_MAX}°) on each side (± tolerance°) of all cardinal directions. Linear gestures outside of this zone will be recognized as diagonal interactions. The default (±${this.TOLERANCE_DEFAULT}°) provides an equal 45° sector for each of the 8 directions. Increase to make cardinal sectors larger compared to diagonal sectors.`;
    },

    // Continuous Linear Action Configuration
    /** Minimum interval between continuous linear actions (milliseconds) */
    INCREMENT_MIN: 200,
    /** Default interval between continuous linear actions (milliseconds) */
    INCREMENT_DEFAULT: 1000,
    /** Maximum interval between continuous linear actions (milliseconds) */
    INCREMENT_MAX: 3000,
    /**
     * Dynamic description for linear increment
     * @returns {string} Description with current min/max values
     */
    get INCREMENT_DESCRIPTION() {
      return `Interval (${this.INCREMENT_MIN}-${this.INCREMENT_MAX} ms) between repeated linear actions after settling the pointer in one spot and holding.`;
    },

    /** Minimum duration to settle before continuous actions (milliseconds) */
    SETTLED_TIMER_MIN: 60,
    /** Default duration to settle before continuous actions (milliseconds) */
    SETTLED_TIMER_DEFAULT: 120,
    /** Maximum duration to settle before continuous actions (milliseconds) */
    SETTLED_TIMER_MAX: 500,
    /**
     * Dynamic description for settled timer
     * @returns {string} Description with current min/max values
     */
    get SETTLED_TIMER_DESCRIPTION() {
      return `Duration (${this.SETTLED_TIMER_MIN}-${this.SETTLED_TIMER_MAX} ms) a linear gesture must settle before starting continuous linear interaction firing.`;
    },

    /** Minimum radius for settled position detection (pixels) */
    SETTLED_RADIUS_MIN: 4,
    /** Default radius for settled position detection (pixels) */
    SETTLED_RADIUS_DEFAULT: 12,
    /** Maximum radius for settled position detection (pixels) */
    SETTLED_RADIUS_MAX: 48,
    /**
     * Dynamic description for settled radius
     * @returns {string} Description with current min/max values
     */
    get SETTLED_RADIUS_DESCRIPTION() {
      return `Radius (${this.SETTLED_RADIUS_MIN}-${this.SETTLED_RADIUS_MAX} px) around the continous linear settled position. Leaving this zone cancels the continuous linear interaction.`;
    },

    // Linear Interaction Type Definitions
    /** Left swipe interaction metadata */
    left: { 
      /** Interaction execution mode */
      mode: 'discrete', 
      /** Associated icon */
      icon: ICON.LINEAR_LEFT
    },
    /** Right swipe interaction metadata */
    right: { 
      /** Interaction execution mode */
      mode: 'discrete', 
      /** Associated icon */
      icon: ICON.LINEAR_RIGHT
    },
    /** Up swipe interaction metadata */
    up: { 
      /** Interaction execution mode */
      mode: 'discrete', 
      /** Associated icon */
      icon: ICON.LINEAR_UP
    },
    /** Down swipe interaction metadata */
    down: { 
      /** Interaction execution mode */
      mode: 'discrete', 
      /** Associated icon */
      icon: ICON.LINEAR_DOWN
    },
    /** Up-left diagonal swipe interaction metadata */
    up_left: { 
      /** Interaction execution mode */
      mode: 'discrete', 
      /** Associated icon */
      icon: ICON.LINEAR_UP_LEFT
    },
    /** Up-right diagonal swipe interaction metadata */
    up_right: { 
      /** Interaction execution mode */
      mode: 'discrete',
      /** Associated icon */
      icon: ICON.LINEAR_UP_RIGHT
    },
    /** Down-left diagonal swipe interaction metadata */
    down_left: { 
      /** Interaction execution mode */
      mode: 'discrete', 
      /** Associated icon */
      icon: ICON.LINEAR_DOWN_LEFT
    },
    /** Down-right diagonal swipe interaction metadata */
    down_right: { 
      /** Interaction execution mode */
      mode: 'discrete', 
      /** Associated icon */
      icon: ICON.LINEAR_DOWN_RIGHT
    },
    /** Two-finger up swipe interaction metadata */
    up_2: { 
      /** Interaction execution mode */
      mode: 'discrete', 
      /** Associated icon */
      icon: ICON.LINEAR_UP_2
    },
    /** Two-finger down swipe interaction metadata */
    down_2: { 
      /** Interaction execution mode */
      mode: 'discrete', 
      /** Associated icon */
      icon: ICON.LINEAR_DOWN_2
    }
  },

  /**
   * Circular/rotation interaction configuration and tuning constants
   * @namespace
   */
  CIRCULAR: {

    // Detection and Recognition Thresholds (Detection → Initial → Increment)
    /** Minimum rotation angle for circular gesture detection (degrees) */
    THRESHOLD_DETECTION_MIN: 10,
    /** Default rotation angle for circular gesture detection (degrees) */
    THRESHOLD_DETECTION_DEFAULT: 20,
    /** Maximum rotation angle for circular gesture detection (degrees) */
    THRESHOLD_DETECTION_MAX: 45,
    /**
     * Dynamic description for circular detection threshold
     * @returns {string} Description with current min/max values
     */
    get THRESHOLD_DETECTION_DESCRIPTION() {
      return `Rotation (${this.THRESHOLD_DETECTION_MIN}-${this.THRESHOLD_DETECTION_MAX}°) around the point that the pointer first touches the touchpad required to latch a gesture as a circular interaction (not linear). Lower values make circular detection more sensitive as compared to linear.`;
    },

    /** Minimum rotation angle for initial circular action (degrees) */
    THRESHOLD_INITIAL_MIN: 15,
    /** Default rotation angle for initial circular action (degrees) */
    THRESHOLD_INITIAL_DEFAULT: 40,
    /** Maximum rotation angle for initial circular action (degrees) */
    THRESHOLD_INITIAL_MAX: 90,
    /**
     * Dynamic description for circular initial threshold
     * @returns {string} Description with current min/max values
     */
    get THRESHOLD_INITIAL_DESCRIPTION() {
      return `Rotation (${this.THRESHOLD_INITIAL_MIN}-${this.THRESHOLD_INITIAL_MAX}°) around the point that the pointer first touches the touchpad required to trigger the first circular action. Must be greater than or equal to detection threshold.`;
    },

    /** Minimum rotation angle for subsequent circular increments (degrees) */
    THRESHOLD_INCREMENT_MIN: 10,
    /** Default rotation angle for subsequent circular increments (degrees) */
    THRESHOLD_INCREMENT_DEFAULT: 30,
    /** Maximum rotation angle for subsequent circular increments (degrees) */
    THRESHOLD_INCREMENT_MAX: 60,
    /**
     * Dynamic description for circular increment threshold
     * @returns {string} Description with current min/max values
     */
    get THRESHOLD_INCREMENT_DESCRIPTION() {
      return `Rotation (${this.THRESHOLD_INCREMENT_MIN}-${this.THRESHOLD_INCREMENT_MAX}°) after the initial threshold for each successive continuous circular increment. Increase to decrease frequency of continuous circular actions. Tweak this in conjunction with the action rate limit to tune continuous circular action frequency.`;
    },

    // Rate Limiting for Continuous Actions
    /** Minimum action firing rate for continuous circular interactions (actions/sec) */
    RATE_ACTION_MAX_MIN: 1.0,
    /** Default action firing rate for continuous circular interactions (actions/sec) */
    RATE_ACTION_MAX_DEFAULT: 12.0,
    /** Maximum action firing rate for continuous circular interactions (actions/sec) */
    RATE_ACTION_MAX_MAX: 24.0,
    /**
     * Dynamic description for circular action rate limiting
     * @returns {string} Description with current min/max values
     */
    get RATE_ACTION_MAX_DESCRIPTION() {
      return `Maximum action firing rate (${this.RATE_ACTION_MAX_MIN}-${this.RATE_ACTION_MAX_MAX} actions/sec) for continuous circular interactions. Limits how frequently actions are executed. Tweak this in conjunction with the increment threshold to tune continuous circular action frequency.`;
    },

    // Circular Interaction Type Definitions
    /** Clockwise rotation interaction metadata */
    circular_clockwise: { 
      /** Interaction execution mode */
      mode: 'continuous',
      /** Associated icon */
      icon: ICON.CIRCULAR_CLOCKWISE
    },
    /** Counterclockwise rotation interaction metadata */
    circular_counterclockwise: { 
      /** Interaction execution mode */
      mode: 'continuous',
      /** Associated icon */
      icon: ICON.CIRCULAR_COUNTERCLOCKWISE
    },
    /** Double-tap clockwise rotation interaction metadata */
    double_clockwise: {
      /** Interaction execution mode */
      mode: 'continuous',
      /** Associated icon */
      icon: ICON.CIRCULAR_DOUBLE_CLOCKWISE
    },
    /** Double-tap counterclockwise rotation interaction metadata */
    double_counterclockwise: {
      /** Interaction execution mode */
      mode: 'continuous',
      /** Associated icon */
      icon: ICON.CIRCULAR_DOUBLE_COUNTERCLOCKWISE
    }
  },

  /**
   * Multi-touch interaction configuration and tuning constants
   * @namespace
   */
  MULTI: {

    // Multi-touch Detection Timing
    /** Minimum duration for multi-touch gesture detection (milliseconds) */
    TIMER_MIN: 100,
    /** Default duration for multi-touch gesture detection (milliseconds) */
    TIMER_DEFAULT: 200,
    /** Maximum duration for multi-touch gesture detection (milliseconds) */
    TIMER_MAX: 300,
    /**
     * Dynamic description for multi-touch timer
     * @returns {string} Description with current min/max values
     */
    get TIMER_DESCRIPTION() {
      return `Duration (${this.TIMER_MIN}-${this.TIMER_MAX} ms) for multi-touch interactions. Increase for more time between the first and last touches to flag an interaction as multi instead of single-touch.`;
    },

    // Distance Thresholds for Pinch Detection
    /** Minimum distance change for pinch gesture recognition (pixels) */
    THRESHOLD_MIN: 20,
    /** Default distance change for pinch gesture recognition (pixels) */
    THRESHOLD_DEFAULT: 50,
    /** Maximum distance change for pinch gesture recognition (pixels) */
    THRESHOLD_MAX: 200,
    /**
     * Dynamic description for multi-touch threshold
     * @returns {string} Description with current min/max values
     */
    get THRESHOLD_DESCRIPTION() {
      return `Minimum gesture distance change (${this.THRESHOLD_MIN}-${this.THRESHOLD_MAX} px) between two pointers to recognize pinch in or out. Increase to require a more deliberate pinch; decrease for earlier recognition.`;
    },

    // Priority Resolution Between Competing Gestures
    /** Minimum ratio for interaction type priority resolution */
    RATIO_MIN: 0.5,
    /** Default ratio for interaction type priority resolution */
    RATIO_DEFAULT: 2.0,
    /** Maximum ratio for interaction type priority resolution */
    RATIO_MAX: 5.0,
    /**
     * Dynamic description for multi-touch priority ratio
     * @returns {string} Description with current min/max values
     */
    get RATIO_DESCRIPTION() {
      return `Ratio threshold (${this.RATIO_MIN}-${this.RATIO_MAX}) for determining dominant interaction type when both pinch and linear occur simultaneously. Higher values favor linear detection; lower values favor pinch detection. Calculated as linear_distance / (pinch_distance + 1).`;
    },

    // Multi-touch Interaction Type Definitions
    /** Pinch in (zoom out) interaction metadata */
    pinch_in: { 
      /** Interaction execution mode */
      mode: 'discrete', 
      /** Associated icon */
      icon: ICON.MULTI_PINCH_IN
    },
    /** Pinch out (zoom in) interaction metadata */
    pinch_out: { 
      /** Interaction execution mode */
      mode: 'discrete', 
      /** Associated icon */
      icon: ICON.MULTI_PINCH_OUT
    }
  }

};

/**
 * Performance optimization settings and configuration constants
 * Controls various performance-related features including caching, batching, and throttling
 * @readonly
 * @namespace
 */
const PERFORMANCE = {
  // ===== IMPLEMENTED OPTIMIZATIONS =====

  /** Enable RAF (RequestAnimationFrame) batching for visual updates to consolidate multiple calls */
  RAF_BATCH_ENABLED: true,

  /** Maximum number of pointer history entries to prevent memory bloat in long sessions */
  MAX_POINTER_HISTORY: 30,

  /** Time-to-live for cached config values in milliseconds to avoid repeated lookups */
  CONFIG_CACHE_TTL: 10000,

  /** Delay in milliseconds for non-critical initialization (e.g., feedback visualizer) to reduce startup time */
  LAZY_INIT_DELAY: 100,

  // ===== PLANNED OPTIMIZATIONS (Not yet implemented, ordered by priority) =====

  // MEDIUM IMPACT - Throttling prevents CPU spikes during interactions
  // INTERACTION_THROTTLE: 8, // Throttle heavy interaction calculations (e.g., angle/distance) to ~120 FPS for responsiveness without excess CPU

  // MEDIUM IMPACT - Multi-touch throttling reduces CPU usage
  // MULTI_TOUCH_UPDATE_THROTTLE: 16, // Throttle multi-touch distance calculations (60 FPS)

  // MEDIUM IMPACT - Event debouncing reduces processing overhead
  // MOVE_EVENT_DEBOUNCE: 16, // ~60 FPS (1000 ms / 60fps = 16.67ms) - balanced for all devices

  // LOW IMPACT - Shorter animations reduce RAF cycles
  // FEEDBACK_ANIMATION_DURATION: 150, // Shorter animation duration for feedback to reduce RAF cycles
};

// #endregion

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
function getClampedNumber(value, min, max) {
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
function getInteractions() {
  const allTypes = {};
  
  // Collect interaction objects from each interaction category
  Object.values(INTERACTION).forEach(category => {
    Object.entries(category).forEach(([key, value]) => {
      // Only include objects that have interaction properties (mode, etc.)
      if (typeof value === 'object' && value.mode) {
        allTypes[key] = value;
      }
    });
  });
  
  return allTypes;
}

/**
 * Central configuration resolution system that resolves values using a priority chain:
 * Card Config → Constants → Fallback. Implements caching for improved performance.
 * 
 * @param {Object} cardConfig - The card configuration object
 * @param {string} category - Interaction category (e.g., 'tap', 'linear', 'multi')
 * @param {string} property - Property name (e.g., 'threshold', 'timer_single')
 * @param {*} constantValue - Default value from INTERACTION constants
 * @param {*} [fallback=constantValue] - Ultimate fallback value if all else fails
 * @returns {*} Resolved configuration value following the priority chain
 * @example
 * // Resolves tap timer with fallback chain
 * const timer = resolveConfigValue(config, 'tap', 'timer_single', INTERACTION.TAP.TIMER_SINGLE_DEFAULT);
 */
function resolveConfigValue(cardConfig, category, property, constantValue, fallback = constantValue) {
  // Check cache first
  const cachedValue = configCache.get(cardConfig, category, property, constantValue);
  if (cachedValue !== undefined) {
    return cachedValue;
  }

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

  // Cache the resolved value
  configCache.set(cardConfig, category, property, constantValue, resolvedValue);
  
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
function getDistance(x1, y1, x2, y2) {
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
function getAngle(x1, y1, x2, y2) {
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
function normalizeAngle(angle) {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

// #endregion

// #region ===== CARD AND EDITORS =====

/**
 * TouchpadCard - A custom Home Assistant card with configurable header, touchpad, and overlays. Supports dynamic styling, text, and overlay content from input_text helper, and extensive interaction tuning and configuration using Home Assisting action handling.
 */
class TouchpadCard extends LitElement {

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
    return css`

      /* ===== HOST ===== */
      :host {
        /* USED */
        background: var(--touchpad-card-background);
        box-shadow: var(--touchpad-card-box-shadow);
        border-radius: var(--touchpad-card-border-radius);
        box-sizing: border-box;
        --tile-color: var(--state-icon-color);

        /* --touchpad-card-* CSS variable declarations with fallback chains */

        /* CARD */
        --touchpad-card-background: var(--ha-card-background, var(--primary-background-color, var(--card-background-color, rgba(255, 255, 255, 1))));
        --touchpad-card-box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
        --touchpad-card-border-radius: var(--ha-card-border-radius, 12px);

        /* HEADER */
        --touchpad-card-header-background: var(--ha-card-background, rgba(255, 255, 255, 0));
        --touchpad-card-header-color: var(--primary-text-color, rgba(255, 255, 255, 1));
      
        /* TOUCHPAD */
        /* This is the intended fallback chain, but I cannot get --state-icon-color to blend properly with its container while trying to match the appearance of the area card main area */
        /* --touchpad-card-touchpad-color: var(--touchpad-card-config-touchpad-color, var(--state-icon-color, var(--ha-card-background, var(--primary-background-color, #fff)))); */

        /* Alternative fallback chain that works better visually across devices until I can figure out how to match the area card */
        --touchpad-card-touchpad-color: var(--touchpad-card-config-touchpad-color, transparent);
        --touchpad-card-touchpad-opacity: var(--touchpad-card-config-touchpad-opacity, 1);
        --touchpad-card-touchpad-margin: var(--touchpad-card-config-touchpad-margin, var(--touchpad-card-default-margin));
        /* --touchpad-card-touchpad-blend-mode: overlay; */

        /* TOUCHPAD BORDER */
        --touchpad-card-touchpad-border-width: var(--touchpad-card-config-touchpad-border-width, var(--touchpad-card-default-border-width));
        --touchpad-card-touchpad-border-radius: var(--touchpad-card-config-touchpad-border-radius, 0px);
        --touchpad-card-touchpad-border-color: var(--touchpad-card-config-touchpad-border-color, var(--ha-card-border-color, var(--divider-color, var(--primary-text-color, #000))));

        /* TOUCHPAD OVERLAY TEXT */
        --touchpad-card-touchpad-text-color: var(--touchpad-card-config-touchpad-text-color, var(--primary-text-color));
        --touchpad-card-touchpad-text-opacity: var(--touchpad-card-config-touchpad-text-opacity, 1);

        /* TOUCHPAD OVERLAY ICON */
        --touchpad-card-touchpad-icon-scale: var(--touchpad-card-config-touchpad-icon-scale, var(--touchpad-card-default-icon-scale));
        --touchpad-card-touchpad-icon-color: var(--touchpad-card-config-touchpad-icon-color, var(--mdc-icon-color, #333));
        --touchpad-card-touchpad-icon-opacity: var(--touchpad-card-config-touchpad-icon-opacity, var(--touchpad-card-default-opacity));

        /* TOUCHPAD OVERLAY IMAGE */
        --touchpad-card-touchpad-image-scale: var(--touchpad-card-config-touchpad-image-scale, var(--touchpad-card-default-image-scale));
        --touchpad-card-touchpad-image-opacity: var(--touchpad-card-config-touchpad-image-opacity, var(--touchpad-card-default-opacity));

        /* FONTS */
        --touchpad-card-font-family: var(--ha-font-family-body, sans-serif);

        /* TOUCHPAD PSEUDOCLASS MULTIPLIERS (RELATIVE DELTAS) */
        --touchpad-card-hover-multiplier: 0.9;
        --touchpad-card-active-multiplier: 0.75;
      }

      /* ===== CARD ===== */
      ha-card {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
      }

      /* ===== VIEW-SCOPED RULES ===== */
      :host(.masonry-view) ha-card {
        min-height: var(--touchpad-card-masonry-min-height);
      }

      :host(.sections-view) {
        height: 100%;
      }

      :host(.sections-view) ha-card {
        height: 100%;
        min-height: unset;
      }

      /* ===== BACKGROUND ===== */
      .background {
        position: absolute;
        inset: 0;
        border-radius: var(--ha-card-border-radius,12px);
        margin: calc(-1 * var(--ha-card-border-width,1px));
        overflow: hidden;
      }

      /* ===== HEADER CONTAINER ===== */
      .header {
        color: var(--touchpad-card-header-color);
        font-family: var(--touchpad-card-font-family);
        margin: calc(-1 * var(--ha-card-border-width,1px));
        display: flex;
        flex-direction: column;
        flex: none;
      }

      /* ===== HEADER CONTENT ===== */
      .content {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 10px;
        flex: 1 1 0%;
        min-width: 0px;
        box-sizing: border-box;
        pointer-events: none;
        gap: 10px;
      }

      /* ===== HEADER ICON ===== */
      .icon-container {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .ha-icon {
        height: var(--mdc-icon-size, 24px);
        width: var(--mdc-icon-size, 24px);
        /* Removed margin since it's now handled by .icon-container */
      }

      /* ===== HEADER NAME ===== */
      .ha-info {
        min-width: 0;
        transition: background-color 180ms ease-in-out;
        box-sizing: border-box;
      }

      /* ===== TOUCHPAD ===== */

      .header+.touchpad-container {
        flex: 1 0 auto; /* If header is present, touchpad container flexes to fill remaining space */
      }

      .touchpad-container {
        flex: 1;
        display: flex;
        overflow: hidden;
        --tile-icon-color: var(--tile-color);
        position: relative;
        padding: 6px;
        margin: -6px;
      }

      .touchpad {
        background-color: var(--touchpad-card-touchpad-color);
        margin: var(--touchpad-card-touchpad-margin);
        border: solid;
        border-width: var(--touchpad-card-touchpad-border-width);
        border-radius: var(--touchpad-card-touchpad-border-radius);
        border-color: var(--touchpad-card-touchpad-border-color);
        box-shadow: var(--touchpad-card-box-shadow);
        overflow: hidden; /* Prevent content overflow (scroll bars) */
        font-family: var(--touchpad-card-font-family);
        width: 100%;
        display: flex;
        flex: 1;
        position: relative;
        z-index: 0;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: var(--touchpad-card-touchpad-opacity, 1);
        touch-action: none; /* Prevent default touch actions */
        transition: opacity 0.12s ease, transform 0.12s ease, background-color 0.12s ease, border-color 0.12s ease;

        /* Not supported on iOS */
        /* mix-blend-mode: var(--touchpad-card-touchpad-blend-mode, overlay); /* Blend with background */
      }

      /* ===== EFFECTS ===== */

      /* Apply hover feedback only on devices that support hover with fine pointer */
      @media (hover: hover) and (pointer: fine) {
        .touchpad:hover {
          opacity: calc(
            var(--touchpad-card-hover-multiplier, 0.9) * var(--touchpad-card-touchpad-opacity, 1)
          );
        }
      }

      .touchpad:active {
        opacity: calc(
          var(--touchpad-card-active-multiplier, 0.75) * var(--touchpad-card-touchpad-opacity, 1)
        );
        scale: 0.99;
      }

      .touchpad:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
        opacity: 0.9;
      }

      /* ===== HA RIPPLE EFFECT ===== */

      .touchpad ha-ripple {
        --ha-ripple-color: var(--tile-color);
        --ha-ripple-hover-opacity: 0; /* Disable ripple hover opacity because it sucks at corners inside borders */
        --ha-ripple-pressed-opacity: 0; /* Disable ripple pressed opacity because it sucks at corners inside borders */
        position: absolute;
        inset: 0;
        border-radius: var(--touchpad-card-touchpad-border-radius);
        pointer-events: none;
        z-index: 1;
      }

      /* ===== TOUCHPAD OVERLAY ===== */

      .graphics-container {
        position: absolute;
        inset: 0;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        pointer-events: none;
      }

      .graphics-icon {
        height: var(--touchpad-card-touchpad-icon-scale);
        width: var(--touchpad-card-touchpad-icon-scale);
        --mdc-icon-size: 100%;
        color: var(--touchpad-card-touchpad-icon-color);
        opacity: var(--touchpad-card-touchpad-icon-opacity);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        overflow: hidden;
      }

      .graphics-image {
        height: var(--touchpad-card-touchpad-image-scale);
        opacity: var(--touchpad-card-touchpad-image-opacity);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        overflow: hidden;
      }

      /* ===== TOUCHPAD TEXT ===== */

      .touchpad-text {
        color: var(--touchpad-card-touchpad-text-color);
        opacity: var(--touchpad-card-touchpad-text-opacity);
        font-family: var(--touchpad-card-font-family);
        overflow: visible;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        word-break: break-word;
        white-space: pre-wrap;
        font-size: min(1.2em, 4vw);
        padding: 8px;
        position: absolute;
        inset: 0;
        box-sizing: border-box;
        pointer-events: none;
        z-index: 2;
      }

      /* ===== FEEDBACK ===== */

      .feedback-container {
        position: absolute;
        bottom: 0px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        pointer-events: none;
      }

      .feedback {
        position: relative;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 8px;
        padding: 8px;
        width: 80px;
        height: 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
        opacity: 0;
        transition: opacity 200ms ease;
      }

      .feedback ha-icon {
        --mdc-icon-size: 32px;
        color: var(--primary-text-color);
        filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
        z-index: 1001;
        position: relative;
      }

      /* Continuous Rate Limited Layout */
      .continuous-row {
        display: flex;
        align-items: center;
        gap: 4px;
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
      }

      .counter-badge {
        background: rgba(255, 255, 255, 0.9);
        color: #000;
        border-radius: 6px;
        padding: 0px 1px;
        font-size: 16px;
        font-weight: bold;
        min-width: 16px;
        text-align: center;
        visibility: hidden;
        flex-shrink: 0;
        line-height: 1;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .increment-counter {
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        height: 20px;
      }

      .rate-limit-bar {
        width: 60px;
        height: 20px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        overflow: hidden;
        position: relative;
        visibility: hidden;
      }
      .rate-limit-bar-fill {
        height: 100%;
        width: 0%;
        background: var(--primary-color);
        border-radius: 8px;
        transition: width 0.2s ease;
        visibility: hidden;
      }

      .angle-text {
        position: absolute;
        bottom: 0px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 16px;
        color: var(--primary-text-color);
        font-weight: bold;
        visibility: hidden;
      }

    `;
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
  firstUpdated() {
    super.firstUpdated();
    
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
    let node = this;
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

/**
 * TouchpadCardEditor - Visual configuration editor for the Touchpad Card
 * Provides dynamic form-based configuration interface for Home Assistant
 */
class TouchpadCardEditor extends LitElement {

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

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
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
  static getConfigSchema(config = {}) {
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
  static _generateCacheKey(config = {}) {
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

  /**
   * Returns cache statistics for debugging and performance monitoring.
   * Provides insight into cache usage and effectiveness.
   * 
   * @returns {Object} Cache statistics object
   * @returns {number} returns.size - Current number of cached schemas
   * @returns {Array.<string>} returns.keys - Array of all cache keys
   * @static
   */
  static getCacheStats() {
    return {
      size: this._schemaCache.size,
      keys: Array.from(this._schemaCache.keys())
    };
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
  static createField(name, label, selector, icon, description) {
    const field = { name, label, selector };
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
      // this.createField("blend", "Blend Mode", {
      //   select: {
      //     options: [
      //       { value: "normal", label: "Normal (No Blending)" },
      //       { value: "multiply", label: "Multiply" },
      //       { value: "screen", label: "Screen" },
      //       { value: "overlay", label: "Overlay (Default)" },
      //       { value: "darken", label: "Darken" },
      //       { value: "lighten", label: "Lighten" },
      //       { value: "color-dodge", label: "Color Dodge" },
      //       { value: "color-burn", label: "Color Burn" },
      //       { value: "hard-light", label: "Hard Light" },
      //       { value: "soft-light", label: "Soft Light" },
      //       { value: "difference", label: "Difference" },
      //       { value: "exclusion", label: "Exclusion" },
      //       { value: "hue", label: "Hue" },
      //       { value: "saturation", label: "Saturation" },
      //       { value: "color", label: "Color" },
      //       { value: "luminosity", label: "Luminosity" }
      //     ],
      //     mode: "dropdown"
      //   }
      // }),
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
              'timer_single',
              `Single Tap Timer (${INTERACTION.TAP.TIMER_SINGLE_DEFAULT} ms)`,
              { number: { min: INTERACTION.TAP.TIMER_SINGLE_MIN, max: INTERACTION.TAP.TIMER_SINGLE_MAX, step: 10, unit_of_measurement: 'ms' } },
              ICON.TAP_TIMER_SINGLE,
              INTERACTION.TAP.TIMER_SINGLE_DESCRIPTION
            ),
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

      const config = ev.detail.value ?? {};

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

      // Sanitize color fields: remove keys where color is empty string/null/undefined
      try {
        const touchpad = config.touchpad;
        if (touchpad) {
          if (touchpad.color === '' || touchpad.color === null) delete touchpad.color;
          if (touchpad.border) {
            if (touchpad.border.color === '' || touchpad.border.color === null) delete touchpad.border.color;
            if (touchpad.border.opacity === '' || touchpad.border.opacity === null) delete touchpad.border.opacity;
          }
          const overlay = touchpad.overlay;
          if (overlay && overlay.graphics) {
            const graphics = overlay.graphics;
            if (graphics.icon) {
              if (graphics.icon.color === '' || graphics.icon.color === null) delete graphics.icon.color;
              if (graphics.icon.opacity === '' || graphics.icon.opacity === null) delete graphics.icon.opacity;
            }
            if (graphics.image) {
              if (graphics.image.opacity === '' || graphics.image.opacity === null) delete graphics.image.opacity;
            }
          }
          if (overlay && overlay.text) {
            const text = overlay.text;
            if (text.color === '' || text.color === null) delete text.color;
            if (text.opacity === '' || text.opacity === null) delete text.opacity;
          }
          if (touchpad.opacity === '' || touchpad.opacity === null) delete touchpad.opacity;
        }

        // Clean empty strings elsewhere recursively for color-like keys if desired
      } catch (e) {
        // Non-fatal: continue with assigning config
      }

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

      Object.values(categoryConfig).forEach(actionConfig => {
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
          <interaction-action-editor
            .hass=${this.hass}
            .config=${this.config}
            .visible=${this._showActionEditor}
            @config-changed=${this._handleActionEditorConfigChange}
          ></interaction-action-editor>
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
class InteractionActionEditor extends LitElement {

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

// #endregion

// #region ===== INTERACTION HANDLING, ROUTING, AND EXECUTION =====

/**
 * PointerHandler - Unified input event processor for mouse, touch, and stylus interactions.
 * Provides normalized pointer data and gesture recognition for TouchpadCard interaction system.
 * Handles multi-touch scenarios, pointer tracking, and coordinate normalization.
 * 
 * Features:
 * - Cross-browser pointer event handling
 * - Multi-touch support with pointer tracking
 * - Normalized coordinate system (0-1 range)
 * - Gesture state management
 * - Prevention of unwanted browser behaviors
 * - Memory-efficient event binding
 * 
 * @class PointerHandler
 */
class PointerHandler {
  /**
   * Initializes the PointerHandler with element binding and callback registration.
   * Sets up pointer tracking state and establishes event listener connections.
   * 
   * @param {HTMLElement} element - Target element for pointer event capture
   * @param {Object} callbacks - Event callbacks for pointer interaction lifecycle
   * @param {Function} callbacks.onPointerStart - Called when pointer input begins
   * @param {Function} callbacks.onPointerMove - Called during pointer movement
   * @param {Function} callbacks.onPointerEnd - Called when pointer input ends
   * @constructor
   */
  constructor(element, callbacks) {
    this.element = element;
    this.callbacks = callbacks;
    this.activePointers = new Map();
    this.isPointerDown = false;
    this.pointerStartTime = 0;
    this.startPosition = { x: 0, y: 0 };
    this.bindEvents();
  }

  bindEvents() {
    // Use pointer events for unified mouse/touch/stylus support
    this.boundPointerDown = this.handlePointerDown.bind(this);
    this.boundPointerMove = this.handlePointerMove.bind(this);
    this.boundPointerUp = this.handlePointerUp.bind(this);
    this.boundPointerCancel = this.handlePointerCancel.bind(this);
    this.boundContextMenu = (e) => e.preventDefault();
    this.boundSelectStart = (e) => e.preventDefault();

    // All these events need preventDefault() so they can't be passive
    // But we can still specify the option explicitly to silence warnings
    this.element.addEventListener('pointerdown', this.boundPointerDown, { passive: false });
    this.element.addEventListener('pointermove', this.boundPointerMove, { passive: false });
    this.element.addEventListener('pointerup', this.boundPointerUp, { passive: false });
    this.element.addEventListener('pointercancel', this.boundPointerCancel, { passive: false });
    
    // Prevent context menu and selection - these need preventDefault()
    this.element.addEventListener('contextmenu', this.boundContextMenu, { passive: false });
    this.element.addEventListener('selectstart', this.boundSelectStart, { passive: false });
  }

  handlePointerDown(event) {

    event.preventDefault();
    
    const pointer = this.createPointerData(event);
    this.activePointers.set(event.pointerId, pointer);
    
    // Capture the pointer so it continues tracking even outside element bounds
    // This ensures consistent behavior for all pointer types (mouse, touch, stylus)
    this.element.setPointerCapture(event.pointerId);
    
    if (!this.isPointerDown) {
      this.isPointerDown = true;
      this.pointerStartTime = performance.now();
      this.startPosition = { x: pointer.x, y: pointer.y };
    }

    this.callbacks?.onPointerStart?.(pointer, this.activePointers);
  }

  handlePointerMove(event) {
    if (!this.activePointers.has(event.pointerId)) return;
    
    event.preventDefault();
    const pointer = this.createPointerData(event);
    this.activePointers.set(event.pointerId, pointer);
    
    this.callbacks?.onPointerMove?.(pointer, this.activePointers);
  }

  handlePointerUp(event) {

    if (!this.activePointers.has(event.pointerId)) return;
    
    event.preventDefault();
    const pointer = this.createPointerData(event);
    
    // Remove pointer first, then call callback with updated map
    this.activePointers.delete(event.pointerId);
    
    // Release pointer capture when the pointer ends
    if (this.element.hasPointerCapture?.(event.pointerId)) {
      this.element.releasePointerCapture(event.pointerId);
    }
    
    this.callbacks?.onPointerEnd?.(pointer, this.activePointers);
    
    if (this.activePointers.size === 0) {
      this.isPointerDown = false;
    }
  }

  handlePointerCancel(event) {
    this.handlePointerUp(event);
  }

  createPointerData(event) {
    const rect = this.element.getBoundingClientRect();
    
    // Check if element has valid bounds
    const hasValidBounds = rect.width > 0 && rect.height > 0;
    
    let x, y;
    
    if (hasValidBounds) {
      // Normal case - element is properly sized and positioned
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    } else {
      // Fallback for invalid bounds - use direct event coordinates
      console.warn(`[TouchpadCard] Element bounds invalid (${rect.width}x${rect.height}), using direct coordinates`);
      
      // For touch/pointer events, try to get the most accurate coordinates
      if (event.offsetX !== undefined && event.offsetY !== undefined) {
        x = event.offsetX;
        y = event.offsetY;
      } else if (event.layerX !== undefined && event.layerY !== undefined) {
        x = event.layerX;
        y = event.layerY;
      } else {
        // Use raw client coordinates as last resort
        x = event.clientX;
        y = event.clientY;
      }
      

    }
    
    return {
      id: event.pointerId,
      x: x,
      y: y,
      timestamp: performance.now(),
      pressure: event.pressure || 0.5,
      type: event.pointerType
    };
  }

  getPointerCount() {
    return this.activePointers.size;
  }

  cleanup() {
    // Remove event listeners when cleaning up
    this.element.removeEventListener('pointerdown', this.boundPointerDown);
    this.element.removeEventListener('pointermove', this.boundPointerMove);
    this.element.removeEventListener('pointerup', this.boundPointerUp);
    this.element.removeEventListener('pointercancel', this.boundPointerCancel);
    this.element.removeEventListener('contextmenu', this.boundContextMenu);
    this.element.removeEventListener('selectstart', this.boundSelectStart);
  }
}

/**
 * InteractionRouter - Central coordinator for gesture recognition and interaction dispatch.
 * Analyzes pointer input patterns to determine interaction types (tap, linear, circular, multi-touch)
 * and routes them to appropriate handlers based on gesture characteristics and timing.
 * 
 * Features:
 * - Multi-gesture recognition (tap, hold, swipe, circular, pinch)
 * - Configurable sensitivity and timing parameters
 * - State machine for interaction lifecycle management  
 * - Multi-touch coordination and conflict resolution
 * - Performance-optimized distance and timing calculations
 * 
 * @class InteractionRouter
 */
class InteractionRouter {
  /**
   * Initializes the InteractionRouter with configuration and callback bindings.
   * Sets up state tracking, timing systems, and gesture recognition parameters from config.
   * 
   * @param {Object} config - Interaction configuration with sensitivity and timing settings
   * @param {Object} callbacks - Callback functions for interaction lifecycle events
   * @param {Function} callbacks.onInteractionStart - Called when interaction begins
   * @param {Function} callbacks.onInteractionUpdate - Called during interaction progress
   * @param {Function} callbacks.onInteractionEnd - Called when interaction completes
   * @constructor
   */
  constructor(config, callbacks) {
    this.config = config;
    this.callbacks = callbacks;
    this.interactionState = 'none';
    this.tapState = 'idle';
    this.tapCount = 0;
    this.lastTapTime = 0;
    this.tapTimerRuntime = null;
    this.linearTimerRuntime = null;
    this.holdTimerRuntime = null;
    this.firstPointer = null;
    this.totalDistance = 0;
    
    // Configuration map for all interaction properties
    const CONFIG_MAP = {
      // Tap properties
      tapTimerSingle: { 
        category: 'tap', 
        property: 'timer_single', 
        default: INTERACTION.TAP.TIMER_SINGLE_DEFAULT 
      },
      tapTimerDouble: { 
        category: 'tap', 
        property: 'timer_double', 
        default: INTERACTION.TAP.TIMER_DOUBLE_DEFAULT 
      },
      tapTimerHold: { 
        category: 'tap', 
        property: 'timer_hold', 
        default: INTERACTION.TAP.TIMER_HOLD_DEFAULT 
      },
      
      // Linear properties
      linearThreshold: { 
        category: 'linear', 
        property: 'threshold', 
        default: INTERACTION.LINEAR.THRESHOLD_DEFAULT 
      },
      linearTimer: { 
        category: 'linear', 
        property: 'timer', 
        default: INTERACTION.LINEAR.TIMER_DEFAULT 
      },
      linearTolerance: { 
        category: 'linear', 
        property: 'tolerance', 
        default: INTERACTION.LINEAR.TOLERANCE_DEFAULT 
      },
      linearIncrement: {
        category: 'linear',
        property: 'increment',
        default: INTERACTION.LINEAR.INCREMENT_DEFAULT
      },
      linearSettledTimer: {
        category: 'linear',
        property: 'settled_timer',
        default: INTERACTION.LINEAR.SETTLED_TIMER_DEFAULT
      },
      linearSettledRadius: {
        category: 'linear',
        property: 'settled_radius',
        default: INTERACTION.LINEAR.SETTLED_RADIUS_DEFAULT
      },
      
      // Circular properties
      circularThresholdDetection: {
        category: 'circular',
        property: 'threshold_detection',
        default: INTERACTION.CIRCULAR.THRESHOLD_DETECTION_DEFAULT
      },
      circularThresholdInitial: {
        category: 'circular', 
        property: 'threshold_initial',
        default: INTERACTION.CIRCULAR.THRESHOLD_INITIAL_DEFAULT
      },
      circularThresholdIncrement: {
        category: 'circular',
        property: 'threshold_increment', 
        default: INTERACTION.CIRCULAR.THRESHOLD_INCREMENT_DEFAULT
      },
      circularRateActionMax: {
        category: 'circular',
        property: 'rate_action_max',
        default: INTERACTION.CIRCULAR.RATE_ACTION_MAX_DEFAULT
      },
      
      // Multi-touch properties
      multiTimer: {
        category: 'multi',
        property: 'timer',
        default: INTERACTION.MULTI.TIMER_DEFAULT
      },
      multiThreshold: {
        category: 'multi',
        property: 'threshold',
        default: INTERACTION.MULTI.THRESHOLD_DEFAULT
      },
      multiRatio: {
        category: 'multi',
        property: 'ratio',
        default: INTERACTION.MULTI.RATIO_DEFAULT
      }
    };

    // Apply all configurations in one loop
    Object.entries(CONFIG_MAP).forEach(([propertyName, configDef]) => {
      const value = resolveConfigValue(
        config, 
        configDef.category, 
        configDef.property, 
        configDef.default
      );
      this[propertyName] = value;
    });

  // Ensure all runtime state starts from a known baseline so the first interaction works
  // after a page refresh (initializes counters/timestamps to 0 and angles to null).
  this.resetState();
  }

  onPointerStart(pointer, activePointers) {

    // Clear any existing timers
    this.clearTimers();
    
    if (activePointers.size === 1) {
      // Detect second-tap start within double-tap window: enables double_* circular mode
      const now = performance.now();
      if (this.tapCount === 1 && (now - this.lastTapTime) <= this.tapTimerDouble) {
        this.doubleTapActive = true;
        // Prevent pending single-tap fallback from first tap
        if (this.tapTimerRuntime) {
          clearTimeout(this.tapTimerRuntime);
          this.tapTimerRuntime = null;
        }
      }
      // Single pointer - potential tap interaction
      this.firstPointer = pointer;
      this.totalDistance = 0;
      this.interactionState = 'potential_tap';
      
      // Initialize circular interaction center at pointer down location
      this.circularCenter = { x: pointer.x, y: pointer.y };
      this.circularTransitioned = false;
      

      
      // Start hold timer
      this.holdTimerRuntime = setTimeout(() => {
        this.recognizeHold();
      }, this.tapTimerHold);
    } else if (activePointers.size === 2) {
      // Two pointers - potential pinch or rotation interaction
      this.interactionState = 'multi_touch';
      this.multiPointers = Array.from(activePointers.values());
      this.initializeMultiTouchInteraction();

    } else {
      // More than 2 pointers - set to multi-touch state for future Phase 2 implementation
      this.interactionState = 'multi_touch';
      this.clearTimers();
    }
  }

  onPointerMove(pointer, activePointers) {
    if (this.interactionState === 'potential_tap' && this.firstPointer) {
      // Calculate movement distance
      const distance = getDistance(
        this.firstPointer.x, this.firstPointer.y,
        pointer.x, pointer.y
      );
      this.totalDistance = Math.max(this.totalDistance, distance);
      
      // If movement exceeds LINEAR threshold, transition to linear interaction detection
      if (this.totalDistance > this.linearThreshold) {
        this.transitionToLinear();
      }
    } else if ((this.interactionState === 'linear' || this.interactionState === 'linear_detect' || this.interactionState === 'linear_continuous' || this.interactionState === 'circular_detection') && this.firstPointer) {
      // Update total distance for linear interaction from start
      const distance = getDistance(
        this.firstPointer.x, this.firstPointer.y,
        pointer.x, pointer.y
      );
      this.totalDistance = Math.max(this.totalDistance, distance);

      // Handle continuous-linear lifecycle
      if (this.interactionState === 'linear_detect') {
        // No-move settle using a timeout: reset timer on movement
        const movedSinceLast = this._updateLinearLastMove(pointer);
        if (movedSinceLast) {
          this._scheduleLinearSettle();
        }
        // While still detecting, circular transitions are allowed until latch
        this.checkCircularTransition(pointer);
      } else if (this.interactionState === 'linear_continuous') {
        // Cancel if leaving settled zone
        const d = getDistance(this.linearSettledAt.x, this.linearSettledAt.y, pointer.x, pointer.y);
        if (d > this.linearSettledZoneRadiusRuntime) {
          this._cancelLinearContinuous('exit_zone');
        }
        // Do NOT check circular when latched
      } else {
        // Pre-detect linear or circular
        this.checkCircularTransition(pointer);
      }
    } else if (this.interactionState === 'circular' && this.circularCenter) {
      // Process circular interaction movement
      this.processCircularMovement(pointer);
    } else if (this.interactionState === 'multi_touch' && activePointers.size >= 2) {
      // Process multi-touch interaction movement
      this.processMultiTouchMovement(activePointers);
    }
  }

  onPointerEnd(pointer, activePointers) {

    if (this.interactionState === 'potential_tap' && activePointers.size === 0) {
      // Single tap completed within distance threshold

      this.clearTimers();
      this.processTap();
    } else if ((this.interactionState === 'linear' || this.interactionState === 'linear_detect') && activePointers.size === 0) {
      // Pointer up before settle: discrete fallback
      this.clearTimers();
      this.processLinear(pointer);
    } else if (this.interactionState === 'linear_continuous' && activePointers.size === 0) {
      // Cancel continuous on pointer up
      this._cancelLinearContinuous('pointer_up');
    } else if (this.interactionState === 'circular_detection' && activePointers.size === 0) {
      // Circular detection completed - check if circular interaction was detected

      this.clearTimers();
      if (this.latchedDirection || this.circularIncrementCount > 0) {
        // Circular interaction was detected during movement

        this.processCircularEnd(pointer);
      } else {
        // No circular interaction detected, process as linear

        this.processLinear(pointer);
      }
    } else if (this.interactionState === 'circular' && activePointers.size === 0) {
      // Circular interaction completed

      this.clearTimers();
      this.processCircularEnd(pointer);
    } else if (this.interactionState === 'multi_touch' && activePointers.size === 0) {
      // Multi-touch interaction completed

      this.clearTimers();
      this.processMultiTouchEnd();
    } else if (activePointers.size === 0) {
      // All pointers lifted - reset state

      this.resetState();
    }
  }

  processTap() {

    const currentTime = performance.now();
    const timeSinceLastTap = currentTime - this.lastTapTime;
    
    if (this.tapCount === 0 || timeSinceLastTap > this.tapTimerDouble) {
      // First tap or too long since last tap
      this.tapCount = 1;
      this.lastTapTime = currentTime;

      
      // Wait for potential double tap
      this.tapTimerRuntime = setTimeout(() => {
        this.recognizeSingleTap();
      }, this.tapTimerDouble);
    } else if (this.tapCount === 1 && timeSinceLastTap <= this.tapTimerDouble) {
      // Double tap detected

      this.recognizeDoubleTap();
    }
  }

  recognizeSingleTap() {

    const interactionData = { 
      type: 'tap',
      pointers: 1,
      pointerType: this.firstPointer?.type || 'unknown'
    };
    this.callbacks?.onInteractionRecognized?.('tap', interactionData);
    this.callbacks?.onActionExecute?.('tap', interactionData);
    this.resetState();
  }

  recognizeDoubleTap() {

    this.clearTimers();
    const interactionData = { 
      type: 'double_tap',
      pointers: 1,
      pointerType: this.firstPointer?.type || 'unknown'
    };
    this.callbacks?.onInteractionRecognized?.('double_tap', interactionData);
    this.callbacks?.onActionExecute?.('double_tap', interactionData);
    this.resetState();
  }

  recognizeHold() {
    this.clearTimers();
    
    // Calculate duration from first pointer press to hold recognition
    const duration = this.firstPointer ? performance.now() - this.firstPointer.timestamp : null;
    
    const interactionData = { 
      type: 'hold',
      duration: duration,
      pointers: 1,
      pointerType: this.firstPointer?.type || 'unknown'
    };
    this.callbacks?.onInteractionRecognized?.('hold', interactionData);
    this.callbacks?.onActionExecute?.('hold', interactionData);
    this.resetState();
  }

  transitionToLinear() {

    // Enter linear detection phase
    this.interactionState = 'linear_detect';
    this.clearTimers();
  this.linearLastMove = { x: this.firstPointer.x, y: this.firstPointer.y, t: performance.now() };
  // Start settle timeout so latch occurs even if no more move events come in
  this._scheduleLinearSettle();
    // After linearTimer, allow circular detection if not yet latched
    this.linearTimerRuntime = setTimeout(() => {
      if (this.interactionState === 'linear_detect') {
        this.interactionState = 'circular_detection';
      }
      // Only clear this specific timer; do not touch other timers/intervals
      this.linearTimerRuntime = null;
    }, this.linearTimer);
  }

  processLinear(endPointer) {

    
    // Check if movement meets minimum distance requirement for linear interaction
    if (this.totalDistance < this.linearThreshold) {

      this.resetState();
      return;
    }

    // Calculate direction angle (0° = right, 90° = down, 180° = left, 270° = up)
    const deltaX = endPointer.x - this.firstPointer.x;
    const deltaY = endPointer.y - this.firstPointer.y;
    
    // Convert to degrees (0-360)
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    if (angle < 0) angle += 360;



    // Determine direction based on angle and tolerance
    const direction = this.getLinearDirection(angle);
    
    if (direction) {
      // Calculate interaction duration
      const duration = endPointer.timestamp - this.firstPointer.timestamp;
      
      const interactionData = {
        type: direction,
        distance: this.totalDistance,
        angle: angle,
        duration: duration,
        pointers: 1,
        pointerType: this.firstPointer?.type || 'unknown'
      };
      this.callbacks?.onInteractionRecognized?.(direction, interactionData);
      this.callbacks?.onActionExecute?.(direction, interactionData);
    } else {

    }
    
    this.resetState();
  }

  getLinearDirection(angle) {
    const tolerance = this.linearTolerance;
    
    // Right: 0° ± tolerance (handles wrap-around)
    if (angle <= tolerance || angle >= (360 - tolerance)) {
      return 'right';
    }
    // Down: 90° ± tolerance
    if (angle >= (90 - tolerance) && angle <= (90 + tolerance)) {
      return 'down';
    }
    // Left: 180° ± tolerance
    if (angle >= (180 - tolerance) && angle <= (180 + tolerance)) {
      return 'left';
    }
    // Up: 270° ± tolerance
    if (angle >= (270 - tolerance) && angle <= (270 + tolerance)) {
      return 'up';
    }
    
    // If not cardinal, determine diagonal based on quadrant
    if (angle > tolerance && angle < (90 - tolerance)) {
      return 'down_right'; // Quadrant I
    } else if (angle > (90 + tolerance) && angle < (180 - tolerance)) {
      return 'down_left'; // Quadrant II
    } else if (angle > (180 + tolerance) && angle < (270 - tolerance)) {
      return 'up_left'; // Quadrant III
    } else { // angle > (270 + tolerance) && angle < (360 - tolerance)
      return 'up_right'; // Quadrant IV
    }
  }

  // ===== Continuous Linear helpers =====
  _updateLinearLastMove(pointer) {
    const EPSILON = 1.5; // px minimal jitter threshold
    const moved = getDistance(this.linearLastMove.x, this.linearLastMove.y, pointer.x, pointer.y) > EPSILON;
    if (moved) {
      this.linearLastMove = { x: pointer.x, y: pointer.y, t: performance.now() };
    }
    return moved;
  }

  _scheduleLinearSettle() {
    this._clearLinearSettleTimer();
    this.linearSettleTimeout = setTimeout(() => {
      if (this.interactionState === 'linear_detect' && this.linearLastMove) {
        // Use last known position for settle anchor
        const fakePointer = { x: this.linearLastMove.x, y: this.linearLastMove.y };
        this._latchLinearContinuous(fakePointer);
      }
    }, this.linearSettledTimer);
  }

  _clearLinearSettleTimer() {
    if (this.linearSettleTimeout) {
      clearTimeout(this.linearSettleTimeout);
      this.linearSettleTimeout = null;
    }
  }

  _latchLinearContinuous(pointer) {
    // Lock into continuous linear; disable circular competition
    this.interactionState = 'linear_continuous';
    this.linearSettledAt = { x: pointer.x, y: pointer.y };
    this.linearSettledZoneRadiusRuntime = this.linearSettledRadius || INTERACTION.LINEAR.SETTLED_RADIUS_DEFAULT;
    this.linearIncrementCount = 0;
    this.linearIncrementTimer = null;
  // Clear pending settle timeout
  this._clearLinearSettleTimer();

    // Determine direction once at latch, ignore subsequent drift
    const deltaX = pointer.x - this.firstPointer.x;
    const deltaY = pointer.y - this.firstPointer.y;
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    this.linearLatchedDirection = this.getLinearDirection(angle);

    // Clear pending linear-detection timer so it can't interfere later
    if (this.linearTimerRuntime) {
      clearTimeout(this.linearTimerRuntime);
      this.linearTimerRuntime = null;
    }

    // Fire first increment immediately on settle, then start interval
    this._fireLinearIncrement();
    this.linearIncrementTimer = setInterval(() => {
      if (this.interactionState === 'linear_continuous') this._fireLinearIncrement();
    }, this.linearIncrement);
  }

  _fireLinearIncrement() {
    if (!this.linearLatchedDirection) return;
    this.linearIncrementCount += 1;
    const now = performance.now();
    const duration = this.firstPointer ? now - this.firstPointer.timestamp : null;
    const interactionData = {
      type: this.linearLatchedDirection,
      incrementCount: this.linearIncrementCount,
      actionsFired: this.linearIncrementCount,
      duration: duration,
      pointers: 1,
      pointerType: this.firstPointer?.type || 'unknown'
    };
    // Recognition/feedback and action each interval
    this.callbacks?.onInteractionRecognized?.(this.linearLatchedDirection, interactionData);
    this.callbacks?.onActionExecute?.(this.linearLatchedDirection, interactionData);
  // Per-increment logging removed to reduce noise
  }

  _cancelLinearContinuous(reason) {
    if (this.linearIncrementTimer) {
      clearInterval(this.linearIncrementTimer);
      this.linearIncrementTimer = null;
    }
  this._clearLinearSettleTimer();
    // Log completion with summary
    if (this.linearLatchedDirection && this.linearIncrementCount > 0) {
      const now = performance.now();
      const duration = this.firstPointer ? now - this.firstPointer.timestamp : null;
      const interactionData = {
        type: this.linearLatchedDirection,
        incrementCount: this.linearIncrementCount,
        actionsFired: this.linearIncrementCount,
        completed: true,
        cancelReason: reason,
        duration: duration,
        pointers: 1,
        pointerType: this.firstPointer?.type || 'unknown'
      };
      this.callbacks?.onInteractionRecognized?.(this.linearLatchedDirection, interactionData);
    }
    this.resetState();
  }

  initializeMultiTouchInteraction() {
    if (this.multiPointers.length !== 2) return;
    
    const [pointer1, pointer2] = this.multiPointers;
    
    // Calculate initial distance between pointers
    this.multiInitialDistance = getDistance(pointer1.x, pointer1.y, pointer2.x, pointer2.y);
    this.multiCurrentDistance = this.multiInitialDistance;
    
    // Calculate initial center point between pointers
    this.multiInitialCenter = {
      x: (pointer1.x + pointer2.x) / 2,
      y: (pointer1.y + pointer2.y) / 2
    };
    this.multiCurrentCenter = { ...this.multiInitialCenter };
    this.multiLinearDistance = 0;
    
    // Reset interaction state
    this.multiInteractionType = null;
    this.multiPinchFired = false;
    this.multiLinearFired = false;
  }

  processMultiTouchMovement(activePointers) {
    if (activePointers.size !== 2) return;
    
    const pointers = Array.from(activePointers.values());
    const [pointer1, pointer2] = pointers;
    
    // Calculate current distance and center
    const currentDistance = getDistance(pointer1.x, pointer1.y, pointer2.x, pointer2.y);
    const currentCenter = {
      x: (pointer1.x + pointer2.x) / 2,
      y: (pointer1.y + pointer2.y) / 2
    };
    
    // Calculate changes from initial values
    const pinchChange = Math.abs(currentDistance - this.multiInitialDistance);
    const linearDistance = getDistance(
      this.multiInitialCenter.x, this.multiInitialCenter.y,
      currentCenter.x, currentCenter.y
    );
    
    // Update current values
    this.multiCurrentCenter = currentCenter;
    this.multiLinearDistance = linearDistance;
    
    // Determine interaction type using priority ratio if not already set
    if (!this.multiInteractionType) {
      const ratio = linearDistance / (pinchChange + 1);
      
      if (ratio > this.multiRatio && linearDistance > 10) {
        this.multiInteractionType = 'linear';
      } else if (pinchChange > 5) {
        this.multiInteractionType = 'pinch';
      }
    }
    
    if (this.multiInteractionType === 'pinch') {
      this.processMultiTouchPinch(currentDistance);
    } else if (this.multiInteractionType === 'linear') {
      // Continuous 2-finger linear with settle/timer
      if (!this.multiLinearState) {
        // Enter detection once beyond threshold
        if (linearDistance >= this.linearThreshold) {
          this.multiLinearState = 'detect';
          this.multiLinearLastMove = { x: currentCenter.x, y: currentCenter.y, t: performance.now() };
          this.multiLinearSettleStartTime = performance.now();
        }
      }

      if (this.multiLinearState === 'detect') {
        const moved = getDistance(this.multiLinearLastMove.x, this.multiLinearLastMove.y, currentCenter.x, currentCenter.y) > 1.5;
        if (moved) {
          this.multiLinearLastMove = { x: currentCenter.x, y: currentCenter.y, t: performance.now() };
          this.multiLinearSettleStartTime = performance.now();
        } else {
          const now = performance.now();
          if (now - this.multiLinearSettleStartTime >= this.linearSettledTimer) {
            // Latch continuous
            this.multiLinearState = 'continuous';
            this.multiLinearSettledAt = { x: currentCenter.x, y: currentCenter.y };
            // Determine direction once using initial center movement
            const deltaX = currentCenter.x - this.multiInitialCenter.x;
            const deltaY = currentCenter.y - this.multiInitialCenter.y;
            let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
            if (angle < 0) angle += 360;
            const tol = this.linearTolerance;
            this.multiLinearLatchedDirection = null;
            if (angle >= (270 - tol) && angle <= (270 + tol)) {
              this.multiLinearLatchedDirection = 'up_2';
            } else if (angle >= (90 - tol) && angle <= (90 + tol)) {
              this.multiLinearLatchedDirection = 'down_2';
            } else {
              // If not clear up/down, map to the nearest (keep simple)
              this.multiLinearLatchedDirection = (Math.abs(angle - 270) < Math.abs(angle - 90)) ? 'up_2' : 'down_2';
            }
            this.multiLinearIncrementCount = 0;
            if (this.config?.interactions?.debugging?.logging) {
              console.info('[TouchpadCard] Linear(2) start:', {
                direction: this.multiLinearLatchedDirection,
                settled_at: this.multiLinearSettledAt,
                radius: this.linearSettledRadius
              });
            }
            // Fire first increment immediately
            this._fireMultiLinearIncrement();
            this.multiLinearIncrementTimer = setInterval(() => {
              if (this.multiLinearState === 'continuous') this._fireMultiLinearIncrement();
            }, this.linearIncrement);
          }
        }
      } else if (this.multiLinearState === 'continuous') {
        // Cancel if center leaves settled zone
        const d = getDistance(this.multiLinearSettledAt.x, this.multiLinearSettledAt.y, currentCenter.x, currentCenter.y);
        if (d > this.linearSettledRadius) {
          this._cancelMultiLinearContinuous('exit_zone');
        }
      } else {
        // Before detect threshold met, do nothing
      }
    }
  }

  processMultiTouchPinch(currentDistance) {
    // Only fire once per interaction session
    if (this.multiPinchFired) return;
    
    const distanceChange = currentDistance - this.multiInitialDistance;
    const threshold = this.multiThreshold;
    
    // Check for significant pinch interaction
    if (Math.abs(distanceChange) >= threshold) {
      const interactionType = distanceChange > 0 ? 'pinch_out' : 'pinch_in';
      const interactionData = {
        change: distanceChange,
        startDistance: this.multiInitialDistance,
        endDistance: currentDistance,
        pointers: this.multiPointers.length,
        pointerType: this.firstPointer?.type || 'unknown'
      };
      
      // Fire pinch interaction once per session
      this.callbacks.onInteractionRecognized(interactionType, interactionData);
      this.callbacks?.onActionExecute?.(interactionType, interactionData);
      this.multiPinchFired = true;
    }
  }

  processMultiTouchEnd() {
    // End multi interactions; cancel multi-linear continuous if active
    if (this.multiLinearState === 'continuous') {
      this._cancelMultiLinearContinuous('pointer_up');
      return;
    }
    // Discrete fallback for quick two-finger swipe (up_2/down_2)
    if (this.multiInteractionType === 'linear' && this.multiLinearDistance >= this.linearThreshold) {
      const deltaX = (this.multiCurrentCenter?.x ?? this.multiInitialCenter.x) - this.multiInitialCenter.x;
      const deltaY = (this.multiCurrentCenter?.y ?? this.multiInitialCenter.y) - this.multiInitialCenter.y;
      let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      const tolerance = this.linearTolerance;
      let direction = null;
      if (angle >= (270 - tolerance) && angle <= (270 + tolerance)) {
        direction = 'up_2';
      } else if (angle >= (90 - tolerance) && angle <= (90 + tolerance)) {
        direction = 'down_2';
      }
      if (direction) {
        const interactionData = {
          type: direction,
          distance: this.multiLinearDistance,
          angle: angle,
          pointers: 2,
          pointerType: this.firstPointer?.type || 'unknown'
        };
        this.callbacks.onInteractionRecognized(direction, interactionData);
        this.callbacks?.onActionExecute?.(direction, interactionData);
      }
    }
    this.resetState();
  }

  _fireMultiLinearIncrement() {
    if (!this.multiLinearLatchedDirection) return;
    this.multiLinearIncrementCount += 1;
    const now = performance.now();
    const duration = this.firstPointer ? now - this.firstPointer.timestamp : null;
    const interactionData = {
      type: this.multiLinearLatchedDirection,
      incrementCount: this.multiLinearIncrementCount,
      actionsFired: this.multiLinearIncrementCount,
      duration: duration,
      pointers: 2,
      pointerType: this.firstPointer?.type || 'unknown'
    };
    this.callbacks?.onInteractionRecognized?.(this.multiLinearLatchedDirection, interactionData);
    this.callbacks?.onActionExecute?.(this.multiLinearLatchedDirection, interactionData);
  // Per-increment logging removed to reduce noise
  }

  _cancelMultiLinearContinuous(reason) {
    if (this.multiLinearIncrementTimer) {
      clearInterval(this.multiLinearIncrementTimer);
      this.multiLinearIncrementTimer = null;
    }
    if (this.multiLinearLatchedDirection && this.multiLinearIncrementCount > 0) {
      const now = performance.now();
      const duration = this.firstPointer ? now - this.firstPointer.timestamp : null;
      const interactionData = {
        type: this.multiLinearLatchedDirection,
        incrementCount: this.multiLinearIncrementCount,
        actionsFired: this.multiLinearIncrementCount,
        completed: true,
        cancelReason: reason,
        duration: duration,
        pointers: 2,
        pointerType: this.firstPointer?.type || 'unknown'
      };
      this.callbacks?.onInteractionRecognized?.(this.multiLinearLatchedDirection, interactionData);
      if (this.config?.interactions?.debugging?.logging) {
        console.info('[TouchpadCard] Linear(2) cancel:', {
          reason,
          direction: this.multiLinearLatchedDirection,
          total_increments: this.multiLinearIncrementCount,
          duration
        });
      }
    }
    this.resetState();
  }

  checkCircularTransition(pointer) {
    if (!this.circularCenter || this.circularTransitioned) return;
    
    // Calculate angle from circular center to current position
    const currentAngle = getAngle(
      this.circularCenter.x, this.circularCenter.y,
      pointer.x, pointer.y
    );
    const normalizedCurrentAngle = normalizeAngle(currentAngle);
    
    // Initialize angles on first significant movement
  // Initialize tracking angles when they are not yet set (null or undefined)
  if (this.circularStartAngle == null || this.circularCurrentAngle == null) {
      this.circularStartAngle = normalizedCurrentAngle;
      this.circularCurrentAngle = normalizedCurrentAngle;
      this.circularTotalAngle = 0;
      return;
    }
    
    // Calculate angular change since last position
    let angleDelta = normalizedCurrentAngle - this.circularCurrentAngle;
    
    // Handle wrap-around (e.g., from 359° to 1°)
    if (angleDelta > 180) {
      angleDelta -= 360;
    } else if (angleDelta < -180) {
      angleDelta += 360;
    }
    
    // Accumulate total angle change
    this.circularTotalAngle += Math.abs(angleDelta);
    this.circularCurrentAngle = normalizedCurrentAngle;
    
    // Determine direction based on angle delta
    if (Math.abs(angleDelta) > 1) { // Minimum movement to determine direction
      this.circularDirection = angleDelta > 0 ? 'clockwise' : 'counterclockwise';
    }
    
    // Check if we've accumulated enough angle to transition to circular
    if (this.circularTotalAngle >= this.circularThresholdDetection) {
      this.transitionToCircular();
    }
  }

  transitionToCircular() {

    this.interactionState = 'circular';
    this.circularTransitioned = true;
    
    // CRITICAL: Clear all timers when transitioning to circular
    this.clearTimers();
    
    // Latch the direction based on current movement
    this.latchedDirection = this.circularDirection;
    
    // Mark whether this circular was initiated during an active double-tap sequence
    this.isDoubleCircular = !!this.doubleTapActive;

    
    // Initialize center history with current center
    this.centerHistory = [{ ...this.circularCenter }];
    
    // Reset angle accumulation for threshold counting
    this.circularAngleRemainder = 0;  // Track remainder after threshold subtractions
    this.circularAngleTotal = 0;  // Track total accumulated angle across all increments
    this.circularIncrementCount = 0;
  }

  processCircularMovement(pointer) {
    if (!this.circularCenter || !this.latchedDirection) return;
    
    // Use FIXED initial center instead of moving average to prevent angle inflation
    // This provides more accurate and consistent angle measurements
    
    // Calculate current angle from FIXED initial center
    const currentAngle = getAngle(
      this.circularCenter.x, this.circularCenter.y,
      pointer.x, pointer.y
    );
    const normalizedCurrentAngle = normalizeAngle(currentAngle);
    
    // Calculate angular change since last position
    let angleDelta = normalizedCurrentAngle - this.circularCurrentAngle;
    
    // Handle wrap-around
    if (angleDelta > 180) {
      angleDelta -= 360;
    } else if (angleDelta < -180) {
      angleDelta += 360;
    }
    
    // Only process angle changes that match the latched direction
    const currentDirection = angleDelta > 0 ? 'clockwise' : 'counterclockwise';
    const significantMovement = Math.abs(angleDelta) > 1;
    
    if (significantMovement && currentDirection === this.latchedDirection) {
      // Accumulate total angle for matching direction
      const angleDeltaAbs = Math.abs(angleDelta);
      this.circularAngleRemainder += angleDeltaAbs;  // Accumulate in remainder
      this.circularAngleTotal += angleDeltaAbs;  // Track total accumulated angle
      this.circularCurrentAngle = normalizedCurrentAngle;
      
      // Check for initial threshold
      if (this.circularIncrementCount === 0 && this.circularAngleRemainder >= this.circularThresholdInitial) {
        this.circularIncrementCount++;
        this.fireCircularInteraction();
        this.circularAngleRemainder -= this.circularThresholdInitial; // Subtract threshold, keep remainder
      }
      // Check for increment thresholds
      else if (this.circularIncrementCount > 0 && this.circularAngleRemainder >= this.circularThresholdIncrement) {
        this.circularIncrementCount++;
        this.fireCircularInteraction();
        this.circularAngleRemainder -= this.circularThresholdIncrement; // Subtract threshold, keep remainder
      }
    }
    // If movement is significant but opposite direction, just update current angle without accumulating
    else if (significantMovement) {
      this.circularCurrentAngle = normalizedCurrentAngle;
    }
  }

  updateMovingAverageCenter(pointer) {
    // Add current pointer position to history
    this.centerHistory.push({ x: pointer.x, y: pointer.y });
    
    // Keep only the last N positions for moving average
    if (this.centerHistory.length > this.centerHistoryMaxLength) {
      this.centerHistory.shift();
    }
  }

  getMovingAverageCenter() {
    if (this.centerHistory.length === 0) {
      return this.circularCenter;
    }
    
    // Calculate average of all positions in history
    const sum = this.centerHistory.reduce(
      (acc, pos) => ({ x: acc.x + pos.x, y: acc.y + pos.y }), 
      { x: 0, y: 0 }
    );
    
    return {
      x: sum.x / this.centerHistory.length,
      y: sum.y / this.centerHistory.length
    };
  }

  fireCircularInteraction() {
    const currentTime = performance.now();
    const timeSinceLastAction = currentTime - this.circularLastActionTime;
    const minInterval = 1000 / this.circularRateActionMax; // Convert rate to milliseconds
    
    const interactionType = this.isDoubleCircular
      ? (this.latchedDirection === 'clockwise' ? 'double_clockwise' : 'double_counterclockwise')
      : (this.latchedDirection === 'clockwise' ? 'circular_clockwise' : 'circular_counterclockwise');
    
    // Rate limiting check - acts as a filter, not a cap
    const shouldFireAction = this.circularLastActionTime === 0 || timeSinceLastAction >= minInterval;
    
    if (shouldFireAction) {
      this.circularActionsFired++;
      this.circularLastActionTime = currentTime;
    }
    
    // Track the rate limiting state
    this.circularLastRateLimited = !shouldFireAction;
    
    // Calculate duration from interaction start
    const duration = this.firstPointer ? currentTime - this.firstPointer.timestamp : null;
    
    // Calculate current angular sweep using actual tracked angle
    const currentAngularSweep = this.circularAngleTotal;
    
    const interactionData = {
      direction: this.latchedDirection,
      incrementCount: this.circularIncrementCount,
      actionsFired: this.circularActionsFired,
      rateMaxAction: this.circularRateActionMax,
      rateLimited: !shouldFireAction,
      timeSinceLastAction: timeSinceLastAction,
      minInterval: minInterval,
      duration: duration,
      currentAngularSweep: currentAngularSweep,
      pointers: 1,
      pointerType: this.firstPointer?.type || 'unknown'
    };
    
    // Always fire the interaction recognition callback for feedback/logging
    this.callbacks.onInteractionRecognized(interactionType, interactionData);
    
    // Only fire action execution when rate limiting allows
    if (shouldFireAction) {
      this.callbacks?.onActionExecute?.(interactionType, interactionData);
    }
  }

  processCircularEnd(endPointer = null) {
    if (this.circularIncrementCount > 0) {
      // Log summary of circular interaction

      
      // Fire final interaction with summary
      const interactionType = this.isDoubleCircular
        ? (this.latchedDirection === 'clockwise' ? 'double_clockwise' : 'double_counterclockwise')
        : (this.latchedDirection === 'clockwise' ? 'circular_clockwise' : 'circular_counterclockwise');
      
      // Calculate duration if we have timing data
      let duration = null;
      if (endPointer && this.firstPointer) {
        duration = endPointer.timestamp - this.firstPointer.timestamp;
      }
      
      // Use actual total angular sweep
      const angularSweep = this.circularAngleTotal;
      
      const interactionData = {
        direction: this.latchedDirection,
        incrementCount: this.circularIncrementCount,
        actionsFired: this.circularActionsFired,
        rateMaxAction: this.circularRateActionMax,
        rateLimited: this.circularLastRateLimited,
        completed: true,
        duration: duration,
        angularSweep: angularSweep,
        currentAngularSweep: angularSweep,
        pointers: 1,
        pointerType: this.firstPointer?.type || 'unknown'
      };
      
      this.callbacks.onInteractionRecognized(interactionType, interactionData);
    }
    
    this.resetState();
  }

  clearTimers() {
    if (this.tapTimerRuntime) {
      clearTimeout(this.tapTimerRuntime);
      this.tapTimerRuntime = null;
    }
    if (this.holdTimerRuntime) {
      clearTimeout(this.holdTimerRuntime);
      this.holdTimerRuntime = null;
    }
    if (this.linearTimerRuntime) {
      clearTimeout(this.linearTimerRuntime);
      this.linearTimerRuntime = null;
    }
    if (this.linearIncrementTimer) {
      clearInterval(this.linearIncrementTimer);
      this.linearIncrementTimer = null;
    }
    if (this.linearSettleTimeout) {
      clearTimeout(this.linearSettleTimeout);
      this.linearSettleTimeout = null;
    }
    if (this.multiLinearIncrementTimer) {
      clearInterval(this.multiLinearIncrementTimer);
      this.multiLinearIncrementTimer = null;
    }
  }

  resetState() {
    this.interactionState = 'none';
    this.tapState = 'idle';
    this.tapCount = 0;
    this.doubleTapActive = false;
    this.isDoubleCircular = false;
    this.firstPointer = null;
    this.totalDistance = 0;
    // Linear continuous state
    this.linearLatchedDirection = null;
    this.linearLastMove = null;
    this.linearSettleStartTime = null;
    this.linearSettledAt = null;
    this.linearIncrementCount = 0;
    if (this.linearIncrementTimer) {
      clearInterval(this.linearIncrementTimer);
      this.linearIncrementTimer = null;
    }
    if (this.linearSettleTimeout) {
      clearTimeout(this.linearSettleTimeout);
      this.linearSettleTimeout = null;
    }
    
    // Circular interaction state
    this.circularCenter = null;
    this.circularStartAngle = null;
    this.circularCurrentAngle = null;
    this.circularAngleRemainder = 0;  // Reset remainder angle
    this.circularAngleTotal = 0;  // Reset total accumulated angle
    this.circularIncrementCount = 0;
    this.circularDirection = null;
    this.circularTransitioned = false;
    
    // Enhanced circular tracking
    this.latchedDirection = null;
    this.centerHistory = [];
    this.centerHistoryMaxLength = PERFORMANCE.MAX_POINTER_HISTORY;
    
    // Multi-touch interaction state
    this.multiPointers = [];
    this.multiInitialDistance = 0;
    this.multiCurrentDistance = 0;
    this.multiInitialCenter = null; // Center point of 2 pointers
    this.multiCurrentCenter = null;
    this.multiLinearDistance = 0; // Total linear movement of center
    this.multiInteractionType = null; // 'pinch' or 'linear'
    this.multiPinchFired = false;
    this.multiLinearFired = false;
    this.multiLinearState = null;
    this.multiLinearSettledAt = null;
    this.multiLinearIncrementCount = 0;
    if (this.multiLinearIncrementTimer) {
      clearInterval(this.multiLinearIncrementTimer);
      this.multiLinearIncrementTimer = null;
    }
    
    // Action rate limiting state for continuous interactions
    this.circularActionsFired = 0;
    this.circularLastActionTime = 0;
    this.circularLastRateLimited = false; // Track last rate limiting state
    
    this.clearTimers();
  }

  cleanup() {
    this.clearTimers();
    this.resetState();
  }
}

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
class ActionExecutor {

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
        
        let serviceData = { ...actionConfig.service_data } || {};
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
        
        let performData = { ...actionConfig.data } || {};
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

// #endregion

// #region ===== FEEDBACK AND DEBUGGING =====

/**
 * FeedbackVisualizer - Visual feedback and debugging display system for TouchpadCard interactions.
 * Provides real-time visual indicators for interaction states, gesture recognition feedback,
 * and developer debugging information. Manages overlay icons, animations, and status displays.
 * 
 * Features:
 * - Real-time interaction feedback with icons and animations
 * - Developer debugging overlays with interaction data
 * - Performance-optimized DOM updates using element caching
 * - Lazy initialization to minimize resource usage
 * - Configurable feedback modes and styling
 * - Gesture state visualization with timing information
 * 
 * @class FeedbackVisualizer
 */
class FeedbackVisualizer {
  /**
   * Initializes the FeedbackVisualizer with element and configuration references.
   * Sets up lazy-loaded feedback system with element caching for performance optimization.
   * 
   * @param {HTMLElement} element - Target element for feedback display
   * @param {Object} config - Configuration object with feedback settings
   * @param {boolean} config.feedback - Whether feedback is enabled
   * @param {string} config.feedback_style - Style mode for feedback display
   * @constructor
   */
  constructor(element, config) {
    this.element = element;
    this.config = config;
    this.feedbackIcon = null;
    this.currentFeedback = null;
    
    // Initialize element cache for efficient DOM access
    this.elementCache = new ElementCache(element);
    
    // Don't initialize feedback icon here - wait until it's needed (lazy initialization)
  }

  /**
   * Lazy initialization for feedback icon element to optimize startup performance.
   * Searches for feedback icon in cached elements and fallback to direct DOM query.
   * 
   * @returns {boolean} True if feedback icon was successfully located and initialized
   */
  initializeFeedback() {
    // Only initialize when actually needed and warn if not found
    if (!this.feedbackIcon) {
      this.feedbackIcon = this.elementCache?.get('#feedback-icon') || this.element?.querySelector('#feedback-icon');
    }
    return this.feedbackIcon !== null;
  }

  showInteractionFeedback(interactionType, data) {
    // Only show feedback if debugging is enabled
    if (!this.config?.interactions?.debugging?.feedback) {
      return;
    }

    // Initialize feedback icon if not already done
    if (!this.initializeFeedback()) {
      console.warn('[TouchpadCard] FeedbackVisualizer: feedback element not found when attempting to show interaction feedback');
      return;
    }

    // Use RAF batching for all visual updates to optimize performance
    rafBatcher.schedule(() => {
      this._updateFeedbackVisual(interactionType, data);
    });
  }

  _updateFeedbackVisual(interactionType, data) {
    // Get icon for interaction type
    const icon = this.getInteractionIcon(interactionType);
    
    // Update the existing ha-icon element
    this.feedbackIcon.setAttribute('icon', icon);
    this.feedbackIcon.style.visibility = 'visible';
    this.feedbackIcon.style.transition = 'color 200ms ease, visibility 200ms ease';
    
    // Show the entire feedback container
    const feedbackDiv = this.feedbackIcon.parentElement;
    feedbackDiv.style.opacity = '1';
    
    // Get feedback container elements
    const continuousRow = feedbackDiv.querySelector('.continuous-row');
    const actionCounter = feedbackDiv.querySelector('.action-counter');
    const incrementCounter = feedbackDiv.querySelector('.increment-counter');
    const rateLimitBar = feedbackDiv.querySelector('.rate-limit-bar');
    const rateLimitBarFill = feedbackDiv.querySelector('.rate-limit-bar-fill');
    const angleText = feedbackDiv.querySelector('.angle-text');
    
    // Determine feedback type based on interaction
    const feedbackType = this.getFeedbackType(interactionType, data);
    
    // Show appropriate elements based on feedback type
    switch (feedbackType) {
      case 'continuous-rate-limited':
        this.showContinuousRateLimited(data, {
          continuousRow, actionCounter, incrementCounter, 
          rateLimitBar, rateLimitBarFill, angleText
        });
        break;
        
      case 'continuous-no-limit':
        this.showContinuousNoLimit(data, { 
          continuousRow, actionCounter, incrementCounter, rateLimitBar, rateLimitBarFill, angleText 
        });
        break;
        
      case 'non-continuous':
        // Just the icon - hide all continuous elements
        if (continuousRow) {
          continuousRow.style.visibility = 'hidden';
        }
        if (incrementCounter) {
          incrementCounter.style.visibility = 'hidden';
        }
        if (actionCounter) {
          actionCounter.style.visibility = 'hidden';
        }
        if (rateLimitBar) {
          rateLimitBar.style.visibility = 'hidden';
        }
        if (rateLimitBarFill) {
          rateLimitBarFill.style.visibility = 'hidden';
        }
        if (angleText) {
          angleText.style.visibility = 'hidden';
        }
        // Reset icon position to center
        if (this.feedbackIcon) {
          this.feedbackIcon.style.transform = '';
        }
        break;
    }
    
    // Auto-clear feedback after duration
    clearTimeout(this.currentFeedback);
    const isContinuousTick = !!(data && data.incrementCount > 0);
    if (!isContinuousTick || data?.completed) {
      this.currentFeedback = setTimeout(() => {
        this.clearFeedback();
      }, TOUCHPAD.FEEDBACK_DURATION);
    }
  }

  getFeedbackType(interactionType, data) {
    // Check if it's a continuous interaction with increment count
    const isContinuous = (Object.keys(INTERACTION.CIRCULAR).includes(interactionType) || 
                         Object.keys(INTERACTION.LINEAR).includes(interactionType)) && 
                         data?.incrementCount > 0;
    
    if (!isContinuous) {
      return 'non-continuous';
    }
    
    // Check if it's rate limited (circular interactions)
    const isRateLimited = Object.keys(INTERACTION.CIRCULAR).includes(interactionType);
    
    return isRateLimited ? 'continuous-rate-limited' : 'continuous-no-limit';
  }

  hideAllFeedbackElements(feedbackContainer) {
    const elements = [
      '.continuous-row', '.action-counter', 
      '.rate-limit-bar', '.rate-limit-bar-fill', '.increment-counter', '.angle-text'
    ];
    
    elements.forEach(selector => {
      const element = feedbackContainer.querySelector(selector);
      if (element) {
        element.style.opacity = '0';
      }
    });
  }

  showContinuousRateLimited(data, elements) {
    const { continuousRow, actionCounter, incrementCounter, rateLimitBar, rateLimitBarFill, angleText } = elements;
    
    // Make elements visible
    continuousRow.style.visibility = 'visible';
    actionCounter.style.visibility = 'visible';
    incrementCounter.style.visibility = 'visible';
    incrementCounter.style.display = '';
    rateLimitBar.style.visibility = 'visible';
    rateLimitBarFill.style.visibility = 'visible';
    
    // Reset icon position for rate limited mode
    if (this.feedbackIcon) {
      this.feedbackIcon.style.transform = '';
    }
    
    // Reset increment counter to flex position (right side)
    incrementCounter.style.position = 'static';
    incrementCounter.style.top = 'auto';
    incrementCounter.style.left = 'auto';
    incrementCounter.style.transform = 'none';
    
    // Update counter values
    const actionsFired = data.actionsFired || 0;
    const totalIncrements = data.incrementCount || 0;
    actionCounter.textContent = actionsFired.toString();
    incrementCounter.textContent = totalIncrements.toString();
    
    // Update progress bar
    const progress = totalIncrements > 0 ? (actionsFired / totalIncrements) * 100 : 0;
    rateLimitBarFill.style.width = `${progress}%`;
    
    // Update progress bar color based on rate
    const rateMaxAction = data.rateMaxAction || 5.0;
    const timeSinceLastAction = data.timeSinceLastAction || 0;
    const currentRate = timeSinceLastAction > 0 ? (1000 / timeSinceLastAction) : 0;
    
    let barColor = '';
    if (currentRate <= rateMaxAction) barColor = '#4caf50';
    else if (currentRate <= 2 * rateMaxAction) barColor = '#ff9800';
    else barColor = '#f44336';
    
    rateLimitBarFill.style.background = barColor;
    
    // Show angle for circular interactions
    if (data.currentAngularSweep !== undefined) {
      angleText.style.visibility = 'visible';
      angleText.textContent = `${Math.round(data.currentAngularSweep)}°`;
    } else {
      angleText.style.visibility = 'hidden';
    }
  }

  showContinuousNoLimit(data, elements) {
    const { continuousRow, actionCounter, incrementCounter, rateLimitBar, rateLimitBarFill, angleText } = elements;
    
    // Make continuous row visible
    continuousRow.style.visibility = 'visible';
    
    // Hide action counter, rate limit bar, and angle text
    actionCounter.style.visibility = 'hidden';
    rateLimitBar.style.visibility = 'hidden';
    rateLimitBarFill.style.visibility = 'hidden';
    angleText.style.visibility = 'hidden';
    
    // Show and center increment counter both horizontally and vertically
    incrementCounter.style.visibility = 'visible';
    incrementCounter.style.display = '';
    incrementCounter.style.position = 'absolute';
    incrementCounter.style.top = '50%';
    incrementCounter.style.left = '50%';
    incrementCounter.style.transform = 'translate(-50%, -50%)';
    
    // Shift icon down for non-rate limited mode
    if (this.feedbackIcon) {
      this.feedbackIcon.style.transform = 'translateY(10px)';
    }
    
    // Update increment counter value
    const totalIncrements = data.incrementCount || 0;
    incrementCounter.textContent = totalIncrements.toString();
  }

  getInteractionIcon(interactionType) {
    const iconMap = {
      'tap': ICON.TAP,
      'double_tap': ICON.DOUBLE_TAP,
      'hold': ICON.HOLD,
      'left': ICON.LINEAR_LEFT,
      'right': ICON.LINEAR_RIGHT,
      'up': ICON.LINEAR_UP,
      'down': ICON.LINEAR_DOWN,
      'up_left': ICON.LINEAR_UP_LEFT,
      'up_right': ICON.LINEAR_UP_RIGHT,
      'down_left': ICON.LINEAR_DOWN_LEFT,
      'down_right': ICON.LINEAR_DOWN_RIGHT,
      'up_2': ICON.LINEAR_UP_2,
      'down_2': ICON.LINEAR_DOWN_2,
      'circular_clockwise': ICON.CIRCULAR_CLOCKWISE,
      'circular_counterclockwise': ICON.CIRCULAR_COUNTERCLOCKWISE,
      'double_clockwise': ICON.CIRCULAR_DOUBLE_CLOCKWISE,
      'double_counterclockwise': ICON.CIRCULAR_DOUBLE_COUNTERCLOCKWISE,
      'pinch_in': ICON.MULTI_PINCH_IN,
      'pinch_out': ICON.MULTI_PINCH_OUT
    };
    
    return iconMap[interactionType] || ICON.FEEDBACK_DEFAULT;
  }

  clearFeedback() {
    // Fade out the entire feedback div as one unit
    const feedbackDiv = this.feedbackIcon?.parentElement;
    if (feedbackDiv) {
      feedbackDiv.style.transition = `opacity ${TOUCHPAD.FEEDBACK_FADE_OUT}ms ease`;
      feedbackDiv.style.opacity = '0';
      
      // Reset everything after fade
      setTimeout(() => {
        if (feedbackDiv) {
          feedbackDiv.style.opacity = '0'; // Keep it hidden until next interaction
        }
        
        if (this.feedbackIcon) {
          this.feedbackIcon.setAttribute('icon', '');
          this.feedbackIcon.style.color = '';
          this.feedbackIcon.style.transform = '';
          this.feedbackIcon.style.visibility = 'hidden';
        }
        
        // Reset progress bar
        const rateLimitBarFill = feedbackDiv.querySelector('.rate-limit-bar-fill');
        if (rateLimitBarFill) {
          rateLimitBarFill.style.width = '0%';
          rateLimitBarFill.style.background = 'var(--primary-color)';
        }
        
        // Reset increment counter display
        const incrementCounter = feedbackDiv.querySelector('.increment-counter');
        if (incrementCounter) {
          incrementCounter.style.display = '';
        }
        
        // Reset visibility for feedback elements
        const continuousRow = feedbackDiv.querySelector('.continuous-row');
        if (continuousRow) {
          continuousRow.style.visibility = 'hidden';
        }
        
        const rateLimitBar = feedbackDiv.querySelector('.rate-limit-bar');
        if (rateLimitBar) {
          rateLimitBar.style.visibility = 'hidden';
        }
        
        const angleText = feedbackDiv.querySelector('.angle-text');
        if (angleText) {
          angleText.style.visibility = 'hidden';
        }
      }, TOUCHPAD.FEEDBACK_FADE_OUT);
    }
    
    if (this.currentFeedback) {
      clearTimeout(this.currentFeedback);
      this.currentFeedback = null;
    }
  }

  cleanup() {
    this.clearFeedback();
  }

}

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
class DebugLogger {
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

  formatPointerData(pointer, interaction = {}) {
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

// #endregion

// #region ===== PERFORMANCE OPTIMIZATION =====

/**
 * RAF Batching System - Consolidates multiple RAF calls into a single frame
 * to reduce CPU overhead and prevent frame drops during rapid interactions
 */
class RAFBatcher {
  constructor() {
    this.pendingCallbacks = new Set();
    this.rafId = null;
  }

  /**
   * Schedule a callback to run in the next animation frame
   * Multiple calls within the same frame are automatically batched
   */
  schedule(callback) {
    if (!PERFORMANCE.RAF_BATCH_ENABLED) {
      requestAnimationFrame(callback);
      return;
    }

    this.pendingCallbacks.add(callback);
    
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        const callbacks = Array.from(this.pendingCallbacks);
        this.pendingCallbacks.clear();
        this.rafId = null;
        
        // Execute all batched callbacks
        callbacks.forEach(cb => {
          try {
            cb();
          } catch (error) {
            console.warn('[TouchpadCard] RAF batch callback error:', error);
          }
        });
      });
    }
  }

  /**
   * Cancel all pending RAF callbacks
   */
  cancel() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.pendingCallbacks.clear();
  }
}

/**
 * Element Cache System - Caches frequently accessed DOM elements
 * to eliminate repeated querySelector calls and improve performance
 */
class ElementCache {
  constructor(renderRoot) {
    this.renderRoot = renderRoot;
    this.cache = new Map();
    this.weakRefs = new WeakMap();
  }

  /**
   * Get an element from cache or query and cache it
   */
  get(selector) {
    // Check if we have a cached element
    if (this.cache.has(selector)) {
      const element = this.cache.get(selector);
      // Verify element is still in DOM
      if (element && element.isConnected) {
        return element;
      }
      // Remove stale reference
      this.cache.delete(selector);
    }

    // Query for element and cache it
    const element = this.renderRoot?.querySelector(selector);
    if (element) {
      this.cache.set(selector, element);
    }
    return element;
  }

  /**
   * Get multiple elements matching selector
   */
  getAll(selector) {
    const cacheKey = `${selector}:all`;
    
    if (this.cache.has(cacheKey)) {
      const elements = this.cache.get(cacheKey);
      // Verify elements are still in DOM
      if (elements && elements.every(el => el.isConnected)) {
        return elements;
      }
      this.cache.delete(cacheKey);
    }

    const elements = Array.from(this.renderRoot?.querySelectorAll(selector) || []);
    if (elements.length > 0) {
      this.cache.set(cacheKey, elements);
    }
    return elements;
  }

  /**
   * Get element with fallback selectors
   */
  getWithFallback(...selectors) {
    for (const selector of selectors) {
      const element = this.get(selector);
      if (element) return element;
    }
    return null;
  }

  /**
   * Clear the cache (useful when DOM structure changes)
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Update render root and clear cache
   */
  updateRenderRoot(newRenderRoot) {
    this.renderRoot = newRenderRoot;
    this.clear();
  }
}

/**
 * Configuration Cache System - Caches resolved config values to avoid repeated lookups
 * Improves performance by reducing redundant configuration resolution calls
 */
class ConfigCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
  }

  /**
   * Generate cache key from parameters
   */
  _generateKey(cardConfig, category, property, constantValue) {
    // Create a stable key from the parameters
    const configHash = JSON.stringify(cardConfig?.interactions?.[category]?.tuning?.[property]);
    return `${category}.${property}.${configHash}.${constantValue}`;
  }

  /**
   * Check if cache entry is still valid
   */
  _isValid(key) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp) return false;
    
    const age = performance.now() - timestamp;
    return age < PERFORMANCE.CONFIG_CACHE_TTL;
  }

  /**
   * Get cached config value if available and valid
   */
  get(cardConfig, category, property, constantValue) {
    const key = this._generateKey(cardConfig, category, property, constantValue);
    
    if (this.cache.has(key) && this._isValid(key)) {
      return this.cache.get(key);
    }
    
    return undefined;
  }

  /**
   * Store resolved config value in cache
   */
  set(cardConfig, category, property, constantValue, resolvedValue) {
    const key = this._generateKey(cardConfig, category, property, constantValue);
    this.cache.set(key, resolvedValue);
    this.timestamps.set(key, performance.now());
  }

  /**
   * Clear expired entries from cache
   */
  cleanup() {
    const now = performance.now();
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now - timestamp >= PERFORMANCE.CONFIG_CACHE_TTL) {
        this.cache.delete(key);
        this.timestamps.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }
}

// Global config cache instance
const configCache = new ConfigCache();

// Global RAF batcher instance
const rafBatcher = new RAFBatcher();

// #endregion

// #region ===== CUSTOM ELEMENT REGISTRATION =====

/**
 * Registers the TouchpadCard and TouchpadCardEditor as custom elements
 * for use in Home Assistant and web applications.
 * A console message including the card type and version is logged to 
 * indicate successful registration.
 */
if (!customElements.get("touchpad-card")) {
  customElements.define("touchpad-card", TouchpadCard);
  customElements.define("touchpad-card-editor", TouchpadCardEditor);
  customElements.define("interaction-action-editor", InteractionActionEditor);
  console.info(
    `%c 👆🏼 ${CARD_TYPE.replaceAll("-", " ").replace(/\b\w/g, l => l.toUpperCase())} %c v${CARD_VERSION} `,
    [
      "background-color: #001689ff;",
      "color: #9ea1a2ff;",
      "padding: 2px 1px 2px 2px;",
      "border-radius: 5px 0 0 5px;",
      "font-family: DejaVu Sans,Verdana,Geneva,sans-serif;",
      "text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3);"
    ].join("\n"),
    [
      "background-color: #9ea1a2ff;",
      "color: #001689ff;",
      "padding: 2px 2px 2px 1px;",
      "border-radius: 0 5px 5px 0;",
      "font-family: DejaVu Sans,Verdana,Geneva,sans-serif;",
      "text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3);"
    ].join("\n")
  );
}

/**
 * Registers the card with Home Assistant's customCards array
 * so it appears in the UI and can be selected by users.
 */
window.customCards = window.customCards || [];
window.customCards.push({
  type: CARD_TYPE,
  name: CARD_TYPE.replaceAll("-", " ").replace(/\b\w/g, l => l.toUpperCase()),
  preview: false, // False allows the description to show in the card picker instead
  description: "A customizable and tunable touchpad card supporting 19 tap, linear, circular, and multi-touch interactions including continuous actions. Extensive appearance options include header, margin, border, and text, icon, and/or image overlays with dynamic text and icon support via input_text helper entities. Interaction configuration includes standard Home Assistant action editor flows and a Quick Action Editor to simplify configuration for targeting a default entity with the same action. Console logging and visual feedback are available for interaction tuning and debugging.",
  documentationURL: "https://github.com/GizmoGoody/homeassistant-touchpad-card", // placeholder until real URL is available
});
// #endregion