import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  withRequestLoggingMock,
  sendOtpMock,
  verifyOtpMock,
  refreshSessionMock,
  handleWechatCallbackMock,
} = vi.hoisted(() => ({
  withRequestLoggingMock: vi.fn(async (_request: Request, handler: () => Promise<Response>) =>
    handler(),
  ),
  sendOtpMock: vi.fn(),
  verifyOtpMock: vi.fn(),
  refreshSessionMock: vi.fn(),
  handleWechatCallbackMock: vi.fn(),
}));

vi.mock('../../../lib/middleware/request-logger', () => ({
  withRequestLogging: withRequestLoggingMock,
}));

vi.mock('../../../lib/auth/service', () => ({
  AuthError: class AuthError extends Error {
    constructor(
      public readonly code: string,
      message: string,
      public readonly status: number,
    ) {
      super(message);
    }
  },
  getAuthService: () => ({
    sendOtp: sendOtpMock,
    verifyOtp: verifyOtpMock,
    refreshSession: refreshSessionMock,
    handleWechatCallback: handleWechatCallbackMock,
  }),
}));

import { POST as postOtpSend } from './otp-send/route';
import { POST as postOtpVerify } from './otp-verify/route';
import { POST as postRefresh } from './refresh/route';
import { POST as postWechatCallback } from './wechat-callback/route';

describe('auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns send OTP payload with unified response format', async () => {
    sendOtpMock.mockResolvedValue({
      challengeId: 'challenge-1',
      resendAfterSeconds: 60,
      expiresAt: '2026-04-24T00:00:00.000Z',
    });

    const response = await postOtpSend(
      new Request('https://example.com/api/auth/otp-send', {
        method: 'POST',
        body: JSON.stringify({ phone: '13800138000' }),
      }) as never,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        challengeId: 'challenge-1',
        resendAfterSeconds: 60,
        expiresAt: '2026-04-24T00:00:00.000Z',
      },
    });
  });

  it('returns verification session payload', async () => {
    verifyOtpMock.mockResolvedValue({
      session: {
        accessToken: 'access',
        refreshToken: 'refresh',
        accessTokenExpiresAt: '2026-04-24T00:15:00.000Z',
        refreshTokenExpiresAt: '2026-05-01T00:00:00.000Z',
        user: {
          id: 'user-1',
          phone: '13800138000',
          displayName: 'Sue',
          consentAt: '2026-04-24T00:00:00.000Z',
          lastSignInAt: '2026-04-24T00:00:00.000Z',
          authMethod: 'otp',
          needsOnboarding: true,
        },
      },
      nextPath: '/(setup)/permissions',
    });

    const response = await postOtpVerify(
      new Request('https://example.com/api/auth/otp-verify', {
        method: 'POST',
        body: JSON.stringify({
          phone: '13800138000',
          code: '123456',
          consentAccepted: true,
        }),
      }) as never,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({
        nextPath: '/(setup)/permissions',
      }),
    });
  });

  it('returns refresh session payload', async () => {
    refreshSessionMock.mockResolvedValue({
      session: {
        accessToken: 'access-2',
        refreshToken: 'refresh-2',
        accessTokenExpiresAt: '2026-04-24T00:15:00.000Z',
        refreshTokenExpiresAt: '2026-05-01T00:00:00.000Z',
        user: {
          id: 'user-1',
          phone: '13800138000',
          displayName: null,
          consentAt: '2026-04-24T00:00:00.000Z',
          lastSignInAt: '2026-04-24T00:00:00.000Z',
          authMethod: 'otp',
          needsOnboarding: false,
        },
      },
      nextPath: '/(main)/dashboard',
    });

    const response = await postRefresh(
      new Request('https://example.com/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: 'refresh-1' }),
      }) as never,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({
        nextPath: '/(main)/dashboard',
      }),
    });
  });

  it('returns wechat callback payload', async () => {
    handleWechatCallbackMock.mockResolvedValue({
      featureEnabled: false,
    });

    const response = await postWechatCallback(
      new Request('https://example.com/api/auth/wechat-callback', {
        method: 'POST',
        body: JSON.stringify({ code: 'dev-code' }),
      }) as never,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        featureEnabled: false,
      },
    });
  });
});
