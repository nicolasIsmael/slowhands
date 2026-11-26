import { expect, test } from "@playwright/test";
import { UNUSABLE_FILES } from "../files/unusable-files.ts";
import { ImportDialog } from "../pages/import-dialog.ts";
import { SongListPage } from "../pages/song-list-page.ts";

const EXPLANATION_LIMIT_MS = 2000;

test("every unusable file is explained in English within two seconds", async ({ page }) => {
  const home = new SongListPage(page);
  const summary = new ImportDialog(page);
  await home.open();
  for (const { file, english } of UNUSABLE_FILES) {
    const delay = await summary.explanationDelay(english, () => home.importFiles([file()]));
    expect(delay, english).toBeLessThan(EXPLANATION_LIMIT_MS);
    await summary.closeButton("Close").click();
  }
});

test("every unusable file is explained in Spanish within two seconds", async ({ page }) => {
  const home = new SongListPage(page);
  const summary = new ImportDialog(page);
  await home.open();
  await home.chooseLanguage("Language", "es");
  for (const { file, spanish } of UNUSABLE_FILES) {
    const delay = await summary.explanationDelay(spanish, () =>
      home.importFiles([file()], "Importar partituras"),
    );
    expect(delay, spanish).toBeLessThan(EXPLANATION_LIMIT_MS);
    await summary.closeButton("Cerrar").click();
  }
});
