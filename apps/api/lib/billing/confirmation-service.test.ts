import { describe, expect, it } from 'vitest';

import type { ConfirmationRepository } from './confirmation-service';
import { ConfirmationService } from './confirmation-service';

const foodId = '00000000-0000-4000-8000-000000000001';
const shoppingId = '00000000-0000-4000-8000-000000000003';
const systemFoodId = '00000000-0000-0000-0000-000000000001';
const transactionId = '11111111-1111-4111-8111-111111111111';

function createRepository(
  overrides: Partial<ConfirmationRepository> = {},
): ConfirmationRepository {
  return {
    confirmBulk: async ({ transactionIds }) => transactionIds.length,
    confirmOne: async ({ categoryId }) => ({
      ai_confidence: 0.88,
      ai_provider: 'gpt-5.3-codex',
      amount_cents: -2800,
      category_id: categoryId ?? foodId,
      classified_at: '2026-04-28 01:00:00+00',
      description: '午餐',
      direction: 'expense',
      direction_confidence: 'high',
      id: transactionId,
      merchant: '美团外卖',
      source: 'alipay_csv',
      status: 'confirmed',
      transaction_at: '2026-04-28 00:30:00+00',
    }),
    getCategory: async ({ categoryId }) => ({
      icon: 'utensils',
      id: categoryId,
      is_system: true,
      name: '餐饮',
      sort_order: 1,
      user_id: null,
    }),
    getPendingClassificationSummary: async () => ({
      classifiedCount: 1,
      totalCount: 2,
      unclassifiedCount: 1,
    }),
    listCategories: async () => [
      {
        icon: 'utensils',
        id: foodId,
        is_system: true,
        name: '餐饮',
        sort_order: 1,
        user_id: null,
      },
    ],
    listPendingTransactions: async () => [
      {
        ai_confidence: 0.88,
        ai_provider: 'gpt-5.3-codex',
        amount_cents: -2800,
        category_id: foodId,
        classified_at: '2026-04-28 01:00:00+00',
        description: '午餐',
        direction: 'expense',
        direction_confidence: 'high',
        id: transactionId,
        merchant: '美团外卖',
        source: 'alipay_csv',
        status: 'pending_confirmation',
        transaction_at: '2026-04-28 00:30:00+00',
      },
    ],
    rejectOne: async ({ categoryId }) => ({
      ai_confidence: 0.88,
      ai_provider: 'gpt-5.3-codex',
      amount_cents: -2800,
        category_id: categoryId ?? foodId,
      classified_at: '2026-04-28 01:00:00+00',
      description: '午餐',
      direction: 'expense',
      direction_confidence: 'high',
      id: transactionId,
      merchant: '美团外卖',
      source: 'alipay_csv',
      status: 'rejected',
      transaction_at: '2026-04-28 00:30:00+00',
    }),
    upsertUserRule: async () => undefined,
    ...overrides,
  };
}

