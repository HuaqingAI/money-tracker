import type { UpdateUserProfileInput, UserProfile } from '@money-tracker/shared';
import type { User } from '@supabase/supabase-js';

import { getAuthRepository } from '../auth/repository';
import type { AuthIdentityRecord } from '../auth/types';
import { userRepository } from '../db/repositories/user-repo';
import { mapUserProfile } from '../mappers/user-mapper';

const optionalCleanupHandlers: ReadonlyArray<(userId: string) => Promise<void>> = [];

function mapAuthRecordToUser(authUser: User, record: AuthIdentityRecord): User {
  return {
    ...authUser,
    app_metadata: {
      ...authUser.app_metadata,
      app_auth: true,
      provider: record.authMethod === 'wechat' ? 'wechat' : 'phone',
      providers: [record.authMethod === 'wechat' ? 'wechat' : 'phone'],
    },
    phone: record.phone ?? undefined,
    updated_at: record.updatedAt,
    user_metadata: {
      ...(authUser.user_metadata ?? {}),
      avatar_url: record.avatarUrl ?? null,
      birthday: record.birthday ?? null,
      gender: record.gender ?? null,
      nickname: record.displayName,
    },
  };
}

function isAppAuthUser(authUser: User): boolean {
  return authUser.app_metadata?.app_auth === true;
}

function getAuthMethod(authUser: User): AuthIdentityRecord['authMethod'] {
  return authUser.app_metadata?.provider === 'wechat' ? 'wechat' : 'otp';
}

export async function getUserProfile(authUser: User): Promise<UserProfile> {
  let profileRow: Awaited<ReturnType<typeof userRepository.getUserProfileByUserId>> = null;
  try {
    profileRow = await userRepository.getUserProfileByUserId(authUser.id);
  } catch {
    profileRow = null;
  }

  return mapUserProfile(authUser, profileRow);
}

export async function updateUserProfile(
  authUser: User,
  input: UpdateUserProfileInput,
): Promise<UserProfile> {
  let existingProfile: Awaited<ReturnType<typeof userRepository.getUserProfileByUserId>> =
    null;
  try {
    existingProfile = await userRepository.getUserProfileByUserId(authUser.id);
  } catch {
    existingProfile = null;
  }

  const consentAt =
    existingProfile?.consent_at ?? authUser.created_at ?? new Date().toISOString();
  const updatedAuthRecord = await getAuthRepository().updateUserProfile(authUser.id, {
    avatarUrl: input.avatarUrl,
    birthday: input.birthday,
    displayName: input.nickname,
    gender: input.gender,
    now: new Date(),
  });
  let updatedAuthUser = updatedAuthRecord
    ? mapAuthRecordToUser(authUser, updatedAuthRecord)
    : authUser;

  if (!updatedAuthRecord && isAppAuthUser(authUser)) {
    updatedAuthUser = mapAuthRecordToUser(
      authUser,
      await getAuthRepository().upsertUserProfileSnapshot({
        userId: authUser.id,
        phone: authUser.phone ?? null,
        authMethod: getAuthMethod(authUser),
        consentAt,
        displayName: input.nickname,
        avatarUrl: input.avatarUrl,
        gender: input.gender,
        birthday: input.birthday,
        createdAt: authUser.created_at ?? new Date().toISOString(),
        now: new Date(),
      }),
    );
  } else if (!updatedAuthRecord) {
    updatedAuthUser = await userRepository.updateAuthUserMetadata(authUser.id, {
      ...(authUser.user_metadata ?? {}),
      avatar_url: input.avatarUrl,
      birthday: input.birthday,
      gender: input.gender,
      nickname: input.nickname,
    });
  }

  try {
    existingProfile = await userRepository.saveUserProfile({
      userId: authUser.id,
      nickname: input.nickname,
      avatarUrl: input.avatarUrl,
      gender: input.gender,
      birthday: input.birthday,
      consentAt,
    });
  } catch {
    existingProfile = null;
  }

  return mapUserProfile(updatedAuthUser, existingProfile);
}

export async function deleteUserAccount(authUser: User): Promise<void> {
  for (const cleanup of optionalCleanupHandlers) {
    await cleanup(authUser.id);
  }

  await userRepository.deleteUserById(authUser.id);
}
