import { readdirSync, readFileSync } from "node:fs";

const ADR_DIRECTORY = "docs/adr";
const FILE_NAME = /^(\d{4})-.+\.md$/;
const INDEX_ROW = /^\|\s*\[(\d{4})\]\(([^)]+)\)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/;

export interface AdrRecord {
  number: string;
  file: string;
  title: string;
  status: string;
}

export function parseAdr(file: string, text: string): AdrRecord | null {
  const number = FILE_NAME.exec(file)?.[1];
  const title = /^# \d{4} (.+)$/m.exec(text)?.[1];
  const status = /^- Status: (.+)$/m.exec(text)?.[1];
  return number && title && status ? { number, file, title, status } : null;
}

export function parseIndex(text: string): AdrRecord[] {
  return text.split("\n").flatMap((line) => {
    const match = INDEX_ROW.exec(line);
    return match
      ? [
          {
            number: match[1] ?? "",
            file: match[2] ?? "",
            title: match[3] ?? "",
            status: match[4] ?? "",
          },
        ]
      : [];
  });
}

export function compareIndex(records: AdrRecord[], indexed: AdrRecord[]): string[] {
  const problems: string[] = [];
  for (const record of records) {
    const row = indexed.find((entry) => entry.number === record.number);
    if (!row) {
      problems.push(`${record.file}: missing from the index`);
    } else if (row.title !== record.title || row.status !== record.status) {
      problems.push(`${record.file}: index row differs from the record (title or status)`);
    }
  }
  for (const row of indexed) {
    if (!records.some((record) => record.number === row.number)) {
      problems.push(`index lists ${row.number} but no such file exists`);
    }
  }
  return problems;
}

export function checkAdrDirectory(directory = ADR_DIRECTORY): string[] {
  const files = readdirSync(directory).filter((name) => FILE_NAME.test(name));
  const records = files.flatMap((name) => {
    const record = parseAdr(name, readFileSync(`${directory}/${name}`, "utf8"));
    return record ? [record] : [];
  });
  const malformed = files.length - records.length;
  const indexed = parseIndex(readFileSync(`${directory}/README.md`, "utf8"));
  const problems = compareIndex(records, indexed);
  return malformed > 0
    ? [`${malformed} record(s) lack a title or a status`, ...problems]
    : problems;
}

if (import.meta.main) {
  const problems = checkAdrDirectory();
  for (const problem of problems) {
    console.error(problem);
  }
  process.exit(problems.length === 0 ? 0 : 1);
}
