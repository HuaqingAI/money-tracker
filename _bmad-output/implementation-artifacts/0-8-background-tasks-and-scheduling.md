# Story 0.8: 后台任务与定时调度基础设施

Status: done

## Story

As a 开发者,
I want 一个可靠的后台定时任务执行机制,
So that 洞察推送、季节预警等需要定期分析的功能有运行环境。

## Acceptance Criteria

### AC1: Worker 服务部署形态

**Given** Docker Compose 生产环境
**When** 检查后台任务方案
**Then** `deploy/docker-compose.prod.yml` 包含 `worker` 服务（复用 Next.js 镜像，入口为 `apps/api/worker/index.ts`）
**And** worker 进程使用 `node-cron` 或类似库调度定时任务
**And** worker 与 API 服务共享数据库连接，但运行在独立容器中
**And** worker 内存限制 <= 256MB（NFR7 资源约束下的剩余空间）

### AC2: 调度与执行可靠性

**Given** 任务调度框架已就绪
**When** 注册一个示例定时任务（如每日凌晨 2:00 执行）
**Then** 任务按 cron 表达式准时触发
**And** 任务执行日志通过 pino 记录（与 API 日志格式一致）
**And** 任务失败时自动重试 1 次，仍失败则记录错误到 Sentry

### AC3: 任务注册约定

**Given** 任务注册接口
**When** 在 `apps/api/worker/tasks/` 下添加新任务文件
**Then** 任务文件导出 `{ cron: string, handler: () => Promise<void> }` 接口
**And** worker 启动时自动扫描并注册所有任务
**And** 预置任务占位：`insight-analysis.ts`（E7 洞察推送用）、`seasonal-alert.ts`（E5 人情预警用）

## Tasks / Subtasks

