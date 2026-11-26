import type { RequestBody, WorkerResponse } from "./messages.ts";

/** Sends one request to a worker and waits for its answer. */
export interface WorkerCaller {
  call(request: RequestBody, transfer: Transferable[]): Promise<WorkerResponse>;
  close(): void;
}
