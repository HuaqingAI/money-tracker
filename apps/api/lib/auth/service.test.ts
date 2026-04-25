import { AUTH_ERROR_CODES, AUTH_ROUTE_PATHS } from '@money-tracker/shared';
import { describe, expect, it } from 'vitest';

import { AuthError, AuthService, getNextPathFromAccessToken } from './service';

describe('AuthService', () => {
  it('issues OTP metadata and reuses resend throttle window', async () => {
    const service = new AuthService();

    const first = await service.sendOtp('13800138000');
    const second = await service.sendOtp('13800138000');

    expect(first.challengeId).toBeTruthy();
    expect(first.devCode).toMatch(/^\d{6}$/);
    expect(second.challengeId).toBe(first.challengeId);
    expect(second.resendAfterSeconds).toBeGreaterThan(0);
    expect(second.devCode).toBe(first.devCode);
  });

  it('rejects OTP verification without consent', async () => {
    const service = new AuthService();
    await service.sendOtp('13800138001');

    await expect(
      service.verifyOtp({
        phone: '13800138001',
        code: '000000',
        consentAccepted: false,
      }),
    ).rejects.toMatchObject<AuthError>({
      code: AUTH_ERROR_CODES.consentRequired,
      status: 400,
    });
  });

  it('creates a new user session and routes to onboarding on first verification', async () => {
    const service = new AuthService();
    await service.sendOtp('13800138002');

    // Pull the generated challenge by attempting codes until repository state is exercised
    const challenge = (
      service as unknown as {
        repository: { getOtpChallengeByPhone(phone: string): Promise<{ code: string } | null> };
      }
    ).repository;
    const record = await challenge.getOtpChallengeByPhone('13800138002');

    const result = await service.verifyOtp({
      phone: '13800138002',
      code: record?.code ?? '',
      consentAccepted: true,
      displayName: 'Sue',
    });

    expect(result.nextPath).toBe(AUTH_ROUTE_PATHS.permissions);
    expect(result.session.user.needsOnboarding).toBe(true);
    expect(getNextPathFromAccessToken(result.session.accessToken)).toBe(
      AUTH_ROUTE_PATHS.permissions,
    );
  });

  it('routes returning users to dashboard after refresh', async () => {
    const service = new AuthService();
    await service.sendOtp('13800138003');

    const challenge = (
      service as unknown as {
        repository: { getOtpChallengeByPhone(phone: string): Promise<{ code: string } | null> };
      }
    ).repository;
    const record = await challenge.getOtpChallengeByPhone('13800138003');

    const firstLogin = await service.verifyOtp({
      phone: '13800138003',
      code: record?.code ?? '',
      consentAccepted: true,
    });

    const refreshed = await service.refreshSession(firstLogin.session.refreshToken);
    expect(refreshed.nextPath).toBe(AUTH_ROUTE_PATHS.permissions);

    await service.sendOtp('13800138003');
    const secondRecord = await challenge.getOtpChallengeByPhone('13800138003');
    const secondLogin = await service.verifyOtp({
      phone: '13800138003',
      code: secondRecord?.code ?? '',
      consentAccepted: false,
    });

    expect(secondLogin.nextPath).toBe(AUTH_ROUTE_PATHS.dashboard);
    expect(secondLogin.session.user.needsOnboarding).toBe(false);
  });

  it('rejects reused refresh tokens after rotation', async () => {
    const service = new AuthService();
    await service.sendOtp('13800138004');

    const challenge = (
      service as unknown as {
        repository: { getOtpChallengeByPhone(phone: string): Promise<{ code: string } | null> };
      }
    ).repository;
    const record = await challenge.getOtpChallengeByPhone('13800138004');

    const login = await service.verifyOtp({
      phone: '13800138004',
      code: record?.code ?? '',
      consentAccepted: true,
    });

    await expect(service.refreshSession(login.session.refreshToken)).resolves.toEqual(
      expect.objectContaining({
        session: expect.objectContaining({
          refreshToken: expect.not.stringMatching(login.session.refreshToken),
        }),
      }),
    );
    await expect(service.refreshSession(login.session.refreshToken)).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.refreshInvalid,
      status: 401,
    });
  });

  it('requires consent before handling wechat callback', async () => {
    const service = new AuthService();

    await expect(
      service.handleWechatCallback({
        code: 'dev-code',
        consentAccepted: false,
      }),
    ).rejects.toMatchObject({
      code: AUTH_ERROR_CODES.consentRequired,
      status: 400,
    });
  });
});
