import { expect, test } from "@playwright/test";
import { fixturePayload } from "../files/fixture-payload.ts";
import { storedSongCount } from "../files/library-database.ts";
import { startCountingTaps, tapsSoFar } from "../files/tap-counter.ts";
import { SongListPage } from "../pages/song-list-page.ts";
import { ViewerPage } from "../pages/viewer-page.ts";

const MELODY = "Simple Melody";
const MELODY_ROW = "Simple Melody Test Composer";
const MAX_TAPS = 2;

async function libraryWithOneSong(home: SongListPage, viewer: ViewerPage) {
  await home.open();
  await home.importFiles([fixturePayload("single-staff.musicxml")]);
  await expect(viewer.scoreDrawing()).toBeVisible();
  await viewer.backButton("Back to songs").click();
  await expect(home.songRows()).toHaveText([MELODY_ROW]);
}

test("renaming takes two taps and changes the name in the list", async ({ page }) => {
  const home = new SongListPage(page);
  await libraryWithOneSong(home, new ViewerPage(page));
  await startCountingTaps(page);
  await home.rowMenu(MELODY).click();
  await home.menuItem("Rename").click();
  const field = page.getByRole("textbox", { name: "Song name" });
  await expect(field).toBeVisible();
  expect(await tapsSoFar(page)).toBeLessThanOrEqual(MAX_TAPS);

  await field.fill("  My favourite  ");
  await field.press("Enter");
  await expect(home.songRows()).toHaveText(["My favourite Test Composer"]);
});

test("a renamed song keeps its score and its new name after a reload", async ({ page }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await libraryWithOneSong(home, viewer);
  await home.rowMenu(MELODY).click();
  await home.menuItem("Rename").click();
  await page.getByRole("textbox", { name: "Song name" }).fill("My favourite");
  await page.getByRole("button", { name: "Save" }).click();
  await page.reload();
  await expect(home.songRows()).toHaveText(["My favourite Test Composer"]);
  await home.songButton("My favourite").click();
  await expect(viewer.scoreDrawing()).toBeVisible();
});

test("deleting takes two taps to reach the confirmation, which says it cannot be undone", async ({
  page,
}) => {
  const home = new SongListPage(page);
  await libraryWithOneSong(home, new ViewerPage(page));
  await startCountingTaps(page);
  await home.rowMenu(MELODY).click();
  await home.menuItem("Delete").click();
  const confirmation = page.getByRole("alertdialog", { name: `Delete “${MELODY}”?` });
  await expect(confirmation).toBeVisible();
  await expect(confirmation).toContainText("This cannot be undone");
  expect(await tapsSoFar(page)).toBeLessThanOrEqual(MAX_TAPS);
  expect(await storedSongCount(page)).toBe(1);

  await confirmation.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("No songs yet")).toBeVisible();
  expect(await storedSongCount(page)).toBe(0);
});

test("cancelling the confirmation keeps the song", async ({ page }) => {
  const home = new SongListPage(page);
  await libraryWithOneSong(home, new ViewerPage(page));
  await home.rowMenu(MELODY).click();
  await home.menuItem("Delete").click();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(home.songRows()).toHaveText([MELODY_ROW]);
  expect(await storedSongCount(page)).toBe(1);
});

test("the menu and its dialogs are written in Spanish when the interface is Spanish", async ({
  page,
}) => {
  const home = new SongListPage(page);
  await libraryWithOneSong(home, new ViewerPage(page));
  await home.chooseLanguage("Language", "es");
  await page.getByRole("button", { name: `Acciones de ${MELODY}` }).click();
  await page.getByRole("menuitem", { name: "Eliminar" }).click();
  await expect(page.getByRole("alertdialog", { name: `¿Eliminar «${MELODY}»?` })).toBeVisible();
  await expect(page.getByText("No se puede deshacer")).toBeVisible();
});
