import {
  type ApiResponse,
  type NotificationCaptureResult,
  notificationCaptureResultSchema,
  notificationCaptureUploadSchema,
} from '@money-tracker/shared';
import { type NextRequest, NextResponse } from 'next/server';

import { storeNotificationCapture } from '../../../../lib/capture-store';
import { withRequestLogging } from '../../../../lib/middleware/request-logger';

export function POST(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async ({ logger }) => {
    const parsedBody = notificationCaptureUploadSchema.parse(
      await request.json(),
    );

    const storedCapture = storeNotificationCapture(
      parsedBody.capture,
      parsedBody.deviceId,
    );

    const data = notificationCaptureResultSchema.parse({
      duplicate: storedCapture.duplicate,
      normalized: storedCapture.normalized,
      receivedAt: new Date().toISOString(),
    });

    logger.info(
      {
        duplicate: data.duplicate,
        platform: data.normalized.platform,
        amountCents: data.normalized.amountCents,
      },
      'billing:capture:accepted',
    );

    const body: ApiResponse<NotificationCaptureResult> = {
      success: true,
      data,
    };

    return NextResponse.json(body, {
      status: storedCapture.duplicate ? 200 : 201,
    });
  });
}
