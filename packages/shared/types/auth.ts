import type { AuthRoutePath } from '../constants/auth';

export type AuthMethod = 'otp' | 'wechat';

export interface AuthUser {
  id: string;
  phone: string | null;
  displayName: string | null;
  consentAt: string | null;
  lastSignInAt: string | null;
  authMethod: AuthMethod;
  needsOnboarding: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: AuthUser;
}

export interface SendOtpResult {
  challengeId: string;
  resendAfterSeconds: number;
  expiresAt: string;
  devCode?: string;
}

export interface VerifyOtpResult {
  session: AuthSession;
  nextPath: AuthRoutePath;
}

export interface RefreshSessionResult {
  session: AuthSession;
  nextPath: AuthRoutePath;
}

export interface WechatCallbackResult {
  featureEnabled: boolean;
  nextPath?: AuthRoutePath;
  session?: AuthSession;
}
