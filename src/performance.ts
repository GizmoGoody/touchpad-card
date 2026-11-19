import { PERFORMANCE } from './const';

// #region ===== PERFORMANCE OPTIMIZATION =====

/**
 * RAF Batching System - Consolidates multiple RAF calls into a single frame
 * to reduce CPU overhead and prevent frame drops during rapid interactions
 */
export class RAFBatcher {
  // Instance fields (declared for TypeScript; assigned at runtime)
  pendingCallbacks: any;
  rafId: any;

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
        const callbacks: any[] = Array.from(this.pendingCallbacks);
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


// Global RAF batcher instance
export const rafBatcher = new RAFBatcher();

// #endregion
