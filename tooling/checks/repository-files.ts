import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".ico",
  ".woff",
  ".woff2",
  ".pdf",
  ".mid",
  ".mp3",
  ".mxl",
  ".zip",
]);

export interface RepositoryFile {
  path: string;
  text: string;
}

export function isBinaryPath(path: string): boolean {
  const dot = path.lastIndexOf(".");
  return dot >= 0 && BINARY_EXTENSIONS.has(path.slice(dot).toLowerCase());
}

export function listRepositoryPaths(): string[] {
  const output = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { encoding: "utf8" },
  );
  return output.split("\0").filter((path) => path !== "");
}

export function readRepositoryTextFiles(): RepositoryFile[] {
  return listRepositoryPaths()
    .filter((path) => !isBinaryPath(path))
    .map((path) => ({ path, text: readFileSync(path, "utf8") }));
}
