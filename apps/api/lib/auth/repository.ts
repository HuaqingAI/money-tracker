import { randomUUID } from 'node:crypto';

import type {
  AuthIdentityRecord,
  AuthRepository,
  OtpChallengeRecord,
  RefreshTokenRecord,
} from './types';

class InMemoryAuthRepository implements AuthRepository {
  private readonly otpChallengesById = new Map<string, OtpChallengeRecord>();
  private readonly otpChallengeIdsByPhone = new Map<string, string>();
  private readonly usersByPhone = new Map<string, AuthIdentityRecord>();
  private readonly refreshTokens = new Map<string, RefreshTokenRecord>();

  async createOtpChallenge(
    phone: string,
    code: string,
    now: Date,
  ): Promise<OtpChallengeRecord> {
    const createdAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
    const resendAvailableAt = new Date(now.getTime() + 60 * 1000).toISOString();
    const record: OtpChallengeRecord = {
      id: randomUUID(),
      phone,
      code,
      createdAt,
      expiresAt,
      resendAvailableAt,
    };
    const previousChallengeId = this.otpChallengeIdsByPhone.get(phone);
    if (previousChallengeId) {
      this.otpChallengesById.delete(previousChallengeId);
    }

    this.otpChallengesById.set(record.id, record);
    this.otpChallengeIdsByPhone.set(phone, record.id);
    return record;
  }

  async getOtpChallengeById(id: string): Promise<OtpChallengeRecord | null> {
    return this.otpChallengesById.get(id) ?? null;
  }

  async getOtpChallengeByPhone(phone: string): Promise<OtpChallengeRecord | null> {
    const challengeId = this.otpChallengeIdsByPhone.get(phone);
    if (!challengeId) {
      return null;
    }

    return this.otpChallengesById.get(challengeId) ?? null;
  }

  async consumeOtpChallenge(id: string): Promise<void> {
    const record = this.otpChallengesById.get(id);
    if (!record) {
      return;
    }

    this.otpChallengesById.delete(id);
    if (this.otpChallengeIdsByPhone.get(record.phone) === id) {
      this.otpChallengeIdsByPhone.delete(record.phone);
    }
  }

  async getUserByPhone(phone: string): Promise<AuthIdentityRecord | null> {
    return this.usersByPhone.get(phone) ?? null;
  }

  async getUserById(userId: string): Promise<AuthIdentityRecord | null> {
    for (const user of this.usersByPhone.values()) {
      if (user.id === userId) {
        return user;
      }
    }

    return null;
  }

  async upsertPhoneUser(params: {
    phone: string;
    consentAt: string;
    displayName?: string | undefined;
    now: Date;
  }): Promise<{ user: AuthIdentityRecord; isNewUser: boolean }> {
    const existing = this.usersByPhone.get(params.phone);
    const timestamp = params.now.toISOString();

    if (existing) {
      const updated: AuthIdentityRecord = {
        ...existing,
        displayName: params.displayName?.trim() || existing.displayName,
        consentAt: existing.consentAt ?? params.consentAt,
        lastSignInAt: timestamp,
        needsOnboarding: false,
        updatedAt: timestamp,
      };
      this.usersByPhone.set(params.phone, updated);
      return { user: updated, isNewUser: false };
    }

    const created: AuthIdentityRecord = {
      id: randomUUID(),
      phone: params.phone,
      displayName: params.displayName?.trim() || null,
      consentAt: params.consentAt,
      lastSignInAt: timestamp,
      authMethod: 'otp',
      needsOnboarding: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.usersByPhone.set(params.phone, created);
    return { user: created, isNewUser: true };
  }

  async createRefreshToken(
    userId: string,
    token: string,
    expiresAt: string,
  ): Promise<void> {
    this.refreshTokens.set(token, {
      token,
      userId,
      expiresAt,
    });
  }

  async getRefreshToken(token: string): Promise<RefreshTokenRecord | null> {
    return this.refreshTokens.get(token) ?? null;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    this.refreshTokens.delete(token);
  }

  async replaceRefreshToken(params: {
    currentToken: string;
    userId: string;
    newToken: string;
    expiresAt: string;
    now: Date;
  }): Promise<boolean> {
    const existing = this.refreshTokens.get(params.currentToken);
    if (!existing || existing.userId !== params.userId) {
      return false;
    }

    if (new Date(existing.expiresAt).getTime() <= params.now.getTime()) {
      this.refreshTokens.delete(params.currentToken);
      return false;
    }

    this.refreshTokens.delete(params.currentToken);
    this.refreshTokens.set(params.newToken, {
      token: params.newToken,
      userId: params.userId,
      expiresAt: params.expiresAt,
    });
    return true;
  }
}

const globalForAuthRepository = globalThis as typeof globalThis & {
  __moneyTrackerAuthRepository?: AuthRepository;
};

const globalRepository =
  globalForAuthRepository.__moneyTrackerAuthRepository ?? new InMemoryAuthRepository();
globalForAuthRepository.__moneyTrackerAuthRepository = globalRepository;

export function getAuthRepository(): AuthRepository {
  return globalRepository;
}
