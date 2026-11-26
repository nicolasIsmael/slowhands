# 0005 Storage schema and migrations

- Status: Accepted
- Date: 2026-11-24

## Context

Imported scores must stay on the device, be listable instantly, survive restarts and
updates, and be readable offline. An imported song and its original file must never be left
half written. The data also has to survive future changes to the metadata we extract.

## Decision

Use IndexedDB through **Dexie** 4.4.7 (Apache-2.0). IndexedDB is the only browser store that
gives transactions across several tables; Dexie adds typed tables, `liveQuery` for reactive
lists and an explicit versioning API. Writing that layer by hand would be larger and riskier.

Schema version 1:

```text
songs:      id, activityAt, contentHash, identityKey
scoreFiles: songId
settings:   key
```

- `songs` holds the metadata the list needs; it never holds file bytes, so listing is cheap.
- `scoreFiles` holds the untouched original file bytes (as an `ArrayBuffer`), one row per song,
  so a score can be re-read when the reader improves.
- `settings` holds small key/value rows, starting with the chosen interface language.
- A song and its file are written, replaced and deleted in one read-write transaction.
- A quota error is mapped to a typed `storage-full` code; any other failure to `storage-failed`.
- Each song records an `extractorVersion`, the version of the rules that produced its metadata,
  so a later migration can recompute metadata from the stored originals.

Migrations: every schema version lives in its own file under `src/storage/database/migrations/`
exporting its `stores()` declaration and an optional `upgrade()` step; the database class
registers them in order. A migration test seeds a database at the previous version with
fake-indexeddb, opens the latest one and checks that data, including original bytes, survives.
If another tab holds the database open during an upgrade, the connection is closed and the
interface asks for a reload.

Persistent storage is requested from the browser after the first successful import, to reduce
the chance of eviction.

## Alternatives considered

- **localStorage**: synchronous, tiny quota, no transactions, no binary data.
- **The Origin Private File System for the bytes**: allowed, but keeping bytes and metadata in
  one store keeps writes atomic.
- **One table holding bytes and metadata**: every list read would load every score.
- **`Blob` values instead of `ArrayBuffer`**: lower memory use, but older engines have had
  problems; revisit if memory measurements demand it.

## Consequences

- Reads of the list stay fast regardless of library size.
- Exporting a library later is straightforward: originals and metadata are all there.
- Schema changes need a new migration file and a test; the stored originals make most changes
  recoverable.
