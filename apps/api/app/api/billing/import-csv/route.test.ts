import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  requireAuthenticatedUserMock,
  withRequestLoggingMock,
  ensurePersistentUserMock,
  afterMock,
  classifyPendingTransactionsMock,
  importCsvMock,
} = vi.hoisted(() => ({
    afterMock: vi.fn((callback: () => Promise<void> | void) => {
      void callback();
    }),
    classifyPendingTransactionsMock: vi.fn(),
    requireAuthenticatedUserMock: vi.fn(),
    withRequestLoggingMock: vi.fn(
      async (_request: Request, handler: () => Promise<Response>) => handler(),
    ),
    ensurePersistentUserMock: vi.fn(),
    importCsvMock: vi.fn(),
  }));

vi.mock('next/server', async () => {
  const actual = await vi.importActual<typeof import('next/server')>('next/server');
  return {
    ...actual,
    after: afterMock,
  };
});

vi.mock('../../../../lib/middleware/request-logger', () => ({
  withRequestLogging: withRequestLoggingMock,
}));

vi.mock('../../../../lib/middleware/require-authenticated-user', () => ({
  AuthenticatedUserError: class AuthenticatedUserError extends Error {
    constructor(
      public readonly code: string,
      public readonly status: number,
      message: string,
    ) {
      super(message);
    }
  },
  requireAuthenticatedUser: requireAuthenticatedUserMock,
}));

vi.mock('../../../../lib/auth/ensure-persistent-user', () => ({
  ensurePersistentUser: ensurePersistentUserMock,
}));

vi.mock('../../../../lib/billing/import-service', () => ({
  getBillingImportService: () => ({
    importCsv: importCsvMock,
  }),
}));

vi.mock('../../../../lib/services/classify-service', () => ({
  getClassifyService: () => ({
    classifyPendingTransactions: classifyPendingTransactionsMock,
  }),
}));

import { POST } from './route';

function createUser(): User {
  return {
    app_metadata: { provider: 'phone', providers: ['phone'] },
    aud: 'authenticated',
    created_at: '2026-04-26T00:00:00.000Z',
    id: 'user-1',
    phone: '13812345678',
    updated_at: '2026-04-26T00:00:00.000Z',
    user_metadata: {},
  } as User;
}

function createRequest(file: File): Request {
  const formData = new FormData();
  formData.append('file', file);
  return new Request('https://example.com/api/billing/import-csv', {
    body: formData,
    method: 'POST',
  });
}

describe('POST /api/billing/import-csv', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedUserMock.mockResolvedValue({
      accessToken: 'token',
      user: createUser(),
    });
    ensurePersistentUserMock.mockResolvedValue(undefined);
    classifyPendingTransactionsMock.mockResolvedValue({
      classifiedCount: 1,
      failedCount: 0,
      totalCount: 1,
    });
  });

  it('imports a CSV file for the authenticated user', async () => {
    importCsvMock.mockResolvedValue({
      totalCount: 1,
      importedCount: 1,
      duplicateCount: 0,
      failedCount: 0,
      importId: 'import-1',
      importedTransactionIds: ['11111111-1111-4111-8111-111111111111'],
      platform: 'alipay',
    });

    const response = await POST(
      createRequest(
        new File(['交易时间,交易金额\n2026-04-26 10:30:00,12.34'], 'bill.csv', {
          type: 'text/csv',
        }),
      ) as never,
    );

    expect(importCsvMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'bill.csv',
        userId: 'user-1',
      }),
    );
    expect(ensurePersistentUserMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-1',
      }),
    );
    expect(classifyPendingTransactionsMock).toHaveBeenCalledWith({
      transactionIds: ['11111111-1111-4111-8111-111111111111'],
      userId: 'user-1',
    });
    expect(afterMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({
        importId: 'import-1',
        importedCount: 1,
      }),
    });
  });

  it('triggers catch-up classification when an imported file only contains duplicates', async () => {
    importCsvMock.mockResolvedValue({
      totalCount: 1,
      importedCount: 0,
      duplicateCount: 1,
      failedCount: 0,
      importId: 'import-1',
      importedTransactionIds: [],
      platform: 'alipay',
    });

    const response = await POST(
      createRequest(new File(['header\nrow'], 'bill.csv', { type: 'text/csv' })) as never,
    );

    expect(afterMock).toHaveBeenCalledTimes(1);
    expect(classifyPendingTransactionsMock).toHaveBeenCalledWith({
      userId: 'user-1',
    });
    expect(response.status).toBe(200);
  });

  it('rejects files larger than 10MB', async () => {
    const response = await POST(
      createRequest(new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'bill.csv')) as never,
    );

    expect(importCsvMock).not.toHaveBeenCalled();
    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'IMPORT_FILE_TOO_LARGE',
        message: 'CSV 文件不能超过 10MB',
      },
    });
  });

  it('rejects non-CSV files', async () => {
    const response = await POST(
      createRequest(new File(['plain'], 'bill.txt')) as never,
    );

    expect(importCsvMock).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: 'INVALID_CSV_FILE',
      },
    });
  });
});
