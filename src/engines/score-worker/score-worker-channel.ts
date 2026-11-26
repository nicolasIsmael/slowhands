import type { RequestBody, WorkerRequest, WorkerResponse } from "./messages.ts";
import type { WorkerCaller } from "./worker-caller.ts";

interface Waiting {
  resolve: (response: WorkerResponse) => void;
  reject: (error: Error) => void;
}

/**
 * Talks to a dedicated worker created on first use. A crash fails the requests in flight and
 * drops the worker, so the next request starts a fresh one.
 */
export class ScoreWorkerChannel implements WorkerCaller {
  private worker: Worker | null = null;
  private nextId = 0;
  private readonly waiting = new Map<number, Waiting>();

  call(request: RequestBody, transfer: Transferable[]): Promise<WorkerResponse> {
    const id = this.nextId++;
    const message = { ...request, id } as WorkerRequest;
    return new Promise((resolve, reject) => {
      this.waiting.set(id, { resolve, reject });
      this.ensureWorker().postMessage(message, transfer);
    });
  }

  close(): void {
    this.worker?.terminate();
    this.worker = null;
    this.failAll(new Error("worker closed"));
  }

  private ensureWorker(): Worker {
    if (this.worker === null) {
      const worker = new Worker(new URL("./worker-entry.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => this.answer(event.data);
      worker.onerror = () => {
        this.worker = null;
        this.failAll(new Error("worker crashed"));
      };
      this.worker = worker;
    }
    return this.worker;
  }

  private answer(response: WorkerResponse): void {
    this.waiting.get(response.id)?.resolve(response);
    this.waiting.delete(response.id);
  }

  private failAll(error: Error): void {
    for (const { reject } of this.waiting.values()) {
      reject(error);
    }
    this.waiting.clear();
  }
}
