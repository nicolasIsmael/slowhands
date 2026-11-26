import { useId } from "react";
import { useTranslation } from "react-i18next";
import { DropZone } from "../import/drop-zone.tsx";
import { DuplicatesDialog } from "../import/duplicates-dialog.tsx";
import { ImportButton } from "../import/import-button.tsx";
import { ImportSummaryDialog } from "../import/import-summary-dialog.tsx";
import { useBatchImport } from "../import/use-batch-import.ts";
import { LibraryContent } from "./library-content.tsx";
import { SongActionDialogs } from "./song-action-dialogs.tsx";
import { useLibrary } from "./use-library.ts";
import { useOpenSong } from "./use-open-song.ts";
import { useSongActions } from "./use-song-actions.ts";

export function SongListScreen() {
  const { t } = useTranslation("library");
  const headingId = useId();
  const { state, start, decide, dismiss } = useBatchImport();
  const library = useLibrary();
  const openSong = useOpenSong();
  const { target, actions, close } = useSongActions();
  const importing = state.status === "running" || state.status === "deciding";

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id={headingId} className="text-lg font-semibold">
          {t("list.title")}
        </h2>
        <ImportButton onFiles={start} disabled={importing} />
      </div>
      <LibraryContent library={library} onOpen={openSong} actions={actions} />
      <DropZone onFiles={start} />
      <ImportSummaryDialog state={state} onClose={dismiss} />
      {state.status === "deciding" && (
        <DuplicatesDialog notices={state.notices} onDecide={decide} />
      )}
      <SongActionDialogs target={target} onClose={close} />
    </section>
  );
}
