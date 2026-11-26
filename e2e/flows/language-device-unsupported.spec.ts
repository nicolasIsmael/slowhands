import { expect, test } from "@playwright/test";
import { SongListPage } from "../pages/song-list-page.ts";

test.use({ locale: "fr-FR" });

test("a device in an unsupported language falls back to English", async ({ page }) => {
  const home = new SongListPage(page);
  await home.open();
  await expect(home.languageSelect("Language")).toBeVisible();
  expect(await home.documentLanguage()).toBe("en");
});
