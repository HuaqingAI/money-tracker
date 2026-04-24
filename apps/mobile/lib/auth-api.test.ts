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

import { refreshSession, sendOtp, verifyOtp, wechatCallback } from './auth-api';

describe('auth-api', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('posts OTP requests to the configured API base URL', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            challengeId: 'challenge-1',
            resendAfterSeconds: 60,
            expiresAt: '2026-04-24T00:00:00.000Z',
            devCode: '123456',
          },
        }),
      ),
    );

    await expect(sendOtp({ phone: '13800138000' })).resolves.toEqual({
      challengeId: 'challenge-1',
      resendAfterSeconds: 60,
      expiresAt: '2026-04-24T00:00:00.000Z',
      devCode: '123456',
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/auth/otp-send',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('surfaces API errors as thrown exceptions', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'AUTH_OTP_INVALID',
            message: '验证码错误',
          },
        }),
      ),
    );

    await expect(
      verifyOtp({
        phone: '13800138000',
        code: '123456',
        consentAccepted: true,
      }),
    ).rejects.toThrow('验证码错误');
  });

  it('supports refresh and wechat callback contracts', async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              session: {
                accessToken: 'a',
                refreshToken: 'b',
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
            },
          }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: {
              featureEnabled: false,
            },
          }),
        ),
      );

    await expect(refreshSession({ refreshToken: 'refresh' })).resolves.toEqual(
      expect.objectContaining({
        nextPath: '/(main)/dashboard',
      }),
    );

    await expect(wechatCallback({ code: 'dev-code' })).resolves.toEqual({
      featureEnabled: false,
    });
  });
});
