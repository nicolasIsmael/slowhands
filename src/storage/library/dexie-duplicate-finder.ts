import type { DuplicateCandidate, DuplicateFinder } from "@core/library/duplicate-finder.ts";
import type { DuplicateMatch } from "@core/library/duplicate-match.ts";
import type { SlowHandsDatabase } from "../database/slow-hands-database.ts";

export class DexieDuplicateFinder implements DuplicateFinder {
  private readonly database: SlowHandsDatabase;

  constructor(database: SlowHandsDatabase) {
    this.database = database;
  }

  async findDuplicate({
    contentHash,
    identityKey,
  }: DuplicateCandidate): Promise<DuplicateMatch | null> {
    const sameContent = await this.database.songs.where("contentHash").equals(contentHash).first();
    if (sameContent) {
      return { existing: sameContent, reason: "same-content" };
    }
    const sameIdentity = await this.database.songs.where("identityKey").equals(identityKey).first();
    return sameIdentity ? { existing: sameIdentity, reason: "same-identity" } : null;
  }
}
