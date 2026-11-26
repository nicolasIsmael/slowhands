import { expect, test } from "vitest";
import { encodeText } from "./testing/fixture-files.ts";
import { WebCryptoContentHasher } from "./web-crypto-content-hasher.ts";

const hasher = new WebCryptoContentHasher();

test("hashes bytes to the known SHA-256 value, in lower-case hexadecimal", async () => {
  expect(await hasher.hash(encodeText("abc"))).toBe(
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("hashes empty input to the known SHA-256 value", async () => {
  expect(await hasher.hash(new Uint8Array())).toBe(
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  );
});

test("gives different bytes different hashes", async () => {
  expect(await hasher.hash(encodeText("a"))).not.toBe(await hasher.hash(encodeText("b")));
});
