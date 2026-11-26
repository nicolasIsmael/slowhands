import { expect, test } from "@playwright/test";
import { SongListPage } from "../pages/song-list-page.ts";

interface Manifest {
  name: string;
  start_url: string;
  scope: string;
  display: string;
  icons: { src: string; sizes: string; purpose: string }[];
}

test("the page points to a manifest that the browser can read", async ({ page, request }) => {
  await new SongListPage(page).open();
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(href).not.toBeNull();
  const response = await request.get(new URL(href ?? "", page.url()).toString());
  expect(response.ok()).toBe(true);
  const manifest = (await response.json()) as Manifest;
  expect(manifest).toMatchObject({
    name: "SlowHands",
    start_url: "/",
    scope: "/",
    display: "standalone",
  });
});

test("every icon in the manifest is served as an image", async ({ page, request }) => {
  await new SongListPage(page).open();
  const href = (await page.locator('link[rel="manifest"]').getAttribute("href")) ?? "";
  const manifestUrl = new URL(href, page.url());
  const manifest = (await (await request.get(manifestUrl.toString())).json()) as Manifest;
  const purposes = manifest.icons.map((icon) => `${icon.sizes} ${icon.purpose}`);
  expect(purposes).toEqual(["192x192 any", "512x512 any", "512x512 maskable"]);
  for (const icon of manifest.icons) {
    const response = await request.get(new URL(icon.src, manifestUrl).toString());
    expect(response.headers()["content-type"], icon.src).toContain("image/png");
  }
});

test("opening the start address shows the song list", async ({ page }) => {
  const home = new SongListPage(page);
  await page.goto("/");
  await expect(home.importButton()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Songs" })).toBeVisible();
});
