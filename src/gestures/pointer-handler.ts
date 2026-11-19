
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
export class PointerHandler {
  // Instance fields (declared for TypeScript; assigned at runtime)
  activePointers: any;
  boundContextMenu: any;
  boundPointerCancel: any;
  boundPointerDown: any;
  boundPointerMove: any;
  boundPointerUp: any;
  boundSelectStart: any;
  callbacks: any;
  element: any;
  isPointerDown: any;
  pointerStartTime: any;
  startPosition: any;

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
