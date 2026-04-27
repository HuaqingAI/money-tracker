import { monthlySummaryQuerySchema } from '@money-tracker/shared';
import type { NextRequest } from 'next/server';

import { getMonthlySummary } from '../../../../lib/analytics/monthly-summary-service';
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

  return errorResponse(
    'MONTHLY_SUMMARY_FAILED',
    'Failed to load monthly summary.',
    500,
  );
}

export function GET(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async () => {
    try {
      const { user } = await requireAuthenticatedUser(request);
      const url = new URL(request.url);
      const parsed = monthlySummaryQuerySchema.safeParse({
        month: url.searchParams.get('month'),
      });

      if (!parsed.success) {
        return errorResponse(
          'INVALID_MONTHLY_SUMMARY_QUERY',
          parsed.error.issues[0]?.message ?? 'Invalid monthly summary query.',
          400,
        );
      }

      return successResponse(
        await getMonthlySummary(user.id, parsed.data.month),
      );
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
