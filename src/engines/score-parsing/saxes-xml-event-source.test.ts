import { ScoreRejection } from "@core/score/score-rejection.ts";
import type { XmlEvent } from "@core/score/xml-event-source.ts";
import { expect, test } from "vitest";
import { SaxesXmlEventSource } from "./saxes-xml-event-source.ts";
import { encodeText, readFixture } from "./testing/fixture-files.ts";

const source = new SaxesXmlEventSource();
const collect = (bytes: Uint8Array): XmlEvent[] => [...source.events(bytes)];

const textOf = (events: XmlEvent[], elementName: string): string => {
  const index = events.findIndex((event) => event.type === "start" && event.name === elementName);
  const next = events[index + 1];
  return next?.type === "text" ? next.text : "";
};

function rejectionOf(bytes: Uint8Array): string {
  try {
    collect(bytes);
  } catch (error) {
    return error instanceof ScoreRejection ? error.code : "other error";
  }
  return "accepted";
}

const elementEvents = (events: XmlEvent[]): XmlEvent[] =>
  events.filter((event) => event.type !== "text");

test("streams a well-formed score from its root to its end", () => {
  const events = collect(readFixture("piano-grand-staff.musicxml"));
  expect(elementEvents(events)[0]).toMatchObject({ type: "start", name: "score-partwise" });
  expect(elementEvents(events).at(-1)).toEqual({ type: "end", name: "score-partwise" });
  expect(textOf(events, "work-title")).toBe("Morning Study");
});

test("hands over attributes as plain text values", () => {
  const events = collect(readFixture("piano-grand-staff.musicxml"));
  const creator = events.find((event) => event.type === "start" && event.name === "creator");
  expect(creator).toMatchObject({ attributes: { type: "composer" } });
});

test("streams a long score completely", () => {
  const events = collect(readFixture("long-score.musicxml"));
  const measures = events.filter((event) => event.type === "start" && event.name === "measure");
  expect(measures).toHaveLength(300);
});

test("rejects a score that is cut off", () => {
  expect(rejectionOf(readFixture("invalid/truncated.musicxml"))).toBe("xml-malformed");
});

test("rejects plain text", () => {
  expect(rejectionOf(readFixture("invalid/plain-text.xml"))).toBe("xml-malformed");
});

test("rejects bytes that hold no document at all", () => {
  expect(rejectionOf(encodeText("   "))).toBe("xml-malformed");
});

test("streams a well-formed document that is not a score", () => {
  const events = collect(readFixture("invalid/wrong-root.xml"));
  expect(elementEvents(events)[0]).toMatchObject({ type: "start", name: "recipe" });
});

test("reads accents, non-Latin characters and emoji", () => {
  const events = collect(readFixture("Café ñandú 🎹.musicxml"));
  expect(textOf(events, "work-title")).toBe("Canción de Cuna 🎹");
  expect(textOf(events, "creator")).toBe("José Núñez 山田");
});

test("honors a UTF-16 byte-order mark", () => {
  const body = '<?xml version="1.0" encoding="UTF-16"?><a>é</a>';
  const units = Uint8Array.from(
    Array.from(body).flatMap((c) => [c.charCodeAt(0) & 255, c.charCodeAt(0) >> 8]),
  );
  const bytes = new Uint8Array([0xff, 0xfe, ...units]);
  expect(textOf(collect(bytes), "a")).toBe("é");
});

test("honors the encoding declared in the document", () => {
  const head = encodeText('<?xml version="1.0" encoding="ISO-8859-1"?><a>');
  const bytes = new Uint8Array([...head, 0xe9, ...encodeText("</a>")]);
  expect(textOf(collect(bytes), "a")).toBe("é");
});
