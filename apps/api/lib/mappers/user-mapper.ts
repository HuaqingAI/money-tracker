import type { Database, LoginMethod, UserProfile } from '@money-tracker/shared';
import { maskPhoneNumber } from '@money-tracker/shared';
import type { User } from '@supabase/supabase-js';

type UserProfileRow = Database['auth']['Tables']['user_profiles']['Row'];

function includesWechat(value: string): boolean {
  return value.includes('wechat');
}

function inferLoginMethod(user: User): LoginMethod {
  const provider = String(user.app_metadata?.provider ?? '').toLowerCase();
  const providers = Array.isArray(user.app_metadata?.providers)
    ? user.app_metadata.providers
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.toLowerCase())
    : [];

  if (
    provider === 'phone' ||
    providers.includes('phone') ||
    (typeof user.phone === 'string' && user.phone.length > 0)
  ) {
    return 'phone';
  }

  if (
    includesWechat(provider) ||
    providers.some((item: string) => includesWechat(item))
  ) {
    return 'wechat';
  }

  return 'unknown';
}

export function mapUserProfile(
  authUser: User,
  profileRow: UserProfileRow | null,
): UserProfile {
  const userMetadata =
    authUser.user_metadata && typeof authUser.user_metadata === 'object'
      ? authUser.user_metadata
      : null;

  const metadataNickname =
    userMetadata && typeof userMetadata.nickname === 'string'
      ? userMetadata.nickname
      : null;
  const metadataAvatarUrl =
    userMetadata && typeof userMetadata.avatar_url === 'string'
      ? userMetadata.avatar_url
      : null;

  return {
    userId: authUser.id,
    nickname: profileRow?.nickname ?? metadataNickname,
    avatarUrl: profileRow?.avatar_url ?? metadataAvatarUrl,
    maskedPhoneNumber: maskPhoneNumber(authUser.phone),
    loginMethod: inferLoginMethod(authUser),
    consentAt: profileRow?.consent_at ?? authUser.created_at ?? null,
    createdAt: profileRow?.created_at ?? authUser.created_at ?? null,
    updatedAt: profileRow?.updated_at ?? authUser.updated_at ?? null,
  };
}
