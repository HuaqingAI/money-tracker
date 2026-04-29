import type {
  AiClient,
  ClassifyTransactionInput,
  ClassifyTransactionResult,
} from '@money-tracker/shared';
import { describe, expect, it } from 'vitest';

import type { ClassificationRepository } from './classify-service';
import { ClassifyService } from './classify-service';

const foodId = '00000000-0000-4000-8000-000000000001';
const shoppingId = '00000000-0000-4000-8000-000000000003';

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

describe('ClassifyService', () => {
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
