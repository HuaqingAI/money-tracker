import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        apiUrl: 'https://api.example.com',
      },
    },
  },
}));

import { fetchMonthlySummary, fetchRecentTransactions } from './dashboard-api';

describe('dashboard-api', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('fetches monthly summary with bearer auth and validates response shape', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            aiCoverageRate: 50,
            aiCoveredCount: 1,
            categoryBreakdown: [],
            hasTransactions: true,
            month: '2026-04',
            pendingConfirmationCount: 1,
            pendingConfirmationExpenseCents: 800,
            spotlight: null,
            totalExpenseCents: 1200,
            transactionCount: 2,
          },
        }),
      ),
    );

    await expect(fetchMonthlySummary('access-token', '2026-04')).resolves.toMatchObject({
      month: '2026-04',
      totalExpenseCents: 1200,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/dashboard/monthly-summary?month=2026-04',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }),
        method: 'GET',
      }),
    );
  });

  it('fetches recent transactions', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            hasMore: false,
            limit: 10,
            transactions: [
              {
                amountCents: 5000,
                categoryId: null,
                categoryName: '其他',
                description: '工资',
                direction: 'income',
                directionConfidence: 'high',
                id: '11111111-1111-4111-8111-111111111111',
                merchant: '公司',
                source: 'alipay_csv',
                status: 'confirmed',
                transactionAt: '2026-04-27T01:20:00.000Z',
              },
            ],
          },
        }),
      ),
    );

    await expect(fetchRecentTransactions('access-token')).resolves.toEqual({
      hasMore: false,
      limit: 10,
      transactions: [
        {
          amountCents: 5000,
          categoryId: null,
          categoryName: '其他',
          description: '工资',
          direction: 'income',
          directionConfidence: 'high',
          id: '11111111-1111-4111-8111-111111111111',
          merchant: '公司',
          source: 'alipay_csv',
          status: 'confirmed',
          transactionAt: '2026-04-27T01:20:00.000Z',
        },
      ],
    });
  });

  it('surfaces API and malformed response errors as stable exceptions', async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'DASHBOARD_INVALID_MONTH',
              message: '月份格式必须为 YYYY-MM',
            },
          }),
          { status: 400 },
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

    await expect(fetchMonthlySummary('access-token', 'bad')).rejects.toThrow(
      '月份格式必须为 YYYY-MM',
    );
    await expect(fetchMonthlySummary('access-token', '2026-04')).rejects.toThrow(
      '服务端返回了不可识别的响应',
    );
  });
});

