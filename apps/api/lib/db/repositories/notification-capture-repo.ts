import {
  normalizeNotificationCapture,
  type NotificationCapture,
} from '@money-tracker/shared';

import { getSupabaseAdmin } from '../supabase-admin';

const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

function resolveDeviceKey(deviceId?: string): string {
  return deviceId?.trim() || 'anonymous-device';
}

function toMerchantKey(merchantName: string): string {
  return merchantName.trim().toLowerCase();
}

export interface StoreNotificationCaptureInput {
  capture: NotificationCapture;
  capturedAt?: string | undefined;
  deviceId?: string | undefined;
  userId: string;
}

export interface StoredNotificationCapture {
  duplicate: boolean;
  normalized: NotificationCapture;
}

export class NotificationCaptureRepository {
  async store(
    input: StoreNotificationCaptureInput,
  ): Promise<StoredNotificationCapture> {
    const normalized = normalizeNotificationCapture(input.capture);
    const deviceKey = resolveDeviceKey(input.deviceId);
    const merchantKey = toMerchantKey(normalized.merchantName);
    const transactionTime = new Date(normalized.transactionTime).getTime();
    const windowStart = new Date(transactionTime - DUPLICATE_WINDOW_MS).toISOString();
    const windowEnd = new Date(transactionTime + DUPLICATE_WINDOW_MS).toISOString();
    const client = getSupabaseAdmin().schema('billing');

    const { data: existing, error: existingError } = await client
      .from('notification_captures')
      .select('id')
      .eq('user_id', input.userId)
      .eq('device_id', deviceKey)
      .eq('platform', normalized.platform)
      .eq('amount_cents', normalized.amountCents)
      .eq('merchant_key', merchantKey)
      .gte('transaction_at', windowStart)
      .lte('transaction_at', windowEnd)
      .limit(1);

    if (existingError) {
      throw new Error(`Failed to check notification capture duplicate: ${existingError.message}`);
    }

    if ((existing?.length ?? 0) > 0) {
      return {
        duplicate: true,
        normalized,
      };
    }

    const { error: insertError } = await client
      .from('notification_captures')
      .insert({
        amount_cents: normalized.amountCents,
        captured_at: input.capturedAt ?? new Date().toISOString(),
        device_id: deviceKey,
        merchant: normalized.merchantName,
        merchant_key: merchantKey,
        platform: normalized.platform,
        transaction_at: normalized.transactionTime,
        user_id: input.userId,
      });

    if (insertError) {
      throw new Error(`Failed to store notification capture: ${insertError.message}`);
    }

    return {
      duplicate: false,
      normalized,
    };
  }
}

export const notificationCaptureRepository = new NotificationCaptureRepository();
