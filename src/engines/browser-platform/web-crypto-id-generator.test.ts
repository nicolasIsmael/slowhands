import { expect, test } from "vitest";
import { WebCryptoIdGenerator } from "./web-crypto-id-generator.ts";

test("produces identifiers shaped like UUIDs", () => {
  expect(new WebCryptoIdGenerator().next()).toMatch(/^[0-9a-f-]{36}$/);
});

test("never repeats an identifier", () => {
  const generator = new WebCryptoIdGenerator();
  const ids = new Set(Array.from({ length: 100 }, () => generator.next()));
  expect(ids.size).toBe(100);
});
