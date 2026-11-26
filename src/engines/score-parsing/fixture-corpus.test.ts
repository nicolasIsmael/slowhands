import type { AnalysisResult } from "@core/score/analysis-result.ts";
import { expect, test } from "vitest";
import { createFileAnalyzer } from "./score-pipeline.ts";
import { readFixture } from "./testing/fixture-files.ts";

const analyzer = createFileAnalyzer();
const analyze = (name: string, path = name): Promise<AnalysisResult> =>
  analyzer.analyze(name, readFixture(path));

interface Expectation {
  file: string;
  title: string | null;
  composer: string | null;
  format: "musicxml" | "mxl";
}

const WELL_FORMED: Expectation[] = [
  {
    file: "piano-grand-staff.musicxml",
    title: "Morning Study",
    composer: "Test Composer",
    format: "musicxml",
  },
  {
    file: "piano-grand-staff.mxl",
    title: "Morning Study",
    composer: "Test Composer",
    format: "mxl",
  },
  {
    file: "single-staff.musicxml",
    title: "Simple Melody",
    composer: "Test Composer",
    format: "musicxml",
  },
  {
    file: "two-parts.musicxml",
    title: "Duet for Two Voices",
    composer: "Test Composer",
    format: "musicxml",
  },
  {
    file: "orchestral.musicxml",
    title: "Short Overture",
    composer: "Test Composer",
    format: "musicxml",
  },
  {
    file: "extension-xml.xml",
    title: "Plain Xml Extension",
    composer: "Test Composer",
    format: "musicxml",
  },
  { file: "no-title-no-composer.musicxml", title: null, composer: null, format: "musicxml" },
  {
    file: "Café ñandú 🎹.musicxml",
    title: "Canción de Cuna 🎹",
    composer: "José Núñez 山田",
    format: "musicxml",
  },
  {
    file: "unsupported-notation.musicxml",
    title: "Study With Rare Notation",
    composer: "Test Composer",
    format: "musicxml",
  },
  {
    file: "long-score.musicxml",
    title: "Long Study",
    composer: "Test Composer",
    format: "musicxml",
  },
];

test("every well-formed sample score is accepted with the title, composer and format it holds", async () => {
  for (const expected of WELL_FORMED) {
    const result = await analyze(expected.file);
    expect(result.status, expected.file).toBe("accepted");
    if (result.status === "accepted") {
      expect(result.summary, expected.file).toMatchObject({
        title: expected.title,
        composer: expected.composer,
        format: expected.format,
      });
    }
  }
});

test("a compressed score and its plain copy have the same content hash", async () => {
  const plain = await analyze("piano-grand-staff.musicxml");
  const packed = await analyze("piano-grand-staff.mxl");
  const hashOf = (result: AnalysisResult) =>
    result.status === "accepted" ? result.summary.contentHash : "";
  expect(hashOf(packed)).toBe(hashOf(plain));
  expect(hashOf(plain)).toMatch(/^[0-9a-f]{64}$/);
});

const REJECTED: [string, string][] = [
  ["invalid/empty.musicxml", "empty-file"],
  ["invalid/truncated.musicxml", "xml-malformed"],
  ["invalid/plain-text.xml", "xml-malformed"],
  ["invalid/wrong-root.xml", "not-a-score"],
  ["invalid/corrupt-archive.mxl", "archive-corrupted"],
  ["invalid/archive-without-score.mxl", "archive-without-score"],
  ["unsupported/score.pdf", "unsupported-file-type"],
  ["unsupported/cover.png", "unsupported-file-type"],
  ["unsupported/tune.mid", "unsupported-file-type"],
  ["unsupported/song.mp3", "unsupported-file-type"],
];

test("every invalid or unsupported sample file is rejected with a specific reason", async () => {
  for (const [path, code] of REJECTED) {
    const name = path.slice(path.lastIndexOf("/") + 1);
    expect(await analyze(name, path), path).toEqual({ status: "rejected", code });
  }
});

test("a PDF renamed to a score extension is still recognized as unsupported", async () => {
  const result = await analyzer.analyze("renamed.musicxml", readFixture("unsupported/score.pdf"));
  expect(result).toEqual({ status: "rejected", code: "unsupported-file-type" });
});
