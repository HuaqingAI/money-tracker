import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        apiUrl: 'http://localhost:3000/',
      },
      hostUri: '192.168.1.20:8081',
    },
  },
}));

import {
  fetchMonthlySummary,
  fetchMonthlyTrend,
  fetchUserProfile,
  updateProfile,
} from './api-client';

describe('api-client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('normalizes localhost API URLs for real device development', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            avatarUrl: null,
            birthday: null,
            consentAt: null,
            createdAt: null,
            gender: null,
            loginMethod: 'phone',
            maskedPhoneNumber: '138****5678',
            nickname: 'Sue',
            updatedAt: null,
            userId: 'user-1',
          },
        }),
      ),
    );

    await fetchUserProfile('access-token');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://192.168.1.20:3000/api/user/profile',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }),
        method: 'GET',
      }),
    );
  });

  it('updates profile through the configured API URL', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            avatarUrl: null,
            birthday: '1996-03-15',
            consentAt: null,
            createdAt: null,
            gender: 'female',
            loginMethod: 'phone',
            maskedPhoneNumber: '138****5678',
            nickname: 'New Name',
            updatedAt: null,
            userId: 'user-1',
          },
        }),
      ),
    );

    await updateProfile('access-token', {
      avatarUrl: null,
      birthday: '1996-03-15',
      gender: 'female',
      nickname: 'New Name',
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://192.168.1.20:3000/api/user/profile',
      expect.objectContaining({
        body: JSON.stringify({
          avatarUrl: null,
          birthday: '1996-03-15',
          gender: 'female',
          nickname: 'New Name',
        }),
        method: 'PUT',
      }),
    );
  });

  it('fetches monthly summary with bearer auth and month query', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            categories: [],
            comparisons: {
              previousMonth: null,
              yearOverYear: null,
            },
            generatedAt: '2026-04-27T00:00:00.000Z',
            month: '2026-04',
            monthEnd: '2026-05-01T00:00:00.000Z',
            monthStart: '2026-04-01T00:00:00.000Z',
            source: 'live',
            totalExpenseCents: 0,
            transactionCount: 0,
          },
        }),
      ),
    );

    await fetchMonthlySummary('access-token', '2026-04');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://192.168.1.20:3000/api/analytics/monthly-summary?month=2026-04',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }),
        method: 'GET',
      }),
    );
  });

  it('fetches monthly summary with includePending when requested', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            categories: [],
            comparisons: {
              previousMonth: null,
              yearOverYear: null,
            },
            generatedAt: '2026-04-27T00:00:00.000Z',
            month: '2026-04',
            monthEnd: '2026-05-01T00:00:00.000Z',
            monthStart: '2026-04-01T00:00:00.000Z',
            source: 'live',
            totalExpenseCents: 0,
            transactionCount: 0,
          },
        }),
      ),
    );

    await fetchMonthlySummary('access-token', '2026-04', {
      includePending: true,
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://192.168.1.20:3000/api/analytics/monthly-summary?month=2026-04&includePending=true',
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  it('fetches monthly trend with default query parameters', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            endMonth: '2026-04',
            months: 12,
            points: [],
            startMonth: '2025-05',
          },
        }),
      ),
    );

    await fetchMonthlyTrend('access-token');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://192.168.1.20:3000/api/analytics/trend?months=12',
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });
});
