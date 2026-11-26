import enCommon from "./locales/en/common.json";
import enImport from "./locales/en/import.json";
import enLibrary from "./locales/en/library.json";
import enPwa from "./locales/en/pwa.json";
import enViewer from "./locales/en/viewer.json";
import esCommon from "./locales/es/common.json";
import esImport from "./locales/es/import.json";
import esLibrary from "./locales/es/library.json";
import esPwa from "./locales/es/pwa.json";
import esViewer from "./locales/es/viewer.json";

export const resources = {
  en: { common: enCommon, import: enImport, library: enLibrary, pwa: enPwa, viewer: enViewer },
  es: { common: esCommon, import: esImport, library: esLibrary, pwa: esPwa, viewer: esViewer },
} as const;

export const NAMESPACES = ["common", "import", "library", "pwa", "viewer"] as const;
