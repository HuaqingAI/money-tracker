# Story 1.7: 月度报表

Status: done

## Story

As a 已登录用户,
I want 查看按月汇总的消费报表,
So that 我能了解每月的消费结构和变化趋势。

## Acceptance Criteria

### AC1: 当月消费总额与分类分布

**Given** 用户有当月 confirmed 交易数据  
**When** 进入月度报表页  
**Then** 展示当月消费总额和按分类的支出分布  
**And** 每个分类显示金额、笔数和占比百分比  
**And** 金额以 cents 整数存储和计算，展示时 /100  
**And** 视觉结构参考 `_bmad-output/E-Assets/page-designs/01.8-monthly-report.html`  
**And** 文案参考 `_bmad-output/E-Assets/content/scenario-01-content-final.md`  
**And** 交互参考 `_bmad-output/C-UX-Scenarios/01-dannys-zero-input-first-experience/01.8-monthly-report/01.8-monthly-report.md`

### AC2: 环比、同比与多月趋势

**Given** 用户有多个月的历史数据  
**When** 查看报表  
**Then** 展示上月环比和去年同月同比趋势对比  
**And** 趋势数据通过 `GET /api/analytics/trend?months=12` 获取  
**And** 当前月数据通过 `GET /api/analytics/monthly-summary?month=YYYY-MM` 获取  
**And** 缺少对比月份时明确返回 `null`，前端隐藏对应对比，不伪造趋势

### AC3: 月份切换

**Given** 用户切换月份  
**When** 选择上一月或下一月  
**Then** 报表数据更新为对应月份  
**And** 月份边界按 UTC 计算，展示时使用当前用户设备时区格式化

### AC4: 空状态与错误状态

**Given** 当月无 confirmed 交易数据  
**When** 进入报表  
**Then** 展示空状态「本月暂无消费记录」和导入账单引导  
**And** 空状态插画参考 `_bmad-output/E-Assets/images/empty-states/empty-monthly-report.svg`  
**And** 网络或服务端异常时展示可重试状态，不显示空白页面

### AC5: API 与缓存

**Given** 用户已登录  
**When** 移动端请求月报数据  
**Then** API 统一返回 `{ success: boolean, data?: T, error?: { code: string, message: string } }`  
**And** API 必须通过 Bearer JWT 鉴权，仅返回当前用户数据  
**And** 移动端 TanStack Query 按月缓存，`staleTime=5min`

## Tasks / Subtasks

