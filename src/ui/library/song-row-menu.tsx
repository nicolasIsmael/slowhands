import type { LibraryEntry } from "@core/library/library-entry.ts";
import { EllipsisVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../primitives/dropdown-menu.tsx";

export interface SongRowActions {
  onRename: (entry: LibraryEntry) => void;
  onDelete: (entry: LibraryEntry) => void;
}

/** The two things that can be done to a song: opening the menu is one tap, choosing is the second. */
export function SongRowMenu({
  entry,
  onRename,
  onDelete,
}: SongRowActions & { entry: LibraryEntry }) {
  const { t } = useTranslation("library");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("row.menu", { name: entry.displayName })}
        className="flex min-h-14 min-w-11 items-center justify-center rounded-lg border bg-card outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        <EllipsisVertical aria-hidden className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onRename(entry)}>{t("row.rename")}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onDelete(entry)}>{t("row.delete")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
