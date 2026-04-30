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
            direction: 'expense',
            direction_confidence: 'high',
            id: '22222222-2222-4222-8222-222222222222',
            merchant: '包子铺',
            source: 'alipay_csv',
            status: 'confirmed',
            transaction_at: '2026-04-27 01:00:00+00',
          },
          {
            amount_cents: -900,
            category_id: null,
            description: null,
            direction: 'income',
            direction_confidence: 'high',
            id: '33333333-3333-4333-8333-333333333333',
            merchant: '便利店',
            source: 'wechat_csv',
            status: 'pending_confirmation',
            transaction_at: '2026-04-26 01:00:00+00',
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
          direction: 'expense',
          directionConfidence: 'high',
          id: '22222222-2222-4222-8222-222222222222',
          merchant: '包子铺',
          source: 'alipay_csv',
          status: 'confirmed',
          transactionAt: '2026-04-27T01:00:00.000Z',
        },
      ],
    });
  });

  it('keeps income refund and closed rows visible in recent transaction ledger', async () => {
    const service = new TransactionService(
      createRepository({
        listRecentTransactions: async () => [
          {
            amount_cents: 5000,
            category_id: null,
            description: '工资',
            direction: 'income',
            direction_confidence: 'high',
            id: '22222222-2222-4222-8222-222222222222',
            merchant: '公司',
            source: 'alipay_csv',
            status: 'confirmed',
            transaction_at: '2026-04-27 01:00:00+00',
          },
          {
            amount_cents: 1200,
            category_id: null,
            description: '退款',
            direction: 'refund',
            direction_confidence: 'high',
            id: '33333333-3333-4333-8333-333333333333',
            merchant: '商户',
            source: 'wechat_csv',
            status: 'confirmed',
            transaction_at: '2026-04-26 01:00:00+00',
          },
          {
            amount_cents: 0,
            category_id: null,
            description: '关闭',
            direction: 'closed',
            direction_confidence: 'medium',
            id: '44444444-4444-4444-8444-444444444444',
            merchant: '商户',
            source: 'wechat_csv',
            status: 'pending_confirmation',
            transaction_at: '2026-04-25 01:00:00+00',
          },
        ],
      }),
    );

    await expect(
      service.listRecentTransactions({
        limit: 10,
        userId: 'user-1',
      }),
    ).resolves.toMatchObject({
      transactions: [
        expect.objectContaining({
          direction: 'income',
          directionConfidence: 'high',
        }),
        expect.objectContaining({
          direction: 'refund',
          directionConfidence: 'high',
        }),
        expect.objectContaining({
          direction: 'closed',
          directionConfidence: 'medium',
        }),
      ],
    });
  });
});
