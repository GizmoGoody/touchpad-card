import { ICON, INTERACTION, TOUCHPAD } from '../const';
import { ElementCache, rafBatcher } from '../performance';

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
export class FeedbackVisualizer {
  // Instance fields (declared for TypeScript; assigned at runtime)
  config: any;
  currentFeedback: any;
  element: any;
  elementCache: any;
  feedbackIcon: any;

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
