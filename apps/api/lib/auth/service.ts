import {
  AUTH_ERROR_CODES,
  AUTH_OTP_RESEND_SECONDS,
  AUTH_OTP_TTL_SECONDS,
  AUTH_ROUTE_PATHS,
  type AuthSession,
  type RefreshSessionResult,
  type SendOtpResult,
  type VerifyOtpResult,
  type WechatCallbackResult,
} from '@money-tracker/shared';

import { getAuthRepository } from './repository';
import { createAccessToken, createRefreshTokenValue, getRefreshTokenExpiry, readAccessTokenPayload } from './token';
import type { AuthIdentityRecord, AuthRepository } from './types';

export class AuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

interface AccessTokenPayload {
  [key: string]: unknown;
  sub: string;
  phone: string | null;
  authMethod: 'otp' | 'wechat';
  needsOnboarding: boolean;
}

function getAuthSecret(): string {
  return process.env.SUPABASE_JWT_SECRET ?? process.env.JWT_SECRET ?? 'dev-jwt-secret';
}

function mapUser(user: AuthIdentityRecord) {
  return {
    id: user.id,
    phone: user.phone,
    displayName: user.displayName,
    consentAt: user.consentAt,
    lastSignInAt: user.lastSignInAt,
    authMethod: user.authMethod,
    needsOnboarding: user.needsOnboarding,
  } as const;
}

function getNextPath(needsOnboarding: boolean) {
  return needsOnboarding ? AUTH_ROUTE_PATHS.permissions : AUTH_ROUTE_PATHS.dashboard;
}

function generateOtp(): string {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
}