- [x] Task 1: 建立 shared 月报类型、查询 schema 和纯函数测试 (AC: #1, #2, #3)
  - [x] 1.1 新增 `packages/shared/types/analytics.ts`，定义月报 VO、分类明细、趋势点和趋势对比类型
  - [x] 1.2 新增 `packages/shared/schemas/analytics.ts`，定义 `month=YYYY-MM` 与 `months=1..24` 查询 schema
  - [x] 1.3 新增 `packages/shared/utils/monthly-report.ts`，封装 UTC 月份边界、百分比、环比/同比计算和分类聚合
  - [x] 1.4 新增 shared 单元测试，覆盖跨月边界、空数据、分类占比、环比/同比缺失和 0 基线

- [x] Task 2: 实现月报 API 聚合与趋势接口 (AC: #1, #2, #5)
  - [x] 2.1 新增 `apps/api/lib/analytics/monthly-summary-service.ts`，优先读取 `analytics.monthly_summaries`，缺失时从 `billing.transactions` confirmed 数据现场聚合
  - [x] 2.2 新增 `GET /api/analytics/monthly-summary?month=YYYY-MM`
  - [x] 2.3 新增 `GET /api/analytics/trend?months=12`
  - [x] 2.4 新增 API 单元测试，覆盖鉴权、非法参数、当前用户隔离、预聚合 fallback 和趋势返回

- [x] Task 3: 实现移动端月报数据客户端与页面 (AC: #1, #2, #3, #4, #5)
  - [x] 3.1 扩展 `apps/mobile/lib/api-client.ts`，新增月报和趋势 fetcher
  - [x] 3.2 新增 `apps/mobile/app/(main)/report.tsx`，实现顶部栏、首次说明、月份切换、总览、分类分布、趋势和空/错/加载状态
  - [x] 3.3 更新 `apps/mobile/app/(main)/dashboard.tsx`，增加进入月度报表入口
  - [x] 3.4 新增移动端单元测试，验证 API client 路径、鉴权 header、错误处理和月份切换 helper

- [x] Task 4: 编译验证、单元测试和 Story 收尾 (AC: #1, #2, #3, #4, #5)
  - [x] 4.1 运行 shared、api、mobile 单元测试
  - [x] 4.2 运行 TypeScript 编译验证和 lint
  - [x] 4.3 记录验证结果，更新 File List、Completion Notes、Change Log
  - [x] 4.4 将 Story 状态更新为 review

### Review Findings

- [x] [Review][Defer] 月报实时口径是否纳入待确认账单 [apps/api/lib/analytics/monthly-summary-service.ts:197] - deferred：虽然未确认分类，但它仍是真实消费；如果不展示在报表里，用户会以为报表丢失了这部分消费。后续需要单独设计 pending 账单在月报中的呈现形式与对比口径。
- [x] [Review][Patch] 预聚合分类没有按 category_id 回填分类名 [apps/api/lib/analytics/monthly-summary-service.ts:124]
- [x] [Review][Patch] 趋势接口遇到空预聚合点时不会 fallback 到 live transactions [apps/api/lib/analytics/monthly-summary-service.ts:357]
- [x] [Review][Patch] 缺少对比月份时前端仍展示趋势对比槽位 [apps/mobile/app/(main)/report.tsx:319]
- [x] [Review][Patch] 页面仍展示结余/收入占位，偏离“只实现支出月报、不伪造收入/结余”的约束 [apps/mobile/app/(main)/report.tsx:234]
- [x] [Review][Patch] 月报 React Query cache key 未包含用户作用域 [apps/mobile/app/(main)/report.tsx:140]
- [x] [Review][Patch] 月报服务测试 mock 没有真正验证 user_id 与月份边界过滤 [apps/api/lib/analytics/monthly-summary-service.test.ts:27]
- [x] [Review][Patch] 空状态未承接指定 empty-monthly-report 插画参考 [apps/mobile/app/(main)/report.tsx:113]

## Dev Notes

### 架构约束

- 遵循单向依赖：`apps/mobile -> packages/shared + packages/ui`，`apps/api -> packages/shared`，`packages/shared` 不依赖 React。
- API 响应必须使用统一 `ApiResponse<T>`。
- 数据库字段保持 snake_case，API/移动端 VO 使用 camelCase。
- 金额只用 cents 整数计算，不使用浮点存储。
- 月份边界用 UTC：`YYYY-MM-01T00:00:00.000Z` 到下月同一时刻左闭右开。
- 只统计 `billing.transactions.status = 'confirmed'` 的交易；`pending_confirmation` 和 `rejected` 不进入月报。
- 当前数据库没有交易方向字段，本 Story 不伪造收入/结余，只实现 FR5 的支出月报；页面展示“暂未识别到收入记录”。

### 实现指导

- `analytics.monthly_summaries` 已存在，但当前 main 分支尚未落地月报聚合 worker；API 必须能在预聚合缺失时从 `billing.transactions` 现场聚合，保证首次体验可用。
- 分类名优先取 join 到的 `billing.categories.name`，无分类时显示“其他”。
- 趋势接口返回最近 N 个月数据；环比/同比由 shared 纯函数基于趋势点计算，缺数据返回 `null`。
- 移动端先用 Tamagui/React Native 基础视图实现可编译、可测试页面，不新增 `victory-native-xl`、`react-native-svg`、`view-shot`、微信 SDK 等原型中提及但当前 package 未安装的依赖。
- 分享能力在 UX 原型中存在，但本 Story 的 AC 来自 FR5，不新增分享 SDK；按钮可作为后续 Phase 扩展入口，不阻塞月报核心闭环。

### Previous Story Learnings

- Story 1.8 复盘指出：不要假设认证来源，API 必须兼容当前应用自签 JWT，统一走 `requireAuthenticatedUser`。
- Story 1.8 复盘指出：不要只按 AC 粗略实现，要对照高保真原型的字段与状态；本 Story 至少覆盖加载、空、错误、单月、多月趋势状态。
- Story 1.3 复盘指出：服务端接口不能用进程内临时状态承载核心数据；本 Story 聚合必须来自 Supabase 数据表。

### References

- `_bmad-output/planning-artifacts/epics.md` Story 1.7 / FR5
- `_bmad-output/planning-artifacts/architecture.md` 数据分层、API、缓存、月份边界约束
- `_bmad-output/E-Assets/page-designs/01.8-monthly-report.html`
- `_bmad-output/E-Assets/content/scenario-01-content-final.md`
- `_bmad-output/C-UX-Scenarios/01-dannys-zero-input-first-experience/01.8-monthly-report/01.8-monthly-report.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-27：用户选择编译验证、单元测试、AI 判断确认模式。
- 2026-04-27：当前 Codex worktree 初始为 detached HEAD，基于当前 main 创建 `story/1-7-monthly-report`。
- 2026-04-27：发现 `sprint-status.yaml` 中 1-7 仍为 backlog 且无 story 文件，先执行 Create Story，再进入实现。
- 2026-04-27：初次运行测试时发现 worktree 缺少 `node_modules`，执行 `pnpm install` 后继续验证。
- 2026-04-27：`pnpm build` 初次被 import/export 排序规则阻塞，执行 ESLint autofix 后复跑通过。

### Completion Notes List

- 2026-04-27：创建 Story 1.7 文档，明确不新增依赖、不伪造收入字段，优先完成 FR5 月报核心闭环。
- 2026-04-27：新增 shared 月报 VO、查询 schema 和纯函数，覆盖 UTC 月份边界、分类聚合、百分比、环比/同比计算。
- 2026-04-27：新增 `GET /api/analytics/monthly-summary` 和 `GET /api/analytics/trend`，通过 Bearer JWT 鉴权并仅查询当前用户数据；月报优先读 `analytics.monthly_summaries`，缺失时从 confirmed 交易实时聚合。
- 2026-04-27：新增移动端月报页、Dashboard 入口、月报 API client 和月份切换 helper，覆盖加载、错误、空状态、分类明细和趋势对比。
- 2026-04-27：完成全量单元测试、lint、build 验证，Story 状态更新为 review。
- 2026-04-27：完成 code review patch：预聚合分类名回填、空预聚合趋势 fallback、移动端对比隐藏、支出口径 UI、用户作用域缓存 key、服务测试过滤覆盖和空状态插画语义。

### Verification

- PASS: `pnpm --filter @money-tracker/shared test -- monthly-report.test.ts`
- PASS: `pnpm --filter api test -- lib/analytics/monthly-summary-service.test.ts app/api/analytics/monthly-summary/route.test.ts app/api/analytics/trend/route.test.ts`
- PASS: `pnpm --filter mobile test -- lib/api-client.test.ts lib/monthly-report.test.ts`
- PASS: `pnpm --filter @money-tracker/shared build`
- PASS: `pnpm --filter @money-tracker/ui build`
- PASS: `pnpm --filter mobile exec tsc --noEmit`
- PASS: `pnpm --filter api exec tsc --noEmit`
- PASS: root `pnpm test`
- PASS: root `pnpm lint`
- PASS: root `pnpm build`
- PASS: review patch `pnpm --filter api test -- lib/analytics/monthly-summary-service.test.ts`
- PASS: review patch `pnpm --filter mobile exec tsc --noEmit`
- PASS: review patch `pnpm --filter api exec tsc --noEmit`
- PASS: review patch root `pnpm test`
- PASS: review patch root `pnpm lint`
- PASS: review patch root `pnpm build`

### File List

- `_bmad-output/implementation-artifacts/1-7-monthly-report.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `packages/shared/index.ts`
- `packages/shared/schemas/analytics.ts`
- `packages/shared/types/analytics.ts`
- `packages/shared/utils/monthly-report.ts`
- `packages/shared/utils/monthly-report.test.ts`
- `apps/api/app/api/analytics/monthly-summary/route.ts`
- `apps/api/app/api/analytics/monthly-summary/route.test.ts`
- `apps/api/app/api/analytics/trend/route.ts`
- `apps/api/app/api/analytics/trend/route.test.ts`
- `apps/api/lib/analytics/monthly-summary-service.ts`
- `apps/api/lib/analytics/monthly-summary-service.test.ts`
- `apps/mobile/app/(main)/dashboard.tsx`
- `apps/mobile/app/(main)/report.tsx`
- `apps/mobile/lib/api-client.ts`
- `apps/mobile/lib/api-client.test.ts`
- `apps/mobile/lib/monthly-report.ts`
- `apps/mobile/lib/monthly-report.test.ts`

## Change Log

- 2026-04-27：创建 Story 1.7 月度报表实现说明与任务清单。
- 2026-04-27：完成月报 shared 类型/工具、API 聚合接口、移动端报表页和验证收尾，Story 状态进入 review。
- 2026-04-27：完成 code review patch 并将 Story 状态更新为 done。
