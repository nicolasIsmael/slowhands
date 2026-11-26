import type { FileAnalyzer } from "@core/score/file-analyzer.ts";
import type { AnalyzedResponse, AnalyzeRequest } from "./messages.ts";

/** Checks one file and sends the original bytes back with the verdict. */
export async function handleAnalyze(
  request: AnalyzeRequest,
  analyzer: FileAnalyzer,
): Promise<AnalyzedResponse> {
  const result = await analyzer.analyze(request.fileName, new Uint8Array(request.buffer));
  return { kind: "analyzed", id: request.id, result, buffer: request.buffer };
}
