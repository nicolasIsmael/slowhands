import { type BrowserContext, chromium, devices, expect, test } from "@playwright/test";
import { fixturePayload } from "../files/fixture-payload.ts";
import { SongListPage } from "../pages/song-list-page.ts";
import { ViewerPage } from "../pages/viewer-page.ts";

const MELODY = "Simple Melody Test Composer";
const DUET = "Duet for Two Voices Test Composer";

interface Session {
  context: BrowserContext;
  home: SongListPage;
  viewer: ViewerPage;
}

/** One run of the browser on a profile folder that is kept between runs, like a real phone. */
async function startSession(profile: string, baseURL: string | undefined): Promise<Session> {
  const context = await chromium.launchPersistentContext(profile, {
    ...devices["Pixel 7"],
    ...(baseURL ? { baseURL } : {}),
  });
  const page = context.pages()[0] ?? (await context.newPage());
  const home = new SongListPage(page);
  await home.open();
  return { context, home, viewer: new ViewerPage(page) };
}

async function importAndRead(
  { home, viewer }: Pick<Session, "home" | "viewer">,
  file: string,
): Promise<void> {
  await home.importFiles([fixturePayload(file)]);
  await expect(viewer.scoreDrawing()).toBeVisible();
}

test("songs are still listed, in order, after the browser is closed and reopened", async ({
  baseURL,
}, testInfo) => {
  test.setTimeout(90_000);
  const profile = testInfo.outputPath("profile");
  const first = await startSession(profile, baseURL);
  await importAndRead(first, "single-staff.musicxml");
  await first.viewer.backButton("Back to songs").click();
  await importAndRead(first, "two-parts.musicxml");
  await first.context.close();

  const second = await startSession(profile, baseURL);
  await expect(second.home.importButton()).toBeVisible();
  await expect(second.home.songRows()).toHaveText([DUET, MELODY]);
  await second.context.close();
});

test("opening an older song moves it to the top of the list", async ({ page }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  await importAndRead({ home, viewer }, "single-staff.musicxml");
  await viewer.backButton("Back to songs").click();
  await importAndRead({ home, viewer }, "two-parts.musicxml");
  await viewer.backButton("Back to songs").click();
  await expect(home.songRows()).toHaveText([DUET, MELODY]);

  await home.songButton(MELODY).click();
  await expect(viewer.title("Simple Melody")).toBeVisible();
  await viewer.backButton("Back to songs").click();
  await expect(home.songRows()).toHaveText([MELODY, DUET]);
});

test("reloading while reading a score returns to the list", async ({ page }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  await importAndRead({ home, viewer }, "single-staff.musicxml");
  await page.reload();
  await expect(home.importButton()).toBeVisible();
  await expect(viewer.scoreDrawing()).toHaveCount(0);
  await expect(home.songRows()).toHaveText([MELODY]);
});

test("accents, non-Latin characters and emoji in a song's name survive a reload", async ({
  page,
}) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  await importAndRead({ home, viewer }, "Café ñandú 🎹.musicxml");
  await page.reload();
  await expect(home.songRows()).toHaveText(["Canción de Cuna 🎹 José Núñez 山田"]);
});
