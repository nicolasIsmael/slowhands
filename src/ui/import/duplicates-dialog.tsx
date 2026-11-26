import type { DuplicateDecision, DuplicateNotice } from "@core/import/duplicate-decision.ts";
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

const REASON_KEYS = {
  "same-content": "duplicates.reason.sameContent",
  "same-identity": "duplicates.reason.sameIdentity",
} as const;

function DuplicateList({ notices }: { notices: readonly DuplicateNotice[] }) {
  const { t } = useTranslation("import");
  return (
    <ul className="max-h-64 divide-y overflow-y-auto rounded-md border">
      {notices.map((notice) => (
        <li key={notice.fileIndex} className="grid gap-1 p-3">
          <p dir="auto" className="font-medium break-all">
            {notice.fileName}
          </p>
          <p dir="auto" className="text-sm text-muted-foreground break-words">
            {t(REASON_KEYS[notice.reason], { name: notice.existingName })}
          </p>
        </li>
      ))}
    </ul>
  );
}

/**
 * The one question about every duplicate of a batch. Closing it (Escape) counts as skipping,
 * because that changes nothing.
 */
export function DuplicatesDialog({
  notices,
  onDecide,
}: {
  notices: readonly DuplicateNotice[];
  onDecide: (decision: DuplicateDecision) => void;
}) {
  const { t } = useTranslation("import");
  return (
    <Dialog open onOpenChange={(open) => !open && onDecide("skip-all")}>
      <DialogContent onInteractOutside={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t("duplicates.heading", { count: notices.length })}</DialogTitle>
          <DialogDescription>{t("duplicates.explanation")}</DialogDescription>
        </DialogHeader>
        <DuplicateList notices={notices} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onDecide("skip-all")}>
            {t("duplicates.skip")}
          </Button>
          <Button variant="outline" onClick={() => onDecide("keep-both-all")}>
            {t("duplicates.keepBoth")}
          </Button>
          <Button onClick={() => onDecide("replace-all")}>{t("duplicates.replace")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
