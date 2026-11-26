import { exactBuffer } from "@core/bytes/exact-buffer.ts";
import { expect, test } from "vitest";
import { createFileAnalyzer } from "../score-parsing/score-pipeline.ts";
import { readFixture } from "../score-parsing/testing/fixture-files.ts";
import { handleAnalyze } from "./analysis-handler.ts";

const analyzer = createFileAnalyzer();
const request = (fileName: string, path: string) => ({
  kind: "analyze" as const,
  id: 7,
  fileName,
  buffer: exactBuffer(readFixture(path)),
});

test("accepts a score and sends the original bytes back with the verdict", async () => {
  const input = request("piano-grand-staff.musicxml", "piano-grand-staff.musicxml");
  const response = await handleAnalyze(input, analyzer);
  expect(response.id).toBe(7);
  expect(response.result.status).toBe("accepted");
  expect(response.buffer).toBe(input.buffer);
  expect(response.buffer.byteLength).toBe(8192);
});

test("rejects a file that is not a score and still answers the same request", async () => {
  const response = await handleAnalyze(
    request("wrong-root.xml", "invalid/wrong-root.xml"),
    analyzer,
  );
  expect(response.id).toBe(7);
  expect(response.result).toEqual({ status: "rejected", code: "not-a-score" });
});
