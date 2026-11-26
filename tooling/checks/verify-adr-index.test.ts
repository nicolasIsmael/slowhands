import { expect, test } from "vitest";
import { compareIndex, parseAdr, parseIndex } from "./verify-adr-index.ts";

const record = parseAdr("0003-x.md", "# 0003 Static rules\n\n- Status: Accepted\n");

test("reads the title and status of a record", () => {
  expect(record).toEqual({
    number: "0003",
    file: "0003-x.md",
    title: "Static rules",
    status: "Accepted",
  });
});

test("reads rows of the index table", () => {
  const rows = parseIndex("| [0003](0003-x.md) | Static rules | Accepted | 2026-11-24 |");
  expect(rows).toHaveLength(1);
  expect(rows[0]?.status).toBe("Accepted");
});

test("accepts an index that matches the records", () => {
  const rows = parseIndex("| [0003](0003-x.md) | Static rules | Accepted | 2026-11-24 |");
  expect(compareIndex(record ? [record] : [], rows)).toEqual([]);
});

test("reports a record missing from the index", () => {
  expect(compareIndex(record ? [record] : [], [])).toEqual(["0003-x.md: missing from the index"]);
});

test("reports a status that differs from the index", () => {
  const rows = parseIndex("| [0003](0003-x.md) | Static rules | Proposed | 2026-11-24 |");
  expect(compareIndex(record ? [record] : [], rows)).toHaveLength(1);
});

test("reports an index row without a file", () => {
  const rows = parseIndex("| [0009](0009-y.md) | Other | Accepted | 2026-11-24 |");
  expect(compareIndex([], rows)).toEqual(["index lists 0009 but no such file exists"]);
});
