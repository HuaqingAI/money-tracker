import type { User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

import { getSupabaseAdmin } from '@/db/supabase-admin';

export class AuthenticatedUserError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'AuthenticatedUserError';
  }
}

export interface AuthenticatedUserContext {
  accessToken: string;
  user: User;
}

export function extractBearerToken(request: Request | NextRequest): string | null {
  const authorization = request.headers.get('authorization');

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

export async function requireAuthenticatedUser(
  request: Request | NextRequest,
): Promise<AuthenticatedUserContext> {
  const accessToken = extractBearerToken(request);

  if (!accessToken) {
    throw new AuthenticatedUserError(
      'AUTH_UNAUTHORIZED',
      401,
      '缺少有效的 Bearer Token',
    );
  }

  const { data, error } = await getSupabaseAdmin().auth.getUser(accessToken);

  if (error || !data.user) {
    throw new AuthenticatedUserError(
      'AUTH_UNAUTHORIZED',
      401,
      '登录态无效或已过期',
    );
  }

  return {
    accessToken,
    user: data.user,
  };
}
