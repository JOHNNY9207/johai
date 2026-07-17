import assert from "node:assert/strict";
import test from "node:test";
import {
  SynchronousKnowledgeProcessingQueue,
  type KnowledgeProcessingJob,
  type KnowledgeProcessingResult,
} from "../app/lib/knowledge-processing-queue.ts";
import {
  classifyKnowledgeProcessingFailure,
  getProcessingStartDecision,
  type KnowledgeProcessingState,
} from "../app/lib/knowledge-processing-state.ts";

type FakeChunk = { index: number; content: string };
type FakeFile = {
  id: string;
  businessId: string;
  lineageId: string;
  status: KnowledgeProcessingState;
  attempts: number;
  active: boolean;
  previousId?: string;
  attemptToken?: string;
  lastCompletedRequestId?: string;
  lastFailedRequestId?: string;
  error?: string;
  failureRecoverable?: boolean;
};

type Behavior = {
  chunks?: string[];
  error?: Error;
  gate?: Promise<void>;
  allowReadyReprocess?: boolean;
};

class InMemoryKnowledgeRepository {
  readonly files = new Map<string, FakeFile>();
  readonly chunks = new Map<string, FakeChunk[]>();
  readonly transitions = new Map<string, KnowledgeProcessingState[]>();
  readonly behaviors = new Map<string, Behavior>();

  addFile(file: FakeFile, chunks: string[] = []) {
    this.files.set(file.id, { ...file });
    this.chunks.set(
      file.id,
      chunks.map((content, index) => ({ index, content }))
    );
    this.transitions.set(file.id, [file.status]);
  }

  private transition(file: FakeFile, status: KnowledgeProcessingState) {
    file.status = status;
    this.transitions.get(file.id)?.push(status);
  }

  private result(
    file: FakeFile,
    values: Partial<KnowledgeProcessingResult> = {}
  ): KnowledgeProcessingResult {
    return {
      fileId: file.id,
      status: file.status,
      attempt: file.attempts,
      ...values,
    };
  }

  async process(job: KnowledgeProcessingJob) {
    const file = this.files.get(job.fileId);
    if (!file || file.businessId !== job.businessId) {
      return {
        fileId: job.fileId,
        status: "Failed",
        skipped: true,
        recoverable: false,
        error: "Knowledge file does not belong to the active business.",
      } satisfies KnowledgeProcessingResult;
    }

    if (
      file.lastCompletedRequestId === job.requestId ||
      file.lastFailedRequestId === job.requestId
    ) {
      return this.result(file, {
        skipped: true,
        recoverable: file.status === "Failed",
        error: "This processing request was already completed.",
      });
    }

    if (file.status === "Uploaded") this.transition(file, "Queued");
    const behavior = this.behaviors.get(job.requestId) ?? {};
    const decision = getProcessingStartDecision(
      {
        processing_status: file.status,
        processing_attempts: file.attempts,
        source_metadata:
          file.failureRecoverable === undefined
            ? undefined
            : {
                processing_failure: {
                  recoverable: file.failureRecoverable,
                },
              },
      },
      { allowReadyReprocess: behavior.allowReadyReprocess }
    );

    if (!decision.allowed) {
      return this.result(file, {
        skipped: true,
        recoverable: decision.recoverable,
        error: decision.message,
      });
    }

    file.attempts += 1;
    file.attemptToken = `${job.requestId}:${file.attempts}`;
    const claimedToken = file.attemptToken;
    this.transition(file, "Processing");
    if (behavior.gate) await behavior.gate;

    if (file.attemptToken !== claimedToken || file.status !== "Processing") {
      return this.result(file, {
        skipped: true,
        recoverable: false,
        error: "A newer document state superseded this processing attempt.",
      });
    }

    if (behavior.error) {
      const failure = classifyKnowledgeProcessingFailure(behavior.error);
      file.error = failure.message;
      file.failureRecoverable = failure.recoverable;
      file.lastFailedRequestId = job.requestId;
      file.attemptToken = undefined;
      this.transition(file, "Failed");
      return this.result(file, {
        error: failure.message,
        recoverable: failure.recoverable,
      });
    }

    const nextChunks = behavior.chunks ?? ["processed knowledge"];
    this.chunks.set(
      file.id,
      nextChunks.map((content, index) => ({ index, content }))
    );
    file.error = undefined;
    file.failureRecoverable = undefined;
    file.lastCompletedRequestId = job.requestId;
    file.attemptToken = undefined;
    this.transition(file, "Ready");
    return this.result(file, {
      chunkCount: nextChunks.length,
      recoverable: false,
    });
  }

