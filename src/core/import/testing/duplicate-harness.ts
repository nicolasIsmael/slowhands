import type { IdGenerator } from "../../identity/id-generator.ts";
import type { DuplicateCandidate, DuplicateFinder } from "../../library/duplicate-finder.ts";
import type { DuplicateMatch } from "../../library/duplicate-match.ts";
import { createNewSong } from "../../library/new-song.ts";
import type { SongRecord } from "../../library/song-record.ts";
import type { SongWriter } from "../../library/song-writer.ts";
import { FilePrecheck } from "../../score/file-precheck.ts";
import type { Clock } from "../../time/clock.ts";
import { BatchImport } from "../batch-import.ts";
import type { FileSource } from "../file-source.ts";
import type { ScoreAnalysis, ScoreAnalyzer } from "../score-analyzer.ts";

export const file = (name: string, sizeBytes = 10): FileSource => ({
  name,
  sizeBytes,
  readBytes: async () => new Uint8Array(sizeBytes),
});

export const accepted = (title: string): ScoreAnalysis => ({
  status: "accepted",
  summary: { title, composer: null, format: "musicxml", contentHash: `hash-${title}` },
  bytes: new Uint8Array(10),
});

export interface ExistingSong {
  readonly id: string;
  readonly title: string;
  readonly hash: string;
  readonly renamedTo: string | null;
}

function existingRecord({ id, title, hash, renamedTo }: ExistingSong): SongRecord {
  const song = createNewSong({
    summary: { title, composer: null, format: "musicxml", contentHash: hash },
    fileName: `${title}.musicxml`,
    byteSize: 10,
    id,
    now: 100,
  });
  return renamedTo === null ? song : { ...song, displayName: renamedTo, isRenamed: true };
}

/** An in-memory library, analyzer and clock that record what a batch asked of them. */
export class DuplicateHarness {
  readonly log: string[] = [];
  readonly added: SongRecord[] = [];
  readonly replaced: SongRecord[] = [];
  failSaves = false;
  private songs: SongRecord[];
  private nextId = 0;
  private readonly analyses: Record<string, ScoreAnalysis>;
  private readonly analysisCounts = new Map<string, number>();
  private readonly failingSecondAnalysis = new Set<string>();

  constructor(analyses: Record<string, ScoreAnalysis>, existing: readonly ExistingSong[]) {
    this.analyses = analyses;
    this.songs = existing.map(existingRecord);
  }

  failSecondAnalysisOf(fileName: string): void {
    this.failingSecondAnalysis.add(fileName);
  }

  forgetExistingSongs(): void {
    this.songs = [];
  }

  readonly analyzer: ScoreAnalyzer = {
    analyze: async (source) => {
      const count = (this.analysisCounts.get(source.name) ?? 0) + 1;
      this.analysisCounts.set(source.name, count);
      this.log.push(`analyze ${source.name}`);
      if (count === 2 && this.failingSecondAnalysis.has(source.name)) {
        throw new Error("could not read the file again");
      }
      return this.analyses[source.name] ?? { status: "rejected", code: "not-a-score" };
    },
    release: () => {},
  };

  readonly finder: DuplicateFinder = {
    findDuplicate: async (candidate: DuplicateCandidate): Promise<DuplicateMatch | null> => {
      const sameContent = this.songs.find((song) => song.contentHash === candidate.contentHash);
      if (sameContent) {
        return { existing: sameContent, reason: "same-content" };
      }
      const sameIdentity = this.songs.find((song) => song.identityKey === candidate.identityKey);
      return sameIdentity ? { existing: sameIdentity, reason: "same-identity" } : null;
    },
  };

  readonly writer: SongWriter = {
    add: async (song) => {
      this.log.push(`add ${song.sourceFileName}`);
      this.failIfAsked();
      this.added.push(song);
      this.songs.push(song);
    },
    replace: async (id, song) => {
      this.log.push(`replace ${song.sourceFileName}`);
      this.failIfAsked();
      this.replaced.push({ ...song, id });
    },
    rename: async () => {},
    markOpened: async () => {},
    remove: async () => {},
  };

  readonly ids: IdGenerator = { next: () => `song-${++this.nextId}` };
  readonly clock: Clock = { now: () => 5000 };

  importer(): BatchImport {
    return new BatchImport({
      precheck: new FilePrecheck(),
      analyzer: this.analyzer,
      writer: this.writer,
      finder: this.finder,
      ids: this.ids,
      clock: this.clock,
    });
  }

  private failIfAsked(): void {
    if (this.failSaves) {
      throw new Error("disk failure");
    }
  }
}
