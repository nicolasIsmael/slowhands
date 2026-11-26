import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { contrastRatio, readColorTokens } from "./color-contrast.ts";

const tokens = readColorTokens(
  readFileSync(join(process.cwd(), "src/ui/styling/global.css"), "utf8"),
);

const ratio = (foreground: string, background: string): number => {
  const front = tokens.get(foreground);
  const back = tokens.get(background);
  if (front === undefined || back === undefined) {
    throw new Error(`Missing color token: ${foreground} or ${background}`);
  }
  return contrastRatio(front, back);
};

/** WCAG AA asks for 4.5:1 for text and 3:1 for the edges and focus rings of controls. */
const TEXT = 4.5;
const CONTROL = 3;

test.each([
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["accent-foreground", "accent"],
  ["destructive-foreground", "destructive"],
  ["muted-foreground", "background"],
  ["muted-foreground", "card"],
  ["muted-foreground", "muted"],
  ["destructive", "background"],
  ["destructive", "card"],
])("text in %s on %s is readable", (foreground, background) => {
  expect(ratio(foreground, background)).toBeGreaterThanOrEqual(TEXT);
});

test.each([
  ["input", "background"],
  ["input", "card"],
  ["ring", "background"],
  ["ring", "card"],
])("%s stands out from %s enough to be seen", (foreground, background) => {
  expect(ratio(foreground, background)).toBeGreaterThanOrEqual(CONTROL);
});

test("the contrast of black on white is the maximum, 21 to 1", () => {
  expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
});

test("a color has no contrast with itself", () => {
  expect(contrastRatio("#1c1917", "#1c1917")).toBeCloseTo(1, 5);
});