describe('ConfirmationService', () => {
  it('maps pending confirmations with category names', async () => {
    const service = new ConfirmationService(createRepository());

    await expect(service.listPendingConfirmations('user-1')).resolves.toEqual({
      categories: [
        {
          icon: 'utensils',
          id: foodId,
          isSystem: true,
          name: '餐饮',
        },
      ],
      classification: {
        classifiedCount: 1,
        totalCount: 2,
        unclassifiedCount: 1,
      },
      transactions: [
        {
          aiConfidence: 0.88,
          aiProvider: 'gpt-5.3-codex',
          amountCents: -2800,
          categoryId: foodId,
          categoryName: '餐饮',
          classifiedAt: '2026-04-28T01:00:00.000Z',
          description: '午餐',
          direction: 'expense',
          directionConfidence: 'high',
          id: transactionId,
          merchant: '美团外卖',
          source: 'alipay_csv',
          status: 'pending_confirmation',
          transactionAt: '2026-04-28T00:30:00.000Z',
        },
      ],
    });
  });

  it('normalizes system category names when stored names are garbled', async () => {
    const service = new ConfirmationService(
      createRepository({
        listCategories: async () => [
          {
            icon: 'utensils',
            id: systemFoodId,
            is_system: true,
            name: '??',
            sort_order: 1,
            user_id: null,
          },
        ],
        listPendingTransactions: async () => [
          {
            ai_confidence: 0.88,
            ai_provider: 'gpt-5.3-codex',
            amount_cents: -2800,
            category_id: systemFoodId,
            classified_at: '2026-04-28 01:00:00+00',
            description: '午餐',
            direction: 'expense',
            direction_confidence: 'high',
            id: transactionId,
            merchant: '美团外卖',
            source: 'alipay_csv',
            status: 'pending_confirmation',
            transaction_at: '2026-04-28 00:30:00+00',
          },
        ],
      }),
    );

    await expect(service.listPendingConfirmations('user-1')).resolves.toMatchObject({
      categories: [
        {
          id: systemFoodId,
          name: '餐饮',
        },
      ],
      transactions: [
        {
          categoryId: systemFoodId,
          categoryName: '餐饮',
        },
      ],
    });
  });

  it('confirms one pending transaction', async () => {
    const service = new ConfirmationService(createRepository());

    await expect(
      service.confirmTransaction({
        transactionId,
        userId: 'user-1',
      }),
    ).resolves.toEqual({
      status: 'confirmed',
      transactionId,
    });
  });

  it('rejects with a corrected category and records feedback rule', async () => {
    const recordedRules: Array<{
      categoryId: string;
      keyword: string;
      userId: string;
    }> = [];
    const service = new ConfirmationService(
      createRepository({
        upsertUserRule: async (input) => {
          recordedRules.push(input);
        },
      }),
    );

    await expect(
      service.rejectTransaction({
        categoryId: shoppingId,
        transactionId,
        userId: 'user-1',
      }),
    ).resolves.toEqual({
      categoryId: shoppingId,
      status: 'rejected',
      transactionId,
    });
    expect(recordedRules).toEqual([
      {
        categoryId: shoppingId,
        keyword: '美团外卖',
        userId: 'user-1',
      },
    ]);
  });

  it('rejects invalid categories and missing transactions', async () => {
    const service = new ConfirmationService(
      createRepository({
        confirmOne: async () => null,
        getCategory: async () => null,
      }),
    );

    await expect(
      service.confirmTransaction({
        transactionId,
        userId: 'user-1',
      }),
    ).rejects.toMatchObject({
      code: 'TRANSACTION_NOT_FOUND',
      status: 404,
    });
    await expect(
      service.rejectTransaction({
        categoryId: shoppingId,
        transactionId,
        userId: 'user-1',
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_CATEGORY',
      status: 400,
    });
  });

  it('confirms with a corrected category and records feedback rule', async () => {
    const recordedRules: Array<{
      categoryId: string;
      keyword: string;
      userId: string;
    }> = [];
    const service = new ConfirmationService(
      createRepository({
        upsertUserRule: async (input) => {
          recordedRules.push(input);
        },
      }),
    );

    await expect(
      service.confirmTransaction({
        categoryId: shoppingId,
        transactionId,
        userId: 'user-1',
      }),
    ).resolves.toEqual({
      status: 'confirmed',
      transactionId,
    });
    expect(recordedRules).toEqual([
      {
        categoryId: shoppingId,
        keyword: '美团外卖',
        userId: 'user-1',
      },
    ]);
  });

  it('supports pure rejection without recording a feedback rule', async () => {
    const recordedRules: Array<{
      categoryId: string;
      keyword: string;
      userId: string;
    }> = [];
    const service = new ConfirmationService(
      createRepository({
        upsertUserRule: async (input) => {
          recordedRules.push(input);
        },
      }),
    );

    await expect(
      service.rejectTransaction({
        transactionId,
        userId: 'user-1',
      }),
    ).resolves.toEqual({
      categoryId: null,
      status: 'rejected',
      transactionId,
    });
    expect(recordedRules).toEqual([]);
  });

  it('fails bulk confirmation when not every requested transaction is confirmed', async () => {
    const service = new ConfirmationService(
      createRepository({
        confirmBulk: async () => 1,
      }),
    );

    await expect(
      service.confirmBulk({
        transactionIds: [
          '11111111-1111-4111-8111-111111111111',
          '22222222-2222-4222-8222-222222222222',
        ],
        userId: 'user-1',
      }),
    ).rejects.toMatchObject({
      code: 'TRANSACTION_NOT_FOUND',
      status: 409,
    });
  });
});
