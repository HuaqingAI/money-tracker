import type { User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

import { getSupabaseAdmin } from '@/db/supabase-admin';

import { getAuthRepository } from '../auth/repository';
import { verifyAccessTokenPayload } from '../auth/token';

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

interface AppAccessTokenPayload extends Record<string, unknown> {
  sub: string;
  phone: string | null;
  authMethod: 'otp' | 'wechat';
}

function getAuthSecret(): string {
  return process.env.SUPABASE_JWT_SECRET ?? process.env.JWT_SECRET ?? 'dev-jwt-secret';
}

function isAppAccessTokenPayload(
  payload: Record<string, unknown> | null,
): payload is AppAccessTokenPayload {
  return (
    typeof payload?.sub === 'string' &&
    (typeof payload.phone === 'string' || payload.phone === null) &&
    (payload.authMethod === 'otp' || payload.authMethod === 'wechat')
  );
}

function getAuthProvider(authMethod: AppAccessTokenPayload['authMethod']): 'phone' | 'wechat' {
  return authMethod === 'wechat' ? 'wechat' : 'phone';
}

function createAppUser(input: {
  authMethod: AppAccessTokenPayload['authMethod'];
  avatarUrl?: string | null | undefined;
  birthday?: string | null | undefined;
  createdAt: string;
  displayName?: string | null | undefined;
  gender?: string | null | undefined;
  phone: string | null;
  updatedAt: string;
  userId: string;
}): User {
  const provider = getAuthProvider(input.authMethod);

  return {
    app_metadata: {
      app_auth: true,
      provider,
      providers: [provider],
    },
    aud: 'authenticated',
    created_at: input.createdAt,
    id: input.userId,
    phone: input.phone ?? undefined,
    updated_at: input.updatedAt,
    user_metadata: {
      avatar_url: input.avatarUrl ?? null,
      birthday: input.birthday ?? null,
      gender: input.gender ?? null,
      nickname: input.displayName ?? null,
    },
  } as User;
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

  const appPayload = verifyAccessTokenPayload<AppAccessTokenPayload>(
    accessToken,
    getAuthSecret(),
  );
  if (isAppAccessTokenPayload(appPayload)) {
    const authRecord = await getAuthRepository().getUserById(appPayload.sub);
    if (authRecord) {
      return {
        accessToken,
        user: createAppUser({
          authMethod: authRecord.authMethod,
          avatarUrl: authRecord.avatarUrl,
          birthday: authRecord.birthday,
          createdAt: authRecord.createdAt,
          displayName: authRecord.displayName,
          gender: authRecord.gender,
          phone: authRecord.phone,
          updatedAt: authRecord.updatedAt,
          userId: authRecord.id,
        }),
      };
    }

    const issuedAt =
      typeof appPayload.iat === 'number'
        ? new Date(appPayload.iat * 1000).toISOString()
        : new Date().toISOString();

    return {
      accessToken,
      user: createAppUser({
        authMethod: appPayload.authMethod,
        createdAt: issuedAt,
        phone: appPayload.phone,
        updatedAt: issuedAt,
        userId: appPayload.sub,
      }),
    };
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
