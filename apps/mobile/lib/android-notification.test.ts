import { beforeEach, describe, expect, it, vi } from 'vitest';

const { openSettingsMock } = vi.hoisted(() => ({
  openSettingsMock: vi.fn(),
}));

vi.mock('expo-linking', () => ({
  openSettings: openSettingsMock,
}));

vi.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        apiUrl: 'http://localhost:3000',
      },
    },
    platform: {
      android: {
        model: 'Mi 13',
      },
    },
  },
}));

import {
  extractAndUploadNotification,
  fetchRemoteNotificationRules,
  getAndroidDeviceProfile,
  getNotificationPermissionStatus,
  openNotificationListenerSettings,
} from './android-notification';

describe('android notification helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('returns a fallback disabled permission state', async () => {
    await expect(getNotificationPermissionStatus()).resolves.toBe('disabled');
  });

  it('opens the system settings page', async () => {
    await openNotificationListenerSettings();
    expect(openSettingsMock).toHaveBeenCalledOnce();
  });

  it('loads remote rules when the api responds', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          version: '2026-04-24.9',
          updatedAt: '2026-04-24T08:00:00.000Z',
          rules: [
            {
              id: 'remote',
              platform: 'alipay',
              packageNames: ['com.eg.android.AlipayGphone'],
              titleKeywords: ['支付宝'],
              textPattern: '(?<amount>\\d+\\.\\d{2})元.*?(?<merchant>[^，]+)',
              timeStrategy: 'posted-at',
            },
          ],
        },
      }),
    } as Response);

    await expect(fetchRemoteNotificationRules()).resolves.toEqual({
      version: '2026-04-24.9',
      updatedAt: '2026-04-24T08:00:00.000Z',
      rules: [
        {
          id: 'remote',
          platform: 'alipay',
          packageNames: ['com.eg.android.AlipayGphone'],
          titleKeywords: ['支付宝'],
          textPattern: '(?<amount>\\d+\\.\\d{2})元.*?(?<merchant>[^，]+)',
          timeStrategy: 'posted-at',
        },
      ],
    });
  });

  it('extracts and uploads a structured notification payload', async () => {
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            version: '2026-04-24.9',
            updatedAt: '2026-04-24T08:00:00.000Z',
            rules: [
              {
                id: 'remote',
                platform: 'alipay',
                packageNames: ['com.eg.android.AlipayGphone'],
                titleKeywords: ['支付宝'],
                textPattern:
                  '支付宝.*?(?<amount>\\d+\\.\\d{2})元.*?商户[:：]?(?<merchant>[^，]+)',
                timeStrategy: 'posted-at',
              },
            ],
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
        }),
      } as Response);

    const capture = await extractAndUploadNotification(
      {
        packageName: 'com.eg.android.AlipayGphone',
        title: '支付宝',
        text: '支付宝到账18.80元，商户：7-Eleven',
        postedAt: '2026-04-24T05:20:00.000Z',
      },
      'android-xiaomi-1',
    );

    expect(capture).toEqual({
      amountCents: 1880,
      merchantName: '7-Eleven',
      platform: 'alipay',
      transactionTime: '2026-04-24T05:20:00.000Z',
    });
    expect(vi.mocked(globalThis.fetch)).toHaveBeenLastCalledWith(
      'http://localhost:3000/api/billing/capture',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );
  });

  it('returns a stable mock device profile', async () => {
    await expect(getAndroidDeviceProfile()).resolves.toEqual({
      manufacturer: 'Xiaomi',
      model: 'Mi 13',
      osName: 'Android',
    });
  });
});
