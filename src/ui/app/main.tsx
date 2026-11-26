import "@ui/styling/global.css";
import { preloadOsmdWhenIdle } from "@engines/osmd-renderer/preload-osmd.ts";
import { bootstrap } from "./bootstrap.tsx";
import { createServices } from "./composition-root.ts";

const container = document.getElementById("root");

if (container) {
  void bootstrap(container, {
    services: createServices(),
    deviceLanguages: navigator.languages,
    document,
  }).then(preloadOsmdWhenIdle);
}
