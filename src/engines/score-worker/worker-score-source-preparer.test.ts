import { ScoreRejection } from "@core/score/score-rejection.ts";
import { expect, test } from "vitest";
import type { WorkerResponse } from "./messages.ts";
import type { WorkerCaller } from "./worker-caller.ts";
import { WorkerScoreSourcePreparer } from "./worker-score-source-preparer.ts";

function callerAnswering(response: WorkerResponse | Error) {
  const state = { closed: 0 };
  const caller: WorkerCaller = {
    call: async () => {
      if (response instanceof Error) {
        throw response;
      }
      return response;
    },
    close: () => {
      state.closed += 1;
    },
  };
  return { caller, state };
}

test("returns the score xml and the notices the worker found", async () => {
  const { caller } = callerAnswering({
    kind: "prepared",
    id: 0,
    xml: Uint8Array.from([60, 120]).buffer,
    notices: ["some-symbols-not-displayed"],
  });
  const prepared = await new WorkerScoreSourcePreparer(() => caller).prepare(
    Uint8Array.from([1]),
    "mxl",
  );
  expect(prepared).toEqual({
    xml: Uint8Array.from([60, 120]),
    notices: ["some-symbols-not-displayed"],
  });
});

test("rejects with the reason the worker gave when the score cannot be read", async () => {
  const { caller } = callerAnswering({ kind: "failed", id: 0, code: "archive-corrupted" });
  const preparer = new WorkerScoreSourcePreparer(() => caller);
  await expect(preparer.prepare(Uint8Array.from([1]), "mxl")).rejects.toMatchObject({
    code: "archive-corrupted",
  });
  await expect(preparer.prepare(Uint8Array.from([1]), "mxl")).rejects.toBeInstanceOf(
    ScoreRejection,
  );
});

test("closes the worker after every request, even when it fails", async () => {
  const { caller, state } = callerAnswering(new Error("worker crashed"));
  const preparer = new WorkerScoreSourcePreparer(() => caller);
  await expect(preparer.prepare(Uint8Array.from([1]), "mxl")).rejects.toThrow("worker crashed");
  expect(state.closed).toBe(1);
});
