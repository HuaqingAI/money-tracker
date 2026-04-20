/**
 * 请求日志工具
 *
 * 在 API Route 处理器开头调用 `withRequestLogging(request, handler)` 即可：
 * - 生成唯一 requestId（crypto.randomUUID()）
 * - 记录请求开始和结束（含耗时）
 * - 在响应头注入 `X-Request-Id`
 * - 为未捕获异常记录 error 日志并重新抛出（由 Sentry 捕获）
 *
 * 也提供 `getRequestId(request)` 用于从入站请求中读取已存在的 requestId
 * （例如由上游 Nginx 注入），若无则生成新的。
 */
import type { NextRequest } from 'next/server';

import { createRequestLogger, logger } from '../logger';

const REQUEST_ID_HEADER = 'x-request-id';

export function getRequestId(request: Request | NextRequest): string {
  const existing = request.headers.get(REQUEST_ID_HEADER);
  if (existing && existing.length > 0) {
    return existing;
  }
  return crypto.randomUUID();
}

export interface RequestLogContext {
  requestId: string;
  logger: ReturnType<typeof createRequestLogger>;
}

/**
 * 包裹 API Route 处理器以启用结构化日志。
 *
 * 使用示例：
 * ```ts
 * export const GET = (request: NextRequest) =>
 *   withRequestLogging(request, async ({ logger }) => {
 *     logger.info('handling request');
 *     return NextResponse.json({ success: true, data: {} });
 *   });
 * ```
 */
export async function withRequestLogging(
  request: Request | NextRequest,
  handler: (ctx: RequestLogContext) => Promise<Response>,
): Promise<Response> {
  const requestId = getRequestId(request);
  const reqLogger = createRequestLogger(requestId);
  const startedAt = Date.now();
  const method = request.method;
  const url = request.url;

  reqLogger.info({ method, url }, 'request:start');

  try {
    const response = await handler({ requestId, logger: reqLogger });
    const durationMs = Date.now() - startedAt;
    reqLogger.info(
      { method, url, status: response.status, durationMs },
      'request:end',
    );
    // 克隆响应以注入 X-Request-Id 头（Response 头是只读的）
    const headers = new Headers(response.headers);
    headers.set('X-Request-Id', requestId);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    reqLogger.error(
      { method, url, durationMs, err: error },
      'request:error',
    );
    throw error;
  }
}

export { logger };
