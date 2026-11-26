import { MAX_SCORE_FILE_BYTES } from "@core/score/limits.ts";
import { useTranslation } from "react-i18next";
import { failureKeyFor } from "./failure-messages.ts";
import type { ImportRow } from "./import-state.ts";

const LIMIT_MB = MAX_SCORE_FILE_BYTES / (1024 * 1024);

const STEP_FOR_RESULT = {
  imported: "imported",
  replaced: "replaced",
  "kept-both": "keptBoth",
  skipped: "skipped",
  failed: "failed",
} as const;

function RowStatus({ row }: { row: ImportRow }) {
  const { t } = useTranslation("import");
  if (row.result?.kind === "failed") {
    const key = failureKeyFor(row.result.code);
    return (
      <div className="text-sm text-destructive">
        <p className="font-medium">{t(`${key}.title`, { limitMb: LIMIT_MB })}</p>
        <p>{t(`${key}.hint`, { limitMb: LIMIT_MB })}</p>
      </div>
    );
  }
  const step = row.result
    ? STEP_FOR_RESULT[row.result.kind]
    : row.step === "done"
      ? "failed"
      : row.step;
  return <p className="text-sm text-muted-foreground">{t(`step.${step}`)}</p>;
}

/** One line per file; a failed file explains itself the moment it is known. */
export function ImportProgressList({ rows }: { rows: readonly ImportRow[] }) {
  return (
    <ul aria-live="polite" className="divide-y rounded-md border">
      {rows.map((row) => (
        <li key={row.position} className="grid gap-1 p-3">
          <p dir="auto" className="font-medium break-all">
            {row.fileName}
          </p>
          <RowStatus row={row} />
        </li>
      ))}
    </ul>
  );
}
