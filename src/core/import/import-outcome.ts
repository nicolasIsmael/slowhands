import type { ImportFailureCode } from "./import-failure-code.ts";

export type FileResult =
  | { readonly kind: "imported"; readonly songId: string }
  | { readonly kind: "replaced"; readonly songId: string }
  | { readonly kind: "kept-both"; readonly songId: string }
  | { readonly kind: "skipped" }
  | { readonly kind: "failed"; readonly code: ImportFailureCode };

export interface ImportOutcome {
  readonly fileName: string;
  readonly result: FileResult;
}
