# Story 0.7: 监控与错误追踪 (Monitoring and Error Tracking)

Status: review

## Story

As a 开发者 (developer),
I want 应用级监控和错误追踪系统就绪 (application-level monitoring and error tracking ready),
So that 线上问题能被快速发现和定位 (online issues can be quickly discovered and located).

## Acceptance Criteria

### AC1: 移动端错误追踪 (Mobile Error Tracking)

**Given** apps/mobile 已配置
**When** React Native 发生未捕获异常
**Then** Sentry RN SDK 自动上报错误，包含堆栈信息和设备上下文
**And** Source map 正确上传，错误可定位到源码行

### AC2: API 端错误追踪 (API Error Tracking)

**Given** apps/api 已配置
**When** Next.js API Route 发生未捕获异常
**Then** Sentry Next.js SDK 自动上报错误
**And** 包含请求 URL、HTTP 方法、响应状态码

### AC3: 结构化日志系统 (Structured Logging)

**Given** 日志系统已配置
**When** API 处理请求
**Then** pino 以 JSON 格式记录结构化日志（timestamp、level、message、requestId）
**And** 日志文件轮转配置就绪（按大小/时间）

### AC4: 健康检查端点 (Health Check Endpoint)

**Given** 健康检查端点
**When** GET `/api/health`
**Then** 返回 `{ success: true, timestamp: "...", services: { database: "ok", ai: "ok" } }`
**And** 检查数据库连接可用性
**And** 可作为 Docker 健康检查和外部监控探针

## Tasks / Subtasks

