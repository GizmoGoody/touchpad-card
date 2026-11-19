import { css } from 'lit';

export const cardStyles = css`

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
