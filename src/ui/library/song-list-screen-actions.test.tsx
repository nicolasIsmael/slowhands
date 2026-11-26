import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import { SongListScreen } from "./song-list-screen.tsx";
import { storeWith } from "./testing/song-fixtures.ts";

async function showLibrary() {
  const store = await storeWith("a", "Moonlight");
  renderWithProviders(<SongListScreen />, { services: { songReader: store, songWriter: store } });
  await screen.findByRole("button", { name: "Moonlight" });
  return store;
}

const chooseFromMenu = async (action: string) => {
  await userEvent.click(screen.getByRole("button", { name: "Actions for Moonlight" }));
  await userEvent.click(screen.getByRole("menuitem", { name: action }));
};

test("renaming from the row menu changes the name shown in the list", async () => {
  await showLibrary();
  await chooseFromMenu("Rename");
  const field = screen.getByRole("textbox", { name: "Song name" });
  await userEvent.clear(field);
  await userEvent.paste("Clair de lune");
  await userEvent.keyboard("{Enter}");
  expect(await screen.findByRole("button", { name: "Clair de lune" })).toBeTruthy();
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("deleting from the row menu removes the song only after confirming", async () => {
  const store = await showLibrary();
  await chooseFromMenu("Delete");
  expect(await store.get("a")).not.toBeNull();
  await userEvent.click(screen.getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(screen.queryByRole("button", { name: "Moonlight" })).toBeNull());
  expect(await screen.findByText("No songs yet")).toBeTruthy();
});

test("cancelling the confirmation keeps the song in the list", async () => {
  await showLibrary();
  await chooseFromMenu("Delete");
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.getByRole("button", { name: "Moonlight" })).toBeTruthy();
  expect(screen.queryByRole("alertdialog")).toBeNull();
});
