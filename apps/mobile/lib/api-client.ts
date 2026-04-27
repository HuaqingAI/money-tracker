import type {
  ApiResponse,
  MonthlyReportSummary,
  MonthlyTrend,
  UpdateUserProfileInput,
  UserProfile,
} from '@money-tracker/shared';

import { getApiUrl } from './runtime-config';

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

function createHeaders(accessToken?: string): Record<string, string> {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  let json: unknown;

  try {
    json = await response.json();
  } catch {
    throw new ApiClientError(
      'INVALID_RESPONSE',
      response.status,
      '服务端返回了不可解析的响应',
    );
  }

  return json as ApiResponse<T>;
}

async function request<T>(
  path: string,
  options: RequestInit & { accessToken?: string },
): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers: createHeaders(options.accessToken),
  });
  const payload = await parseResponse<T>(response);

  if (!payload.success) {
    throw new ApiClientError(
      payload.error.code,
      response.status,
      payload.error.message,
    );
  }

  return payload.data;
}

export function fetchUserProfile(accessToken: string): Promise<UserProfile> {
  return request<UserProfile>('/api/user/profile', {
    accessToken,
    method: 'GET',
  });
}

export function updateProfile(
  accessToken: string,
  input: UpdateUserProfileInput,
): Promise<UserProfile> {
  return request<UserProfile>('/api/user/profile', {
    accessToken,
    body: JSON.stringify(input),
    method: 'PUT',
  });
}

export function deleteAccount(accessToken: string): Promise<{ deleted: boolean }> {
  return request<{ deleted: boolean }>('/api/user/delete-account', {
    accessToken,
    method: 'DELETE',
  });
}

export function fetchMonthlySummary(
  accessToken: string,
  month: string,
): Promise<MonthlyReportSummary> {
  return request<MonthlyReportSummary>(
    `/api/analytics/monthly-summary?month=${encodeURIComponent(month)}`,
    {
      accessToken,
      method: 'GET',
    },
  );
}

export function fetchMonthlyTrend(
  accessToken: string,
  months = 12,
  endMonth?: string,
): Promise<MonthlyTrend> {
  const params = new URLSearchParams({
    months: String(months),
  });

  if (endMonth) {
    params.set('endMonth', endMonth);
  }

  return request<MonthlyTrend>(`/api/analytics/trend?${params.toString()}`, {
    accessToken,
    method: 'GET',
  });
}
