import { createHmac, randomBytes } from 'node:crypto';

import {
  AUTH_ACCESS_TOKEN_TTL_SECONDS,
  AUTH_REFRESH_TOKEN_TTL_SECONDS,
} from '@money-tracker/shared';

function toBase64Url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (normalized.length % 4 || 4)) % 4;
  const padded = normalized + '='.repeat(paddingLength);
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function createSignedToken(
  payload: Record<string, unknown>,
  secret: string,
  expiresInSeconds: number,
): { token: string; expiresAt: string } {
  const header = { alg: 'HS256', typ: 'JWT' };
  const nowSeconds = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: nowSeconds,
    exp: nowSeconds + expiresInSeconds,
  };
  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(body));
  const signature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  const encodedSignature = toBase64Url(signature);

  return {
    token: `${encodedHeader}.${encodedPayload}.${encodedSignature}`,
    expiresAt: new Date((nowSeconds + expiresInSeconds) * 1000).toISOString(),
  };
}

export function createAccessToken(payload: Record<string, unknown>, secret: string) {
  return createSignedToken(payload, secret, AUTH_ACCESS_TOKEN_TTL_SECONDS);
}

export function createRefreshTokenValue(): string {
  return toBase64Url(randomBytes(32));
}

export function getRefreshTokenExpiry(now = new Date()): string {
  return new Date(
    now.getTime() + AUTH_REFRESH_TOKEN_TTL_SECONDS * 1000,
  ).toISOString();
}

export function readAccessTokenPayload<T extends Record<string, unknown>>(
  token: string,
): T | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }
  try {
    return JSON.parse(decodeBase64Url(parts[1] ?? '')) as T;
  } catch {
    return null;
  }
}
