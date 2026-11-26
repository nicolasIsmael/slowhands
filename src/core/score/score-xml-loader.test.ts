import { expect, test } from "vitest";
import { MxlContainerReader } from "./mxl-container.ts";
import { ScoreRejection } from "./score-rejection.ts";
import { ScoreXmlLoader } from "./score-xml-loader.ts";
import { InMemoryArchive } from "./testing/in-memory-archive.ts";
import { asciiBytes, ScriptedXmlSource } from "./testing/scripted-xml-source.ts";
import { element } from "./testing/xml-event-builders.ts";

const container = element(
  "container",
  element("rootfiles", element("rootfile", [], { "full-path": "score.musicxml" })),
);

function loaderFor(entries: Record<string, Uint8Array>): ScoreXmlLoader {
  const archive = new InMemoryArchive({
    "META-INF/container.xml": asciiBytes("container"),
    ...entries,
  });
  return new ScoreXmlLoader(new MxlContainerReader(archive, new ScriptedXmlSource({ container })));
}

test("returns a plain score unchanged", () => {
  const bytes = asciiBytes("<score/>");
  expect(loaderFor({}).load(bytes, "musicxml")).toBe(bytes);
});

test("returns the root file of a compressed score", () => {
  const loader = loaderFor({ "score.musicxml": asciiBytes("ROOT") });
  expect(loader.load(new Uint8Array(), "mxl")).toEqual(asciiBytes("ROOT"));
});

test("rejects a compressed score whose root file is missing", () => {
  expect(() => loaderFor({}).load(new Uint8Array(), "mxl")).toThrow(ScoreRejection);
});
