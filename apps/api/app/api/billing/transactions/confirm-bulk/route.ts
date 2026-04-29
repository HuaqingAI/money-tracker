import {
  BILLING_CONFIRMATION_ERROR_CODES,
  confirmBulkTransactionsInputSchema,
  type ConfirmBulkTransactionsResult,
} from '@money-tracker/shared';
import type { NextRequest } from 'next/server';

import { errorResponse, successResponse } from '../../../../../lib/api-response';
import { BillingConfirmationError } from '../../../../../lib/billing/confirmation-error';
import { getConfirmationService } from '../../../../../lib/billing/confirmation-service';
import {
  type RequestLogContext,
  withRequestLogging,
} from '../../../../../lib/middleware/request-logger';
import {
  AuthenticatedUserError,
  requireAuthenticatedUser,
} from '../../../../../lib/middleware/require-authenticated-user';

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

  logger?.error({ err: error }, 'billing:confirm-bulk:error');
  return errorResponse(
    BILLING_CONFIRMATION_ERROR_CODES.confirmationFailed,
    '批量确认失败，请稍后重试',
    500,
  );
}

async function parseRequest(request: Request): Promise<
  | { success: true; transactionIds: string[] }
  | { success: false; response: Response }
> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: errorResponse(
        BILLING_CONFIRMATION_ERROR_CODES.invalidConfirmationRequest,
        '请求体必须是合法 JSON',
        400,
      ),
    };
  }

  const parsed = confirmBulkTransactionsInputSchema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      response: errorResponse(
        BILLING_CONFIRMATION_ERROR_CODES.invalidConfirmationRequest,
        parsed.error.issues[0]?.message ?? '请求参数不合法',
        400,
      ),
    };
  }

  return {
    success: true,
    transactionIds: parsed.data.transactionIds,
  };
}

export function POST(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async ({ logger }) => {
    try {
      const parsed = await parseRequest(request);
      if (!parsed.success) {
        return parsed.response;
      }

      const { user } = await requireAuthenticatedUser(request);
      const result = await getConfirmationService().confirmBulk({
        transactionIds: parsed.transactionIds,
        userId: user.id,
      });
      return successResponse<ConfirmBulkTransactionsResult>(result);
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  });
}
