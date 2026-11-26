import { expect, test } from "vitest";
import { element, partwiseScore } from "./testing/xml-event-builders.ts";
import { UndrawableNotationScanner } from "./undrawable-notation-scanner.ts";

const scanner = new UndrawableNotationScanner();

test("reports nothing for a plain score", () => {
  expect(scanner.scan(partwiseScore())).toEqual([]);
});

test("reports one notice for each kind of notation the renderer cannot draw", () => {
  const known = [
    "figured-bass",
    "harp-pedals",
    "accordion-registration",
    "scordatura",
    "staff-divide",
    "symbol",
    "percussion",
    "other-direction",
  ];
  for (const name of known) {
    expect(scanner.scan(partwiseScore(element(name))), name).toEqual([
      "some-symbols-not-displayed",
    ]);
  }
});

test("reports the notice once however many such elements there are", () => {
  const head = [...element("figured-bass"), ...element("harp-pedals")];
  expect(scanner.scan(partwiseScore(head))).toHaveLength(1);
});
