import type { KnowledgeProcessingState } from "./knowledge-processing-state";

export type KnowledgeProcessingJobReason =
  | "upload"
  | "manual"
  | "retry"
  | "replacement"
  | "reprocess"
  | "recovery";

export type KnowledgeProcessingJob = {
  fileId: string;
  businessId: string;
  requestId: string;
  requestedAt: string;
  reason: KnowledgeProcessingJobReason;
};

export type KnowledgeProcessingResult = {
  fileId: string;
  status: KnowledgeProcessingState;
  attempt?: number;
  attemptId?: string;
  chunkCount?: number;
  parser?: string;
  durationMs?: number;
  skipped?: boolean;
  recoverable?: boolean;
  error?: string;
};

export interface KnowledgeProcessingQueue {
  enqueue(job: KnowledgeProcessingJob): Promise<KnowledgeProcessingResult>;
}

export type KnowledgeProcessingWorker = (
  job: KnowledgeProcessingJob
) => Promise<KnowledgeProcessingResult>;

export class SynchronousKnowledgeProcessingQueue
  implements KnowledgeProcessingQueue
{
  readonly mode = "synchronous" as const;
  private readonly worker: KnowledgeProcessingWorker;

  constructor(worker: KnowledgeProcessingWorker) {
    this.worker = worker;
  }

  enqueue(job: KnowledgeProcessingJob) {
    return this.worker(job);
  }
}
