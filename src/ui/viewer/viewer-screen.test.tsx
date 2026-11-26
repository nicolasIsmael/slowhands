import { createNewSong } from "@core/library/new-song.ts";
import type { ScoreSourcePreparer } from "@core/viewer/score-source-preparer.ts";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { NavigationController } from "../app/navigation/navigation-controller.ts";
import { InMemorySongStore } from "../testing/in-memory-song-store.ts";
import { RecordingScoreRenderer } from "../testing/recording-score-renderer.ts";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import { ViewerScreen } from "./viewer-screen.tsx";

async function storeWithSong(): Promise<InMemorySongStore> {
  const store = new InMemorySongStore();
  const song = createNewSong({
    summary: { title: "Moonlight", composer: null, format: "musicxml", contentHash: "h" },
    fileName: "moon.musicxml",
    byteSize: 3,
    id: "song-1",
    now: 1000,
  });
  await store.add(song, Uint8Array.from([1]));
  return store;
}

const preparerWith = (
  notices: readonly "some-symbols-not-displayed"[] = [],
): ScoreSourcePreparer => ({
  prepare: async (bytes) => ({ xml: bytes, notices }),
});

async function renderViewer(
  options: {
    preparer?: ScoreSourcePreparer;
    renderer?: RecordingScoreRenderer;
    songId?: string;
    language?: "en" | "es";
  } = {},
) {
  const store = await storeWithSong();
  const renderer = options.renderer ?? new RecordingScoreRenderer();
  const navigation = new NavigationController();
  const showList = vi.spyOn(navigation, "showList");
  const view = renderWithProviders(<ViewerScreen songId={options.songId ?? "song-1"} />, {
    ...(options.language && { language: options.language }),
    services: {
      songReader: store,
      preparer: options.preparer ?? preparerWith(),
      createRenderer: () => renderer,
      navigation,
    },
  });
  return { ...view, renderer, showList, navigation };
}

test("tells the person the score is being prepared while it loads", async () => {
  await renderViewer();
  expect(screen.getByRole("status").textContent).toBe("Preparing the score…");
});

test("shows the song's name once the score is drawn", async () => {
  await renderViewer();
  expect(await screen.findByRole("heading", { name: "Moonlight" })).toBeTruthy();
  expect(screen.queryByRole("status")).toBeNull();
});

test("shows a notice when the score has notation that may not be displayed", async () => {
  await renderViewer({ preparer: preparerWith(["some-symbols-not-displayed"]) });
  expect(await screen.findByRole("note")).toHaveProperty(
    "textContent",
    "Some symbols in this score may not be displayed.",
  );
});

test("explains a song that is no longer in the library", async () => {
  await renderViewer({ songId: "ghost" });
  const alert = await screen.findByRole("alert");
  expect(alert.textContent).toContain("This song is no longer in your library");
});

test("explains a score that could not be drawn", async () => {
  const renderer = new RecordingScoreRenderer({ status: "failed", code: "render-failed" });
  await renderViewer({ renderer });
  expect((await screen.findByRole("alert")).textContent).toContain("could not be displayed");
});

test("goes back to the list from the back button", async () => {
  const { showList } = await renderViewer();
  await userEvent.click(screen.getByRole("button", { name: "Back to songs" }));
  expect(showList).toHaveBeenCalledTimes(1);
});

test("releases the renderer when the screen goes away", async () => {
  const { renderer, unmount } = await renderViewer();
  await screen.findByRole("heading", { name: "Moonlight" });
  unmount();
  expect(renderer.disposed).toBeGreaterThan(0);
});

test("offers zoom controls once the score is drawn and applies them to the renderer", async () => {
  const { renderer } = await renderViewer();
  await screen.findByRole("heading", { name: "Moonlight" });
  await userEvent.click(screen.getByRole("button", { name: "Zoom in" }));
  expect(renderer.zooms).toEqual([1.25]);
});

test("does not offer zoom controls while the score is loading", async () => {
  await renderViewer();
  expect(screen.queryByRole("group", { name: "Zoom" })).toBeNull();
});

test("zooms with the keyboard once the score is drawn", async () => {
  const { renderer } = await renderViewer();
  await screen.findByRole("heading", { name: "Moonlight" });
  await userEvent.keyboard("+");
  await userEvent.keyboard("-");
  expect(renderer.zooms).toEqual([1.25, 1]);
});

test("speaks Spanish when the interface is Spanish", async () => {
  await renderViewer({ language: "es" });
  expect(screen.getByRole("button", { name: "Volver a las canciones" })).toBeTruthy();
  expect(screen.getByRole("status").textContent).toBe("Preparando la partitura…");
});
