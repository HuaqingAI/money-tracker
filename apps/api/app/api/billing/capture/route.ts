import {
  type ApiResponse,
  type NotificationCaptureResult,
  notificationCaptureResultSchema,
  notificationCaptureUploadSchema,
} from '@money-tracker/shared';
import { type NextRequest, NextResponse } from 'next/server';

import { parseJsonRequest } from '../../../../lib/api/request-body';
import { errorResponse } from '../../../../lib/api-response';
import { notificationCaptureRepository } from '../../../../lib/db/repositories/notification-capture-repo';
import { withRequestLogging } from '../../../../lib/middleware/request-logger';
import {
  AuthenticatedUserError,
  requireAuthenticatedUser,
} from '../../../../lib/middleware/require-authenticated-user';

function toErrorResponse(error: unknown): Response {
  const authError =
    error instanceof AuthenticatedUserError ||
    (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'status' in error &&
      typeof error.code === 'string' &&
      typeof error.status === 'number'
    );

  if (authError) {
    const { code, message, status } = error as AuthenticatedUserError;
    return errorResponse(code, message, status);
  }

  return errorResponse(
    'NOTIFICATION_CAPTURE_FAILED',
    'Failed to store notification capture.',
    500,
  );
}

export function POST(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async ({ logger }) => {
    try {
      const { user } = await requireAuthenticatedUser(request);
      const parsedBody = await parseJsonRequest(
        request,
        notificationCaptureUploadSchema,
      );

      if (!parsedBody.success) {
        return parsedBody.response;
      }

      const storedCapture = await notificationCaptureRepository.store({
        capture: parsedBody.data.capture,
        capturedAt: parsedBody.data.capturedAt,
        deviceId: parsedBody.data.deviceId,
        userId: user.id,
      });

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
          userId: user.id,
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
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