function shouldExposeDevOtp(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export class AuthService {
  constructor(private readonly repository: AuthRepository = getAuthRepository()) {}

  async sendOtp(phone: string): Promise<SendOtpResult> {
    const now = new Date();
    const existing = await this.repository.getOtpChallengeByPhone(phone);

    if (existing) {
      const resendAvailableAt = new Date(existing.resendAvailableAt);
      if (resendAvailableAt.getTime() > now.getTime()) {
        return {
          challengeId: existing.id,
          resendAfterSeconds: Math.ceil(
            (resendAvailableAt.getTime() - now.getTime()) / 1000,
          ),
          expiresAt: existing.expiresAt,
          devCode: shouldExposeDevOtp() ? existing.code : undefined,
        };
      }
    }

    const challenge = await this.repository.createOtpChallenge(phone, generateOtp(), now);
    return {
      challengeId: challenge.id,
      resendAfterSeconds: AUTH_OTP_RESEND_SECONDS,
      expiresAt: challenge.expiresAt,
      devCode: shouldExposeDevOtp() ? challenge.code : undefined,
    };
  }

  async verifyOtp(params: {
    phone: string;
    code: string;
    consentAccepted: boolean;
    displayName?: string | undefined;
  }): Promise<VerifyOtpResult> {
    const existingUser = await this.repository.getUserByPhone(params.phone);
    const consentRequired = !existingUser?.consentAt;

    if (consentRequired && !params.consentAccepted) {
      throw new AuthError(
        AUTH_ERROR_CODES.consentRequired,
        '请先同意用户协议和隐私政策',
        400,
      );
    }

    const challenge = await this.repository.getOtpChallengeByPhone(params.phone);
    if (!challenge) {
      throw new AuthError(
        AUTH_ERROR_CODES.otpNotRequested,
        '请先获取验证码',
        400,
      );
    }

    const now = new Date();
    if (new Date(challenge.expiresAt).getTime() <= now.getTime()) {
      await this.repository.consumeOtpChallenge(challenge.id);
      throw new AuthError(
        AUTH_ERROR_CODES.otpExpired,
        `验证码已过期，请在 ${AUTH_OTP_TTL_SECONDS} 秒内完成验证`,
        400,
      );
    }

    if (challenge.code !== params.code) {
      throw new AuthError(
        AUTH_ERROR_CODES.otpInvalid,
        '验证码错误，请重新输入',
        400,
      );
    }

    await this.repository.consumeOtpChallenge(challenge.id);

    const consentAt = now.toISOString();
    const { user, isNewUser } = await this.repository.upsertPhoneUser({
      phone: params.phone,
      consentAt,
      displayName: params.displayName,
      now,
    });

    const session = await this.issueSession(user, isNewUser);

    return {
      session,
      nextPath: getNextPath(session.user.needsOnboarding),
    };
  }

  async refreshSession(refreshToken: string): Promise<RefreshSessionResult> {
    const now = new Date();
    const tokenRecord = await this.repository.getRefreshToken(refreshToken);
    if (!tokenRecord || new Date(tokenRecord.expiresAt).getTime() <= now.getTime()) {
      throw new AuthError(
        AUTH_ERROR_CODES.refreshInvalid,
        '登录已过期，请重新登录',
        401,
      );
    }

    const user = await this.repository.getUserById(tokenRecord.userId);
    if (!user) {
      throw new AuthError(
        AUTH_ERROR_CODES.unauthorized,
        '用户不存在，请重新登录',
        401,
      );
    }

    const newRefreshToken = createRefreshTokenValue();
    const refreshTokenExpiresAt = getRefreshTokenExpiry(now);
    const replaced = await this.repository.replaceRefreshToken({
      currentToken: refreshToken,
      userId: tokenRecord.userId,
      newToken: newRefreshToken,
      expiresAt: refreshTokenExpiresAt,
      now,
    });

    if (!replaced) {
      throw new AuthError(
        AUTH_ERROR_CODES.refreshInvalid,
        '登录已过期，请重新登录',
        401,
      );
    }

    const session = this.buildSession(user, false, newRefreshToken, refreshTokenExpiresAt);
    return {
      session,
      nextPath: getNextPath(session.user.needsOnboarding),
    };
  }

  async handleWechatCallback(params: {
    code: string;
    state?: string | undefined;
    consentAccepted: boolean;
  }): Promise<WechatCallbackResult> {
    if (!params.consentAccepted) {
      throw new AuthError(
        AUTH_ERROR_CODES.consentRequired,
        '请先同意用户协议和隐私政策',
        400,
      );
    }

    const enabled = Boolean(process.env.WECHAT_APP_ID && process.env.WECHAT_APP_SECRET);
    if (!enabled) {
      return {
        featureEnabled: false,
      };
    }

    const now = new Date();
    const { user } = await this.repository.upsertPhoneUser({
      phone: `wechat:${params.code}`,
      consentAt: now.toISOString(),
      displayName: '微信用户',
      now,
    });
    const session = await this.issueSession(
      {
        ...user,
        phone: null,
        authMethod: 'wechat',
      },
      user.needsOnboarding,
    );

    return {
      featureEnabled: true,
      session,
      nextPath: getNextPath(session.user.needsOnboarding),
    };
  }

  private async issueSession(
    user: AuthIdentityRecord,
    isNewUser: boolean,
  ): Promise<AuthSession> {
    const normalizedUser: AuthIdentityRecord = {
      ...user,
      needsOnboarding: isNewUser || user.needsOnboarding,
    };
    const refreshToken = createRefreshTokenValue();
    const refreshTokenExpiresAt = getRefreshTokenExpiry();

    await this.repository.createRefreshToken(
      normalizedUser.id,
      refreshToken,
      refreshTokenExpiresAt,
    );

    return this.buildSession(normalizedUser, false, refreshToken, refreshTokenExpiresAt);
  }

  private buildSession(
    user: AuthIdentityRecord,
    isNewUser: boolean,
    refreshToken: string,
    refreshTokenExpiresAt: string,
  ): AuthSession {
    const normalizedUser: AuthIdentityRecord = {
      ...user,
      needsOnboarding: isNewUser || user.needsOnboarding,
    };
    const accessToken = createAccessToken(
      {
        sub: normalizedUser.id,
        phone: normalizedUser.phone,
        authMethod: normalizedUser.authMethod,
        needsOnboarding: normalizedUser.needsOnboarding,
      },
      getAuthSecret(),
    );

    return {
      accessToken: accessToken.token,
      refreshToken,
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshTokenExpiresAt,
      user: mapUser(normalizedUser),
    };
  }
}

export function getAuthService(): AuthService {
  return new AuthService();
}

export function getNextPathFromAccessToken(accessToken: string) {
  const payload = readAccessTokenPayload<AccessTokenPayload>(accessToken);
  if (!payload) {
    return AUTH_ROUTE_PATHS.register;
  }
  return getNextPath(Boolean(payload.needsOnboarding));
}
