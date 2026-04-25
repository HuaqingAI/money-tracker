import {
  type ApiResponse,
  otpSendRequestSchema,
  type SendOtpResult,
} from '@money-tracker/shared';
import { type NextRequest, NextResponse } from 'next/server';

import { parseJsonRequest } from '../../../../lib/api/request-body';
import { getAuthService } from '../../../../lib/auth/service';
import { withRequestLogging } from '../../../../lib/middleware/request-logger';

export function POST(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async () => {
    const parsed = await parseJsonRequest(request, otpSendRequestSchema);
    if (!parsed.success) {
      return parsed.response;
    }

    const data = await getAuthService().sendOtp(parsed.data.phone);
    return NextResponse.json<ApiResponse<SendOtpResult>>({
      success: true,
      data,
    });
  });
}
