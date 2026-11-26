import type { DuplicateDecider } from "./duplicate-decision.ts";
import type { FileSource } from "./file-source.ts";
import type { ProgressListener } from "./import-progress.ts";
import type { ImportSummary } from "./import-summary.ts";

/**
 * Imports a batch of picked files and reports each file's progress as it goes. When some files
 * match songs already in the library, `decideDuplicates` is asked once, after every new file
 * has been saved.
 */
export interface ImportRunner {
  run(
    files: readonly FileSource[],
    onProgress: ProgressListener,
    decideDuplicates: DuplicateDecider,
  ): Promise<ImportSummary>;
}
