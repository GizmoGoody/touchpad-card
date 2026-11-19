import { INTERACTION, PERFORMANCE } from '../const';
import { getAngle, getDistance, normalizeAngle, resolveConfigValue } from '../utils';

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
export class InteractionRouter {
  // Instance fields (declared for TypeScript; assigned at runtime)
  callbacks: any;
  centerHistory: any;
  centerHistoryMaxLength: any;
  circularActionsFired: any;
  circularAngleRemainder: any;
  circularAngleTotal: any;
  circularCenter: any;
  circularCurrentAngle: any;
  circularDirection: any;
  circularIncrementCount: any;
  circularLastActionTime: any;
  circularLastRateLimited: any;
  circularRateActionMax: any;
  circularStartAngle: any;
  circularThresholdDetection: any;
  circularThresholdIncrement: any;
  circularThresholdInitial: any;
  circularTotalAngle: any;
  circularTransitioned: any;
  config: any;
  doubleTapActive: any;
  firstPointer: any;
  holdTimerRuntime: any;
  interactionState: any;
  isDoubleCircular: any;
  lastTapTime: any;
  latchedDirection: any;
  linearIncrement: any;
  linearIncrementCount: any;
  linearIncrementTimer: any;
  linearLastMove: any;
  linearLatchedDirection: any;
  linearSettleStartTime: any;
  linearSettleTimeout: any;
  linearSettledAt: any;
  linearSettledRadius: any;
  linearSettledTimer: any;
  linearSettledZoneRadiusRuntime: any;
  linearThreshold: any;
  linearTimer: any;
  linearTimerRuntime: any;
  linearTolerance: any;
  multiCurrentCenter: any;
  multiCurrentDistance: any;
  multiInitialCenter: any;
  multiInitialDistance: any;
  multiInteractionType: any;
  multiLinearDistance: any;
  multiLinearFired: any;
  multiLinearIncrementCount: any;
  multiLinearIncrementTimer: any;
  multiLinearLastMove: any;
  multiLinearLatchedDirection: any;
  multiLinearSettleStartTime: any;
  multiLinearSettledAt: any;
  multiLinearState: any;
  multiPinchFired: any;
  multiPointers: any;
  multiRatio: any;
  multiThreshold: any;
  tapCount: any;
  tapState: any;
  tapTimerDouble: any;
  tapTimerHold: any;
  tapTimerRuntime: any;
  totalDistance: any;

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
