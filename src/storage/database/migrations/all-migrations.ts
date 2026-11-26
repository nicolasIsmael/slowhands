import type { Migration } from "./migration.ts";
import { version001 } from "./version-001.ts";

/** Ordered oldest to newest; each new schema version appends one entry. */
export const ALL_MIGRATIONS: readonly Migration[] = [version001];

export const SCHEMA_VERSION = ALL_MIGRATIONS.length;
