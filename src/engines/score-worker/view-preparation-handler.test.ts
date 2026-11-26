import { exactBuffer } from "@core/bytes/exact-buffer.ts";
import { expect, test } from "vitest";
import { createScorePreparation } from "../score-parsing/score-pipeline.ts";
import { readFixture } from "../score-parsing/testing/fixture-files.ts";
import type { PrepareViewRequest } from "./messages.ts";
import { handlePrepareView } from "./view-preparation-handler.ts";

const preparation = createScorePreparation();
const request = (path: string, format: PrepareViewRequest["format"]): PrepareViewRequest => ({
  kind: "prepare-view",
  id: 3,
  format,
  buffer: exactBuffer(readFixture(path)),
});

test("returns the score xml of a plain score without notices", () => {
  const response = handlePrepareView(
    request("piano-grand-staff.musicxml", "musicxml"),
    preparation,
  );
  expect(response).toMatchObject({ kind: "prepared", id: 3, notices: [] });
});

test("unpacks a compressed score", () => {
  const response = handlePrepareView(request("piano-grand-staff.mxl", "mxl"), preparation);
  expect(response.kind).toBe("prepared");
  if (response.kind === "prepared") {
    expect(response.xml.byteLength).toBe(8192);
  }
});

test("tells the caller about notation the renderer cannot draw", () => {
  const response = handlePrepareView(
    request("unsupported-notation.musicxml", "musicxml"),
    preparation,
  );
  expect(response).toMatchObject({ kind: "prepared", notices: ["some-symbols-not-displayed"] });
});

test("reports a damaged archive instead of throwing", () => {
  const response = handlePrepareView(request("invalid/corrupt-archive.mxl", "mxl"), preparation);
  expect(response).toEqual({ kind: "failed", id: 3, code: "archive-corrupted" });
});
