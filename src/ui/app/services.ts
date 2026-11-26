import type { AppInstallation } from "@core/app/app-installation.ts";
import type { AppUpdates } from "@core/app/app-updates.ts";
import type { ImportRunner } from "@core/import/import-runner.ts";
import type { SongReader } from "@core/library/song-reader.ts";
import type { SongWriter } from "@core/library/song-writer.ts";
import type { StoragePersistence } from "@core/library/storage-persistence.ts";
import type { StorageSupersession } from "@core/library/storage-supersession.ts";
import type { SettingsRepository } from "@core/settings/settings-repository.ts";
import type { Clock } from "@core/time/clock.ts";
import type { ScoreRenderer } from "@core/viewer/score-renderer.ts";
import type { ScoreSourcePreparer } from "@core/viewer/score-source-preparer.ts";
import type { ImportActivity } from "../import/import-activity.ts";
import type { NavigationController } from "./navigation/navigation-controller.ts";

/** Everything the screens need from the outside world, wired once in the composition root. */
export interface Services {
  readonly settings: SettingsRepository;
  readonly navigation: NavigationController;
  readonly songReader: SongReader;
  readonly songWriter: SongWriter;
  /** A fresh import for each batch, because each batch gets its own worker. */
  readonly createBatchImport: () => ImportRunner;
  readonly clock: Clock;
  readonly storagePersistence: StoragePersistence;
  readonly preparer: ScoreSourcePreparer;
  readonly updates: AppUpdates;
  readonly installation: AppInstallation;
  readonly supersession: StorageSupersession;
  /** Whether an import is under way; things that reload the page wait for it. */
  readonly importActivity: ImportActivity;
  readonly reloadPage: () => void;
  readonly createRenderer: () => ScoreRenderer<HTMLElement>;
}
