import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import { RenameDialog } from "./rename-dialog.tsx";
import { entryOf, storeWith } from "./testing/song-fixtures.ts";

async function show(language: "en" | "es" = "en") {
  const store = await storeWith("a", "Moonlight");
  const onClose = vi.fn();
  renderWithProviders(<RenameDialog entry={entryOf("a", "Moonlight")} onClose={onClose} />, {
    language,
    services: { songReader: store, songWriter: store },
  });
  return { store, onClose };
}

const nameField = () => screen.getByRole("textbox", { name: "Song name" });

test("starts with the current name", async () => {
  await show();
  expect((nameField() as HTMLInputElement).value).toBe("Moonlight");
});

test("saves the new name, trimmed, and closes", async () => {
  const { store, onClose } = await show();
  await userEvent.clear(nameField());
  await userEvent.type(nameField(), "  Clair de lune  ");
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  expect((await store.get("a"))?.displayName).toBe("Clair de lune");
  expect((await store.get("a"))?.isRenamed).toBe(true);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("saves with the Enter key", async () => {
  const { store } = await show();
  await userEvent.clear(nameField());
  await userEvent.type(nameField(), "Nocturne{Enter}");
  expect((await store.get("a"))?.displayName).toBe("Nocturne");
});

test("cannot save an empty or blank name", async () => {
  const { store } = await show();
  await userEvent.clear(nameField());
  expect(screen.getByRole("button", { name: "Save" })).toHaveProperty("disabled", true);
  await userEvent.type(nameField(), "   {Enter}");
  expect((await store.get("a"))?.displayName).toBe("Moonlight");
});

test("keeping the same name closes without marking the song as renamed", async () => {
  const { store, onClose } = await show();
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  expect((await store.get("a"))?.isRenamed).toBe(false);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("cancelling changes nothing", async () => {
  const { store, onClose } = await show();
  await userEvent.type(nameField(), " extra");
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect((await store.get("a"))?.displayName).toBe("Moonlight");
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("explains when the name could not be saved and stays open", async () => {
  const { store, onClose } = await show();
  vi.spyOn(store, "rename").mockRejectedValue(new Error("disk"));
  await userEvent.type(nameField(), "!");
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  expect((await screen.findByRole("alert")).textContent).toBe(
    "The change could not be saved. Try again.",
  );
  expect(onClose).not.toHaveBeenCalled();
});

test("speaks Spanish when the interface is Spanish", async () => {
  await show("es");
  expect(screen.getByRole("heading", { name: "Renombrar canción" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Guardar" })).toBeTruthy();
});
