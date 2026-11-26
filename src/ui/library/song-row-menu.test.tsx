import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import { SongRowMenu } from "./song-row-menu.tsx";
import { entryOf } from "./testing/song-fixtures.ts";

const entry = entryOf("a", "Moonlight");

function show(language: "en" | "es" = "en") {
  const onRename = vi.fn();
  const onDelete = vi.fn();
  renderWithProviders(<SongRowMenu entry={entry} onRename={onRename} onDelete={onDelete} />, {
    language,
  });
  return { onRename, onDelete };
}

const openMenu = () =>
  userEvent.click(screen.getByRole("button", { name: "Actions for Moonlight" }));

test("the menu button says which song it belongs to", () => {
  show();
  expect(screen.getByRole("button", { name: "Actions for Moonlight" })).toBeTruthy();
});

test("renaming takes two taps: open the menu, choose rename", async () => {
  const { onRename } = show();
  await openMenu();
  await userEvent.click(screen.getByRole("menuitem", { name: "Rename" }));
  expect(onRename).toHaveBeenCalledExactlyOnceWith(entry);
});

test("deleting takes two taps: open the menu, choose delete", async () => {
  const { onDelete } = show();
  await openMenu();
  await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
  expect(onDelete).toHaveBeenCalledExactlyOnceWith(entry);
});

test("opening the menu changes nothing by itself", async () => {
  const { onRename, onDelete } = show();
  await openMenu();
  expect(onRename).not.toHaveBeenCalled();
  expect(onDelete).not.toHaveBeenCalled();
});

test("works with the keyboard", async () => {
  const { onDelete } = show();
  screen.getByRole("button", { name: "Actions for Moonlight" }).focus();
  await userEvent.keyboard("{Enter}{ArrowDown}{ArrowDown}{Enter}");
  expect(onDelete).toHaveBeenCalledTimes(1);
});

test("speaks Spanish when the interface is Spanish", async () => {
  show("es");
  await userEvent.click(screen.getByRole("button", { name: "Acciones de Moonlight" }));
  expect(screen.getByRole("menuitem", { name: "Renombrar" })).toBeTruthy();
  expect(screen.getByRole("menuitem", { name: "Eliminar" })).toBeTruthy();
});
