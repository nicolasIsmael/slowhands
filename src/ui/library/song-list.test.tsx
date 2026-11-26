import { ImportSummary } from "@core/import/import-summary.ts";
import { createNewSong } from "@core/library/new-song.ts";
import type { SongReader } from "@core/library/song-reader.ts";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { NavigationController } from "../app/navigation/navigation-controller.ts";
import { InMemorySongStore } from "../testing/in-memory-song-store.ts";
import { RecordingStoragePersistence } from "../testing/recording-storage-persistence.ts";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import { SongListScreen } from "./song-list-screen.tsx";

interface Seed {
  id: string;
  title: string | null;
  composer: string | null;
  fileName: string;
  now: number;
}

async function seed(store: InMemorySongStore, ...songs: Seed[]): Promise<void> {
  for (const { id, title, composer, fileName, now } of songs) {
    const summary = { title, composer, format: "musicxml", contentHash: id } as const;
    await store.add(createNewSong({ summary, fileName, byteSize: 1, id, now }), new Uint8Array(1));
  }
}

const moonlight: Seed = {
  id: "a",
  title: "Moonlight",
  composer: "Beethoven",
  fileName: "m.xml",
  now: 1000,
};
const prelude: Seed = { id: "b", title: "Prelude", composer: "Bach", fileName: "p.xml", now: 2000 };

const rowNames = (): string[] =>
  within(screen.getByRole("list"))
    .getAllByRole("listitem")
    .map((item) => item.textContent ?? "");

test("lists the songs with their composers, newest activity first", async () => {
  const store = new InMemorySongStore();
  await seed(store, moonlight, prelude);
  renderWithProviders(<SongListScreen />, { services: { songReader: store, songWriter: store } });
  expect(await screen.findByRole("list")).toBeTruthy();
  expect(rowNames()).toEqual(["Prelude Bach", "Moonlight Beethoven"]);
});

test("leaves the composer line out when the score names none", async () => {
  const store = new InMemorySongStore();
  await seed(store, { ...moonlight, title: null, composer: null, fileName: "My Score.musicxml" });
  renderWithProviders(<SongListScreen />, { services: { songReader: store, songWriter: store } });
  expect(await screen.findByRole("button", { name: "My Score" })).toBeTruthy();
});

test("shows names with accents, non-Latin characters and emoji as written", async () => {
  const store = new InMemorySongStore();
  await seed(store, { ...moonlight, title: "Canción 🎹", composer: "José 山田" });
  renderWithProviders(<SongListScreen />, { services: { songReader: store, songWriter: store } });
  expect(await screen.findByRole("button", { name: "Canción 🎹 José 山田" })).toBeTruthy();
});

test("shows the empty hint when there are no songs", async () => {
  renderWithProviders(<SongListScreen />);
  expect(await screen.findByText("No songs yet")).toBeTruthy();
  expect(screen.queryByRole("list")).toBeNull();
});

test("gains a row when a song is added while the list is open", async () => {
  const store = new InMemorySongStore();
  renderWithProviders(<SongListScreen />, { services: { songReader: store, songWriter: store } });
  await screen.findByText("No songs yet");
  await seed(store, moonlight);
  expect(await screen.findByRole("button", { name: "Moonlight Beethoven" })).toBeTruthy();
});

test("opens the song in the viewer and moves it to the top of the list", async () => {
  const store = new InMemorySongStore();
  const navigation = new NavigationController();
  await seed(store, moonlight, prelude);
  renderWithProviders(<SongListScreen />, {
    services: { songReader: store, songWriter: store, navigation },
  });
  await userEvent.click(await screen.findByRole("button", { name: "Moonlight Beethoven" }));
  expect(navigation.current()).toEqual({ name: "viewer", songId: "a" });
  await waitFor(() => expect(rowNames()[0]).toBe("Moonlight Beethoven"));
});

test("explains that the songs could not be loaded when the library cannot be read", async () => {
  const broken: SongReader = {
    watchLibrary: () => ({
      subscribe: (_onValue, onError) => {
        onError(new Error("the database is unavailable"));
        return () => {};
      },
    }),
    get: async () => null,
    readOriginal: async () => null,
  };
  renderWithProviders(<SongListScreen />, { services: { songReader: broken } });
  expect((await screen.findByRole("alert")).textContent).toContain("could not be loaded");
});

test("asks the device to keep the library after a successful import", async () => {
  const persistence = new RecordingStoragePersistence();
  const summary = new ImportSummary([
    { fileName: "a.xml", result: { kind: "imported", songId: "1" } },
    { fileName: "b.xml", result: { kind: "imported", songId: "2" } },
  ]);
  renderWithProviders(<SongListScreen />, {
    services: {
      storagePersistence: persistence,
      createBatchImport: () => ({ run: async () => summary }),
    },
  });
  await userEvent.upload(screen.getByLabelText("Import scores"), [new File(["x"], "a.xml")]);
  await waitFor(() => expect(persistence.requests).toBe(1));
});

test("does not ask when nothing was imported", async () => {
  const persistence = new RecordingStoragePersistence();
  const summary = new ImportSummary([
    { fileName: "a.pdf", result: { kind: "failed", code: "unsupported-file-type" } },
  ]);
  renderWithProviders(<SongListScreen />, {
    services: {
      storagePersistence: persistence,
      createBatchImport: () => ({ run: async () => summary }),
    },
  });
  await userEvent.upload(screen.getByLabelText("Import scores"), [new File(["x"], "a.pdf")]);
  await screen.findByRole("dialog", { name: "Import finished" });
  expect(persistence.requests).toBe(0);
});

test("lists the songs in Spanish when the interface is Spanish", async () => {
  renderWithProviders(<SongListScreen />, { language: "es" });
  expect(await screen.findByText("Aún no hay canciones")).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Canciones" })).toBeTruthy();
});
