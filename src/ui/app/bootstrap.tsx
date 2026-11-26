import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { createI18n } from "../i18n/create-i18n.ts";
import { keepDocumentLanguage } from "../i18n/keep-document-language.ts";
import { App } from "./app.tsx";
import { loadInitialLanguage } from "./initial-language.ts";
import type { Services } from "./services.ts";
import { ServicesProvider } from "./services-context.tsx";

export interface BootstrapDependencies {
  services: Services;
  deviceLanguages: readonly string[];
  document: Document;
}

/** Renders nothing until the interface language is known, so the wrong language never flashes. */
export async function bootstrap(
  container: HTMLElement,
  { services, deviceLanguages, document }: BootstrapDependencies,
): Promise<Root> {
  const language = await loadInitialLanguage(services.settings, deviceLanguages);
  const i18n = createI18n(language);
  keepDocumentLanguage(i18n, document);
  document.getElementById("splash")?.remove();

  const root = createRoot(container);
  root.render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <ServicesProvider services={services}>
          <App />
        </ServicesProvider>
      </I18nextProvider>
    </StrictMode>,
  );
  return root;
}
