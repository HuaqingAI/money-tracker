import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED';

interface AppAccessTokenPayload extends Record<string, unknown> {
  authMethod: 'otp' | 'wechat';
  exp: number;
  iat: number;
  sub: string;
  type?: 'access';
}

function getAuthSecret(): string {
  return process.env.SUPABASE_JWT_SECRET ?? process.env.JWT_SECRET ?? 'dev-jwt-secret';
}

function createUnauthorizedResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: AUTH_UNAUTHORIZED,
        message,
      },
    },
    { status: 401 },
  );
}

function extractBearerToken(request: NextRequest): string | null {
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

function decodeBase64UrlToJson(value: string): Record<string, unknown> | null {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const paddingLength = (4 - (normalized.length % 4 || 4)) % 4;
    const padded = normalized + '='.repeat(paddingLength);
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function encodeBase64Url(bytes: ArrayBuffer): string {
  const byteArray = new Uint8Array(bytes);
  let binary = '';
  for (const byte of byteArray) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function verifySignature(
  encodedHeader: string,
  encodedPayload: string,
  encodedSignature: string,
  secret: string,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
  );

  return encodeBase64Url(signature) === encodedSignature;
}

function isAppAccessTokenPayload(
  payload: Record<string, unknown> | null,
): payload is AppAccessTokenPayload {
  return (
    typeof payload?.sub === 'string' &&
    typeof payload.iat === 'number' &&
    typeof payload.exp === 'number' &&
    (payload.authMethod === 'otp' || payload.authMethod === 'wechat') &&
    (payload.type === undefined || payload.type === 'access')
  );
}

async function verifyAppAccessToken(token: string, now = new Date()): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    return false;
  }

  const payload = decodeBase64UrlToJson(encodedPayload);
  if (!isAppAccessTokenPayload(payload) || payload.exp * 1000 <= now.getTime()) {
    return false;
  }

  return verifySignature(
    encodedHeader,
    encodedPayload,
    encodedSignature,
    getAuthSecret(),
  );
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const accessToken = extractBearerToken(request);
  if (!accessToken) {
    return createUnauthorizedResponse('缺少有效的 Bearer Token');
  }

  const isValid = await verifyAppAccessToken(accessToken);
  if (!isValid) {
    return createUnauthorizedResponse('登录态无效或已过期');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/((?!auth(?:/.*)?$|health$|config/notification-rules$).*)'],
};

