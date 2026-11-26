import { expect, test } from "@playwright/test";
import { SongListPage } from "../pages/song-list-page.ts";

test.use({ locale: "es-ES" });

test("a Spanish device shows the interface in Spanish on first launch", async ({ page }) => {
  const home = new SongListPage(page);
  await home.open();
  await expect(home.languageSelect("Idioma")).toBeVisible();
  expect(await home.documentLanguage()).toBe("es");
});
