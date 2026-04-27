import { describe, expect, it } from 'vitest';

import {
  type TransactionRepository,
  TransactionService,
} from './transaction-service';

function createRepository(
  overrides: Partial<TransactionRepository> = {},
): TransactionRepository {
  return {
    listCategories: async () => [],
    listRecentTransactions: async () => [],
    ...overrides,
  };
}

describe('TransactionService', () => {
  it('maps recent transactions with category names and hasMore', async () => {
    const service = new TransactionService(
      createRepository({
        listCategories: async () => [
          {
            id: '11111111-1111-4111-8111-111111111111',
            name: '餐饮',
          },
        ],
        listRecentTransactions: async () => [
          {
            amount_cents: -1800,
            category_id: '11111111-1111-4111-8111-111111111111',
            description: '早餐',
            id: '22222222-2222-4222-8222-222222222222',
            merchant: '包子铺',
            source: 'alipay_csv',
            status: 'confirmed',
            transaction_at: '2026-04-27T01:00:00.000Z',
          },
          {
            amount_cents: -900,
            category_id: null,
            description: null,
            id: '33333333-3333-4333-8333-333333333333',
            merchant: '便利店',
            source: 'wechat_csv',
            status: 'pending_confirmation',
            transaction_at: '2026-04-26T01:00:00.000Z',
          },
        ],
      }),
    );

    await expect(
      service.listRecentTransactions({
        limit: 1,
        userId: 'user-1',
      }),
    ).resolves.toEqual({
      hasMore: true,
      limit: 1,
      transactions: [
        {
          amountCents: -1800,
          categoryId: '11111111-1111-4111-8111-111111111111',
          categoryName: '餐饮',
          description: '早餐',
          id: '22222222-2222-4222-8222-222222222222',
          merchant: '包子铺',
          source: 'alipay_csv',
          status: 'confirmed',
          transactionAt: '2026-04-27T01:00:00.000Z',
        },
      ],
    });
  });
});

