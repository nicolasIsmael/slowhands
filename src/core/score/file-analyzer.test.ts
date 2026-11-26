import { expect, test } from "vitest";
import { FileAnalyzer } from "./file-analyzer.ts";
import { FilePrecheck } from "./file-precheck.ts";
import { MusicXmlInspector } from "./music-xml-inspector.ts";
import { MxlContainerReader } from "./mxl-container.ts";
import { ScoreFileClassifier } from "./score-file-classifier.ts";
import { ScoreXmlLoader } from "./score-xml-loader.ts";
import { ByteListingHasher } from "./testing/byte-listing-hasher.ts";
import { InMemoryArchive } from "./testing/in-memory-archive.ts";
import { asciiBytes, ScriptedXmlSource } from "./testing/scripted-xml-source.ts";
import { element, partwiseScore, textElement } from "./testing/xml-event-builders.ts";

const SCORE = "<score>";
const titled = partwiseScore(element("work", textElement("work-title", "Moonlight")));
const container = element(
  "container",
  element("rootfiles", element("rootfile", [], { "full-path": "score.musicxml" })),
);

function analyzerFor(options: { damagedArchive?: boolean; maxBytes?: number } = {}) {
  const archive = new InMemoryArchive(
    { "META-INF/container.xml": asciiBytes("container"), "score.musicxml": asciiBytes(SCORE) },
    options.damagedArchive ?? false,
  );
  const xml = new ScriptedXmlSource({ [SCORE]: titled, container, "<other>": element("recipe") });
  return new FileAnalyzer({
    precheck: new FilePrecheck(options.maxBytes),
    classifier: new ScoreFileClassifier(),
    loader: new ScoreXmlLoader(new MxlContainerReader(archive, xml)),
    xml,
    inspector: new MusicXmlInspector(),
    hasher: new ByteListingHasher(),
  });
}

const zip = Uint8Array.from([0x50, 0x4b, 0x03, 0x04, 1, 2]);

test("accepts a plain score and reports its title, format and hash", async () => {
  const result = await analyzerFor().analyze("moon.musicxml", asciiBytes(SCORE));
  expect(result).toEqual({
    status: "accepted",
    summary: {
      title: "Moonlight",
      composer: null,
      format: "musicxml",
      contentHash: asciiBytes(SCORE).join("-"),
    },
  });
});

test("gives a compressed and a plain copy of one score the same hash", async () => {
  const plain = await analyzerFor().analyze("a.musicxml", asciiBytes(SCORE));
  const packed = await analyzerFor().analyze("a.mxl", zip);
  const hashOf = (result: typeof plain) =>
    result.status === "accepted" ? result.summary.contentHash : "";
  expect(hashOf(packed)).toBe(hashOf(plain));
  expect(packed.status === "accepted" && packed.summary.format).toBe("mxl");
});

test("rejects an empty file", async () => {
  const result = await analyzerFor().analyze("a.musicxml", new Uint8Array());
  expect(result).toEqual({ status: "rejected", code: "empty-file" });
});

test("rejects a file over the size limit", async () => {
  const result = await analyzerFor({ maxBytes: 4 }).analyze("a.musicxml", asciiBytes(SCORE));
  expect(result).toEqual({ status: "rejected", code: "file-too-large" });
});

test("rejects an unsupported file type", async () => {
  const result = await analyzerFor().analyze("a.pdf", asciiBytes("%PDF-1.4"));
  expect(result).toEqual({ status: "rejected", code: "unsupported-file-type" });
});

test("rejects a damaged archive as corrupted", async () => {
  const result = await analyzerFor({ damagedArchive: true }).analyze("a.mxl", zip);
  expect(result).toEqual({ status: "rejected", code: "archive-corrupted" });
});

test("rejects a well-formed document that is not a score", async () => {
  const result = await analyzerFor().analyze("a.xml", asciiBytes("<other>"));
  expect(result).toEqual({ status: "rejected", code: "not-a-score" });
});

test("reports any unexpected failure as an unexpected error", async () => {
  const analyzer = analyzerFor();
  const broken = { hash: async () => Promise.reject(new Error("boom")) };
  const failing = new FileAnalyzer({
    precheck: new FilePrecheck(),
    classifier: new ScoreFileClassifier(),
    loader: new ScoreXmlLoader(
      new MxlContainerReader(new InMemoryArchive({}), new ScriptedXmlSource({})),
    ),
    xml: new ScriptedXmlSource({ [SCORE]: titled }),
    inspector: new MusicXmlInspector(),
    hasher: broken,
  });
  expect(analyzer).toBeDefined();
  expect(await failing.analyze("a.musicxml", asciiBytes(SCORE))).toEqual({
    status: "rejected",
    code: "unexpected-error",
  });
});
