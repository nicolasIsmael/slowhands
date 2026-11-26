import { useTranslation } from "react-i18next";
import { Button } from "../primitives/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../primitives/dialog.tsx";
import { Progress } from "../primitives/progress.tsx";
import { ImportProgressList } from "./import-progress-list.tsx";
import type { ImportState } from "./import-state.ts";

function Counts({ state }: { state: Extract<ImportState, { status: "finished" }> }) {
  const { t } = useTranslation("import");
  const { importedCount, replacedCount, keptBothCount, skippedCount, failedCount } = state.summary;
  const parts = [
    importedCount > 0 && t("summary.imported", { count: importedCount }),
    replacedCount > 0 && t("summary.replaced", { count: replacedCount }),
    keptBothCount > 0 && t("summary.keptBoth", { count: keptBothCount }),
    skippedCount > 0 && t("summary.skipped", { count: skippedCount }),
    failedCount > 0 && t("summary.failed", { count: failedCount }),
  ].filter((part) => part !== false);
  return <span>{parts.join(" · ")}</span>;
}

/** Shows progress while a batch runs, then the single summary of what worked and what failed. */
export function ImportSummaryDialog({
  state,
  onClose,
}: {
  state: ImportState;
  onClose: () => void;
}) {
  const { t } = useTranslation("import");
  if (state.status === "idle" || state.status === "deciding") {
    return null;
  }
  const finished = state.status === "finished";
  const done = state.rows.filter((row) => row.step === "done").length;
  return (
    <Dialog open onOpenChange={(open) => finished && !open && onClose()}>
      <DialogContent onInteractOutside={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t(finished ? "summary.heading" : "progress.heading")}</DialogTitle>
          <DialogDescription>
            {finished ? (
              <Counts state={state} />
            ) : (
              t("progress.count", { done, total: state.rows.length })
            )}
          </DialogDescription>
        </DialogHeader>
        {!finished && <Progress value={(done / state.rows.length) * 100} />}
        <ImportProgressList rows={state.rows} />
        {finished && (
          <DialogFooter>
            <Button onClick={onClose}>{t("summary.close")}</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
