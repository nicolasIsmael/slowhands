import type { SongRecord } from "./song-record.ts";

/** What the song list needs to show one row. */
export type LibraryEntry = Pick<
  SongRecord,
  "id" | "displayName" | "composer" | "sourceFileName" | "activityAt"
>;
