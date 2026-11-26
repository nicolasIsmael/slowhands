import type { Transaction } from "dexie";

/** One schema version: the tables it declares and an optional data upgrade step. */
export interface Migration {
  readonly version: number;
  readonly stores: Record<string, string>;
  readonly upgrade?: (transaction: Transaction) => Promise<void> | void;
}
