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

import {
  confirmBulkTransactions,
  confirmTransaction,
  fetchPendingConfirmations,
  rejectTransaction,
  uploadBillingCsv,
} from './billing-api';

describe('billing-api', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('uploads CSV files as multipart form data with a bearer token', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            totalCount: 1,
            importedCount: 1,
            duplicateCount: 0,
            failedCount: 0,
            importId: 'import-1',
            platform: 'alipay',
          },
        }),
      ),
    );

    await expect(
      uploadBillingCsv('access-token', {
        name: 'bill.csv',
        size: 1024,
        uri: 'file:///bill.csv',
      }),
    ).resolves.toMatchObject({
      importId: 'import-1',
      importedCount: 1,
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/billing/import-csv',
      expect.objectContaining({
        body: expect.any(FormData),
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }),
        method: 'POST',
      }),
    );
  });

  it('rejects oversized files before network upload', async () => {
    await expect(
      uploadBillingCsv('access-token', {
        name: 'bill.csv',
        size: 10 * 1024 * 1024 + 1,
        uri: 'file:///bill.csv',
      }),
    ).rejects.toMatchObject({
      code: 'IMPORT_FILE_TOO_LARGE',
      status: 413,
    });

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('surfaces API and non-JSON errors as stable exceptions', async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'IMPORT_ENCODING_ERROR',
              message: '无法识别账单文件编码',
            },
          }),
          { status: 400 },
        ),
      )
      .mockResolvedValueOnce(
        new Response('<html>bad gateway</html>', {
          status: 502,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({}), {
          status: 502,
        }),
      );

    await expect(
      uploadBillingCsv('access-token', {
        name: 'bill.csv',
        uri: 'file:///bill.csv',
      }),
    ).rejects.toThrow('无法识别账单文件编码');

    await expect(
      uploadBillingCsv('access-token', {
        name: 'bill.csv',
        uri: 'file:///bill.csv',
      }),
    ).rejects.toThrow('服务暂时不可用，请稍后重试');

    await expect(
      uploadBillingCsv('access-token', {
        name: 'bill.csv',
        uri: 'file:///bill.csv',
      }),
    ).rejects.toThrow('服务暂时不可用，请稍后重试');
  });

  it('fetches pending confirmations with response validation', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            categories: [
              {
                icon: 'utensils',
                id: '00000000-0000-4000-8000-000000000001',
                isSystem: true,
                name: '餐饮',
              },
            ],
            classification: {
              classifiedCount: 1,
              totalCount: 2,
              unclassifiedCount: 1,
            },
            transactions: [],
          },
        }),
      ),
    );

    await expect(fetchPendingConfirmations('access-token')).resolves.toEqual({
      categories: [
        {
          icon: 'utensils',
          id: '00000000-0000-4000-8000-000000000001',
          isSystem: true,
          name: '餐饮',
        },
      ],
      classification: {
        classifiedCount: 1,
        totalCount: 2,
        unclassifiedCount: 1,
      },
      transactions: [],
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/billing/pending-confirmations',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }),
        method: 'GET',
      }),
    );
  });

  it('sends confirmation mutations', async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              status: 'confirmed',
              transactionId: '11111111-1111-4111-8111-111111111111',
            },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              status: 'confirmed',
              transactionId: '11111111-1111-4111-8111-111111111111',
            },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              categoryId: '00000000-0000-4000-8000-000000000001',
              status: 'rejected',
              transactionId: '11111111-1111-4111-8111-111111111111',
            },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              categoryId: null,
              status: 'rejected',
              transactionId: '11111111-1111-4111-8111-111111111111',
            },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              confirmedCount: 1,
            },
          }),
        ),
      );

    await confirmTransaction(
      'access-token',
      '11111111-1111-4111-8111-111111111111',
    );
    await confirmTransaction(
      'access-token',
      '11111111-1111-4111-8111-111111111111',
      { categoryId: '00000000-0000-4000-8000-000000000003' },
    );
    await rejectTransaction('access-token', {
      categoryId: '00000000-0000-4000-8000-000000000001',
      transactionId: '11111111-1111-4111-8111-111111111111',
    });
    await rejectTransaction('access-token', {
      transactionId: '11111111-1111-4111-8111-111111111111',
    });
    await confirmBulkTransactions('access-token', [
      '11111111-1111-4111-8111-111111111111',
    ]);

    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      'https://api.example.com/api/billing/transactions/11111111-1111-4111-8111-111111111111/confirm',
      expect.objectContaining({
        method: 'POST',
      }),
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      2,
      'https://api.example.com/api/billing/transactions/11111111-1111-4111-8111-111111111111/confirm',
      expect.objectContaining({
        body: JSON.stringify({
          categoryId: '00000000-0000-4000-8000-000000000003',
        }),
        method: 'POST',
      }),
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      3,
      'https://api.example.com/api/billing/transactions/11111111-1111-4111-8111-111111111111/reject',
      expect.objectContaining({
        body: JSON.stringify({
          categoryId: '00000000-0000-4000-8000-000000000001',
        }),
        method: 'POST',
      }),
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      4,
      'https://api.example.com/api/billing/transactions/11111111-1111-4111-8111-111111111111/reject',
      expect.objectContaining({
        method: 'POST',
      }),
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      5,
      'https://api.example.com/api/billing/transactions/confirm-bulk',
      expect.objectContaining({
        body: JSON.stringify({
          transactionIds: ['11111111-1111-4111-8111-111111111111'],
        }),
        method: 'POST',
      }),
    );
  });
});
