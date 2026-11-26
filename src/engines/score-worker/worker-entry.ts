import { createFileAnalyzer, createScorePreparation } from "../score-parsing/score-pipeline.ts";
import { handleAnalyze } from "./analysis-handler.ts";
import type { WorkerRequest, WorkerResponse } from "./messages.ts";
import { handlePrepareView } from "./view-preparation-handler.ts";

interface WorkerScope {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse, transfer: Transferable[]): void;
}

const scope = self as unknown as WorkerScope;
const analyzer = createFileAnalyzer();
const preparation = createScorePreparation();

async function respond(request: WorkerRequest): Promise<void> {
  if (request.kind === "analyze") {
    const response = await handleAnalyze(request, analyzer);
    scope.postMessage(response, [response.buffer]);
    return;
  }
  const response = handlePrepareView(request, preparation);
  scope.postMessage(response, response.kind === "prepared" ? [response.xml] : []);
}

scope.onmessage = (event) => {
  void respond(event.data);
};
