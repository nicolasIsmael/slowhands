import type { AppLanguage } from "@core/settings/app-language.ts";
import type { SettingsRepository } from "@core/settings/settings-repository.ts";
import { act } from "@testing-library/react";
import { expect, test } from "vitest";
import { InMemorySettingsRepository } from "../testing/in-memory-settings-repository.ts";
import { createTestServices } from "../testing/test-services.ts";
import { bootstrap } from "./bootstrap.tsx";
import { NavigationController } from "./navigation/navigation-controller.ts";

function deferredSettings(): { settings: SettingsRepository; release: (l: AppLanguage) => void } {
  let release: (language: AppLanguage) => void = () => {};
  const pending = new Promise<AppLanguage | null>((resolve) => {
    release = resolve;
  });
  const settings: SettingsRepository = {
    getLanguage: () => pending,
    setLanguage: async () => {},
  };
  return { settings, release };
}

test("renders nothing until the saved language has been read", async () => {
  const container = document.createElement("div");
  const { settings, release } = deferredSettings();
  const navigation = new NavigationController();

  const started = bootstrap(container, {
    services: createTestServices({ settings, navigation }),
    deviceLanguages: ["en"],
    document,
  });
  expect(container.innerHTML).toBe("");

  release("es");
  await act(async () => {
    await started;
  });
  expect(container.textContent).toContain("Idioma");
  navigation.dispose();
});

test("sets the document language and removes the splash screen", async () => {
  document.body.innerHTML = '<div id="splash"></div>';
  const container = document.createElement("div");
  const navigation = new NavigationController();
  const settings = new InMemorySettingsRepository("es");

  await act(async () => {
    await bootstrap(container, {
      services: createTestServices({ settings, navigation }),
      deviceLanguages: ["en"],
      document,
    });
  });
  expect(document.documentElement.lang).toBe("es");
  expect(document.getElementById("splash")).toBeNull();
  navigation.dispose();
});

test("follows the device language when nothing was saved", async () => {
  const container = document.createElement("div");
  const navigation = new NavigationController();

  await act(async () => {
    await bootstrap(container, {
      services: createTestServices({ settings: new InMemorySettingsRepository(), navigation }),
      deviceLanguages: ["es-MX"],
      document,
    });
  });
  expect(container.textContent).toContain("Idioma");
  navigation.dispose();
});
