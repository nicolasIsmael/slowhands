import { expect, test } from "vitest";
import { MxlContainerReader } from "../score/mxl-container.ts";
import { ScoreXmlLoader } from "../score/score-xml-loader.ts";
import { InMemoryArchive } from "../score/testing/in-memory-archive.ts";
import { asciiBytes, ScriptedXmlSource } from "../score/testing/scripted-xml-source.ts";
import { element, partwiseScore } from "../score/testing/xml-event-builders.ts";
import { UndrawableNotationScanner } from "../score/undrawable-notation-scanner.ts";
import { ScorePreparation } from "./score-preparation.ts";

const container = element(
  "container",
  element("rootfiles", element("rootfile", [], { "full-path": "score.musicxml" })),
);

function preparationFor(scoreEvents: ReturnType<typeof partwiseScore>): ScorePreparation {
  const archive = new InMemoryArchive({
    "META-INF/container.xml": asciiBytes("container"),
    "score.musicxml": asciiBytes("score"),
  });
  const xml = new ScriptedXmlSource({ container, score: scoreEvents, plain: scoreEvents });
  return new ScorePreparation(
    new ScoreXmlLoader(new MxlContainerReader(archive, xml)),
    xml,
    new UndrawableNotationScanner(),
  );
}

test("returns the score xml of a compressed original", () => {
  const prepared = preparationFor(partwiseScore()).prepare(new Uint8Array(), "mxl");
  expect(prepared.xml).toEqual(asciiBytes("score"));
  expect(prepared.notices).toEqual([]);
});

test("returns a plain original unchanged", () => {
  const bytes = asciiBytes("plain");
  expect(preparationFor(partwiseScore()).prepare(bytes, "musicxml").xml).toBe(bytes);
});

test("adds a notice when the score has notation the renderer cannot draw", () => {
  const events = partwiseScore(element("figured-bass"));
  const prepared = preparationFor(events).prepare(asciiBytes("plain"), "musicxml");
  expect(prepared.notices).toEqual(["some-symbols-not-displayed"]);
});
