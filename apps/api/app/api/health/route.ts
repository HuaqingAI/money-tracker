import { type NextRequest,NextResponse } from 'next/server';

import { withRequestLogging } from '../../../lib/middleware/request-logger';

/**
 * 健康检查端点 — `GET /api/health`
 *
 * 用于 Docker healthcheck 和外部监控探针。
 * 检查依赖服务状态：
 * - database: Supabase 客户端可达性（DATABASE_URL/SUPABASE_URL 配置 + 连接检查）
 * - ai: AI 服务配置完整性（AI_API_KEY 是否存在）
 *
 * 响应格式：
 * - 全部服务 ok → HTTP 200
 *   `{ success: true, timestamp, services: { database: "ok", ai: "ok" } }`
 * - 任一服务异常 → HTTP 503
 *   `{ success: false, timestamp, services: { database: "error", ai: "ok" } }`
 *
 * 设计说明：
 * - 数据库检查使用轻量查询（HEAD 请求或 REST /health），避免影响应用性能
 * - AI 检查仅验证环境变量，不发起实际请求（避免不必要成本和延迟）
 * - 健康检查本身不应记录 Sentry 错误（Docker 每 30s 探测一次会刷屏）
 */

type ServiceStatus = 'ok' | 'error';

interface HealthResponse {
  success: boolean;
  timestamp: string;
  services: {
    database: ServiceStatus;
    ai: ServiceStatus;
  };
}

/**
 * 检查数据库连通性。
 *
 * 通过 Supabase REST API 的 `/rest/v1/` 端点进行 HEAD 请求来验证数据库可达。
 * 使用 AbortController 控制超时（3s），避免健康检查阻塞。
 */
async function checkDatabase(): Promise<ServiceStatus> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return 'error';
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      signal: controller.signal,
    });
    return response.ok ? 'ok' : 'error';
  } catch {
    return 'error';
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * 检查 AI 服务配置完整性。
 *
 * 仅验证 AI_PRIMARY_API_KEY 环境变量是否配置，不发起实际请求。
 * 实际连通性由每次请求时透明处理。
 */
function checkAi(): ServiceStatus {
  return process.env.AI_PRIMARY_API_KEY ? 'ok' : 'error';
}

export function GET(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async () => {
    const [database, ai] = [await checkDatabase(), checkAi()];
    const services = { database, ai } as const;
    const success = database === 'ok' && ai === 'ok';

    const body: HealthResponse = {
      success,
      timestamp: new Date().toISOString(),
      services,
    };

    return NextResponse.json(body, { status: success ? 200 : 503 });
  });
}
