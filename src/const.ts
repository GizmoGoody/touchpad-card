export const CARD_VERSION = __CARD_VERSION__;
export const CARD_TYPE = "touchpad-card";

// #region ===== SHARED CONSTANTS =====

/**
 * Configuration constants for touchpad appearance, layout, and behavior
 * @readonly
 * @enum {number|string}
 */
export const TOUCHPAD = {
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
export const ICON = {

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
export const INTERACTION = {

  /**
   * Tap interaction configuration and timing constants
   * @namespace
   */
  TAP: {

    // Tuning Constants with dynamic descriptions
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
export const PERFORMANCE = {
  /** Enable RAF (RequestAnimationFrame) batching for visual updates to consolidate multiple calls */
  RAF_BATCH_ENABLED: true,
};

// #endregion
