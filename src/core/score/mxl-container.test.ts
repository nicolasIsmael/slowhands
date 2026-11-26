import { expect, test } from "vitest";
import { MxlContainerReader } from "./mxl-container.ts";
import { ScoreRejection } from "./score-rejection.ts";
import { InMemoryArchive } from "./testing/in-memory-archive.ts";
import { asciiBytes, ScriptedXmlSource } from "./testing/scripted-xml-source.ts";
import { element } from "./testing/xml-event-builders.ts";
import type { XmlEvent } from "./xml-event-source.ts";

const none = new Uint8Array();
const rootfile = (path: string): XmlEvent[] =>
  element("rootfile", [], { "full-path": path, "media-type": "x" });

function readerFor(containerEvents: XmlEvent[] | null, files: Record<string, string>) {
  const entries: Record<string, Uint8Array> = {};
  for (const [name, text] of Object.entries(files)) {
    entries[name] = asciiBytes(text);
  }
  if (containerEvents !== null) {
    entries["META-INF/container.xml"] = asciiBytes("container");
  }
  const xml = new ScriptedXmlSource({ container: containerEvents ?? [] });
  return new MxlContainerReader(new InMemoryArchive(entries), xml);
}

function codeOf(action: () => unknown): string {
  try {
    action();
  } catch (error) {
    return error instanceof ScoreRejection ? error.code : "other error";
  }
  return "accepted";
}

const container = (...paths: string[]): XmlEvent[] =>
  element("container", element("rootfiles", paths.flatMap(rootfile)));

test("reads the root file named by the container", () => {
  const reader = readerFor(container("score.musicxml"), { "score.musicxml": "SCORE" });
  expect(new TextDecoder().decode(reader.readScore(none))).toBe("SCORE");
});

test("skips root files that point inside META-INF", () => {
  const events = container("META-INF/other.xml", "real.musicxml");
  const reader = readerFor(events, { "META-INF/other.xml": "NO", "real.musicxml": "YES" });
  expect(new TextDecoder().decode(reader.readScore(none))).toBe("YES");
});

test("rejects an archive without a container", () => {
  const reader = readerFor(null, { "score.musicxml": "SCORE" });
  expect(codeOf(() => reader.readScore(none))).toBe("archive-without-score");
});

test("rejects a container whose root file is missing from the archive", () => {
  const reader = readerFor(container("missing.musicxml"), { "notes.txt": "x" });
  expect(codeOf(() => reader.readScore(none))).toBe("archive-without-score");
});

test("rejects a container that names no root file", () => {
  const reader = readerFor(container(), { "score.musicxml": "SCORE" });
  expect(codeOf(() => reader.readScore(none))).toBe("archive-without-score");
});

test("passes on a damaged archive as corrupted", () => {
  const damaged = new InMemoryArchive({}, true);
  const reader = new MxlContainerReader(damaged, new ScriptedXmlSource({}));
  expect(codeOf(() => reader.readScore(none))).toBe("archive-corrupted");
});
