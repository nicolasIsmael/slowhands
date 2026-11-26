import { exactBuffer } from "@core/bytes/exact-buffer.ts";
import type { ScoreFormat } from "@core/library/song-record.ts";
import { ScoreRejection } from "@core/score/score-rejection.ts";
import type { PreparedScore } from "@core/viewer/prepared-score.ts";
import type { ScoreSourcePreparer } from "@core/viewer/score-source-preparer.ts";
import type { WorkerCaller } from "./worker-caller.ts";

/** Opens a stored score in a worker, so unpacking never happens on the main thread. */
export class WorkerScoreSourcePreparer implements ScoreSourcePreparer {
  private readonly createCaller: () => WorkerCaller;

  constructor(createCaller: () => WorkerCaller) {
    this.createCaller = createCaller;
  }

  async prepare(bytes: Uint8Array, format: ScoreFormat): Promise<PreparedScore> {
    const caller = this.createCaller();
    try {
      const buffer = exactBuffer(bytes);
      const response = await caller.call({ kind: "prepare-view", format, buffer }, [buffer]);
      if (response.kind === "prepared") {
        return { xml: new Uint8Array(response.xml), notices: response.notices };
      }
      throw new ScoreRejection(response.kind === "failed" ? response.code : "unexpected-error");
    } finally {
      caller.close();
    }
  }
}
