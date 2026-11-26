import { expect, test } from "@playwright/test";
import { SongListPage } from "../pages/song-list-page.ts";

test("switching language translates the interface and updates the document language", async ({
  page,
}) => {
  const home = new SongListPage(page);
  await home.open();
  await home.chooseLanguage("Language", "es");
  await expect(home.languageSelect("Idioma")).toBeVisible();
  expect(await home.documentLanguage()).toBe("es");
});

test("the manual choice persists after a reload", async ({ page }) => {
  const home = new SongListPage(page);
  await home.open();
  await home.chooseLanguage("Language", "es");
  await expect(home.languageSelect("Idioma")).toBeVisible();

  await page.reload();
  await expect(home.languageSelect("Idioma")).toBeVisible();
  expect(await home.documentLanguage()).toBe("es");
});

test("a manual choice overrides the device language on the next visit", async ({ page }) => {
  const home = new SongListPage(page);
  await home.open();
  await home.chooseLanguage("Language", "es");
  await expect(home.languageSelect("Idioma")).toBeVisible();

  await home.chooseLanguage("Idioma", "en");
  await page.reload();
  await expect(home.languageSelect("Language")).toBeVisible();
});
