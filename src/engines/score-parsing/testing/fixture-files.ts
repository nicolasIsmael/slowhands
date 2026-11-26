import { readFileSync } from "node:fs";

const SCORES = new URL("../../../../fixtures/scores/", import.meta.url);

/** Reads a sample score file from `fixtures/scores`. */
export function readFixture(relativePath: string): Uint8Array {
  return new Uint8Array(readFileSync(new URL(relativePath, SCORES)));
}

export const encodeText = (text: string): Uint8Array => new TextEncoder().encode(text);
