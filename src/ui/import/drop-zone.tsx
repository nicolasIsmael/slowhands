import { useTranslation } from "react-i18next";
import { useFileDrop } from "./use-file-drop.ts";

/** Lets files be dropped anywhere on the window, with a visible hint while they are dragged. */
export function DropZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const { t } = useTranslation("library");
  const dragging = useFileDrop(onFiles);

  if (!dragging) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-background/90 p-6">
      <p className="rounded-lg border-2 border-dashed border-foreground p-8 text-center text-lg font-medium">
        {t("import.dropHint")}
      </p>
    </div>
  );
}
