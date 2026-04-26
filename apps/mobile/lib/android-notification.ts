import {
  type ApiResponse,
  defaultNotificationRuleSet,
  extractNotificationCapture,
  type NotificationCapture,
  type NotificationCaptureResult,
  type NotificationEnvelope,
  type NotificationRuleSet,
  notificationRuleSetSchema,
} from '@money-tracker/shared';
import Constants from 'expo-constants';
import { Linking, NativeModules, Platform } from 'react-native';

import localNotificationRules from '../config/notification-patterns.json';

export type NotificationPermissionStatus = 'unknown' | 'disabled' | 'enabled';

export interface AndroidDeviceProfile {
  manufacturer: string;
  model: string;
  osName: string;
}

const fallbackDeviceProfile: AndroidDeviceProfile = {
  manufacturer: 'Android',
  model: 'Device',
  osName: 'Android',
};

interface NotificationListenerNativeModule {
  getPermissionStatus?: () => Promise<NotificationPermissionStatus>;
}

function getNotificationListenerNativeModule(): NotificationListenerNativeModule | null {
  return (
    (NativeModules.NotificationListenerSettings as NotificationListenerNativeModule | undefined) ??
    null
  );
}

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
  accessToken?: string | null,
): Promise<void> {
  const apiBaseUrl = resolveApiBaseUrl();

  if (!apiBaseUrl) {
    return;
  }

  if (!accessToken) {
    throw new Error('Cannot upload notification capture without an access token.');
  }

  const response = await fetch(`${apiBaseUrl}/api/billing/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      capture,
      deviceId,
      capturedAt: new Date().toISOString(),
    }),
  });

  let payload: ApiResponse<NotificationCaptureResult>;
  try {
    payload = (await response.json()) as ApiResponse<NotificationCaptureResult>;
  } catch {
    throw new Error('Notification capture upload returned an invalid response.');
  }

  if (!response.ok || !payload.success) {
    const message = payload.success
      ? 'Notification capture upload failed.'
      : payload.error.message;
    throw new Error(message);
  }
}

export async function getAndroidDeviceProfile(): Promise<AndroidDeviceProfile> {
  if (Platform.OS !== 'android') {
    return fallbackDeviceProfile;
  }

  const androidConstants = Platform.constants as typeof Platform.constants & {
    Brand?: string;
    Manufacturer?: string;
    Model?: string;
    Release?: string;
  };
  const manufacturer =
    androidConstants.Manufacturer ||
    androidConstants.Brand ||
    fallbackDeviceProfile.manufacturer;
  const model =
    androidConstants.Model ||
    Constants.platform?.android?.model ||
    fallbackDeviceProfile.model;

  return {
    manufacturer,
    model,
    osName: androidConstants.Release
      ? `Android ${androidConstants.Release}`
      : fallbackDeviceProfile.osName,
  };
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  const nativeModule = getNotificationListenerNativeModule();

  if (!nativeModule?.getPermissionStatus) {
    return 'unknown';
  }

  const status = await nativeModule.getPermissionStatus();
  return status === 'enabled' || status === 'disabled' ? status : 'unknown';
}

export async function openNotificationListenerSettings(): Promise<void> {
  if (Platform.OS !== 'android') {
    await Linking.openSettings();
    return;
  }

  try {
    await Linking.sendIntent('android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS');
  } catch {
    await Linking.openSettings();
  }
}

export async function extractAndUploadNotification(
  envelope: NotificationEnvelope,
  deviceId = 'mock-device',
  accessToken?: string | null,
): Promise<NotificationCapture | null> {
  const rules = await fetchRemoteNotificationRules();
  const capture = extractNotificationCapture(envelope, rules);

  if (!capture) {
    return null;
  }

  await uploadStructuredCapture(capture, deviceId, accessToken);
  return capture;
}
