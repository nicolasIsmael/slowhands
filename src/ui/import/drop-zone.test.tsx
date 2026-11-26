import { fireEvent, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import { DropZone } from "./drop-zone.tsx";

const HINT = "Drop MusicXML files here to import them";
const fileDrag = (files: File[] = []) => ({ dataTransfer: { types: ["Files"], files } });

test("shows nothing until files are dragged over the window", () => {
  renderWithProviders(<DropZone onFiles={() => {}} />);
  expect(screen.queryByText(HINT)).toBeNull();
});

test("shows a hint while files are dragged over the window", () => {
  renderWithProviders(<DropZone onFiles={() => {}} />);
  fireEvent.dragEnter(window, fileDrag());
  expect(screen.getByText(HINT)).toBeTruthy();
});

test("hides the hint when the drag leaves the window", () => {
  renderWithProviders(<DropZone onFiles={() => {}} />);
  fireEvent.dragEnter(window, fileDrag());
  fireEvent.dragLeave(window, fileDrag());
  expect(screen.queryByText(HINT)).toBeNull();
});

test("hands over the dropped files and hides the hint", () => {
  const onFiles = vi.fn();
  renderWithProviders(<DropZone onFiles={onFiles} />);
  const dropped = [new File(["x"], "a.musicxml")];
  fireEvent.dragEnter(window, fileDrag());
  fireEvent.drop(window, fileDrag(dropped));
  expect(onFiles).toHaveBeenCalledWith(dropped);
  expect(screen.queryByText(HINT)).toBeNull();
});

test("ignores drags that carry no files, such as dragged text", () => {
  const onFiles = vi.fn();
  renderWithProviders(<DropZone onFiles={onFiles} />);
  fireEvent.dragEnter(window, { dataTransfer: { types: ["text/plain"], files: [] } });
  fireEvent.drop(window, { dataTransfer: { types: ["text/plain"], files: [] } });
  expect(screen.queryByText(HINT)).toBeNull();
  expect(onFiles).not.toHaveBeenCalled();
});

test("shows the hint in Spanish when the interface is Spanish", () => {
  renderWithProviders(<DropZone onFiles={() => {}} />, { language: "es" });
  fireEvent.dragEnter(window, fileDrag());
  expect(screen.getByText("Suelta los archivos MusicXML aquí para importarlos")).toBeTruthy();
});
