import {
  type ApiResponse,
  AUTH_ERROR_CODES,
  wechatCallbackRequestSchema,
  type WechatCallbackResult,
} from '@money-tracker/shared';
import { type NextRequest,NextResponse } from 'next/server';

import { getAuthService } from '../../../../lib/auth/service';
import { withRequestLogging } from '../../../../lib/middleware/request-logger';

export function POST(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async () => {
    const body = await request.json();
    const parsed = wechatCallbackRequestSchema.safeParse(body);

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

    const data = await getAuthService().handleWechatCallback(parsed.data);
    return NextResponse.json<ApiResponse<WechatCallbackResult>>({
      success: true,
      data,
    });
  });
}
