import type { User } from '@supabase/supabase-js';

import { getSupabaseAdmin } from '../db/supabase-admin';

function isAppAuthUser(user: User): boolean {
  return user.app_metadata?.app_auth === true;
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' ? message : '';
  }

  return '';
}

function getErrorStatus(error: unknown): number | null {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === 'number' ? status : null;
  }

  return null;
}

function isMissingUserError(error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status === 404) {
    return true;
  }

  return getErrorMessage(error).toLowerCase().includes('not found');
}

function createSyntheticEmail(userId: string): string {
  return `app-auth+${userId}@money-tracker.local`;
}

async function userExists(userId: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin().auth.admin.getUserById(userId);

  if (data.user) {
    return true;
  }

  if (error && !isMissingUserError(error)) {
    throw new Error(`Failed to load auth user: ${error.message}`);
  }

  return false;
}

export async function ensurePersistentUser(user: User): Promise<void> {
  if (!isAppAuthUser(user)) {
    return;
  }

  if (await userExists(user.id)) {
    return;
  }

  const { error } = await getSupabaseAdmin().auth.admin.createUser({
    app_metadata: user.app_metadata,
    email: createSyntheticEmail(user.id),
    email_confirm: true,
    id: user.id,
    user_metadata: {
      ...(user.user_metadata ?? {}),
      phone: user.phone ?? null,
    },
  });

  if (!error) {
    return;
  }

  if (await userExists(user.id)) {
    return;
  }

  throw new Error(`Failed to create auth user: ${error.message}`);
}