- [x] Task 1: 建立 worker 运行骨架 (AC: #1)
  - [x] 1.1 创建 `apps/api/worker/index.ts` 作为 worker 入口
  - [x] 1.2 选型并接入 `node-cron` 或等价调度库
  - [x] 1.3 复用现有数据库连接与环境变量加载方式
  - [x] 1.4 复用 Story 0.7 的 pino/Sentry 基础设施

- [x] Task 2: 定义任务注册与发现机制 (AC: #3)
  - [x] 2.1 创建 `apps/api/worker/tasks/` 目录
  - [x] 2.2 定义任务导出契约 `{ cron, handler }`
  - [x] 2.3 实现 worker 启动时的任务扫描与注册逻辑
  - [x] 2.4 添加 `insight-analysis.ts` 与 `seasonal-alert.ts` 两个占位任务

- [x] Task 3: 实现执行可靠性与观测 (AC: #2)
  - [x] 3.1 为每个任务执行生成结构化日志
  - [x] 3.2 失败后自动重试 1 次
  - [x] 3.3 重试后仍失败时上报 Sentry
  - [x] 3.4 注册一个示例 cron 任务验证每日调度能力

- [x] Task 4: 接入生产部署配置 (AC: #1)
  - [x] 4.1 更新 `deploy/docker-compose.prod.yml` 增加 `worker` 服务
  - [x] 4.2 复用 API 镜像并设置 worker 启动命令
  - [x] 4.3 配置内存限制 <= 256MB
  - [x] 4.4 验证 worker 与 API 分离运行但共享数据库连接配置

- [x] Task 5: 验证与文档 (AC: #1, #2, #3)
  - [x] 5.1 编写/补充 worker 相关单元测试
  - [x] 5.2 运行构建验证、测试验证与必要的手动执行验证
  - [x] 5.3 更新 `_bmad-output/implementation-artifacts/sprint-status.yaml` 状态流转

### Review Findings

- [x] [Review][Patch] Worker 容器将无法按当前镜像启动 [apps/api/Dockerfile:43]
- [x] [Review][Patch] 任务注册仍是硬编码列表，未实现 story 要求的自动扫描 [apps/api/worker/tasks/index.ts:3]

## Dev Notes

### 依赖与上下文

- Story 0.7 已完成 pino 日志、Sentry、健康检查基础设施，0.8 应优先复用这些能力而不是重复建设。
- Story 0.6 将承接生产部署能力，因此 `deploy/docker-compose.prod.yml` 的最终落地需要与 0.6 保持一致。
- Story 0.8 为 Epic 7 洞察推送与 Epic 5 季节预警提供运行底座，当前先交付基础设施与占位任务。

### 架构约束

- 运行环境为 monorepo：`apps/api` 为 Next.js API 服务，worker 需要与其共享代码与数据库访问层。
- 资源约束来自 NFR7：在 2核4G ECS 条件下，worker 容器内存预算不超过 256MB。
- 日志格式需与 Story 0.7 中的 pino 配置保持一致，错误追踪需接入 Sentry。
- 调度实现优先保持简单可运维，满足“独立容器 + cron 调度 + 基础重试”即可。

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 0.8]
- [Source: _bmad-output/planning-artifacts/architecture.md#横切关注点]
- [Source: _bmad-output/implementation-artifacts/0-7-monitoring-and-error-tracking.md]

## Dev Agent Record

### Agent Model Used

Sisyphus

### Debug Log References

### Completion Notes List

- 2026-04-22 Implementation 完成:
  - `apps/api/worker/index.ts` 作为独立 worker 入口，启动时加载 Sentry server config、注册任务并监听 SIGINT/SIGTERM 清理 cron 任务。
  - `apps/api/worker/scheduler.ts` 使用 `node-cron` 创建默认停止的任务，显式启动，启用 `noOverlap`，执行失败自动重试 1 次，最终失败记录 pino error 并上报 Sentry。
  - `apps/api/worker/tasks/` 提供任务注册表与两个占位任务：`insight-analysis`、`seasonal-alert`。
  - `deploy/docker-compose.prod.yml` 新增 `worker` 服务，复用 API 镜像，启动命令为 `pnpm --filter api worker:start`，运行已编译的 `dist/worker/index.js`，避免生产环境依赖 `tsx` 直接执行 TypeScript 源码；内存限制 `256M`。
- Verification:
  - PASS: `pnpm --filter api lint`
  - PASS: `pnpm --filter api test`（5 files / 15 tests）
  - PASS: `pnpm --filter api run build:worker`
  - PASS: `pnpm --filter api build`
  - PASS: `node dist/worker/index.js` 烟雾启动成功，输出两个任务的 schedule/start 日志；命令因验证超时被主动截断，符合常驻 worker 预期。
  - PASS: worker scheduler/task registry unit tests cover cron validation, explicit start, retry once, Sentry reporting, and placeholder task loading.
  - REPO-WIDE BLOCKED (pre-existing/non-story): `pnpm lint` fails in `packages/shared/index.ts` export sorting and `apps/mobile/app/_layout.tsx` import sorting; `pnpm test` / `pnpm build` fail in `packages/ui` because Tamagui packages are missing; API `tsc --noEmit` also surfaces existing request-logger test UUID literal typing. Story-scoped API gates are green.

### File List

- `_bmad-output/implementation-artifacts/0-8-background-tasks-and-scheduling.md` — 新建 Story 文件
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — 0-8 状态 backlog → review
- `apps/api/package.json` — 添加 worker/build scripts 与 `node-cron` / `tsx` 依赖
- `apps/api/tsconfig.worker.json` — worker 构建配置
- `apps/api/worker/index.ts` — worker 进程入口
- `apps/api/worker/scheduler.ts` — cron 注册、显式启动、重试与 Sentry 上报
- `apps/api/worker/task.ts` — worker task 类型契约
- `apps/api/worker/scheduler.test.ts` — scheduler 单元测试
- `apps/api/worker/tasks/index.ts` — 任务注册表
- `apps/api/worker/tasks/index.test.ts` — 任务注册表测试
- `apps/api/worker/tasks/insight-analysis.ts` — 洞察分析占位任务
- `apps/api/worker/tasks/seasonal-alert.ts` — 季节预警占位任务
- `deploy/docker-compose.prod.yml` — worker 服务生产部署配置
- `pnpm-lock.yaml` — 依赖锁定更新
