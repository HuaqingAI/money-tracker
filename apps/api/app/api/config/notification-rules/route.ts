import { type NextRequest, NextResponse } from 'next/server';

import { withRequestLogging } from '../../../../lib/middleware/request-logger';
import { resolveNotificationRules } from '../../../../lib/notification-rules';

export function GET(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async () => {
    return NextResponse.json({
      success: true,
      data: resolveNotificationRules(),
    });
  });
}
