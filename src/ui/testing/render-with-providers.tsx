import type { AppLanguage } from "@core/settings/app-language.ts";
import { type RenderResult, render } from "@testing-library/react";
import type { i18n } from "i18next";
import type { ReactElement } from "react";
import { I18nextProvider } from "react-i18next";
import type { Services } from "../app/services.ts";
import { ServicesProvider } from "../app/services-context.tsx";
import { createI18n } from "../i18n/create-i18n.ts";
import { createTestServices } from "./test-services.ts";

export interface RenderOptions {
  language?: AppLanguage;
  services?: Partial<Services>;
}

export interface ProvidedRender extends RenderResult {
  i18n: i18n;
  services: Services;
}

export function renderWithProviders(ui: ReactElement, options: RenderOptions = {}): ProvidedRender {
  const instance = createI18n(options.language ?? "en");
  const services = createTestServices(options.services);
  const result = render(
    <I18nextProvider i18n={instance}>
      <ServicesProvider services={services}>{ui}</ServicesProvider>
    </I18nextProvider>,
  );
  return { ...result, i18n: instance, services };
}
