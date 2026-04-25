import type { AuthMethod, AuthSession } from '@money-tracker/shared';

export interface AuthIdentityRecord {
  id: string;
  phone: string | null;
  displayName: string | null;
  consentAt: string | null;
  lastSignInAt: string | null;
  authMethod: AuthMethod;
  needsOnboarding: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OtpChallengeRecord {
  id: string;
  phone: string;
  code: string;
  createdAt: string;
  expiresAt: string;
  resendAvailableAt: string;
}

export interface RefreshTokenRecord {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface AuthRepository {
  createOtpChallenge(phone: string, code: string, now: Date): Promise<OtpChallengeRecord>;
  getOtpChallengeById(id: string): Promise<OtpChallengeRecord | null>;
  getOtpChallengeByPhone(phone: string): Promise<OtpChallengeRecord | null>;
  consumeOtpChallenge(id: string): Promise<void>;
  getUserByPhone(phone: string): Promise<AuthIdentityRecord | null>;
  getUserById(userId: string): Promise<AuthIdentityRecord | null>;
  upsertPhoneUser(params: {
    phone: string;
    consentAt: string;
    displayName?: string | undefined;
    now: Date;
  }): Promise<{ user: AuthIdentityRecord; isNewUser: boolean }>;
  createRefreshToken(userId: string, token: string, expiresAt: string): Promise<void>;
  getRefreshToken(token: string): Promise<RefreshTokenRecord | null>;
  revokeRefreshToken(token: string): Promise<void>;
  replaceRefreshToken(params: {
    currentToken: string;
    userId: string;
    newToken: string;
    expiresAt: string;
    now: Date;
  }): Promise<boolean>;
}

export interface IssueSessionResult {
  session: AuthSession;
  isNewUser: boolean;
}

export interface WechatCallbackParams {
  code: string;
  state?: string | undefined;
  consentAccepted: boolean;
}

export interface WechatCallbackResponse {
  featureEnabled: boolean;
  session?: AuthSession;
  isNewUser?: boolean;
}
