import type { Migration } from "./migration.ts";

export const version001: Migration = {
  version: 1,
  stores: {
    songs: "id, activityAt, contentHash, identityKey",
    scoreFiles: "songId",
    settings: "key",
  },
};
