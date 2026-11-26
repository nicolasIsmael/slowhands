import { expect, type Locator, type Page, test } from "@playwright/test";
import { fixturePayload } from "../files/fixture-payload.ts";
import { SongListPage } from "../pages/song-list-page.ts";
import { ViewerPage } from "../pages/viewer-page.ts";

const MIN_TARGET_PX = 44;
const MAX_TABS = 20;

async function expectBigEnough(target: Locator, what: string): Promise<void> {
  const box = await target.boundingBox();
  expect(box, `${what} is not on screen`).not.toBeNull();
  expect(box?.width, `${what} width`).toBeGreaterThanOrEqual(MIN_TARGET_PX);
  expect(box?.height, `${what} height`).toBeGreaterThanOrEqual(MIN_TARGET_PX);
}

async function libraryWithOneSong(page: Page) {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  await home.importFiles([fixturePayload("single-staff.musicxml")]);
  await expect(viewer.scoreDrawing()).toBeVisible();
  await viewer.backButton("Back to songs").click();
  await expect(home.songRows()).toHaveCount(1);
  return { home, viewer };
}

/** Presses Tab until the target has the focus, as a person without a pointer would. */
async function tabTo(page: Page, target: Locator): Promise<void> {
  for (let presses = 0; presses < MAX_TABS; presses += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) {
      return;
    }
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused();
}

test("everything to tap on the list screen is at least 44 pixels each way", async ({ page }) => {
  const { home } = await libraryWithOneSong(page);
  await expectBigEnough(home.importButton(), "the import button");
  await expectBigEnough(home.languageSelect("Language"), "the language control");
  await expectBigEnough(home.songButton("Simple Melody"), "the song row");
  await expectBigEnough(home.rowMenu("Simple Melody"), "the song menu button");
});

test("the menu items and the dialog buttons are at least 44 pixels tall", async ({ page }) => {
  const { home } = await libraryWithOneSong(page);
  await home.rowMenu("Simple Melody").click();
  await expectBigEnough(home.menuItem("Rename"), "the rename item");
  await expectBigEnough(home.menuItem("Delete"), "the delete item");
  await home.menuItem("Delete").click();
  await expectBigEnough(page.getByRole("button", { name: "Cancel" }), "the cancel button");
  await expectBigEnough(page.getByRole("button", { name: "Delete" }), "the delete button");
});

test("the viewer controls are at least 44 pixels each way", async ({ page }) => {
  const { home, viewer } = await libraryWithOneSong(page);
  await home.songButton("Simple Melody").click();
  await expect(viewer.scoreDrawing()).toBeVisible();
  for (const name of ["Zoom in", "Zoom out", "Fit to width"] as const) {
    await expectBigEnough(viewer.zoomButton(name), name);
  }
  await expectBigEnough(viewer.backButton("Back to songs"), "the back button");
});

async function openAndLeaveWithKeyboard(page: Page, home: SongListPage, viewer: ViewerPage) {
  await tabTo(page, home.songButton("Simple Melody"));
  await page.keyboard.press("Enter");
  await expect(viewer.scoreDrawing()).toBeVisible();
  await tabTo(page, viewer.backButton("Back to songs"));
  await page.keyboard.press("Enter");
}

async function renameWithKeyboard(page: Page, home: SongListPage) {
  await tabTo(page, home.rowMenu("Simple Melody"));
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("textbox", { name: "Song name" })).toBeFocused();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Typed with keys");
  await page.keyboard.press("Enter");
}

async function deleteWithKeyboard(page: Page, home: SongListPage) {
  await tabTo(page, home.rowMenu("Typed with keys"));
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
}

test("a song can be opened, renamed and deleted with the keyboard alone", async ({ page }) => {
  const { home, viewer } = await libraryWithOneSong(page);
  await openAndLeaveWithKeyboard(page, home, viewer);
  await renameWithKeyboard(page, home);
  await expect(home.songRows()).toHaveText(["Typed with keys Test Composer"]);
  await deleteWithKeyboard(page, home);
  await expect(page.getByText("No songs yet")).toBeVisible();
});

test("every control shows a visible focus ring when reached with the keyboard", async ({
  page,
}) => {
  const { home } = await libraryWithOneSong(page);
  await tabTo(page, home.songButton("Simple Melody"));
  const outline = await home.songButton("Simple Melody").evaluate((element) => {
    const style = getComputedStyle(element);
    return `${style.boxShadow} ${style.outlineStyle}`;
  });
  expect(outline).not.toMatch(/^none none$/);
});
