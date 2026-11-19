/** Card version, injected at build time from package.json by rollup.config.mjs. */
declare const __CARD_VERSION__: string;

/** Entry shown in the Home Assistant card picker. */
interface CustomCardEntry {
  type: string;
  name: string;
  description?: string;
  preview?: boolean;
  documentationURL?: string;
}

interface Window {
  customCards?: CustomCardEntry[];
}
