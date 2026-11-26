import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import { LanguageSwitch } from "./language-switch.tsx";

test("offers English and Spanish with a labeled control", () => {
  renderWithProviders(<LanguageSwitch />);
  const select = screen.getByRole("combobox", { name: "Language" });
  expect(select).toHaveProperty("value", "en");
  expect(screen.getByRole("option", { name: "English" })).toBeTruthy();
  expect(screen.getByRole("option", { name: "Español" })).toBeTruthy();
});

test("starts on the language the interface is using", () => {
  renderWithProviders(<LanguageSwitch />, { language: "es" });
  expect(screen.getByRole("combobox", { name: "Idioma" })).toHaveProperty("value", "es");
});

test("choosing a language translates the interface at once", async () => {
  renderWithProviders(<LanguageSwitch />);
  await userEvent.selectOptions(screen.getByRole("combobox", { name: "Language" }), "es");
  await waitFor(() => expect(screen.getByRole("combobox", { name: "Idioma" })).toBeTruthy());
});

test("choosing a language saves it for the next visit", async () => {
  const { services } = renderWithProviders(<LanguageSwitch />);
  await userEvent.selectOptions(screen.getByRole("combobox", { name: "Language" }), "es");
  await waitFor(async () => expect(await services.settings.getLanguage()).toBe("es"));
});
