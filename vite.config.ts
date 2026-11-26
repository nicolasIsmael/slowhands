import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { WEB_APP_MANIFEST } from "./src/ui/pwa/web-app-manifest.ts";

const layer = (name: string): string => fileURLToPath(new URL(`./src/${name}`, import.meta.url));

const FIVE_MIB = 5 * 1024 * 1024;

/**
 * The service worker caches the files of the build and nothing else: the app makes no requests
 * of its own, and the person's songs live in IndexedDB, not in the cache. A new version waits
 * until the person accepts it.
 */
const offlineSupport = VitePWA({
  registerType: "prompt",
  injectRegister: false,
  manifest: WEB_APP_MANIFEST,
  workbox: {
    globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
    maximumFileSizeToCacheInBytes: FIVE_MIB,
    navigateFallback: "index.html",
    cleanupOutdatedCaches: true,
    runtimeCaching: [],
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), offlineSupport],
  resolve: {
    alias: {
      "@core": layer("core"),
      "@engines": layer("engines"),
      "@storage": layer("storage"),
      "@ui": layer("ui"),
    },
  },
  worker: { format: "es" },
  // Lets a built copy be reached from another device over a Tailscale address (`*.ts.net`).
  preview: { allowedHosts: [".ts.net"] },
});
