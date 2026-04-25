import type { Database } from '@money-tracker/shared';

import { getSupabaseAdmin } from '../supabase-admin';

type UserProfileRow = Database['auth']['Tables']['user_profiles']['Row'];

export interface SaveUserProfileInput {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  consentAt: string;
}

export class UserRepository {
  async getUserProfileByUserId(userId: string): Promise<UserProfileRow | null> {
    const { data, error } = await getSupabaseAdmin()
      .schema('auth')
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load user profile: ${error.message}`);
    }

    return data;
  }

  async saveUserProfile(input: SaveUserProfileInput): Promise<UserProfileRow> {
    const { data, error } = await getSupabaseAdmin()
      .schema('auth')
      .from('user_profiles')
      .upsert(
        {
          user_id: input.userId,
          nickname: input.nickname,
          avatar_url: input.avatarUrl,
          consent_at: input.consentAt,
        },
        {
          onConflict: 'user_id',
        },
      )
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to save user profile: ${error.message}`);
    }

    return data;
  }

  async deleteUserById(userId: string): Promise<void> {
    const { error } = await getSupabaseAdmin().auth.admin.deleteUser(userId, false);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

export const userRepository = new UserRepository();
