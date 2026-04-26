import { beforeEach, describe, expect, it, vi } from 'vitest';

const { withRequestLoggingMock, loggerMock } = vi.hoisted(() => ({
  loggerMock: {
    info: vi.fn(),
  },
  withRequestLoggingMock: vi.fn(
    async (
      _request: Request,
      handler: (ctx: { logger: { info: ReturnType<typeof vi.fn> } }) => Promise<Response>,
    ) => handler({ logger: loggerMock }),
  ),
}));

vi.mock('@/lib/middleware/request-logger', () => ({
  withRequestLogging: withRequestLoggingMock,
}));

import { resetCaptureStore } from '@/lib/capture-store';

import { POST } from './route';

describe('POST /api/billing/capture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetCaptureStore();
  });

  it('accepts a structured capture payload and returns normalized data', async () => {
    const response = await POST(
      new Request('https://example.com/api/billing/capture', {
        method: 'POST',
        body: JSON.stringify({
          capture: {
            amountCents: 1680,
            merchantName: '  瑞幸咖啡 ',
            transactionTime: '2026-04-24T01:00:00.000Z',
            platform: 'alipay',
          },
          deviceId: 'android-xiaomi-1',
        }),
      }) as never,
    );

    expect(withRequestLoggingMock).toHaveBeenCalledOnce();
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        duplicate: false,
        normalized: {
          amountCents: 1680,
          merchantName: '瑞幸咖啡',
          platform: 'alipay',
          transactionTime: '2026-04-24T01:00:00.000Z',
        },
        receivedAt: expect.any(String),
      },
    });
    expect(loggerMock.info).toHaveBeenCalledWith(
      {
        duplicate: false,
        platform: 'alipay',
        amountCents: 1680,
      },
      'billing:capture:accepted',
    );
  });

  it('marks captures in the five-minute window as duplicates', async () => {
    const requestBody = {
      capture: {
        amountCents: 1680,
        merchantName: '瑞幸咖啡',
        transactionTime: '2026-04-24T01:00:00.000Z',
        platform: 'alipay',
      },
      deviceId: 'android-xiaomi-1',
    };

    await POST(
      new Request('https://example.com/api/billing/capture', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }) as never,
    );

    const duplicateResponse = await POST(
      new Request('https://example.com/api/billing/capture', {
        method: 'POST',
        body: JSON.stringify({
          ...requestBody,
          capture: {
            ...requestBody.capture,
            transactionTime: '2026-04-24T01:04:00.000Z',
          },
        }),
      }) as never,
    );

    expect(duplicateResponse.status).toBe(200);
    await expect(duplicateResponse.json()).resolves.toEqual({
      success: true,
      data: {
        duplicate: true,
        normalized: {
          amountCents: 1680,
          merchantName: '瑞幸咖啡',
          platform: 'alipay',
          transactionTime: '2026-04-24T01:04:00.000Z',
        },
        receivedAt: expect.any(String),
      },
    });
  });
});
