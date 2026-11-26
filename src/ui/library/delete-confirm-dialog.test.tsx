import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import { DeleteConfirmDialog } from "./delete-confirm-dialog.tsx";
import { entryOf, storeWith } from "./testing/song-fixtures.ts";

async function show(language: "en" | "es" = "en") {
  const store = await storeWith("a", "Moonlight");
  const onClose = vi.fn();
  renderWithProviders(<DeleteConfirmDialog entry={entryOf("a", "Moonlight")} onClose={onClose} />, {
    language,
    services: { songReader: store, songWriter: store },
  });
  return { store, onClose };
}

test("names the song and says that deleting cannot be undone", async () => {
  await show();
  expect(screen.getByRole("alertdialog", { name: "Delete “Moonlight”?" })).toBeTruthy();
  expect(screen.getByText(/This cannot be undone/)).toBeTruthy();
});

test("removes nothing until the person confirms", async () => {
  const { store } = await show();
  expect(await store.get("a")).not.toBeNull();
});

test("deletes the song and closes once confirmed", async () => {
  const { store, onClose } = await show();
  await userEvent.click(screen.getByRole("button", { name: "Delete" }));
  expect(await store.get("a")).toBeNull();
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("cancelling keeps the song", async () => {
  const { store, onClose } = await show();
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(await store.get("a")).not.toBeNull();
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("explains when the song could not be deleted and stays open", async () => {
  const { store, onClose } = await show();
  vi.spyOn(store, "remove").mockRejectedValue(new Error("disk"));
  await userEvent.click(screen.getByRole("button", { name: "Delete" }));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(onClose).not.toHaveBeenCalled();
});

test("speaks Spanish when the interface is Spanish", async () => {
  await show("es");
  expect(screen.getByRole("alertdialog", { name: "¿Eliminar «Moonlight»?" })).toBeTruthy();
  expect(screen.getByText(/No se puede deshacer/)).toBeTruthy();
});
