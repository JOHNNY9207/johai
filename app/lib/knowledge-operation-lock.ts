import "server-only";

const operationTails = new Map<string, Promise<void>>();

export async function withKnowledgeOperationLock<T>(
  key: string,
  operation: () => Promise<T>
) {
  const previous = operationTails.get(key) ?? Promise.resolve();
  let release = () => {};
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  const tail = previous.catch(() => undefined).then(() => current);
  operationTails.set(key, tail);

  await previous.catch(() => undefined);
  try {
    return await operation();
  } finally {
    release();
    if (operationTails.get(key) === tail) {
      operationTails.delete(key);
    }
  }
}
