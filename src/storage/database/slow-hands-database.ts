import type { SongRecord } from "@core/library/song-record.ts";
import type { StorageSupersession } from "@core/library/storage-supersession.ts";
import { Flag } from "@core/reactive/flag.ts";
import Dexie, { type EntityTable } from "dexie";
import { ALL_MIGRATIONS } from "./migrations/all-migrations.ts";
import type { ScoreFileRow, SettingRow } from "./rows.ts";

export const DATABASE_NAME = "slowhands";

export class SlowHandsDatabase extends Dexie {
  declare songs: EntityTable<SongRecord, "id">;
  declare scoreFiles: EntityTable<ScoreFileRow, "songId">;
  declare settings: EntityTable<SettingRow, "key">;

  /**
   * Raised when another tab upgrades the schema. This tab then closes its connection, so the
   * upgrade is never blocked, and the screen asks for a reload. A tab that opens a newer schema
   * while an older tab is open needs no handling: the older tab closes itself as above.
   */
  readonly supersession: StorageSupersession;

  constructor(name: string = DATABASE_NAME) {
    super(name);
    for (const migration of ALL_MIGRATIONS) {
      const version = this.version(migration.version).stores(migration.stores);
      if (migration.upgrade) {
        version.upgrade(migration.upgrade);
      }
    }
    const upgradedElsewhere = new Flag();
    this.supersession = { superseded: upgradedElsewhere };
    this.on("versionchange", () => {
      this.close();
      upgradedElsewhere.raise();
      return false;
    });
  }
}
