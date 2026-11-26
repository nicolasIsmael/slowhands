import type { Locator, Page } from "@playwright/test";
import type { FilePayload } from "../files/fixture-payload.ts";

type Label = "Language" | "Idioma";
type ImportLabel = "Import scores" | "Importar partituras";

const escapeForRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The home screen: the app title, the language control, the import control and the song list. */
export class SongListPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Opens the app and waits until it has started, so the first action never races it. */
  async open(): Promise<void> {
    await this.page.goto("/");
    await this.page.getByRole("combobox").waitFor();
  }

  languageSelect(name: Label): Locator {
    return this.page.getByRole("combobox", { name });
  }

  async chooseLanguage(currentName: Label, code: "en" | "es"): Promise<void> {
    await this.languageSelect(currentName).selectOption(code);
  }

  documentLanguage(): Promise<string> {
    return this.page.evaluate(() => document.documentElement.lang);
  }

  importControl(label: ImportLabel = "Import scores"): Locator {
    return this.page.getByLabel(label);
  }

  /** One row per song in the list, newest activity first. */
  songRows(): Locator {
    return this.page.getByRole("list").getByRole("listitem");
  }

  /** The button that opens a song; its name starts with the song's name, unlike its menu button. */
  songButton(name: string): Locator {
    return this.page.getByRole("button", { name: new RegExp(`^${escapeForRegExp(name)}`) });
  }

  /** The button that opens the actions menu of the song with this display name. */
  rowMenu(songName: string): Locator {
    return this.page.getByRole("button", { name: `Actions for ${songName}` });
  }

  menuItem(name: "Rename" | "Delete"): Locator {
    return this.page.getByRole("menuitem", { name });
  }

  /** The visible button that wraps the file input. */
  importButton(label: ImportLabel = "Import scores"): Locator {
    return this.page.locator("label").filter({ hasText: label });
  }

  async importFiles(files: FilePayload[], label: ImportLabel = "Import scores"): Promise<void> {
    await this.importControl(label).setInputFiles(files);
  }
}
