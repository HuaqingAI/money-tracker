import type {
  AiClient,
  ClassifyTransactionInput,
  ClassifyTransactionResult,
} from '@money-tracker/shared';
import { describe, expect, it, vi } from 'vitest';

import {
  type ClassificationRepository,
  ClassifyService,
  createProviderUrl,
  extractProviderContent,
  OpenAiCompatibleClient,
  readOpenAiCompatiblePayload,
  resolveDefaultAiClientConfig,
} from './classify-service';

const foodId = '00000000-0000-4000-8000-000000000001';
const shoppingId = '00000000-0000-4000-8000-000000000003';
const systemFoodId = '00000000-0000-0000-0000-000000000001';

function createRepository(
  overrides: Partial<ClassificationRepository> = {},
): ClassificationRepository & {
  listInputs: Array<{
    limit: number;
    transactionIds?: string[];
    userId: string;
  }>;
  updates: Array<{
    categoryId: string | null;
    confidence: number;
    provider: string;
    transactionId: string;
  }>;
} {
  const listInputs: Array<{
    limit: number;
    transactionIds?: string[];
    userId: string;
  }> = [];
  const updates: Array<{
    categoryId: string | null;
    confidence: number;
    provider: string;
    transactionId: string;
  }> = [];

  return {
    listInputs,
    updates,
    listCategories: async () => [
      {
        id: foodId,
        is_system: true,
        name: '餐饮',
        sort_order: 1,
        user_id: null,
      },
      {
        id: shoppingId,
        is_system: true,
        name: '购物',
        sort_order: 3,
        user_id: null,
      },
    ],
    listPendingUnclassifiedTransactions: async (input) => {
      listInputs.push(input);
      return [
        {
          amount_cents: -2800,
          category_id: null,
          description: '午餐',
          id: 'tx-1',
          merchant: '美团外卖',
          source: 'alipay_csv',
          transaction_at: '2026-04-28 00:30:00+00',
          user_id: 'user-1',
        },
      ];
    },
    listUserRules: async () => [],
    updateClassification: async (input) => {
      updates.push({
        categoryId: input.categoryId,
        confidence: input.confidence,
        provider: input.provider,
        transactionId: input.transactionId,
      });
    },
    ...overrides,
  };
}

function createAiClient(
  result: ClassifyTransactionResult,
): AiClient & { calls: ClassifyTransactionInput[] } {
  const calls: ClassifyTransactionInput[] = [];
  return {
    calls,
    classify: async (input) => {
      calls.push(input);
      return result;
    },
  };
}

function createBatchAiClient(
  results: ClassifyTransactionResult[],
): AiClient & {
  batchCalls: ClassifyTransactionInput[][];
  calls: ClassifyTransactionInput[];
} {
  const batchCalls: ClassifyTransactionInput[][] = [];
  const calls: ClassifyTransactionInput[] = [];

  return {
    batchCalls,
    calls,
    classify: async (input) => {
      calls.push(input);
      return results[0] ?? {
        categoryId: null,
        categoryName: '其他',
        confidence: 0.72,
        provider: 'gpt-5.3-codex',
        transactionId: input.transactionId,
      };
    },
    classifyMany: async (inputs) => {
      batchCalls.push(inputs);
      return results;
    },
  };
}

