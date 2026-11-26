import { expect, type Locator, type Page, test } from "@playwright/test";
import { fixturePayload } from "../files/fixture-payload.ts";
import { SongListPage } from "../pages/song-list-page.ts";
import { ViewerPage } from "../pages/viewer-page.ts";

type Preference = "reduce" | "no-preference";

const animationOf = (target: Locator): Promise<string> =>
  target.evaluate((element) => getComputedStyle(element).animationName);

async function libraryWithOneSong(page: Page, preference: Preference) {
  await page.emulateMedia({ reducedMotion: preference });
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  await home.importFiles([fixturePayload("single-staff.musicxml")]);
  await expect(viewer.scoreDrawing()).toBeVisible();
  return { home, viewer };
}

test("with motion allowed, rows, dialogs and screens animate in", async ({ page }) => {
  const { home, viewer } = await libraryWithOneSong(page, "no-preference");
  expect(await animationOf(page.locator("section").first())).toBe("fade-in");
  await viewer.backButton("Back to songs").click();
  expect(await animationOf(home.songRows().first())).toBe("rise-in");
  await home.rowMenu("Simple Melody").click();
  await home.menuItem("Delete").click();
  expect(await animationOf(page.getByRole("alertdialog"))).toBe("fade-in");
});

test("when the person asks for less motion, nothing animates", async ({ page }) => {
  const { home, viewer } = await libraryWithOneSong(page, "reduce");
  expect(await animationOf(page.locator("section").first())).toBe("none");
  await viewer.backButton("Back to songs").click();
  expect(await animationOf(home.songRows().first())).toBe("none");
  await home.rowMenu("Simple Melody").click();
  await home.menuItem("Delete").click();
  expect(await animationOf(page.getByRole("alertdialog"))).toBe("none");
});

test("every animation of the app is declared where the reduced-motion preference is honored", async ({
  page,
}) => {
  await page.goto("/");
  const unguarded = await page.evaluate(() => {
    const names: string[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      for (const rule of Array.from(sheet.cssRules)) {
        if (rule instanceof CSSStyleRule && /animation/.test(rule.cssText)) {
          names.push(rule.selectorText);
        }
      }
    }
    return names;
  });
  expect(unguarded).toEqual([]);
});
