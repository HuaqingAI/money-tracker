import {
  BILLING_CONFIRMATION_ERROR_CODES,
  type PendingConfirmationsResult,
} from '@money-tracker/shared';
import type { NextRequest } from 'next/server';

import { errorResponse, successResponse } from '../../../../lib/api-response';
import { BillingConfirmationError } from '../../../../lib/billing/confirmation-error';
import { getConfirmationService } from '../../../../lib/billing/confirmation-service';
import {
  type RequestLogContext,
  withRequestLogging,
} from '../../../../lib/middleware/request-logger';
import {
  AuthenticatedUserError,
  requireAuthenticatedUser,
} from '../../../../lib/middleware/require-authenticated-user';

function toErrorResponse(
  error: unknown,
  logger?: RequestLogContext['logger'],
): Response {
  if (error instanceof AuthenticatedUserError) {
    return errorResponse(error.code, error.message, error.status);
  }

  if (error instanceof BillingConfirmationError) {
    return errorResponse(error.code, error.message, error.status);
  }

  logger?.error({ err: error }, 'billing:pending-confirmations:error');
  return errorResponse(
    BILLING_CONFIRMATION_ERROR_CODES.pendingConfirmationsFailed,
    '待确认交易加载失败，请稍后重试',
    500,
  );
}

export function GET(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async ({ logger }) => {
    try {
      const { user } = await requireAuthenticatedUser(request);
      const result = await getConfirmationService().listPendingConfirmations(
        user.id,
      );
      return successResponse<PendingConfirmationsResult>(result);
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  });
}
