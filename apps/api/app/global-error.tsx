'use client';

/**
 * Next.js App Router 全局错误边界
 *
 * 捕获未处理的客户端错误和渲染错误，上报到 Sentry。
 * Sentry Next.js SDK 会自动捕获服务端 API Route 错误（含请求 URL、HTTP 方法、状态码）。
 */
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}): React.ReactElement {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body>
        <h2>系统发生错误</h2>
        <p>错误已上报，请稍后重试。</p>
      </body>
    </html>
  );
}
