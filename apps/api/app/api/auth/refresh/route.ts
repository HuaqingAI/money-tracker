import {
  type ApiResponse,
  AUTH_ERROR_CODES,
  refreshSessionRequestSchema,
  type RefreshSessionResult,
} from '@money-tracker/shared';
import { type NextRequest,NextResponse } from 'next/server';

import { AuthError, getAuthService } from '../../../../lib/auth/service';
import { withRequestLogging } from '../../../../lib/middleware/request-logger';

export function POST(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async () => {
    const body = await request.json();
    const parsed = refreshSessionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: AUTH_ERROR_CODES.invalidInput,
            message: parsed.error.issues[0]?.message ?? '请求参数不合法',
          },
        },
        { status: 400 },
      );
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
