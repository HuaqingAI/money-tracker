import { beforeEach, describe, expect, it, vi } from 'vitest';

const { withRequestLoggingMock, upsertRuleMock } = vi.hoisted(() => ({
  withRequestLoggingMock: vi.fn(
    async (_request: Request, handler: () => Promise<Response>) => handler(),
  ),
  upsertRuleMock: vi.fn(),
}));

vi.mock('../../../../lib/middleware/request-logger', () => ({
  withRequestLogging: withRequestLoggingMock,
}));

vi.mock('../../../../lib/billing/csv-rule-repository', () => ({
  getCsvRuleRepository: () => ({
    upsertRule: upsertRuleMock,
  }),
}));

import { PUT } from './route';

const validBody = {
  platform: 'alipay',
  version: '2026-04-26',
  ruleConfig: {
    platform: 'alipay',
    encoding: 'gb18030',
    headerMatch: ['交易时间', '交易金额'],
    skipRows: 0,
    columnMapping: {
      amount: '交易金额',
      transactionAt: '交易时间',
    },
    dateFormat: 'yyyy-MM-dd HH:mm:ss',
  },
};

function createRequest(body: unknown, token = 'secret'): Request {
  return new Request('https://example.com/api/admin/csv-rules', {
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      'x-admin-token': token,
    },
    method: 'PUT',
  });
}

describe('PUT /api/admin/csv-rules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CSV_RULES_ADMIN_TOKEN', 'secret');
    upsertRuleMock.mockResolvedValue({
      is_active: true,
      platform: 'alipay',
      version: '2026-04-26',
    });
  });

  it('updates CSV rules with a configured admin token', async () => {
    const response = await PUT(createRequest(validBody) as never);

    expect(upsertRuleMock).toHaveBeenCalledWith(validBody);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        isActive: true,
        platform: 'alipay',
        version: '2026-04-26',
      },
    });
  });

  it('rejects requests when the admin token is missing or wrong', async () => {
    const response = await PUT(createRequest(validBody, 'wrong') as never);

    expect(upsertRuleMock).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: 'CSV_RULES_UNAUTHORIZED',
      },
    });
  });

  it('does not silently allow writes when server token is unconfigured', async () => {
    vi.stubEnv('CSV_RULES_ADMIN_TOKEN', '');

    const response = await PUT(createRequest(validBody) as never);

    expect(upsertRuleMock).not.toHaveBeenCalled();
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: 'CSV_RULES_UNAUTHORIZED',
      },
    });
  });
});

