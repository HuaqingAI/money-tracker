import { randomUUID } from 'node:crypto';

import type {
  AuthIdentityRecord,
  AuthRepository,
  OtpChallengeRecord,
  RefreshTokenRecord,
} from './types';

class InMemoryAuthRepository implements AuthRepository {
  private readonly otpChallenges = new Map<string, OtpChallengeRecord>();
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
    this.otpChallenges.set(phone, record);
    return record;
  }

  async getOtpChallengeByPhone(phone: string): Promise<OtpChallengeRecord | null> {
    return this.otpChallenges.get(phone) ?? null;
  }

  async consumeOtpChallenge(id: string): Promise<void> {
    for (const [phone, record] of this.otpChallenges.entries()) {
      if (record.id === id) {
        this.otpChallenges.delete(phone);
        return;
      }
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
}

const globalRepository = new InMemoryAuthRepository();

export function getAuthRepository(): AuthRepository {
  return globalRepository;
}
