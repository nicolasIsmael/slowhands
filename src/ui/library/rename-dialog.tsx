import type { LibraryEntry } from "@core/library/library-entry.ts";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../primitives/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../primitives/dialog.tsx";
import { Input } from "../primitives/input.tsx";
import { useRename } from "./use-rename.ts";

/** Changes only the display name; the score is never touched. */
export function RenameDialog({ entry, onClose }: { entry: LibraryEntry; onClose: () => void }) {
  const { t } = useTranslation("library");
  const inputId = useId();
  const { value, setValue, failed, canSave, save } = useRename(entry, onClose);
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined}>
        <form onSubmit={save} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{t("rename.title")}</DialogTitle>
          </DialogHeader>
          <label htmlFor={inputId} className="grid gap-1.5 text-sm font-medium">
            {t("rename.label")}
            <Input
              id={inputId}
              dir="auto"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          {failed && (
            <p role="alert" className="text-sm text-destructive">
              {t("actions.failed")}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              {t("rename.cancel")}
            </Button>
            <Button type="submit" disabled={!canSave}>
              {t("rename.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
