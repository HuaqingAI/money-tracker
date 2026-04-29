import {
  BILLING_CONFIRMATION_ERROR_CODES,
  rejectTransactionInputSchema,
  type RejectTransactionResult,
} from '@money-tracker/shared';
import type { NextRequest } from 'next/server';

import { errorResponse, successResponse } from '../../../../../../lib/api-response';
import { BillingConfirmationError } from '../../../../../../lib/billing/confirmation-error';
import { getConfirmationService } from '../../../../../../lib/billing/confirmation-service';
import {
  type RequestLogContext,
  withRequestLogging,
} from '../../../../../../lib/middleware/request-logger';
import {
  AuthenticatedUserError,
  requireAuthenticatedUser,
} from '../../../../../../lib/middleware/require-authenticated-user';

interface RouteContext {
  params: Promise<{ id: string }>;
}

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

  logger?.error({ err: error }, 'billing:reject:error');
  return errorResponse(
    BILLING_CONFIRMATION_ERROR_CODES.confirmationFailed,
    '交易修正失败，请稍后重试',
    500,
  );
}

async function parseRequest(request: Request): Promise<
  | { success: true; categoryId?: string }
  | { success: false; response: Response }
> {
  const text = await request.text();
  if (text.trim().length === 0) {
    return { success: true };
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
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

  const parsed = rejectTransactionInputSchema.safeParse(body);
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
    ...parsed.data,
  };
}

export function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  return withRequestLogging(request, async ({ logger }) => {
    try {
      const parsed = await parseRequest(request);
      if (!parsed.success) {
        return parsed.response;
      }

      const { user } = await requireAuthenticatedUser(request);
      const { id } = await context.params;
      const result = await getConfirmationService().rejectTransaction({
        ...(parsed.categoryId ? { categoryId: parsed.categoryId } : {}),
        transactionId: id,
        userId: user.id,
      });
      return successResponse<RejectTransactionResult>(result);
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  });
}
