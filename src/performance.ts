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
export class ElementCache {
  // Instance fields (declared for TypeScript; assigned at runtime)
  cache: any;
  weakRefs: any;

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
export class ConfigCache {
  // Instance fields (declared for TypeScript; assigned at runtime)
  cache: any;
  timestamps: any;

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
export const configCache = new ConfigCache();

// Global RAF batcher instance
export const rafBatcher = new RAFBatcher();

// #endregion
