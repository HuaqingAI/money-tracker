import {
  isDuplicateNotificationCapture,
  normalizeNotificationCapture,
  type NotificationCapture,
} from '@money-tracker/shared';

const captureStore = new Map<string, NotificationCapture[]>();

function resolveDeviceKey(deviceId?: string): string {
  return deviceId?.trim() || 'anonymous-device';
}

export function resetCaptureStore(): void {
  captureStore.clear();
}

export function storeNotificationCapture(
  capture: NotificationCapture,
  deviceId?: string,
): { duplicate: boolean; normalized: NotificationCapture } {
  const normalized = normalizeNotificationCapture(capture);
  const deviceKey = resolveDeviceKey(deviceId);
  const existing = captureStore.get(deviceKey) ?? [];
  const duplicate = isDuplicateNotificationCapture(existing, normalized);

  if (!duplicate) {
    existing.push(normalized);
    captureStore.set(deviceKey, existing);
  }

  return {
    duplicate,
    normalized,
  };
}
