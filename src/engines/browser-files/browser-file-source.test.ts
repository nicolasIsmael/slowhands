import { expect, test } from "vitest";
import { BrowserFileSource } from "./browser-file-source.ts";

const fileOf = (text: string, name: string): File => new File([text], name);

test("reports the name and size of the picked file", () => {
  const source = new BrowserFileSource(fileOf("<score/>", "Café 🎹.musicxml"));
  expect(source.name).toBe("Café 🎹.musicxml");
  expect(source.sizeBytes).toBe(8);
});

test("reads the bytes of the picked file only when asked", async () => {
  const bytes = await new BrowserFileSource(fileOf("abc", "a.xml")).readBytes();
  expect(Array.from(bytes)).toEqual([97, 98, 99]);
});