describe('ClassifyService', () => {
  it('reports non-JSON AI provider responses as base URL configuration errors', async () => {
    const response = new Response('<!doctype html><html></html>', {
      headers: {
        'content-type': 'text/html',
      },
      status: 200,
    });

    await expect(readOpenAiCompatiblePayload(response)).rejects.toThrow(
      'Check AI_PRIMARY_BASE_URL',
    );
  });

  it('includes status and content type when the AI provider rejects a request', async () => {
    const response = new Response('{"error":{"message":"bad key"}}', {
      headers: {
        'content-type': 'application/json',
      },
      status: 401,
    });

    await expect(readOpenAiCompatiblePayload(response)).rejects.toThrow(
      'AI provider failed with status 401 (application/json)',
    );
  });

  it('extracts text from Responses API payloads', () => {
    expect(
      extractProviderContent(
        {
          output: [
            {
              content: [{ text: '{"categoryName":"餐饮","confidence":0.8}' }],
            },
          ],
        },
        'responses',
      ),
    ).toBe('{"categoryName":"餐饮","confidence":0.8}');
  });

  it('builds provider URLs from base URL and explicit API path', () => {
    expect(
      createProviderUrl({
        apiPath: '/responses',
        baseUrl: 'https://hth.huaqing.run/',
      }),
    ).toBe('https://hth.huaqing.run/responses');
  });

  it('prefers project AI primary env over global OpenAI env', () => {
    expect(
      resolveDefaultAiClientConfig({
        AI_PRIMARY_API_KEY: 'project-key',
        AI_PRIMARY_BASE_URL: 'https://project.example/v1',
        AI_PRIMARY_MODEL: 'project-model',
        OPENAI_API_KEY: 'global-key',
        OPENAI_BASE_URL: 'https://global.example/v1',
      }),
    ).toEqual({
      fallback: null,
      mode: 'configured',
      primary: {
        apiMode: 'responses',
        apiKey: 'project-key',
        apiPath: '/responses',
        baseUrl: 'https://project.example/v1',
        model: 'project-model',
        provider: 'gpt-5.3-codex',
      },
    });
  });

  it('falls back to OpenAI-compatible env when project primary env is absent', () => {
    expect(
      resolveDefaultAiClientConfig({
        OPENAI_API_KEY: 'global-key',
        OPENAI_BASE_URL: 'https://global.example/v1',
      }),
    ).toEqual({
      fallback: null,
      mode: 'configured',
      primary: {
        apiMode: 'responses',
        apiKey: 'global-key',
        apiPath: '/responses',
        baseUrl: 'https://global.example/v1',
        model: 'gpt-5.3-codex',
        provider: 'gpt-5.3-codex',
      },
    });
  });

  it('prefers project fallback env over Qwen-compatible env', () => {
    expect(
      resolveDefaultAiClientConfig({
        AI_FALLBACK_API_KEY: 'project-fallback-key',
        AI_FALLBACK_BASE_URL: 'https://project-fallback.example/v1',
        AI_FALLBACK_MODEL: 'project-fallback-model',
        AI_PRIMARY_API_KEY: 'project-key',
        AI_PRIMARY_BASE_URL: 'https://project.example/v1',
        QWEN_API_KEY: 'qwen-key',
        QWEN_BASE_URL: 'https://qwen.example/v1',
      }),
    ).toEqual({
      fallback: {
        apiMode: 'chat-completions',
        apiKey: 'project-fallback-key',
        apiPath: '/chat/completions',
        baseUrl: 'https://project-fallback.example/v1',
        model: 'project-fallback-model',
        provider: 'qwen-3.6-plus',
      },
      mode: 'configured',
      primary: {
        apiMode: 'responses',
        apiKey: 'project-key',
        apiPath: '/responses',
        baseUrl: 'https://project.example/v1',
        model: 'gpt-5.3-codex',
        provider: 'gpt-5.3-codex',
      },
    });
  });

  it('uses development stub mode when primary key is absent outside production', () => {
    expect(resolveDefaultAiClientConfig({ NODE_ENV: 'development' })).toEqual({
      fallback: null,
      mode: 'development-stub',
      primary: null,
    });
  });

  it('reports production missing-key mode when primary key is absent in production', () => {
    expect(resolveDefaultAiClientConfig({ NODE_ENV: 'production' })).toEqual({
      fallback: null,
      mode: 'production-missing-key',
      primary: null,
    });
  });

  it('classifies pending transactions through the AI client', async () => {
    const repository = createRepository();
    const aiClient = createAiClient({
      categoryId: foodId,
      categoryName: '餐饮',
      confidence: 0.91,
      provider: 'gpt-5.3-codex',
      transactionId: 'tx-1',
    });
    const service = new ClassifyService(repository, aiClient);

    await expect(
      service.classifyPendingTransactions({
        userId: 'user-1',
      }),
    ).resolves.toEqual({
      classifiedCount: 1,
      failedCount: 0,
      totalCount: 1,
    });
    expect(aiClient.calls).toHaveLength(1);
    expect(repository.updates).toEqual([
      {
        categoryId: foodId,
        confidence: 0.91,
        provider: 'gpt-5.3-codex',
        transactionId: 'tx-1',
      },
    ]);
  });

  it('classifies multiple AI transactions in one provider call', async () => {
    const repository = createRepository({
      listPendingUnclassifiedTransactions: async () => [
        {
          amount_cents: -2800,
          category_id: null,
          description: '午餐',
          id: 'tx-1',
          merchant: '美团外卖',
          source: 'alipay_csv',
          transaction_at: '2026-04-28 00:30:00+00',
          user_id: 'user-1',
        },
        {
          amount_cents: -12900,
          category_id: null,
          description: '日用品',
          id: 'tx-2',
          merchant: '淘宝',
          source: 'alipay_csv',
          transaction_at: '2026-04-27 00:30:00+00',
          user_id: 'user-1',
        },
      ],
    });
    const aiClient = createBatchAiClient([
      {
        categoryId: foodId,
        categoryName: '餐饮',
        confidence: 0.91,
        provider: 'gpt-5.3-codex',
        transactionId: 'tx-1',
      },
      {
        categoryId: shoppingId,
        categoryName: '购物',
        confidence: 0.83,
        provider: 'gpt-5.3-codex',
        transactionId: 'tx-2',
      },
    ]);
    const service = new ClassifyService(repository, aiClient);

    await expect(
      service.classifyPendingTransactions({
        userId: 'user-1',
      }),
    ).resolves.toEqual({
      classifiedCount: 2,
      failedCount: 0,
      totalCount: 2,
    });
    expect(aiClient.calls).toHaveLength(0);
    expect(aiClient.batchCalls).toHaveLength(1);
    expect(aiClient.batchCalls[0]?.map((item) => item.transactionId)).toEqual([
      'tx-1',
      'tx-2',
    ]);
    expect(repository.updates).toEqual([
      {
        categoryId: foodId,
        confidence: 0.91,
        provider: 'gpt-5.3-codex',
        transactionId: 'tx-1',
      },
      {
        categoryId: shoppingId,
        confidence: 0.83,
        provider: 'gpt-5.3-codex',
        transactionId: 'tx-2',
      },
    ]);
  });

  it('uses user rules before calling AI', async () => {
    const repository = createRepository({
      listUserRules: async () => [
        {
          category_id: shoppingId,
          keyword: '美团',
          user_id: 'user-1',
        },
      ],
    });
    const aiClient = createAiClient({
      categoryId: foodId,
      categoryName: '餐饮',
      confidence: 0.91,
      provider: 'gpt-5.3-codex',
      transactionId: 'tx-1',
    });
    const service = new ClassifyService(repository, aiClient);

    await service.classifyPendingTransactions({ userId: 'user-1' });

    expect(aiClient.calls).toHaveLength(0);
    expect(repository.updates).toEqual([
      {
        categoryId: shoppingId,
        confidence: 1,
        provider: 'rule',
        transactionId: 'tx-1',
      },
    ]);
  });

  it('normalizes system category names before sending AI inputs', async () => {
    const repository = createRepository({
      listCategories: async () => [
        {
          id: systemFoodId,
          is_system: true,
          name: '??',
          sort_order: 1,
          user_id: null,
        },
        {
          id: shoppingId,
          is_system: true,
          name: '购物',
          sort_order: 3,
          user_id: null,
        },
      ],
    });
    const aiClient = createBatchAiClient([
      {
        categoryId: systemFoodId,
        categoryName: '餐饮',
        confidence: 0.91,
        provider: 'gpt-5.3-codex',
        transactionId: 'tx-1',
      },
    ]);
    const service = new ClassifyService(repository, aiClient);

    await service.classifyPendingTransactions({ userId: 'user-1' });

    expect(aiClient.batchCalls[0]?.[0]?.categories).toEqual([
      {
        id: systemFoodId,
        name: '餐饮',
      },
      {
        id: shoppingId,
        name: '购物',
      },
    ]);
  });

  it('keeps rule matches out of the AI batch', async () => {
    const repository = createRepository({
      listPendingUnclassifiedTransactions: async () => [
        {
          amount_cents: -2800,
          category_id: null,
          description: '午餐',
          id: 'tx-rule',
          merchant: '美团外卖',
          source: 'alipay_csv',
          transaction_at: '2026-04-28 00:30:00+00',
          user_id: 'user-1',
        },
        {
          amount_cents: -12900,
          category_id: null,
          description: '日用品',
          id: 'tx-ai',
          merchant: '淘宝',
          source: 'alipay_csv',
          transaction_at: '2026-04-27 00:30:00+00',
          user_id: 'user-1',
        },
      ],
      listUserRules: async () => [
        {
          category_id: foodId,
          keyword: '美团',
          user_id: 'user-1',
        },
      ],
    });
    const aiClient = createBatchAiClient([
      {
        categoryId: shoppingId,
        categoryName: '购物',
        confidence: 0.83,
        provider: 'gpt-5.3-codex',
        transactionId: 'tx-ai',
      },
    ]);
    const service = new ClassifyService(repository, aiClient);

    await service.classifyPendingTransactions({ userId: 'user-1' });

    expect(aiClient.batchCalls).toHaveLength(1);
    expect(aiClient.batchCalls[0]?.map((item) => item.transactionId)).toEqual([
      'tx-ai',
    ]);
    expect(repository.updates).toEqual([
      {
        categoryId: foodId,
        confidence: 1,
        provider: 'rule',
        transactionId: 'tx-rule',
      },
      {
        categoryId: shoppingId,
        confidence: 0.83,
        provider: 'gpt-5.3-codex',
        transactionId: 'tx-ai',
      },
    ]);
  });

  it('falls back missing AI batch results by transaction id', async () => {
    const repository = createRepository({
      listPendingUnclassifiedTransactions: async () => [
        {
          amount_cents: -2800,
          category_id: null,
          description: '午餐',
          id: 'tx-1',
          merchant: '美团外卖',
          source: 'alipay_csv',
          transaction_at: '2026-04-28 00:30:00+00',
          user_id: 'user-1',
        },
        {
          amount_cents: -12900,
          category_id: null,
          description: '日用品',
          id: 'tx-2',
          merchant: '淘宝',
          source: 'alipay_csv',
          transaction_at: '2026-04-27 00:30:00+00',
          user_id: 'user-1',
        },
      ],
    });
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          output: [
            {
              content: [
                {
                  text: JSON.stringify({
                    results: [
                      {
                        categoryName: '购物',
                        confidence: 0.82,
                        transactionId: 'tx-2',
                      },
                    ],
                  }),
                },
              ],
            },
          ],
        }),
        {
          headers: { 'content-type': 'application/json' },
          status: 200,
        },
      ));
    vi.stubGlobal('fetch', fetchMock);
    const config = resolveDefaultAiClientConfig({
      AI_PRIMARY_API_KEY: 'project-key',
      AI_PRIMARY_BASE_URL: 'https://project.example/v1',
    });
    if (config.mode !== 'configured') {
      throw new Error('Expected configured AI client config');
    }
    const aiClient = new OpenAiCompatibleClient(config.primary);
    const service = new ClassifyService(repository, aiClient);

    try {
      await service.classifyPendingTransactions({ userId: 'user-1' });
    } finally {
      vi.stubGlobal('fetch', originalFetch);
    }

    expect(repository.updates).toEqual([
      {
        categoryId: foodId,
        confidence: 0.72,
        provider: 'gpt-5.3-codex',
        transactionId: 'tx-1',
      },
      {
        categoryId: shoppingId,
        confidence: 0.82,
        provider: 'gpt-5.3-codex',
        transactionId: 'tx-2',
      },
    ]);
  });

  it('limits classification to a specific imported transaction batch', async () => {
    const repository = createRepository();
    const aiClient = createAiClient({
      categoryId: foodId,
      categoryName: '餐饮',
      confidence: 0.91,
      provider: 'gpt-5.3-codex',
      transactionId: 'tx-1',
    });
    const service = new ClassifyService(repository, aiClient);

    await service.classifyPendingTransactions({
      transactionIds: ['tx-1', 'tx-2'],
      userId: 'user-1',
    });

    expect(repository.listInputs).toEqual([
      {
        limit: 2,
        transactionIds: ['tx-1', 'tx-2'],
        userId: 'user-1',
      },
    ]);
  });

  it('reports partial failures without throwing', async () => {
    const repository = createRepository();
    const aiClient: AiClient = {
      classify: async () => {
        throw new Error('ai unavailable');
      },
    };
    const service = new ClassifyService(repository, aiClient);

    await expect(
      service.classifyPendingTransactions({
        userId: 'user-1',
      }),
    ).resolves.toEqual({
      classifiedCount: 0,
      failedCount: 1,
      totalCount: 1,
    });
  });
});
