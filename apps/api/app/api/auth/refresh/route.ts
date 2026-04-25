import {
  type ApiResponse,
  refreshSessionRequestSchema,
  type RefreshSessionResult,
} from '@money-tracker/shared';
import { type NextRequest, NextResponse } from 'next/server';

import { parseJsonRequest } from '../../../../lib/api/request-body';
import { AuthError, getAuthService } from '../../../../lib/auth/service';
import { withRequestLogging } from '../../../../lib/middleware/request-logger';

export function POST(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async () => {
    const parsed = await parseJsonRequest(request, refreshSessionRequestSchema);
    if (!parsed.success) {
      return parsed.response;
    }

    try {
      const data = await getAuthService().refreshSession(parsed.data.refreshToken);
      return NextResponse.json<ApiResponse<RefreshSessionResult>>({
        success: true,
        data,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json<ApiResponse<never>>(
          {
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          },
          { status: error.status },
        );
      }

      throw error;
    }
  });
}
