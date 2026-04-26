import {
  defaultNotificationRuleSet,
  extractNotificationCapture,
  type NotificationCapture,
  type NotificationEnvelope,
  type NotificationRuleSet,
  notificationRuleSetSchema,
} from '@money-tracker/shared';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

import localNotificationRules from '../config/notification-patterns.json';

export type NotificationPermissionStatus = 'unknown' | 'disabled' | 'enabled';

export interface AndroidDeviceProfile {
  manufacturer: string;
  model: string;
  osName: string;
}

const fallbackDeviceProfile: AndroidDeviceProfile = {
  manufacturer: 'Xiaomi',
  model: '13',
  osName: 'Android',
};

function resolveApiBaseUrl(): string | null {
  const configuredApiUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (Constants.expoConfig?.extra?.apiUrl as string | undefined);

  return configuredApiUrl ? configuredApiUrl.replace(/\/$/u, '') : null;
}

export async function fetchRemoteNotificationRules(): Promise<NotificationRuleSet> {
  const apiBaseUrl = resolveApiBaseUrl();

  if (!apiBaseUrl) {
    return notificationRuleSetSchema.parse(localNotificationRules);
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/config/notification-rules`);
    const payload = (await response.json()) as {
      success: boolean;
      data?: NotificationRuleSet;
    };

    if (response.ok && payload.success && payload.data) {
      return notificationRuleSetSchema.parse(payload.data);
    }
  } catch {
    return notificationRuleSetSchema.parse(localNotificationRules);
  }

  return defaultNotificationRuleSet;
}

export async function uploadStructuredCapture(
  capture: NotificationCapture,
  deviceId: string,
): Promise<void> {
  const apiBaseUrl = resolveApiBaseUrl();

  if (!apiBaseUrl) {
    return;
  }

  await fetch(`${apiBaseUrl}/api/billing/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      capture,
      deviceId,
      capturedAt: new Date().toISOString(),
    }),
  });
}

export async function getAndroidDeviceProfile(): Promise<AndroidDeviceProfile> {
  const expoDeviceName =
    Constants.platform?.android?.model || fallbackDeviceProfile.model;

  return {
    manufacturer: fallbackDeviceProfile.manufacturer,
    model: expoDeviceName,
    osName: fallbackDeviceProfile.osName,
  };
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  return 'disabled';
}

export async function openNotificationListenerSettings(): Promise<void> {
  await Linking.openSettings();
}

export async function extractAndUploadNotification(
  envelope: NotificationEnvelope,
  deviceId = 'mock-device',
): Promise<NotificationCapture | null> {
  const rules = await fetchRemoteNotificationRules();
  const capture = extractNotificationCapture(envelope, rules);

  if (!capture) {
    return null;
  }

  await uploadStructuredCapture(capture, deviceId);
  return capture;
}
