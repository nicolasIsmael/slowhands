import { expect, test } from "vitest";
import { findDisallowedPackages, isAllowedLicense } from "./verify-licenses.ts";

test("allows the permissive licenses and LGPL", () => {
  for (const license of [
    "MIT",
    "ISC",
    "Apache-2.0",
    "BSD-3-Clause",
    "BSD-2-Clause",
    "LGPL-3.0-or-later",
  ]) {
    expect(isAllowedLicense(license)).toBe(true);
  }
});

test("rejects GPL, AGPL and unknown licenses", () => {
  for (const license of ["GPL-3.0-only", "AGPL-3.0-or-later", "UNKNOWN", "MPL-2.0"]) {
    expect(isAllowedLicense(license)).toBe(false);
  }
});

test("accepts an OR expression when one alternative is allowed", () => {
  expect(isAllowedLicense("(MIT OR GPL-3.0-or-later)")).toBe(true);
});

test("requires every term of an AND expression to be allowed", () => {
  expect(isAllowedLicense("MIT AND GPL-3.0-only")).toBe(false);
  expect(isAllowedLicense("MIT AND ISC")).toBe(true);
});

test("names each package with a license that is not allowed", () => {
  const problems = findDisallowedPackages([
    { name: "fine", version: "1.0.0", license: "MIT" },
    { name: "bad", version: "2.0.0", license: "GPL-3.0-only" },
  ]);
  expect(problems).toEqual(["bad@2.0.0: GPL-3.0-only"]);
});

test("excuses a package only while its license matches the listed exception", () => {
  const exceptions = [{ package: "lightningcss*", license: "MPL-2.0", reason: "build tool" }];
  const same = { name: "lightningcss-win32-x64-msvc", version: "1.0.0", license: "MPL-2.0" };
  const changed = { name: "lightningcss", version: "2.0.0", license: "GPL-3.0-only" };
  expect(findDisallowedPackages([same], exceptions)).toEqual([]);
  expect(findDisallowedPackages([changed], exceptions)).toEqual([
    "lightningcss@2.0.0: GPL-3.0-only",
  ]);
});
