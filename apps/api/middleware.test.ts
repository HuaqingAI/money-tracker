import { describe, expect, it, vi } from 'vitest';

import { createAccessToken, createSignedToken } from './lib/auth/token';
import { config, middleware } from './middleware';

const secret = 'test-jwt-secret';

function createRequest(path: string, token?: string): Request {
  const headers = token
    ? {
        authorization: `Bearer ${token}`,
      }
    : undefined;

  return new Request(`https://example.com${path}`, { headers });
}

function pathMatchesMiddleware(path: string): boolean {
  const matcher = config.matcher[0];
  if (!matcher) {
    throw new Error('middleware matcher is not configured');
  }

  const pattern = new RegExp(`^${matcher.replace(':path*', '.*')}$`);
  return pattern.test(path);
}

async function readJson(response: Response): Promise<unknown> {
  return response.json() as Promise<unknown>;
}

describe('api auth middleware', () => {
  it('rejects protected API requests without a bearer token', async () => {
    const response = await middleware(createRequest('/api/user/profile') as never);

    expect(response.status).toBe(401);
    await expect(readJson(response)).resolves.toEqual({
      success: false,
      error: {
        code: 'AUTH_UNAUTHORIZED',
        message: '缺少有效的 Bearer Token',
      },
    });
  });

  it('rejects expired app-issued access tokens with the unified API error shape', async () => {
    vi.stubEnv('JWT_SECRET', secret);
    const { token } = createSignedToken(
      {
        authMethod: 'otp',
        needsOnboarding: false,
        phone: '13812345678',
        sub: 'user-1',
        type: 'access',
      },
      secret,
      -60,
    );

    const response = await middleware(
      createRequest('/api/billing/transactions', token) as never,
    );

    expect(response.status).toBe(401);
    await expect(readJson(response)).resolves.toEqual({
      success: false,
      error: {
        code: 'AUTH_UNAUTHORIZED',
        message: '登录态无效或已过期',
      },
    });
  });

  it('allows protected API requests with a valid app-issued access token', async () => {
    vi.stubEnv('JWT_SECRET', secret);
    const { token } = createAccessToken(
      {
        authMethod: 'otp',
        needsOnboarding: false,
        phone: '13812345678',
        sub: 'user-1',
        type: 'access',
      },
      secret,
    );

    const response = await middleware(
      createRequest('/api/dashboard/monthly-summary', token) as never,
    );

    expect(response.status).not.toBe(401);
  });

  it('does not match auth routes so refresh and login endpoints stay public', () => {
    expect(pathMatchesMiddleware('/api/auth/otp-send')).toBe(false);
    expect(pathMatchesMiddleware('/api/auth/refresh')).toBe(false);
  });

  it('does not match the health check route', () => {
    expect(pathMatchesMiddleware('/api/health')).toBe(false);
  });

  it('does not match public notification rule config used before login', () => {
    expect(pathMatchesMiddleware('/api/config/notification-rules')).toBe(false);
  });

  it('matches admin CSV rules so the route has app JWT plus admin-token protection', () => {
    expect(pathMatchesMiddleware('/api/admin/csv-rules')).toBe(true);
  });
});
