import { exactBuffer } from "@core/bytes/exact-buffer.ts";
import { ScoreRejection } from "@core/score/score-rejection.ts";
import type { ScorePreparation } from "@core/viewer/score-preparation.ts";
import type { FailedResponse, PreparedResponse, PrepareViewRequest } from "./messages.ts";

/** Unpacks one stored score and scans it, or reports why it cannot be read. */
export function handlePrepareView(
  request: PrepareViewRequest,
  preparation: ScorePreparation,
): PreparedResponse | FailedResponse {
  try {
    const prepared = preparation.prepare(new Uint8Array(request.buffer), request.format);
    return {
      kind: "prepared",
      id: request.id,
      xml: exactBuffer(prepared.xml),
      notices: prepared.notices,
    };
  } catch (error) {
    const code = error instanceof ScoreRejection ? error.code : "unexpected-error";
    return { kind: "failed", id: request.id, code };
  }
}
