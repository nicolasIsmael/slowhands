export interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose: "any" | "maskable";
}

export interface WebAppManifest {
  name: string;
  short_name: string;
  description: string;
  lang: string;
  id: string;
  start_url: string;
  scope: string;
  display: "standalone";
  orientation: "any";
  theme_color: string;
  background_color: string;
  icons: ManifestIcon[];
}

/**
 * What the browser needs to install the app: it opens in its own window, in any orientation,
 * and always starts at the song list.
 */
export const WEB_APP_MANIFEST: WebAppManifest = {
  name: "SlowHands",
  short_name: "SlowHands",
  description: "Practice piano from your own scores. Everything stays on your device.",
  lang: "en",
  id: "/",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "any",
  theme_color: "#1c1917",
  background_color: "#fafaf9",
  icons: [
    { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    {
      src: "icons/icon-maskable-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
};
