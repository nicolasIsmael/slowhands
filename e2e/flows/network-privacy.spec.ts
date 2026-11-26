import { type BrowserContext, expect, type Page, type Request, test } from "@playwright/test";
import { fixturePayload } from "../files/fixture-payload.ts";
import { waitUntilAvailableOffline } from "../files/offline.ts";
import { SongListPage } from "../pages/song-list-page.ts";
import { ViewerPage } from "../pages/viewer-page.ts";

/** Words from the scores and names used below; none of them may ever appear in a request. */
const PRIVATE_WORDS = ["Melody", "Duet", "Composer", "Voices", "musicxml", "My favourite"];

function describeRequest(request: Request): string {
  return `${request.method()} ${request.url()} ${request.postData() ?? ""}`;
}

async function importAndRead(page: Page, home: SongListPage, viewer: ViewerPage) {
  await home.importFiles([
    fixturePayload("single-staff.musicxml"),
    fixturePayload("two-parts.musicxml"),
  ]);
  await page.getByRole("button", { name: "Close" }).click();
  await home.songButton("Simple Melody").click();
  await expect(viewer.scoreDrawing()).toBeVisible();
  await viewer.backButton("Back to songs").click();
}

async function renameAndDelete(page: Page, home: SongListPage) {
  await home.rowMenu("Simple Melody").click();
  await home.menuItem("Rename").click();
  await page.getByRole("textbox", { name: "Song name" }).fill("My favourite");
  await page.getByRole("button", { name: "Save" }).click();
  await home.rowMenu("My favourite").click();
  await home.menuItem("Delete").click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
}

async function useTheWholeApp(page: Page, context: BrowserContext) {
  const home = new SongListPage(page);
  await home.open();
  await waitUntilAvailableOffline(page);
  await importAndRead(page, home, new ViewerPage(page));
  await renameAndDelete(page, home);
  await context.setOffline(true);
  await page.reload();
  await expect(home.songRows()).toHaveCount(1);
}

function expectOnlyAppFilesWithoutData(request: Request, appOrigin: string): void {
  const where = describeRequest(request);
  const target = new URL(request.url());
  const isLocalData = target.protocol === "data:" || target.protocol === "blob:";
  expect(isLocalData || target.origin === appOrigin, where).toBe(true);
  expect(request.method(), where).toBe("GET");
  expect(request.postData(), where).toBeNull();
  for (const word of PRIVATE_WORDS) {
    expect(where.toLowerCase(), where).not.toContain(word.toLowerCase());
  }
}

test("only the app's own files are requested, and nothing carries the person's data", async ({
  page,
  context,
  baseURL,
}) => {
  const requests: Request[] = [];
  context.on("request", (request) => requests.push(request));
  await useTheWholeApp(page, context);

  expect(requests.length).toBeGreaterThan(0);
  for (const request of requests) {
    expectOnlyAppFilesWithoutData(request, new URL(baseURL ?? "").origin);
  }
});
