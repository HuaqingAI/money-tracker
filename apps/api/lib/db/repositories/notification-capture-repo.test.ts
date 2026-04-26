import { beforeEach, describe, expect, it, vi } from 'vitest';

const queryState = vi.hoisted(() => ({
  existingRows: [] as Array<{ id: string }>,
  insertError: null as { message: string } | null,
  insertedRows: [] as unknown[],
  selectedFilters: [] as Array<[string, unknown]>,
}));

const getSupabaseAdminMock = vi.hoisted(() =>
  vi.fn(() => {
    const query = {
      eq: vi.fn((column: string, value: unknown) => {
        queryState.selectedFilters.push([column, value]);
        return query;
      }),
      gte: vi.fn(() => query),
      insert: vi.fn((row: unknown) => {
        queryState.insertedRows.push(row);
        return Promise.resolve({ error: queryState.insertError });
      }),
      limit: vi.fn(() =>
        Promise.resolve({ data: queryState.existingRows, error: null }),
      ),
      lte: vi.fn(() => query),
      select: vi.fn(() => query),
    };

    return {
      schema: vi.fn(() => ({
        from: vi.fn(() => query),
      })),
    };
  }),
);

vi.mock('../supabase-admin', () => ({
  getSupabaseAdmin: getSupabaseAdminMock,
}));

import { notificationCaptureRepository } from './notification-capture-repo';

describe('notificationCaptureRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryState.existingRows = [];
    queryState.insertError = null;
    queryState.insertedRows = [];
    queryState.selectedFilters = [];
  });

  it('persists normalized captures scoped by user and device', async () => {
    const result = await notificationCaptureRepository.store({
      capture: {
        amountCents: 1680,
        merchantName: '  瑞幸咖啡 ',
        platform: 'alipay',
        transactionTime: '2026-04-24T01:00:00.000Z',
      },
      capturedAt: '2026-04-24T01:01:00.000Z',
      deviceId: 'android-samsung-1',
      userId: 'user-1',
    });

    expect(result).toEqual({
      duplicate: false,
      normalized: {
        amountCents: 1680,
        merchantName: '瑞幸咖啡',
        platform: 'alipay',
        transactionTime: '2026-04-24T01:00:00.000Z',
      },
    });
    expect(queryState.selectedFilters).toEqual(
      expect.arrayContaining([
        ['user_id', 'user-1'],
        ['device_id', 'android-samsung-1'],
        ['platform', 'alipay'],
        ['amount_cents', 1680],
        ['merchant_key', '瑞幸咖啡'],
      ]),
    );
    expect(queryState.insertedRows).toEqual([
      {
        amount_cents: 1680,
        captured_at: '2026-04-24T01:01:00.000Z',
        device_id: 'android-samsung-1',
        merchant: '瑞幸咖啡',
        merchant_key: '瑞幸咖啡',
        platform: 'alipay',
        transaction_at: '2026-04-24T01:00:00.000Z',
        user_id: 'user-1',
      },
    ]);
  });

  it('does not insert duplicates already present in the persisted window', async () => {
    queryState.existingRows = [{ id: 'capture-1' }];

    const result = await notificationCaptureRepository.store({
      capture: {
        amountCents: 1680,
        merchantName: '瑞幸咖啡',
        platform: 'alipay',
        transactionTime: '2026-04-24T01:04:00.000Z',
      },
      deviceId: 'android-samsung-1',
      userId: 'user-1',
    });

    expect(result.duplicate).toBe(true);
    expect(queryState.insertedRows).toEqual([]);
  });
});
