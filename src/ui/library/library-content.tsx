import { useTranslation } from "react-i18next";
import { SongList } from "./song-list.tsx";
import type { SongRowActions } from "./song-row-menu.tsx";
import type { LibraryState } from "./use-library.ts";

function Message({ title, hint, alert }: { title: string; hint: string; alert?: boolean }) {
  return (
    <div
      role={alert ? "alert" : undefined}
      className="grid gap-1 rounded-lg border border-dashed p-6 text-center"
    >
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

/** What the list area shows: nothing while loading, a hint when empty, or the songs. */
export function LibraryContent({
  library,
  onOpen,
  actions,
}: {
  library: LibraryState;
  onOpen: (songId: string) => void;
  actions: SongRowActions;
}) {
  const { t } = useTranslation("library");
  if (library.status === "loading") {
    return null;
  }
  if (library.status === "failed") {
    return <Message alert title={t("list.failure.title")} hint={t("list.failure.hint")} />;
  }
  if (library.entries.length === 0) {
    return <Message title={t("list.empty.title")} hint={t("list.empty.hint")} />;
  }
  return <SongList entries={library.entries} onOpen={onOpen} {...actions} />;
}
