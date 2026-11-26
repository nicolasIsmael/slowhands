import type { LibraryEntry } from "@core/library/library-entry.ts";
import { useTranslation } from "react-i18next";
import { useServices } from "../app/services-context.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../primitives/alert-dialog.tsx";
import { useSongChange } from "./use-song-change.ts";

/** Deleting cannot be undone, so nothing is removed until the person confirms here. */
export function DeleteConfirmDialog({
  entry,
  onClose,
}: {
  entry: LibraryEntry;
  onClose: () => void;
}) {
  const { t } = useTranslation("library");
  const { songWriter } = useServices();
  const { failed, run } = useSongChange(onClose);
  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle dir="auto">
            {t("delete.title", { name: entry.displayName })}
          </AlertDialogTitle>
          <AlertDialogDescription>{t("delete.description")}</AlertDialogDescription>
        </AlertDialogHeader>
        {failed && (
          <p role="alert" className="text-sm text-destructive">
            {t("actions.failed")}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>{t("delete.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void run(() => songWriter.remove(entry.id));
            }}
          >
            {t("delete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
