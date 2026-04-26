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

import { uploadBillingCsv } from './billing-api';

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
});
