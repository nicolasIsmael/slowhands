import { expect, test } from "@playwright/test";
import { fixturePayload } from "../files/fixture-payload.ts";
import { SongListPage } from "../pages/song-list-page.ts";
import { ViewerPage } from "../pages/viewer-page.ts";

test("dropping a score onto the page imports and shows it", async ({ page }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  const file = fixturePayload("single-staff.musicxml");

  await page.evaluate(
    ({ name, bytes }) => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([new Uint8Array(bytes)], name));
      for (const type of ["dragenter", "drop"]) {
        window.dispatchEvent(
          new DragEvent(type, { dataTransfer: transfer, bubbles: true, cancelable: true }),
        );
      }
    },
    { name: file.name, bytes: Array.from(file.buffer) },
  );

  await expect(viewer.title("Simple Melody")).toBeVisible();
  await expect(viewer.scoreDrawing()).toBeVisible();
});

test("a hint appears while files are dragged over the page", async ({ page }) => {
  const home = new SongListPage(page);
  await home.open();
  await page.evaluate(() => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(["x"], "a.musicxml"));
    window.dispatchEvent(new DragEvent("dragenter", { dataTransfer: transfer, bubbles: true }));
  });
  await expect(page.getByText("Drop MusicXML files here to import them")).toBeVisible();
});
