import {
  DASHBOARD_ERROR_CODES,
  DASHBOARD_RECENT_TRANSACTIONS_DEFAULT_LIMIT,
  dashboardRecentTransactionsLimitSchema,
  type RecentTransactionsResult,
} from '@money-tracker/shared';
import type { NextRequest } from 'next/server';

import { errorResponse, successResponse } from '../../../../lib/api-response';
import { getTransactionService } from '../../../../lib/billing/transaction-service';
import {
  type RequestLogContext,
  withRequestLogging,
} from '../../../../lib/middleware/request-logger';
import {
  AuthenticatedUserError,
  requireAuthenticatedUser,
} from '../../../../lib/middleware/require-authenticated-user';

function parseLimit(value: string | null): number {
  if (value === null) {
    return DASHBOARD_RECENT_TRANSACTIONS_DEFAULT_LIMIT;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || String(parsed) !== value.trim()) {
    return Number.NaN;
  }

  return parsed;
}

function toErrorResponse(
  error: unknown,
  logger?: RequestLogContext['logger'],
): Response {
  if (error instanceof AuthenticatedUserError) {
    return errorResponse(error.code, error.message, error.status);
  }

  logger?.error({ err: error }, 'dashboard:recent-transactions:error');

  return errorResponse(
    DASHBOARD_ERROR_CODES.recentTransactionsFailed,
    '最近交易加载失败，请稍后重试',
    500,
  );
}

export function GET(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async ({ logger }) => {
    try {
      const { user } = await requireAuthenticatedUser(request);
      const url = new URL(request.url);
      const parsedLimit = dashboardRecentTransactionsLimitSchema.safeParse(
        parseLimit(url.searchParams.get('limit')),
      );

      if (!parsedLimit.success) {
        return errorResponse(
          DASHBOARD_ERROR_CODES.invalidLimit,
          parsedLimit.error.issues[0]?.message ?? '最近交易数量无效',
          400,
        );
      }

      const result = await getTransactionService().listRecentTransactions({
        limit: parsedLimit.data,
        userId: user.id,
      });

      return successResponse<RecentTransactionsResult>(result);
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  });
}
