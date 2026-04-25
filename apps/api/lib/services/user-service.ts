import type { UpdateUserProfileInput, UserProfile } from '@money-tracker/shared';
import type { User } from '@supabase/supabase-js';

import { userRepository } from '../db/repositories/user-repo';
import { mapUserProfile } from '../mappers/user-mapper';

const optionalCleanupHandlers: ReadonlyArray<(userId: string) => Promise<void>> = [];

export async function getUserProfile(authUser: User): Promise<UserProfile> {
  const profileRow = await userRepository.getUserProfileByUserId(authUser.id);
  return mapUserProfile(authUser, profileRow);
}

export async function updateUserProfile(
  authUser: User,
  input: UpdateUserProfileInput,
): Promise<UserProfile> {
  const existingProfile = await userRepository.getUserProfileByUserId(authUser.id);
  const consentAt =
    existingProfile?.consent_at ?? authUser.created_at ?? new Date().toISOString();

  const savedProfile = await userRepository.saveUserProfile({
    userId: authUser.id,
    nickname: input.nickname,
    avatarUrl: input.avatarUrl,
    consentAt,
  });

  return mapUserProfile(authUser, savedProfile);
}

export async function deleteUserAccount(authUser: User): Promise<void> {
  for (const cleanup of optionalCleanupHandlers) {
    await cleanup(authUser.id);
  }

  await userRepository.deleteUserById(authUser.id);
}
