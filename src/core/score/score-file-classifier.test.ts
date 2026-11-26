import { expect, test } from "vitest";
import { ScoreFileClassifier } from "./score-file-classifier.ts";
import { ScoreRejection } from "./score-rejection.ts";

const classifier = new ScoreFileClassifier();
const ascii = (text: string): Uint8Array => new TextEncoder().encode(text);
const xmlHead = ascii('<?xml version="1.0"?>');
const zipHead = Uint8Array.from([0x50, 0x4b, 0x03, 0x04, 0, 0]);

function codeOf(action: () => unknown): string {
  try {
    action();
  } catch (error) {
    return error instanceof ScoreRejection ? error.code : "other error";
  }
  return "accepted";
}

test("accepts the three score extensions", () => {
  expect(classifier.classify("piece.musicxml", xmlHead)).toBe("xml");
  expect(classifier.classify("piece.xml", xmlHead)).toBe("xml");
  expect(classifier.classify("piece.mxl", zipHead)).toBe("archive");
});

test("ignores letter case in the extension", () => {
  expect(classifier.classify("PIECE.MusicXML", xmlHead)).toBe("xml");
});

test("rejects other extensions as unsupported", () => {
  for (const name of ["score.pdf", "notes.txt", "song.mid", "noextension"]) {
    expect(
      codeOf(() => classifier.classify(name, xmlHead)),
      name,
    ).toBe("unsupported-file-type");
  }
});

test("recognizes PDF, PNG, JPEG, MIDI and MP3 content under an accepted extension", () => {
  const heads = [
    ascii("%PDF-1.4"),
    Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]),
    Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]),
    ascii("MThd\0\0\0\u0006"),
    ascii("ID3\u0003\0\0"),
    Uint8Array.from([0xff, 0xfb, 0x90, 0x00]),
  ];
  for (const head of heads) {
    expect(codeOf(() => classifier.classify("piece.musicxml", head))).toBe("unsupported-file-type");
  }
});

test("treats a ZIP signature as an archive whatever the extension", () => {
  expect(classifier.classify("piece.xml", zipHead)).toBe("archive");
});

test("treats text content as XML", () => {
  expect(classifier.classify("piece.mxl", ascii("<score-partwise/>"))).toBe("xml");
});
