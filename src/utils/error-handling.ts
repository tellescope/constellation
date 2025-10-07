export class ScriptError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'ScriptError';
  }
}

export function handleError(error: unknown): { message: string; details?: any } {
  if (error instanceof ScriptError) {
    return {
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      details: { stack: error.stack },
    };
  }

  return {
    message: String(error),
  };
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
}
