import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import { ImportButton } from "./import-button.tsx";

const scoreFile = (name: string): File => new File(["<score/>"], name);

test("offers a labeled control for picking files", () => {
  renderWithProviders(<ImportButton onFiles={() => {}} />);
  const input = screen.getByLabelText("Import scores");
  expect(input).toHaveProperty("type", "file");
  expect(input).toHaveProperty("multiple", true);
});

test("does not filter the picker, so a PDF can be chosen and explained", () => {
  renderWithProviders(<ImportButton onFiles={() => {}} />);
  expect(screen.getByLabelText("Import scores").getAttribute("accept")).toBeNull();
});

test("hands over every file the person picks", async () => {
  const onFiles = vi.fn();
  renderWithProviders(<ImportButton onFiles={onFiles} />);
  const files = [scoreFile("a.musicxml"), scoreFile("b.mxl")];
  await userEvent.upload(screen.getByLabelText("Import scores"), files);
  expect(onFiles).toHaveBeenCalledWith(files);
});

test("does nothing when the picker is closed without a choice", async () => {
  const onFiles = vi.fn();
  renderWithProviders(<ImportButton onFiles={onFiles} />);
  await userEvent.upload(screen.getByLabelText("Import scores"), []);
  expect(onFiles).not.toHaveBeenCalled();
});

test("cannot be used while it is disabled", () => {
  renderWithProviders(<ImportButton onFiles={() => {}} disabled />);
  expect(screen.getByLabelText("Import scores")).toHaveProperty("disabled", true);
});

test("is labeled in Spanish when the interface is Spanish", () => {
  renderWithProviders(<ImportButton onFiles={() => {}} />, { language: "es" });
  expect(screen.getByLabelText("Importar partituras")).toBeTruthy();
});
