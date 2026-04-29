import type {
  AiClassificationProvider,
  AiClient,
  ClassifyTransactionInput,
  ClassifyTransactionResult,
} from './ai-client';

export interface AiFallbackClock {
  now(): number;
}

export interface AiFallbackTimer {
  withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T>;
}

export interface AiFallbackOptions {
  breaker?: AiCircuitBreaker;
  clock?: AiFallbackClock;
  failureThreshold?: number;
  recoveryMs?: number;
  timeoutMs?: number;
  timer?: AiFallbackTimer;
}

export interface AiCircuitBreakerSnapshot {
  failedAttempts: number;
  forcedProvider: AiClassificationProvider | null;
  lastFailureAt: number | null;
}

const DEFAULT_FAILURE_THRESHOLD = 3;
const DEFAULT_RECOVERY_MS = 30 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 8 * 1000;

const systemClock: AiFallbackClock = {
  now: () => Date.now(),
};

const defaultTimer: AiFallbackTimer = {
  withTimeout: (promise, timeoutMs) =>
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`AI classification timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeout));
    }),
};

export class AiCircuitBreaker {
  private failedAttempts = 0;
  private forcedProvider: AiClassificationProvider | null = null;
  private lastFailureAt: number | null = null;

  constructor(
    private readonly options: Required<
      Pick<AiFallbackOptions, 'clock' | 'failureThreshold' | 'recoveryMs'>
    > = {
      clock: systemClock,
      failureThreshold: DEFAULT_FAILURE_THRESHOLD,
      recoveryMs: DEFAULT_RECOVERY_MS,
    },
  ) {}

  shouldUseFallback(): boolean {
    if (this.forcedProvider === null || this.lastFailureAt === null) {
      return false;
    }

    if (this.options.clock.now() - this.lastFailureAt >= this.options.recoveryMs) {
      this.reset();
      return false;
    }

    return true;
  }

  recordPrimarySuccess(): void {
    this.reset();
  }

  recordPrimaryFailure(): void {
    this.failedAttempts += 1;
    this.lastFailureAt = this.options.clock.now();
    if (this.failedAttempts >= this.options.failureThreshold) {
      // TODO: multi-instance 需迁移到 Redis
      this.forcedProvider = 'qwen-3.6-plus';
    }
  }

  snapshot(): AiCircuitBreakerSnapshot {
    return {
      failedAttempts: this.failedAttempts,
      forcedProvider: this.forcedProvider,
      lastFailureAt: this.lastFailureAt,
    };
  }

  private reset(): void {
    this.failedAttempts = 0;
    this.forcedProvider = null;
    this.lastFailureAt = null;
  }
}

export class FallbackAiClient implements AiClient {
  private readonly breaker: AiCircuitBreaker;
  private readonly timeoutMs: number;
  private readonly timer: AiFallbackTimer;

  constructor(
    private readonly primary: AiClient,
    private readonly fallback: AiClient,
    options: AiFallbackOptions = {},
  ) {
    this.breaker =
      options.breaker
        ? options.breaker
        : new AiCircuitBreaker({
            clock: options.clock ?? systemClock,
            failureThreshold:
              options.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD,
            recoveryMs: options.recoveryMs ?? DEFAULT_RECOVERY_MS,
          });
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.timer = options.timer ?? defaultTimer;
  }

  async classify(
    input: ClassifyTransactionInput,
  ): Promise<ClassifyTransactionResult> {
    if (this.breaker.shouldUseFallback()) {
      return this.fallback.classify(input);
    }

    try {
      const result = await this.classifyWithPrimary(input);
      this.breaker.recordPrimarySuccess();
      return result;
    } catch {
      this.breaker.recordPrimaryFailure();
      return this.fallback.classify(input);
    }
  }

  getCircuitBreakerSnapshot(): AiCircuitBreakerSnapshot {
    return this.breaker.snapshot();
  }

  private async classifyWithPrimary(
    input: ClassifyTransactionInput,
  ): Promise<ClassifyTransactionResult> {
    try {
      return await this.timer.withTimeout(
        this.primary.classify(input),
        this.timeoutMs,
      );
    } catch {
      return this.timer.withTimeout(this.primary.classify(input), this.timeoutMs);
    }
  }
}
