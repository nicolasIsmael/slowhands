import { registerSW } from "virtual:pwa-register";
import { BatchImport } from "@core/import/batch-import.ts";
import { FilePrecheck } from "@core/score/file-precheck.ts";
import { BrowserAppInstallation } from "@engines/browser-platform/browser-app-installation.ts";
import { BrowserStoragePersistence } from "@engines/browser-platform/browser-storage-persistence.ts";
import { ServiceWorkerUpdates } from "@engines/browser-platform/service-worker-updates.ts";
import { SystemClock } from "@engines/browser-platform/system-clock.ts";
import { WebCryptoIdGenerator } from "@engines/browser-platform/web-crypto-id-generator.ts";
import { OsmdScoreRenderer } from "@engines/osmd-renderer/osmd-score-renderer.ts";
import { ScoreWorkerChannel } from "@engines/score-worker/score-worker-channel.ts";
import { WorkerScoreAnalyzer } from "@engines/score-worker/worker-score-analyzer.ts";
import { WorkerScoreSourcePreparer } from "@engines/score-worker/worker-score-source-preparer.ts";
import { SlowHandsDatabase } from "@storage/database/slow-hands-database.ts";
import { DexieDuplicateFinder } from "@storage/library/dexie-duplicate-finder.ts";
import { DexieSongReader } from "@storage/library/dexie-song-reader.ts";
import { DexieSongWriter } from "@storage/library/dexie-song-writer.ts";
import { DexieSettingsRepository } from "@storage/settings/dexie-settings-repository.ts";
import { ImportActivity } from "../import/import-activity.ts";
import { NavigationController } from "./navigation/navigation-controller.ts";
import type { Services } from "./services.ts";

type BrowserServices = Pick<
  Services,
  | "navigation"
  | "storagePersistence"
  | "preparer"
  | "updates"
  | "installation"
  | "importActivity"
  | "reloadPage"
  | "createRenderer"
>;

/** The services that talk to the browser itself rather than to the library. */
function createBrowserServices(): BrowserServices {
  return {
    navigation: new NavigationController(),
    storagePersistence: new BrowserStoragePersistence(),
    preparer: new WorkerScoreSourcePreparer(() => new ScoreWorkerChannel()),
    updates: new ServiceWorkerUpdates((options) => registerSW(options)),
    installation: new BrowserAppInstallation(window),
    importActivity: new ImportActivity(),
    reloadPage: () => window.location.reload(),
    createRenderer: () => new OsmdScoreRenderer(),
  };
}

export function createServices(): Services {
  const database = new SlowHandsDatabase();
  const songWriter = new DexieSongWriter(database);
  const ids = new WebCryptoIdGenerator();
  const clock = new SystemClock();
  return {
    ...createBrowserServices(),
    settings: new DexieSettingsRepository(database),
    songReader: new DexieSongReader(database),
    songWriter,
    supersession: database.supersession,
    createBatchImport: () =>
      new BatchImport({
        precheck: new FilePrecheck(),
        analyzer: new WorkerScoreAnalyzer(new ScoreWorkerChannel()),
        writer: songWriter,
        finder: new DexieDuplicateFinder(database),
        ids,
        clock,
      }),
    clock,
  };
}
