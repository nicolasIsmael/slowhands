# 0006 Batch import pipeline

- Status: Accepted
- Date: 2026-11-24

## Context

A person can pick several score files at once. Each file must be checked without freezing the
interface, a bad file must never affect the others, nothing half imported may ever appear in
the library, and the person sees one summary at the end. Scores can be compressed (`.mxl`) or
plain XML and can be large, on a phone. Files that already exist in the library must be handled
once per batch, not file by file.

## Decision

- **Sequential processing**: files are handled one at a time, in the order picked. Per file:
  read, classify, unpack if compressed, stream-parse, extract title and composer, hash, then save.
- **Off the main thread**: the checking runs in a worker. The main thread reads the file and
  transfers its bytes to the worker; the worker returns the analysis together with the same bytes
  (transferred, not copied), which are then saved. One worker serves a batch and is terminated
  at its end; a crash becomes an `unexpected-error` for that file and the next file gets a new
  worker. The same worker unpacks and scans a score when a song is opened, so the main thread
  never unzips.
- **Core stays dependency free**: the core owns the rules and defines three interfaces for what
  needs a library or a browser API: an XML event source, an archive reader and a content hasher.
  Their adapters live in `src/engines/score-parsing`. The core never imports a third-party package.
- **Streaming XML**: the inspector consumes parse events, so memory stays flat for 20 MiB scores,
  and a document that is cut off is detected because the parser reports an unfinished document.
  The inspector accepts `score-partwise` and `score-timewise` roots with at least one part and one
  measure, reads the title from `work-title` (otherwise `movement-title`) and the composer from the
  first `creator` of type `composer`.
- **Compressed scores**: `META-INF/container.xml` names the root file; the first root file that is
  not under `META-INF` is used. The size of an entry is checked before it is inflated, with a
  100 MiB limit for the unpacked score, which stops decompression bombs.
- **Limits**: a file larger than 20 MiB, or an empty file, is rejected before it is read.
- **Duplicates**: a score is a duplicate when its score XML hash equals a stored one, or its
  identity key (title and composer, or the file name when either is missing) matches. New songs are
  saved immediately, each in one atomic transaction. Duplicates keep only the file handle; after
  the last file one notice lists them and one global choice applies: replace all, keep both, or
  skip. Closing the notice counts as skip.
- **Results are typed codes**, never text: `unsupported-file-type`, `empty-file`,
  `file-too-large`, `unpacked-too-large`, `archive-corrupted`, `archive-without-score`,
  `xml-malformed`, `not-a-score`, `score-without-music`, `file-unreadable`, `storage-full`,
  `storage-failed`, `unexpected-error`. Per file the outcome is imported, replaced, kept both,
  skipped or failed. The interface shows each file's result as soon as it is known and one
  summary when the batch ends.

New dependencies:

| Package | Version | Problem solved and why not build it                                                                                                                                | License |
| ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| fflate  | 0.8.3   | Unzips `.mxl` in a worker. About 8 KB, synchronous, lets us list entries and check sizes without inflating. A ZIP and DEFLATE implementation is not worth writing. | MIT     |
| saxes   | 6.0.0   | Streaming, strict XML parser with no DOM, so it runs in a worker and reports unfinished documents. A conformant XML parser is not worth writing.                   | ISC     |

Measured in the finished app (4x CPU throttle): a damaged file of 5 MiB is explained in under two
seconds, a damaged file of 15 MiB shows progress and is explained when its check ends, and the page
keeps painting while a batch of large scores is checked.

## Alternatives considered

- **`DOMParser`**: not available in workers and needs the whole document in memory.
- **A tree parser such as fast-xml-parser**: builds the full tree, which is heavy for large scores.
- **jszip**: already present through the score renderer, but larger, asynchronous and dual-licensed
  with GPL; fflate is smaller and cleaner for this need.
- **Parallel processing**: faster on desktops, but memory spikes on phones.
- **Asking about each duplicate**: one interruption per file instead of one decision per batch.

## Consequences

- A long batch never blocks the interface, and failures are isolated per file.
- Core tests run on plain byte arrays with in-memory fakes.
- Each worker request moves buffers, so the app never holds more than one file's bytes at a time,
  apart from the original file handles kept for duplicates.