  archive(fileId: string) {
    const file = this.files.get(fileId);
    if (!file || file.status === "Processing") return false;
    this.transition(file, "Archived");
    return true;
  }

  delete(fileId: string) {
    const file = this.files.get(fileId);
    if (!file || file.status === "Processing") return false;
    const lineage = [...this.files.values()].filter(
      (candidate) => candidate.lineageId === file.lineageId
    );
    if (file.active && lineage.length > 1) return false;
    this.files.delete(fileId);
    this.chunks.delete(fileId);
    return true;
  }

  async replace(
    queue: SynchronousKnowledgeProcessingQueue,
    activeId: string,
    replacementId: string,
    requestId: string
  ) {
    const current = this.files.get(activeId);
    assert.ok(current?.active && current.status === "Ready");
    this.addFile({
      id: replacementId,
      businessId: current.businessId,
      lineageId: current.lineageId,
      status: "Uploaded",
      attempts: 0,
      active: false,
      previousId: current.id,
    });
    const result = await queue.enqueue(
      createJob(replacementId, requestId, current.businessId, "replacement")
    );
    const replacement = this.files.get(replacementId);
    if (
      result.status === "Ready" &&
      replacement &&
      current.active &&
      replacement.previousId === current.id
    ) {
      replacement.active = true;
      current.active = false;
    }
    return result;
  }

  searchable(lineageId: string) {
    return [...this.files.values()].filter(
      (file) =>
        file.lineageId === lineageId &&
        file.active &&
        file.status === "Ready"
    );
  }
}

function createJob(
  fileId: string,
  requestId: string,
  businessId = "business-a",
  reason: KnowledgeProcessingJob["reason"] = "upload"
): KnowledgeProcessingJob {
  return {
    fileId,
    businessId,
    requestId,
    reason,
    requestedAt: "2026-07-11T12:00:00.000Z",
  };
}

function setup(file: Partial<FakeFile> = {}) {
  const repository = new InMemoryKnowledgeRepository();
  repository.addFile({
    id: "file-1",
    businessId: "business-a",
    lineageId: "lineage-1",
    status: "Uploaded",
    attempts: 0,
    active: true,
    ...file,
  });
  const queue = new SynchronousKnowledgeProcessingQueue((job) =>
    repository.process(job)
  );
  return { repository, queue };
}

