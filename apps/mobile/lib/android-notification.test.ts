import { beforeEach, describe, expect, it, vi } from 'vitest';

const { openSettingsMock, sendIntentMock } = vi.hoisted(() => ({
  openSettingsMock: vi.fn(),
  sendIntentMock: vi.fn(),
}));

vi.mock('react-native', () => ({
  Linking: {
    openSettings: openSettingsMock,
    sendIntent: sendIntentMock,
  },
  NativeModules: {},
  Platform: {
    constants: {
      Manufacturer: 'Samsung',
      Model: 'Galaxy S24',
      Release: '15',
    },
    OS: 'android',
  },
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

  it('returns unknown when no native permission reader is installed', async () => {
    await expect(getNotificationPermissionStatus()).resolves.toBe('unknown');
  });

  it('opens the Android notification listener settings page', async () => {
    await openNotificationListenerSettings();
    expect(sendIntentMock).toHaveBeenCalledWith(
      'android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS',
    );
    expect(openSettingsMock).not.toHaveBeenCalled();
  });

  it('falls back to app settings if the notification listener intent fails', async () => {
    sendIntentMock.mockRejectedValueOnce(new Error('unsupported intent'));

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

  it('extracts and uploads a structured notification payload with auth', async () => {
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
      'android-samsung-1',
      'access-token',
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
          Authorization: 'Bearer access-token',
          'Content-Type': 'application/json',
        },
      }),
    );
  });

  it('throws when the upload response fails', async () => {
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
        ok: false,
        json: async () => ({
          success: false,
          error: {
            code: 'AUTH_UNAUTHORIZED',
            message: 'Missing token',
          },
        }),
      } as Response);

    await expect(
      extractAndUploadNotification(
        {
          packageName: 'com.eg.android.AlipayGphone',
          title: '支付宝',
          text: '支付宝到账18.80元，商户：7-Eleven',
          postedAt: '2026-04-24T05:20:00.000Z',
        },
        'android-samsung-1',
        'access-token',
      ),
    ).rejects.toThrow('Missing token');
  });

  it('returns a real Android device profile when platform constants are available', async () => {
    await expect(getAndroidDeviceProfile()).resolves.toEqual({
      manufacturer: 'Samsung',
      model: 'Galaxy S24',
      osName: 'Android 15',
    });
  });
});
