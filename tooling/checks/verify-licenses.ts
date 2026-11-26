import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const EXCEPTIONS_FILE = "tooling/checks/license-exceptions.json";
const ALLOWED = [/^MIT(-0)?$/i, /^ISC$/i, /^Apache-2\.0$/i, /^0?BSD(-[1-4]-Clause)?$/i, /^LGPL-/i];

export interface LicenseException {
  package: string;
  license: string;
  reason: string;
}

export interface InstalledPackage {
  name: string;
  version: string;
  license: string;
}

export function isAllowedLicense(expression: string): boolean {
  const alternatives = expression.replace(/[()]/g, "").split(/\s+OR\s+/i);
  return alternatives.some((alternative) =>
    alternative
      .split(/\s+AND\s+/i)
      .every((term) => ALLOWED.some((pattern) => pattern.test(term.trim()))),
  );
}

function declaredLicense(manifest: Record<string, unknown>): string {
  const license = manifest.license ?? manifest.licenses;
  if (typeof license === "string") {
    return license;
  }
  if (Array.isArray(license)) {
    return license.map((item) => (item as { type?: string }).type ?? "UNKNOWN").join(" OR ");
  }
  return (license as { type?: string } | undefined)?.type ?? "UNKNOWN";
}

function namesMatch(pattern: string, name: string): boolean {
  return pattern.endsWith("*") ? name.startsWith(pattern.slice(0, -1)) : pattern === name;
}

function isExcused(entry: InstalledPackage, exceptions: LicenseException[]): boolean {
  return exceptions.some(
    (excuse) => namesMatch(excuse.package, entry.name) && excuse.license === entry.license,
  );
}

export function findDisallowedPackages(
  packages: InstalledPackage[],
  exceptions: LicenseException[] = [],
): string[] {
  return packages
    .filter((entry) => !isAllowedLicense(entry.license) && !isExcused(entry, exceptions))
    .map((entry) => `${entry.name}@${entry.version}: ${entry.license}`);
}

function readPackage(directory: string): InstalledPackage | null {
  const manifestPath = join(directory, "package.json");
  if (!existsSync(manifestPath)) {
    return null;
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, unknown>;
  return {
    name: String(manifest.name ?? directory),
    version: String(manifest.version ?? "0.0.0"),
    license: declaredLicense(manifest),
  };
}

function packageDirectories(modulesDirectory: string): string[] {
  return readdirSync(modulesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .flatMap((entry) =>
      entry.name.startsWith("@")
        ? readdirSync(join(modulesDirectory, entry.name), { withFileTypes: true })
            .filter((inner) => inner.isDirectory())
            .map((inner) => join(modulesDirectory, entry.name, inner.name))
        : [join(modulesDirectory, entry.name)],
    );
}

export function readInstalledPackages(root = "node_modules/.pnpm"): InstalledPackage[] {
  const found = new Map<string, InstalledPackage>();
  for (const store of readdirSync(root)) {
    const modules = join(root, store, "node_modules");
    if (!existsSync(modules)) {
      continue;
    }
    for (const directory of packageDirectories(modules)) {
      const entry = readPackage(directory);
      if (entry) {
        found.set(`${entry.name}@${entry.version}`, entry);
      }
    }
  }
  return [...found.values()];
}

if (import.meta.main) {
  const exceptions = JSON.parse(readFileSync(EXCEPTIONS_FILE, "utf8")) as LicenseException[];
  const problems = findDisallowedPackages(readInstalledPackages(), exceptions);
  for (const problem of problems) {
    console.error(problem);
  }
  process.exit(problems.length === 0 ? 0 : 1);
}
