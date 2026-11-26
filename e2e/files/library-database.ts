import type { Page } from "@playwright/test";

/** How many songs are stored in the browser's database, counted without going through the app. */
export function storedSongCount(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve, reject) => {
        const opening = indexedDB.open("slowhands");
        opening.onerror = () => reject(opening.error);
        opening.onsuccess = () => {
          const database = opening.result;
          if (!database.objectStoreNames.contains("songs")) {
            database.close();
            resolve(0);
            return;
          }
          const counting = database.transaction("songs").objectStore("songs").count();
          counting.onerror = () => reject(counting.error);
          counting.onsuccess = () => {
            database.close();
            resolve(counting.result);
          };
        };
      }),
  );
}