function deferred() {
  let resolve = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

test("successful upload follows Uploaded → Queued → Processing → Ready", async () => {
  const { repository, queue } = setup();
  repository.behaviors.set("request-1", { chunks: ["one", "two"] });
  const result = await queue.enqueue(createJob("file-1", "request-1"));
  assert.equal(result.status, "Ready");
  assert.equal(result.attempt, 1);
  assert.deepEqual(repository.transitions.get("file-1"), [
    "Uploaded",
    "Queued",
    "Processing",
    "Ready",
  ]);
  assert.deepEqual(
    repository.chunks.get("file-1")?.map((chunk) => chunk.index),
    [0, 1]
  );
});

test("failed extraction preserves the failure and exposes recoverability", async () => {
  const { repository, queue } = setup();
  repository.behaviors.set("request-fail", {
    error: new Error("No usable text could be extracted from this document."),
  });
  const result = await queue.enqueue(createJob("file-1", "request-fail"));
  assert.equal(result.status, "Failed");
  assert.equal(result.recoverable, false);
  assert.match(result.error ?? "", /No usable text/);
  assert.equal(repository.files.get("file-1")?.attempts, 1);
  const retry = await queue.enqueue(
    createJob("file-1", "request-fail-again", "business-a", "retry")
  );
  assert.equal(retry.skipped, true);
  assert.match(retry.error ?? "", /corrected or replaced/);
});

test("retry after a recoverable failure succeeds with a new request id", async () => {
  const { repository, queue } = setup();
  repository.behaviors.set("request-fail", {
    error: new Error("Storage download failed."),
  });
  await queue.enqueue(createJob("file-1", "request-fail"));
  const result = await queue.enqueue(
    createJob("file-1", "request-retry", "business-a", "retry")
  );
  assert.equal(result.status, "Ready");
  assert.equal(result.attempt, 2);
  assert.equal(repository.files.get("file-1")?.error, undefined);
});

test("replaying a completed processing request is idempotent", async () => {
  const { repository, queue } = setup();
  repository.behaviors.set("same-request", { chunks: ["stable"] });
  await queue.enqueue(createJob("file-1", "same-request"));
  const replay = await queue.enqueue(createJob("file-1", "same-request"));
  assert.equal(replay.skipped, true);
  assert.equal(repository.files.get("file-1")?.attempts, 1);
  assert.deepEqual(repository.chunks.get("file-1"), [
    { index: 0, content: "stable" },
  ]);
});

test("a concurrent processing request cannot claim the same file", async () => {
  const { repository, queue } = setup();
  const gate = deferred();
  repository.behaviors.set("slow", { gate: gate.promise });
  const first = queue.enqueue(createJob("file-1", "slow"));
  await Promise.resolve();
  const second = await queue.enqueue(createJob("file-1", "concurrent"));
  assert.equal(second.skipped, true);
  assert.equal(second.status, "Processing");
  assert.equal(repository.files.get("file-1")?.attempts, 1);
  gate.resolve();
  assert.equal((await first).status, "Ready");
});

test("successful replacement activates the new version and keeps one active", async () => {
  const { repository, queue } = setup({ status: "Ready" });
  const result = await repository.replace(
    queue,
    "file-1",
    "file-2",
    "replace-success"
  );
  assert.equal(result.status, "Ready");
  assert.equal(repository.files.get("file-1")?.active, false);
  assert.equal(repository.files.get("file-2")?.active, true);
  assert.equal(repository.searchable("lineage-1").length, 1);
});

test("failed replacement leaves the previous Ready version active", async () => {
  const { repository, queue } = setup({ status: "Ready" },);
  repository.behaviors.set("replace-fail", {
    error: new Error("Storage download failed."),
  });
  const result = await repository.replace(
    queue,
    "file-1",
    "file-2",
    "replace-fail"
  );
  assert.equal(result.status, "Failed");
  assert.equal(repository.files.get("file-1")?.active, true);
  assert.equal(repository.files.get("file-2")?.active, false);
  assert.deepEqual(repository.searchable("lineage-1").map((file) => file.id), [
    "file-1",
  ]);
});

test("archive is rejected while processing and archived content is not searchable", async () => {
  const { repository, queue } = setup({ status: "Ready" });
  const gate = deferred();
  repository.behaviors.set("archive-race", {
    gate: gate.promise,
    allowReadyReprocess: true,
  });
  const running = queue.enqueue(
    createJob("file-1", "archive-race", "business-a", "reprocess")
  );
  await Promise.resolve();
  assert.equal(repository.archive("file-1"), false);
  gate.resolve();
  await running;
  assert.equal(repository.archive("file-1"), true);
  assert.equal(repository.searchable("lineage-1").length, 0);
});

test("delete is rejected while processing and successful delete removes chunks", async () => {
  const { repository, queue } = setup();
  const gate = deferred();
  repository.behaviors.set("delete-race", { gate: gate.promise });
  const running = queue.enqueue(createJob("file-1", "delete-race"));
  await Promise.resolve();
  assert.equal(repository.delete("file-1"), false);
  gate.resolve();
  await running;
  assert.equal(repository.delete("file-1"), true);
  assert.equal(repository.chunks.has("file-1"), false);
});

test("stale older completion cannot overwrite a newer successful result", async () => {
  const { repository, queue } = setup();
  const gate = deferred();
  repository.behaviors.set("older", { gate: gate.promise, chunks: ["old"] });
  const older = queue.enqueue(createJob("file-1", "older"));
  await Promise.resolve();
  const file = repository.files.get("file-1")!;
  file.attemptToken = "newer:2";
  file.attempts = 2;
  file.status = "Ready";
  file.lastCompletedRequestId = "newer";
  repository.chunks.set("file-1", [{ index: 0, content: "newer" }]);
  gate.resolve();
  const result = await older;
  assert.equal(result.skipped, true);
  assert.deepEqual(repository.chunks.get("file-1"), [
    { index: 0, content: "newer" },
  ]);
});

test("retry limit prevents an automatic processing loop", async () => {
  const { queue } = setup({ status: "Failed", attempts: 5 });
  const result = await queue.enqueue(
    createJob("file-1", "retry-six", "business-a", "retry")
  );
  assert.equal(result.skipped, true);
  assert.equal(result.recoverable, false);
  assert.match(result.error ?? "", /retry limit/i);
});

test("tenant isolation rejects a job without changing status, attempts, or chunks", async () => {
  const { repository, queue } = setup();
  const before = structuredClone(repository.files.get("file-1"));
  const result = await queue.enqueue(
    createJob("file-1", "wrong-tenant", "business-b")
  );
  assert.equal(result.skipped, true);
  assert.match(result.error ?? "", /active business/);
  assert.deepEqual(repository.files.get("file-1"), before);
  assert.deepEqual(repository.chunks.get("file-1"), []);
});
