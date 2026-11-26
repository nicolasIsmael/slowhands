import type { FileSource } from "@core/import/file-source.ts";
import { expect, test } from "vitest";
import type { RequestBody, WorkerResponse } from "./messages.ts";
import type { WorkerCaller } from "./worker-caller.ts";
import { WorkerScoreAnalyzer } from "./worker-score-analyzer.ts";

const summary = { title: "T", composer: null, format: "musicxml" as const, contentHash: "h" };

class RecordingCaller implements WorkerCaller {
  readonly requests: RequestBody[] = [];
  readonly transfers: Transferable[][] = [];
  closed = 0;
  private readonly answer: (request: RequestBody) => Promise<WorkerResponse>;

  constructor(answer: (request: RequestBody) => Promise<WorkerResponse>) {
    this.answer = answer;
  }

  call(request: RequestBody, transfer: Transferable[]): Promise<WorkerResponse> {
    this.requests.push(request);
    this.transfers.push(transfer);
    return this.answer(request);
  }

  close(): void {
    this.closed += 1;
  }
}

const source = (bytes: Uint8Array | Error): FileSource => ({
  name: "a.musicxml",
  sizeBytes: 3,
  readBytes: async () => {
    if (bytes instanceof Error) {
      throw bytes;
    }
    return bytes;
  },
});

const echoAccepted = async (request: RequestBody): Promise<WorkerResponse> => ({
  kind: "analyzed",
  id: 0,
  result: { status: "accepted", summary },
  buffer: "buffer" in request ? request.buffer : new ArrayBuffer(0),
});

test("sends the file name and bytes to the worker, handing the buffer over", async () => {
  const caller = new RecordingCaller(echoAccepted);
  await new WorkerScoreAnalyzer(caller).analyze(source(Uint8Array.from([1, 2, 3])));
  expect(caller.requests[0]).toMatchObject({ kind: "analyze", fileName: "a.musicxml" });
  expect(caller.transfers[0]).toHaveLength(1);
});

test("returns the accepted summary together with the original bytes", async () => {
  const caller = new RecordingCaller(echoAccepted);
  const analysis = await new WorkerScoreAnalyzer(caller).analyze(
    source(Uint8Array.from([1, 2, 3])),
  );
  expect(analysis).toEqual({ status: "accepted", summary, bytes: Uint8Array.from([1, 2, 3]) });
});

test("passes a rejection through", async () => {
  const caller = new RecordingCaller(async () => ({
    kind: "analyzed",
    id: 0,
    result: { status: "rejected", code: "not-a-score" },
    buffer: new ArrayBuffer(0),
  }));
  const analysis = await new WorkerScoreAnalyzer(caller).analyze(source(Uint8Array.from([1])));
  expect(analysis).toEqual({ status: "rejected", code: "not-a-score" });
});

test("reports a file that cannot be read", async () => {
  const caller = new RecordingCaller(echoAccepted);
  const analysis = await new WorkerScoreAnalyzer(caller).analyze(source(new Error("gone")));
  expect(analysis).toEqual({ status: "rejected", code: "file-unreadable" });
  expect(caller.requests).toEqual([]);
});

test("reports a crashed worker as an unexpected error", async () => {
  const caller = new RecordingCaller(async () => {
    throw new Error("worker crashed");
  });
  const analysis = await new WorkerScoreAnalyzer(caller).analyze(source(Uint8Array.from([1])));
  expect(analysis).toEqual({ status: "rejected", code: "unexpected-error" });
});

test("closes the worker when the batch releases it", () => {
  const caller = new RecordingCaller(echoAccepted);
  new WorkerScoreAnalyzer(caller).release();
  expect(caller.closed).toBe(1);
});
