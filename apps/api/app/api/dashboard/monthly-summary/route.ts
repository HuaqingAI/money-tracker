import {
  DASHBOARD_ERROR_CODES,
  dashboardMonthSchema,
  type MonthlySummary,
} from '@money-tracker/shared';
import type { NextRequest } from 'next/server';

import { errorResponse, successResponse } from '../../../../lib/api-response';
import { getDashboardService } from '../../../../lib/dashboard/dashboard-service';
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

  logger?.error({ err: error }, 'dashboard:monthly-summary:error');

  return errorResponse(
    DASHBOARD_ERROR_CODES.monthlySummaryFailed,
    'Failed to load dashboard monthly summary.',
    500,
  );
}

export function GET(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async ({ logger }) => {
    try {
      const { user } = await requireAuthenticatedUser(request);
      const url = new URL(request.url);
      const parsedMonth = dashboardMonthSchema.safeParse(
        url.searchParams.get('month'),
      );

      if (!parsedMonth.success) {
        return errorResponse(
          DASHBOARD_ERROR_CODES.invalidMonth,
          parsedMonth.error.issues[0]?.message ?? 'Month must use YYYY-MM.',
          400,
        );
      }

      const summary = await getDashboardService().getMonthlySummary({
        month: parsedMonth.data,
        userId: user.id,
      });

      return successResponse<MonthlySummary>(summary);
    } catch (error) {
      return toErrorResponse(error, logger);
    }
  });
}
