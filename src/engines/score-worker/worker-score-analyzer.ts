import { exactBuffer } from "@core/bytes/exact-buffer.ts";
import type { FileSource } from "@core/import/file-source.ts";
import type { ScoreAnalysis, ScoreAnalyzer } from "@core/import/score-analyzer.ts";
import type { WorkerCaller } from "./worker-caller.ts";

/** Checks files in a worker: the file's bytes go over and come back with the verdict. */
export class WorkerScoreAnalyzer implements ScoreAnalyzer {
  private readonly caller: WorkerCaller;

  constructor(caller: WorkerCaller) {
    this.caller = caller;
  }

  async analyze(source: FileSource): Promise<ScoreAnalysis> {
    let bytes: Uint8Array;
    try {
      bytes = await source.readBytes();
    } catch {
      return { status: "rejected", code: "file-unreadable" };
    }
    try {
      return await this.check(source.name, bytes);
    } catch {
      return { status: "rejected", code: "unexpected-error" };
    }
  }

  release(): void {
    this.caller.close();
  }

  private async check(fileName: string, bytes: Uint8Array): Promise<ScoreAnalysis> {
    const buffer = exactBuffer(bytes);
    const response = await this.caller.call({ kind: "analyze", fileName, buffer }, [buffer]);
    if (response.kind !== "analyzed") {
      return { status: "rejected", code: "unexpected-error" };
    }
    const { result } = response;
    return result.status === "accepted"
      ? { status: "accepted", summary: result.summary, bytes: new Uint8Array(response.buffer) }
      : result;
  }
}
