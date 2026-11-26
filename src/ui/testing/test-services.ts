import { Flag } from "@core/reactive/flag.ts";
import { NavigationController } from "../app/navigation/navigation-controller.ts";
import type { Services } from "../app/services.ts";
import { ImportActivity } from "../import/import-activity.ts";
import { InMemorySettingsRepository } from "./in-memory-settings-repository.ts";
import { InMemorySongStore } from "./in-memory-song-store.ts";
import { RecordingScoreRenderer } from "./recording-score-renderer.ts";
import { RecordingStoragePersistence } from "./recording-storage-persistence.ts";

function notConfigured(name: string): never {
  throw new Error(`${name} was not provided to createTestServices in this test`);
}

/** In-memory services for tests; pass overrides for whatever the test needs to control. */
export function createTestServices(overrides: Partial<Services> = {}): Services {
  const songs = new InMemorySongStore();
  return {
    settings: new InMemorySettingsRepository(),
    navigation: new NavigationController(),
    songReader: songs,
    songWriter: songs,
    createBatchImport: () => notConfigured("createBatchImport"),
    clock: { now: () => 5000 },
    storagePersistence: new RecordingStoragePersistence(),
    preparer: { prepare: () => notConfigured("preparer") },
    updates: { available: new Flag(), apply: async () => {} },
    installation: { canInstall: new Flag(), install: async () => {} },
    supersession: { superseded: new Flag() },
    importActivity: new ImportActivity(),
    reloadPage: () => {},
    createRenderer: () => new RecordingScoreRenderer(),
    ...overrides,
  };
}
