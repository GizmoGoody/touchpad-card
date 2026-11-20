import { printBadge } from './badge';
import { TouchpadCard } from './card/touchpad-card';
import { CARD_TYPE, CARD_VERSION } from './const';
import { InteractionActionEditor } from './editor/quick-action-editor';
import { TouchpadCardEditor } from './editor/touchpad-card-editor';

/**
 * Defines a custom element unless one with that name already exists, so loading
 * the file twice (for example, from two dashboard resources) does not throw.
 */
function defineElement(name: string, element: CustomElementConstructor) {
  if (!customElements.get(name)) {
    customElements.define(name, element);
  }
}

/**
 * Registers the TouchpadCard and its editors as custom elements
 * for use in Home Assistant and web applications.
 * The first registration also logs the card type and version and adds the card
 * to the card picker; a second load of the file skips both.
 */
if (!customElements.get("touchpad-card")) {
  defineElement("touchpad-card", TouchpadCard);
  defineElement("touchpad-card-editor", TouchpadCardEditor);
  defineElement("touchpad-card-quick-action-editor", InteractionActionEditor);
  printBadge({
    icon: "👆🏼",
    name: "Touchpad Card",
    version: CARD_VERSION,
    description: "A tunable touchpad with 19 tap, linear, circular, and multi-touch interactions.",
    repo: CARD_TYPE,
  });

  // Registers the card with Home Assistant's customCards array so it appears in the card picker.
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: CARD_TYPE,
    name: CARD_TYPE.replaceAll("-", " ").replace(/\b\w/g, l => l.toUpperCase()),
    preview: false, // False allows the description to show in the card picker instead
    description: "A customizable and tunable touchpad card supporting 19 tap, linear, circular, and multi-touch interactions including continuous actions. Extensive appearance options include header, margin, border, and text, icon, and/or image overlays with dynamic text and icon support via input_text helper entities. Interaction configuration includes standard Home Assistant action editor flows and a Quick Action Editor to simplify configuration for targeting a default entity with the same action. Console logging and visual feedback are available for interaction tuning and debugging.",
    documentationURL: "https://github.com/GizmoGoody/touchpad-card",
  });
}
