import { describe, expect, it } from 'vitest';

import type {
  AiClient,
  ClassifyTransactionInput,
  ClassifyTransactionResult,
} from './ai-client';
import { AiCircuitBreaker, FallbackAiClient } from './fallback';

const input: ClassifyTransactionInput = {
  amountCents: -2800,
  categories: [{ id: 'cat-food', name: '餐饮' }],
  description: '午餐',
  merchant: '美团外卖',
  source: 'alipay_csv',
  transactionAt: '2026-04-28T01:00:00.000Z',
  transactionId: 'tx-1',
  userId: 'user-1',
};

function result(provider: 'gpt-5.3-codex' | 'qwen-3.6-plus'): ClassifyTransactionResult {
  return {
    categoryId: 'cat-food',
    categoryName: '餐饮',
    confidence: provider === 'gpt-5.3-codex' ? 0.92 : 0.82,
    provider,
    transactionId: 'tx-1',
  };
}

function client(
  classify: (input: ClassifyTransactionInput) => Promise<ClassifyTransactionResult>,
): AiClient {
  return { classify };
}

describe('FallbackAiClient', () => {
  it('uses the default timeout before falling back', async () => {
    const primary = client(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(result('gpt-5.3-codex')), 20);
        }),
    );
    const fallback = client(async () => result('qwen-3.6-plus'));
    const ai = new FallbackAiClient(primary, fallback, { timeoutMs: 1 });

    await expect(ai.classify(input)).resolves.toMatchObject({
      provider: 'qwen-3.6-plus',
    });
  });

  it('retries primary once before using fallback', async () => {
    let attempts = 0;
    const primary = client(async () => {
      attempts += 1;
      throw new Error('primary failed');
    });
    const fallback = client(async () => result('qwen-3.6-plus'));
    const ai = new FallbackAiClient(primary, fallback);

    await expect(ai.classify(input)).resolves.toMatchObject({
      provider: 'qwen-3.6-plus',
    });
    expect(attempts).toBe(2);
  });

  it('opens the circuit after three primary failures and recovers after window', async () => {
    let now = 1_000;
    let primaryAttempts = 0;
    const primary = client(async () => {
      primaryAttempts += 1;
      throw new Error('primary failed');
    });
    const fallback = client(async () => result('qwen-3.6-plus'));
    const ai = new FallbackAiClient(primary, fallback, {
      clock: { now: () => now },
      recoveryMs: 30 * 60 * 1000,
    });

    await ai.classify(input);
    await ai.classify(input);
    await ai.classify(input);
    expect(ai.getCircuitBreakerSnapshot().forcedProvider).toBe('qwen-3.6-plus');

    await ai.classify(input);
    expect(primaryAttempts).toBe(6);

    now += 30 * 60 * 1000;
    await ai.classify(input);
    expect(primaryAttempts).toBe(8);
  });
});

describe('AiCircuitBreaker', () => {
  it('resets after the recovery window elapses', () => {
    let now = 0;
    const breaker = new AiCircuitBreaker({
      clock: { now: () => now },
      failureThreshold: 1,
      recoveryMs: 10,
    });

    breaker.recordPrimaryFailure();
    expect(breaker.shouldUseFallback()).toBe(true);
    now = 10;
    expect(breaker.shouldUseFallback()).toBe(false);
    expect(breaker.snapshot()).toMatchObject({
      failedAttempts: 0,
      forcedProvider: null,
    });
  });
});