- [x] Task 1: 安装并配置 Sentry Next.js SDK (AC: #2)
  - [x] 1.1 安装 `@sentry/nextjs` 到 apps/api (package.json)
  - [x] 1.2 创建 `sentry.server.config.ts` — 服务端初始化
  - [x] 1.3 创建 `sentry.edge.config.ts` — Edge runtime 初始化
  - [x] 1.4 更新 `next.config.js` — `withSentryConfig()` 包裹，source map 上传（配置 auth token 后启用）
  - [x] 1.5 创建 `apps/api/app/global-error.tsx` — 全局错误边界
  - [x] 1.6 创建 `instrumentation.ts` — Next.js 15 instrumentation hook + `onRequestError`
  - [ ] 1.7 编写测试验证 Sentry 配置 — **Deferred**：测试框架待 Story 0-4 提供

- [x] Task 2: 安装并配置 Sentry React Native SDK (AC: #1)
  - [x] 2.1 安装 `@sentry/react-native` 到 apps/mobile (package.json)
  - [x] 2.2 创建 `apps/mobile/lib/sentry.ts` — Sentry 初始化模块
  - [x] 2.3 更新 `apps/mobile/app/_layout.tsx` — 调用 `initSentry()` + `Sentry.wrap()`
  - [x] 2.4 在 `app.config.ts` 添加 `@sentry/react-native/expo` plugin（EAS Build 期 source map 上传）
  - [ ] 2.5 编写测试 — **Deferred**：测试框架待 Story 0-4 提供

- [x] Task 3: 配置 pino 结构化日志 (AC: #3)
  - [x] 3.1 安装 `pino` + `pino-roll` + `pino-pretty` 到 apps/api
  - [x] 3.2 创建 `apps/api/lib/logger.ts` — JSON 格式；生产写文件 + 轮转；开发 pino-pretty → stdout
  - [x] 3.3 创建 `apps/api/lib/middleware/request-logger.ts` — `withRequestLogging()` 包装器（requestId / 请求始末 / X-Request-Id 响应头）
  - [x] 3.4 在 API Route 中集成请求日志（/api/health 已接入作为示例）
  - [x] 3.5 配置日志轮转：默认 10MB + 每日，保留 7 份
  - [ ] 3.6 编写单元测试 — **Deferred**：测试框架待 Story 0-4 提供

- [x] Task 4: 实现健康检查端点 (AC: #4)
  - [x] 4.1 `apps/api/app/api/health/route.ts` 完整实现
  - [x] 4.2 数据库连接检查（Supabase REST `/rest/v1/` HEAD，3s 超时）
  - [x] 4.3 AI 服务配置检查（AI_PRIMARY_API_KEY 环境变量）
  - [x] 4.4 标准响应格式：`{ success, timestamp, services: { database, ai } }`
  - [x] 4.5 失败返回 HTTP 503
  - [ ] 4.6 编写单元测试 — **Deferred**：测试框架待 Story 0-4 提供

- [ ] Task 5: Docker 健康检查集成 (AC: #4) — **Deferred to Story 0-6**
  - [ ] 5.1 `deploy/docker-compose.prod.yml` 添加 healthcheck 指令
  - [ ] 5.2 验证 healthcheck 格式

> 注：`deploy/` 目录由 Story 0-6（生产环境部署）创建。本 Story 提供的 `/api/health` 端点已满足 Docker healthcheck 接入点；Story 0-6 在创建 docker-compose.prod.yml 时接入即可。

## Dev Notes

### 架构约束

- **技术栈**：Next.js 15 App Router (apps/api) + Expo SDK 54 React Native (apps/mobile)
- **TypeScript 严格模式**，禁止 `any`
- **文件命名** kebab-case，组件 PascalCase，函数/hooks camelCase
- **API 响应格式**：`{ success: boolean, data?: T, error?: string }`

### Sentry 配置要点

- **Next.js**：`withSentryConfig()` + `instrumentation.ts` + 两个 runtime 配置；未配置 DSN 时 SDK 不启用但不报错
- **React Native**：`@sentry/react-native/expo` plugin 在 EAS Build 期上传 source map
- **PIPL**：`sendDefaultPii: false`（不发送个人身份信息）

### pino 日志配置要点

- **生产**：JSON → `./logs/app.log`，pino-roll 按大小（10MB）+ 时间（每日）轮转，保留 7 份
- **开发**：pino-pretty 到 stdout，带颜色和 ISO 时间戳
- **必需字段**：timestamp (ISO)、level (标签名)、message、requestId（通过 child logger 注入）
- **请求日志**：使用 `withRequestLogging()` 包装器代替 Next.js middleware（Edge runtime 无法加载 pino 这类 Node-only 依赖）

### 健康检查设计

- **数据库**：Supabase REST `/rest/v1/` HEAD 请求，3s AbortController 超时，不需 SQL 权限
- **AI**：仅验证 `AI_PRIMARY_API_KEY` 环境变量，不发实际请求（避免 Docker 每 30s 探测的成本/延迟）
- **响应**：成功 200，失败 503；统一格式 `{ success, timestamp, services: { database, ai } }`

### 环境变量（新增）

- `SENTRY_DSN` / `SENTRY_ENVIRONMENT` / `SENTRY_TRACES_SAMPLE_RATE`
- `SENTRY_ORG` / `SENTRY_PROJECT_API` / `SENTRY_PROJECT_MOBILE` / `SENTRY_AUTH_TOKEN`（CI/build 时用于 source map 上传）
- `EXPO_PUBLIC_SENTRY_DSN` / `EXPO_PUBLIC_SENTRY_ENVIRONMENT` / `EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`
- `LOG_LEVEL` / `LOG_FILE_PATH` / `LOG_FILE_MAX_SIZE` / `LOG_FILE_MAX_FILES`

### 依赖关系

- **前置**：0-1（monorepo ✓ merged）、0-2（UI ✓ merged）
- **软依赖（但本 Story 不阻塞）**：0-3 (Supabase client)、0-4 (测试框架)、0-6 (deploy/)
- **后续**：0-8 worker 将复用 pino logger 和 Sentry

### Project Structure Notes

```
apps/api/
  sentry.server.config.ts        [NEW]
  sentry.edge.config.ts          [NEW]
  instrumentation.ts             [NEW]
  next.config.js                 [MODIFIED: withSentryConfig]
  app/
    global-error.tsx             [NEW]
    api/health/route.ts          [MODIFIED: 占位 → 真实实现]
  lib/
    logger.ts                    [NEW]
    middleware/request-logger.ts [NEW]

apps/mobile/
  app.config.ts                  [MODIFIED: 添加 sentry plugin]
  app/_layout.tsx                [MODIFIED: initSentry + Sentry.wrap]
  lib/sentry.ts                  [NEW]

.env.example                     [MODIFIED: 添加监控变量]
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 0.7]
- [Source: _bmad-output/planning-artifacts/architecture.md#监控与日志]
- [Source: _bmad-output/planning-artifacts/prd-bridge.md#FR24]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- pnpm install 在 worktree 中与并行开发会话（story 0-3）竞争资源，最终在独立安装后完成
- git rebase main 时需先移除 untracked `_bmad-output/implementation-artifacts/` 目录（main 中已提交），rebase 后重新创建并恢复本 Story 的 artifacts

### Completion Notes List

- 2026-04-20 Story context analysis 完成 — 基于 epics.md + architecture.md 生成开发者指南
- 2026-04-20 Implementation 完成:
  - **AC1 (Mobile)**: `@sentry/react-native` + `lib/sentry.ts` 封装初始化 + `_layout.tsx` Sentry.wrap + `app.config.ts` Sentry Expo plugin
  - **AC2 (API)**: `@sentry/nextjs` + server/edge config + instrumentation.ts + withSentryConfig + global-error.tsx
  - **AC3 (Logging)**: `pino` + `pino-roll` + `logger.ts` (prod: 文件+轮转; dev: pino-pretty) + `request-logger.ts` 包装器（requestId + X-Request-Id 响应头）
  - **AC4 (Health)**: `/api/health` 并行检查 DB（Supabase REST HEAD，3s timeout）+ AI（env var）；200/503；统一格式
- **Deferred** (有明确依赖):
  - Task 5 Docker healthcheck → Story 0-6
  - 单元测试 (1.7/2.5/3.6/4.6) → Story 0-4 Vitest
- **设计决策**:
  - Sentry 未配置 DSN 时自动禁用，本地开发无需账号
  - 健康检查 DB 用 REST HEAD（不需 SQL 权限）；AI 仅验证 env var（避免 Docker 每 30s 探测的成本）
  - 请求日志用 `withRequestLogging` 包装器（不用 Next.js middleware），规避 Edge runtime 不支持 pino 的限制

### File List

**New:**
- `apps/api/sentry.server.config.ts`
- `apps/api/sentry.edge.config.ts`
- `apps/api/instrumentation.ts`
- `apps/api/app/global-error.tsx`
- `apps/api/lib/logger.ts`
- `apps/api/lib/middleware/request-logger.ts`
- `apps/mobile/lib/sentry.ts`

**Modified:**
- `apps/api/package.json` — 添加 @sentry/nextjs, pino, pino-roll, pino-pretty
- `apps/api/next.config.js` — withSentryConfig 包裹
- `apps/api/app/api/health/route.ts` — 占位替换为真实实现
- `apps/mobile/package.json` — 添加 @sentry/react-native
- `apps/mobile/app.config.ts` — 添加 Sentry Expo plugin
- `apps/mobile/app/_layout.tsx` — initSentry + Sentry.wrap
- `.env.example` — 添加 SENTRY_*, EXPO_PUBLIC_SENTRY_*, LOG_* 占位
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — 0-7 状态 backlog → ready-for-dev → in-progress → review
