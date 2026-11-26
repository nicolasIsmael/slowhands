import { expect, type Page, test } from "@playwright/test";
import { fixturePayload } from "../files/fixture-payload.ts";
import { storedSongCount } from "../files/library-database.ts";
import { ImportDialog } from "../pages/import-dialog.ts";
import { SongListPage } from "../pages/song-list-page.ts";
import { ViewerPage } from "../pages/viewer-page.ts";

const DUPLICATES_NOTICE = "This song is already in your library";

/** A library that already holds the single-staff song. */
async function libraryWithMelody(home: SongListPage, viewer: ViewerPage) {
  await home.open();
  await home.importFiles([fixturePayload("single-staff.musicxml")]);
  await expect(viewer.scoreDrawing()).toBeVisible();
  await viewer.backButton("Back to songs").click();
}

/** One new song and one duplicate of the song already in the library. */
const newAndDuplicate = () => [
  fixturePayload("two-parts.musicxml"),
  fixturePayload("single-staff.musicxml"),
];

async function importWithDuplicate(page: Page) {
  const home = new SongListPage(page);
  await libraryWithMelody(home, new ViewerPage(page));
  await home.importFiles(newAndDuplicate());
  await expect(page.getByRole("dialog", { name: DUPLICATES_NOTICE })).toBeVisible();
  return home;
}

test("the new files are saved first and one notice lists the duplicate", async ({ page }) => {
  await importWithDuplicate(page);
  const notice = page.getByRole("dialog", { name: DUPLICATES_NOTICE });
  await expect(notice.getByText("single-staff.musicxml")).toBeVisible();
  await expect(notice.getByText(/Same score as “Simple Melody”/)).toBeVisible();
  expect(await storedSongCount(page)).toBe(2);
});

test("replacing swaps the existing song and lists it as replaced", async ({ page }) => {
  await importWithDuplicate(page);
  await page.getByRole("button", { name: "Replace existing" }).click();
  const summary = new ImportDialog(page);
  await expect(summary.message("1 song imported · 1 song replaced")).toBeVisible();
  expect(await storedSongCount(page)).toBe(2);
});

test("keeping both adds a separate song and lists it as kept", async ({ page }) => {
  await importWithDuplicate(page);
  await page.getByRole("button", { name: "Keep both" }).click();
  const summary = new ImportDialog(page);
  await expect(
    summary.message("1 song imported · 1 song kept next to the existing one"),
  ).toBeVisible();
  expect(await storedSongCount(page)).toBe(3);
});

test("skipping leaves the library as it was and lists the file as skipped", async ({ page }) => {
  await importWithDuplicate(page);
  await page.getByRole("button", { name: "Skip duplicates" }).click();
  const summary = new ImportDialog(page);
  await expect(summary.message("1 song imported · 1 duplicate skipped")).toBeVisible();
  expect(await storedSongCount(page)).toBe(2);
});

test("closing the notice without choosing counts as skipping", async ({ page }) => {
  await importWithDuplicate(page);
  await page.keyboard.press("Escape");
  await expect(
    new ImportDialog(page).message("1 song imported · 1 duplicate skipped"),
  ).toBeVisible();
  expect(await storedSongCount(page)).toBe(2);
});

test("replacing keeps the name the person gave the song", async ({ page }) => {
  const home = await importWithDuplicate(page);
  await page.getByRole("button", { name: "Skip duplicates" }).click();
  await new ImportDialog(page).closeButton("Close").click();
  await home.rowMenu("Simple Melody").click();
  await home.menuItem("Rename").click();
  await page.getByRole("textbox", { name: "Song name" }).fill("My favourite");
  await page.getByRole("button", { name: "Save" }).click();

  await home.importFiles([fixturePayload("single-staff.musicxml")]);
  await page.getByRole("button", { name: "Replace existing" }).click();
  await expect(new ViewerPage(page).title("My favourite")).toBeVisible();
});

test("the notice is written in Spanish when the interface is Spanish", async ({ page }) => {
  const home = new SongListPage(page);
  await libraryWithMelody(home, new ViewerPage(page));
  await home.chooseLanguage("Language", "es");
  await home.importFiles(newAndDuplicate(), "Importar partituras");
  await expect(
    page.getByRole("dialog", { name: "Esta canción ya está en tu biblioteca" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Omitir duplicadas" }).click();
  await expect(
    new ImportDialog(page).message("1 canción importada · 1 duplicada omitida"),
  ).toBeVisible();
});
