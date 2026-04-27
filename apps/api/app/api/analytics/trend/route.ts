import { monthlyTrendQuerySchema, monthStringSchema } from '@money-tracker/shared';
import type { NextRequest } from 'next/server';

import { getMonthlyTrend } from '../../../../lib/analytics/monthly-summary-service';
import { errorResponse, successResponse } from '../../../../lib/api-response';
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

  return errorResponse('MONTHLY_TREND_FAILED', 'Failed to load monthly trend.', 500);
}

export function GET(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async () => {
    try {
      const { user } = await requireAuthenticatedUser(request);
      const url = new URL(request.url);
      const parsed = monthlyTrendQuerySchema.safeParse({
        months: url.searchParams.get('months') ?? undefined,
      });

      if (!parsed.success) {
        return errorResponse(
          'INVALID_MONTHLY_TREND_QUERY',
          parsed.error.issues[0]?.message ?? 'Invalid monthly trend query.',
          400,
        );
      }

      const endMonthInput = url.searchParams.get('endMonth') ?? undefined;
      const parsedEndMonth = endMonthInput
        ? monthStringSchema.safeParse(endMonthInput)
        : null;

      if (parsedEndMonth && !parsedEndMonth.success) {
        return errorResponse(
          'INVALID_MONTHLY_TREND_QUERY',
          parsedEndMonth.error.issues[0]?.message ?? 'Invalid monthly trend query.',
          400,
        );
      }

      return successResponse(
        await getMonthlyTrend(
          user.id,
          parsed.data.months,
          parsedEndMonth?.success ? parsedEndMonth.data : undefined,
        ),
      );
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
