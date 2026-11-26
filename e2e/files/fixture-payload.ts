import { readFileSync } from "node:fs";
import { basename } from "node:path";

export interface FilePayload {
  name: string;
  mimeType: string;
  buffer: Buffer;
}

/** A sample score file from `fixtures/scores`, ready to hand to a file input. */
export function fixturePayload(relativePath: string): FilePayload {
  const url = new URL(`../../fixtures/scores/${relativePath}`, import.meta.url);
  return { name: basename(relativePath), mimeType: "", buffer: readFileSync(url) };
}
