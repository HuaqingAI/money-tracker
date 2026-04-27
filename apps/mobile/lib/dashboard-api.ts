import {
  type ApiResponse,
  DASHBOARD_RECENT_TRANSACTIONS_DEFAULT_LIMIT,
  DASHBOARD_ROUTE_PATHS,
  type MonthlySummary,
  monthlySummarySchema,
  type RecentTransactionsResult,
  recentTransactionsResultSchema,
} from '@money-tracker/shared';

import { ApiClientError } from './api-client';
import { getApiUrl } from './runtime-config';

function createHeaders(accessToken: string): Record<string, string> {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiError(value: unknown): value is { code: string; message: string } {
  return (
    isRecord(value) &&
    typeof value.code === 'string' &&
    typeof value.message === 'string'
  );
}

async function parseJsonResponse<T>(
  response: Response,
  parseData: (value: unknown) => T,
): Promise<ApiResponse<T>> {
  let json: unknown;

  try {
    json = await response.json();
  } catch {
    throw new ApiClientError(
      'INVALID_RESPONSE',
      response.status,
      response.ok ? '服务端返回了不可解析的响应' : '服务暂时不可用，请稍后重试',
    );
  }

  if (!isRecord(json) || typeof json.success !== 'boolean') {
    throw new ApiClientError(
      'INVALID_RESPONSE',
      response.status,
      response.ok ? '服务端返回了不可识别的响应' : '服务暂时不可用，请稍后重试',
    );
  }

  if (!json.success) {
    if (!isApiError(json.error)) {
      throw new ApiClientError(
        'INVALID_RESPONSE',
        response.status,
        '服务端返回了不可识别的错误响应',
      );
    }

    return {
      success: false,
      error: json.error,
    };
  }

  return {
    success: true,
    data: parseData(json.data),
  };
}

async function request<T>(
  path: string,
  accessToken: string,
  parseData: (value: unknown) => T,
): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    headers: createHeaders(accessToken),
    method: 'GET',
  });
  const payload = await parseJsonResponse(response, parseData);

  if (!payload.success) {
    throw new ApiClientError(
      payload.error.code,
      response.status,
      payload.error.message,
    );
  }

  return payload.data;
}

export function fetchMonthlySummary(
  accessToken: string,
  month: string,
): Promise<MonthlySummary> {
  const params = new URLSearchParams({ month });

  return request(
    `${DASHBOARD_ROUTE_PATHS.monthlySummary}?${params.toString()}`,
    accessToken,
    (value) => monthlySummarySchema.parse(value),
  );
}

export function fetchRecentTransactions(
  accessToken: string,
  limit = DASHBOARD_RECENT_TRANSACTIONS_DEFAULT_LIMIT,
): Promise<RecentTransactionsResult> {
  const params = new URLSearchParams({ limit: String(limit) });

  return request(
    `${DASHBOARD_ROUTE_PATHS.recentTransactions}?${params.toString()}`,
    accessToken,
    (value) => recentTransactionsResultSchema.parse(value),
  );
}

