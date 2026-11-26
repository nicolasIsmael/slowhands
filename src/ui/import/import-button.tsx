import { cn } from "cn";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { buttonVariants } from "../primitives/button.tsx";

export interface ImportButtonProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

function pickedFiles(event: ChangeEvent<HTMLInputElement>): File[] {
  const files = Array.from(event.target.files ?? []);
  event.target.value = "";
  return files;
}

/** A file picker that looks like a button; the real input stays keyboard and screen-reader reachable. */
export function ImportButton({ onFiles, disabled = false }: ImportButtonProps) {
  const { t } = useTranslation("library");
  return (
    <label
      className={cn(
        buttonVariants(),
        "cursor-pointer focus-within:ring-[3px] focus-within:ring-ring",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      {t("import.button")}
      <input
        type="file"
        multiple
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          const files = pickedFiles(event);
          if (files.length > 0) {
            onFiles(files);
          }
        }}
      />
    </label>
  );
}
