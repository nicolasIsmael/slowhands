import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { WEB_APP_MANIFEST } from "./web-app-manifest.ts";

const fromProjectRoot = (...parts: string[]): string => join(process.cwd(), ...parts);

const iconFile = (src: string): Buffer => readFileSync(fromProjectRoot("public", src));

/** A PNG states its width and height in the first bytes after its signature. */
function pngSize(file: Buffer): string {
  return `${file.readUInt32BE(16)}x${file.readUInt32BE(20)}`;
}

test("names the app", () => {
  expect(WEB_APP_MANIFEST.name).toBe("SlowHands");
  expect(WEB_APP_MANIFEST.short_name).toBe("SlowHands");
});

test("starts at the root of the site, which shows the song list", () => {
  expect(WEB_APP_MANIFEST.start_url).toBe("/");
  expect(WEB_APP_MANIFEST.scope).toBe("/");
});

test("opens in its own window and does not lock the orientation", () => {
  expect(WEB_APP_MANIFEST.display).toBe("standalone");
  expect(WEB_APP_MANIFEST.orientation).toBe("any");
});

test("has icons of 192 and 512 pixels and a maskable one", () => {
  const icons = WEB_APP_MANIFEST.icons.map(({ sizes, purpose }) => `${sizes} ${purpose}`);
  expect(icons).toEqual(["192x192 any", "512x512 any", "512x512 maskable"]);
});

test("every icon is a PNG file of the size it declares", () => {
  for (const icon of WEB_APP_MANIFEST.icons) {
    expect(icon.type).toBe("image/png");
    expect(pngSize(iconFile(icon.src)), icon.src).toBe(icon.sizes);
  }
});

test("uses the colors of the page it opens, so the launch does not flash", () => {
  const page = readFileSync(fromProjectRoot("index.html"), "utf8");
  expect(page).toContain(`content="${WEB_APP_MANIFEST.theme_color}"`);
  expect(page).toContain(`background: ${WEB_APP_MANIFEST.background_color}`);
});
