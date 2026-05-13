# Story 1.6: Dashboard 首页

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 用户,
I want 在首页看到我的消费概览和待处理事项,
so that 我能快速了解当月财务状况并处理待确认交易。

## Acceptance Criteria

1. Dashboard 位于 `apps/mobile/app/(main)/dashboard.tsx`，已登录用户默认进入该页面；页面结构匹配 `E-Assets/page-designs/01.7-dashboard.html`、文案取自 `E-Assets/content/scenario-01-content-final.md`，交互遵循 `C-UX-Scenarios/01-dannys-zero-input-first-experience/01.7-dashboard/01.7-dashboard.md`。
2. 新增 `GET /api/analytics/monthly-summary?month=YYYY-MM`，返回统一 `ApiResponse<MonthlySummary>`；后端从 `billing.transactions` 按当前用户、月份、`status in ('confirmed', 'pending_confirmation')` 聚合总支出、分类分布、交易数、待确认数量和 AI 覆盖率，优先使用 `analytics.monthly_summaries`，缺失时回退实时聚合。
3. 新增 `GET /api/billing/transactions?limit=10`，返回统一 `ApiResponse<RecentTransactionsResult>`；接口按当前用户返回最新交易流水，不全量加载，支持 limit 上限保护。
4. Dashboard 使用 TanStack Query 分别请求月度汇总和最近交易；月度汇总 `staleTime=5min`，最近交易 `staleTime=30s`，两个端点独立缓存并支持下拉刷新。
5. 有交易数据时展示：月份标题、本月总支出、分类消费 Top 5、AI 覆盖率、待确认交易数量徽章、最近交易流水、AI Spotlight 卡片、查看完整报表入口、补充更多账单入口和 FAB 快捷操作。
6. 无交易数据时展示上下文感知空状态：标题“还没有消费数据”、引导用户开启通知读取、导入账单或记一笔试试；空状态插画可使用现有空状态资源的轻量占位，不得显示空白页或仅 loading spinner。
7. 加载状态必须展示 Dashboard 骨架屏；错误状态展示可恢复的错误提示和重试按钮。
8. Dashboard 保留重新进入通知权限页和账单导入页的入口；FAB 打开快捷操作菜单，至少提供“账单导入”和“记一笔试试”两个动作。Story 2.3 未落地前，“记一笔试试”可展示受控提示，不得导航到不存在页面。
9. AI Spotlight 在无真实 AI 洞察服务时由后端基于当月聚合数据生成确定性 MVP 文案；不得调用未落地的 AI 服务，也不得伪造不可验证的外部洞察。
10. 为 shared dashboard schema/类型、API service/repository/route、mobile dashboard API client 和关键状态渲染逻辑补充单元测试；完成编译验证和单元测试。

## Tasks / Subtasks

- [x] Task 1: 建立 Dashboard 共享契约 (AC: #2, #3, #4, #9)
  - [x] 1.1 新增 `packages/shared/constants/dashboard.ts`，定义 Dashboard 路由、查询限制、错误码和分类色/图标映射
  - [x] 1.2 新增 `packages/shared/types/dashboard.ts`，定义 `MonthlySummary`、`CategorySummary`、`RecentTransaction`、`DashboardSpotlight` 等类型
  - [x] 1.3 新增 `packages/shared/schemas/dashboard.ts`，定义 Zod schema 并在 `packages/shared/index.ts` 导出
  - [x] 1.4 补充 shared 单元测试，覆盖月份参数、分类分布、最近交易响应和错误输入

- [x] Task 2: 实现后端月度聚合与最近交易 API (AC: #2, #3, #9)
  - [x] 2.1 新增 `apps/api/lib/dashboard/dashboard-service.ts`，封装月度边界、实时聚合、AI 覆盖率与 MVP Spotlight 文案生成
  - [x] 2.2 新增 `GET /api/analytics/monthly-summary` route，接入 `requireAuthenticatedUser()`、`withRequestLogging()` 和统一 `ApiResponse<T>`
  - [x] 2.3 新增 `apps/api/lib/billing/transaction-service.ts` 或等价服务，查询当前用户最近交易并限制 `limit <= 50`
  - [x] 2.4 新增 `GET /api/billing/transactions` route，返回最新交易流水和分页元信息的最小契约
  - [x] 2.5 为 service 与 route 补充单元测试，覆盖空数据、有数据、待确认交易、非法月份、未授权和 limit 上限

- [x] Task 3: 实现移动端 Dashboard 数据层 (AC: #4, #7)
  - [x] 3.1 新增 `apps/mobile/lib/dashboard-api.ts`，封装月度汇总和最近交易请求，校验 API JSON shape
  - [x] 3.2 在 `dashboard.tsx` 使用 TanStack Query 独立加载 summary 与 recent transactions，设置指定 staleTime
  - [x] 3.3 实现下拉刷新、重试和错误兜底，不阻塞另一个已成功的数据块
  - [x] 3.4 补充 dashboard API client 单元测试，覆盖成功、服务端错误和非法响应

- [x] Task 4: 实现 Dashboard UI 状态与交互 (AC: #1, #5, #6, #7, #8)
  - [x] 4.1 替换当前 Dashboard 占位页，实现月份 Header、摘要卡、AI Spotlight、覆盖率、分类 Top 5、待确认入口、最近交易和 CTA 区块
  - [x] 4.2 实现空状态引导卡片：通知权限、账单导入、记一笔试试；通知权限入口跳转 `/(setup)/permissions`，导入入口跳转 `/(setup)/bill-import`
  - [x] 4.3 实现骨架屏和错误态，避免白屏或纯 spinner
  - [x] 4.4 实现 FAB 快捷菜单；Story 2.3 未落地前，“记一笔试试”展示受控提示
  - [x] 4.5 最近交易和分类卡片点击在目标页面未落地时使用受控提示，不导航到不存在路由

- [x] Task 5: 验证、Story 收尾与编译/测试 (AC: #10)
  - [x] 5.1 运行 story 范围内 shared/api/mobile 单元测试并修复失败
  - [x] 5.2 运行 `pnpm build` 编译验证；如 Windows Next standalone symlink 权限阻塞，记录具体失败阶段并补跑可替代的 `tsc --noEmit`
  - [x] 5.3 更新本 Story 的 Dev Agent Record、File List、Change Log，并将 Story 状态推进到 `review`
  - [x] 5.4 更新 `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Review Findings

- [x] [Review][Patch] Dashboard loading/error gate blocks successfully loaded data blocks [apps/mobile/app/(main)/dashboard.tsx:427] - 已拆分 summary/recent render state，单块失败不会遮住另一块的已成功数据。
- [x] [Review][Patch] Full-data dashboard has no notification-permission re-entry [apps/mobile/app/(main)/dashboard.tsx:346] - 已在完整数据态的 Action 区补回 `/(setup)/permissions` 入口。
- [x] [Review][Patch] Positive-only income months are counted as expenses [apps/api/lib/dashboard/dashboard-service.ts:176] - 已补 `DashboardService` 回归测试，确认正数收入月不计入 `totalExpenseCents` 且 pending/confirmed 口径保持稳定。
- [x] [Review][Patch] Nested `.env.local` files are no longer ignored [./.gitignore:19] - 已新增 `**/.env.local` 与 `**/.env.*.local`，并用 `git check-ignore` 复核。

## Dev Notes

### 架构约束

- 保持 monorepo 单向依赖：`apps/mobile -> packages/shared`，`apps/api -> packages/shared`；`packages/shared` 不引入 React 或平台依赖。
- API 响应统一为 `{ success: boolean, data?: T, error?: { code: string, message: string } }`。
- 金额继续使用整数分 `amount_cents`/`amountCents`，展示层才 `/100`；不得使用浮点数入库或聚合。
- 日期时间存储按 UTC；Dashboard 查询月份参数为 `YYYY-MM`，服务端将用户本月边界按 UTC 月份处理。后续用户时区能力未落地前，不在前端自行推断复杂时区。
- 数据库已有 `billing.transactions`、`billing.categories`、`analytics.monthly_summaries`。本 Story 优先用现有表，不新增 migration，除非实现过程中发现必须变更数据库结构。
- `analytics.monthly_summaries.category_breakdown` 目前没有稳定写入链路；Dashboard API 必须能从 `billing.transactions` 实时聚合回退，避免空汇总导致首页误判无数据。
- Story 1.5 仍为 backlog，AI 分类确认页未落地。Dashboard 可展示 `pending_confirmation` 数量与受控提示，但不得强依赖不存在的确认列表页面。
- Story 2.3 手动记账未落地。FAB 的“记一笔试试”在本 Story 只做受控提示或后续入口占位，不能创建未设计的数据写入流。

### 现有代码上下文

- 当前 Dashboard 占位页：`apps/mobile/app/(main)/dashboard.tsx`，仅展示欢迎、我的、退出。
- 认证和路由守卫：`apps/mobile/app/_layout.tsx`、`apps/mobile/stores/auth-store.ts`。
- 移动端 API 模式：`apps/mobile/lib/api-client.ts`、`apps/mobile/lib/billing-api.ts`。
- 服务端认证模式：`apps/api/lib/middleware/require-authenticated-user.ts`，兼容 Story 1.2 的 app JWT 与 Supabase Auth token。
- API 响应工具：`apps/api/lib/api-response.ts`。
- Supabase admin client：`apps/api/lib/db/supabase-admin.ts`。
- CSV 导入已将交易写入 `billing.transactions`，状态为 `pending_confirmation`；通知捕获目前写入 `billing.notification_captures` staging，不直接进入交易表。

### UX / 文案要求

- Full State 核心信息顺序：月份标题 -> 月度总支出 -> AI Spotlight -> AI 覆盖率 -> 分类消费 -> 最近交易 -> 报表/导入 CTA。
- Empty State 文案使用正式定稿：
  - 标题：“还没有消费数据”
  - 副标题：“开启下面任一方式，不动手就能知道钱去哪了”
  - 通知卡：“开启通知读取” / “消费到账自动识别，不用动手”
  - 导入卡：“导入支付宝账单” / “3 个月消费 5 分钟到手，AI 自动分类每一笔”
  - 兜底卡：“记一笔试试” / “30 秒搞定，感受一下”
- 不使用评判性文案，例如“你花太多了”“应该节约”“预算超支”。
- 图标优先使用现有可用方案；项目暂未安装 lucide-react-native，不为本 Story 增加图标依赖。可使用文本/emoji/轻量形状占位，但需保持布局稳定。

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.6]
- [Source: _bmad-output/planning-artifacts/epics.md#FR4]
- [Source: _bmad-output/C-UX-Scenarios/01-dannys-zero-input-first-experience/01.7-dashboard/01.7-dashboard.md]
- [Source: _bmad-output/E-Assets/page-designs/01.7-dashboard.html]
- [Source: _bmad-output/E-Assets/content/scenario-01-content-final.md#01.7 Dashboard]
- [Source: _bmad-output/D-Design-System/components/card.md]
- [Source: _bmad-output/D-Design-System/components/skeleton.md]
- [Source: apps/api/lib/api-response.ts]
- [Source: apps/api/lib/middleware/require-authenticated-user.ts]
- [Source: supabase/migrations/003_create_billing_schema.sql]
- [Source: supabase/migrations/004_create_analytics_schema.sql]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-27: 按 `start story 1-6` 创建分支 `story/1-6-dashboard-home`；本仓库处于单 repo 模式，`BACKEND_ROOT_ABS=C:\Users\boil\.codex\worktrees\f381\money-tracker`。
- 2026-04-27: `rg --files` 在当前 Windows 环境被拒绝执行，改用 PowerShell 文件枚举读取上下文。
- 2026-04-27: `_bmad-output/project-context.md` 不存在，使用 AGENTS.md、epics、架构/UX 工件和已完成 Story 1.4/1.8 作为上下文。
- 2026-04-27: `pnpm install` 完成，用于补齐本地缺失的 workspace 依赖。
- 2026-04-27: Story 范围验证通过：shared dashboard schema 测试、API dashboard/transactions service 与 route 测试、mobile dashboard API 与 auth-store 测试均通过。
- 2026-04-27: 全量验证通过：`pnpm test`、`pnpm lint`、`pnpm build`，并补跑 mobile/api `tsc --noEmit`。

### Completion Notes List

- 2026-04-27: Create Story 完成：基于 Story 1.6 需求、01.7 UX 规格和现有代码形态创建 Dashboard 开发规格；明确不依赖未落地的 Story 1.5/2.3 页面。
- 2026-04-27: Implementation 开始：Story 状态推进到 in-progress，按 shared 契约 -> API -> mobile Dashboard 顺序实现。
- 2026-04-27: 完成 shared Dashboard 常量、类型、Zod schema 与导出；补充 `confirmed`、`rejected` 交易状态以兼容 Dashboard 聚合。
- 2026-04-27: 完成月度汇总与最近交易 API；优先读取 `analytics.monthly_summaries`，缺失时基于 `billing.transactions` 实时聚合，并生成确定性 MVP AI Spotlight。
- 2026-04-27: 完成移动端 Dashboard 数据层与首页 UI；包含 full/empty/loading/error 状态、下拉刷新、独立缓存、最近交易、分类 Top 5、CTA 与 FAB 受控动作。
- 2026-04-27: 未新增数据库 migration；本 Story 复用既有 `billing.transactions`、`billing.categories`、`analytics.monthly_summaries` 表结构。
- 2026-04-27: 单元测试、lint、编译验证均通过，Story 状态推进到 review。
- 2026-05-09: 关闭 4 项 review findings，补充 Dashboard 块级渲染状态、通知权限重入口、支出聚合回归测试与 `.env.local` ignore 规则。

### Verification

- `pnpm --filter mobile test -- lib/dashboard-render-state.test.ts lib/dashboard-api.test.ts screens/onboarding/content.test.ts`
- `pnpm --filter api test -- lib/dashboard/dashboard-service.test.ts`
- `pnpm --filter mobile lint`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm --filter mobile exec tsc --noEmit`
- `pnpm --filter api exec tsc --noEmit`

### File List

- `_bmad-output/implementation-artifacts/1-6-dashboard-home.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `.gitignore`
- `apps/api/app/api/analytics/monthly-summary/route.test.ts`
- `apps/api/app/api/analytics/monthly-summary/route.ts`
- `apps/api/app/api/billing/transactions/route.test.ts`
- `apps/api/app/api/billing/transactions/route.ts`
- `apps/api/lib/billing/import-service.test.ts`
- `apps/api/lib/billing/transaction-service.test.ts`
- `apps/api/lib/billing/transaction-service.ts`
- `apps/api/lib/dashboard/dashboard-service.test.ts`
- `apps/api/lib/dashboard/dashboard-service.ts`
- `apps/mobile/app/(main)/dashboard.tsx`
- `apps/mobile/lib/dashboard-api.test.ts`
- `apps/mobile/lib/dashboard-api.ts`
- `apps/mobile/lib/dashboard-render-state.test.ts`
- `apps/mobile/lib/dashboard-render-state.ts`
- `apps/mobile/stores/auth-store.test.ts`
- `apps/mobile/stores/auth-store.ts`
- `packages/shared/constants/billing.ts`
- `packages/shared/constants/dashboard.ts`
- `packages/shared/index.ts`
- `packages/shared/schemas/dashboard.test.ts`
- `packages/shared/schemas/dashboard.ts`
- `packages/shared/types/dashboard.ts`

## Change Log

- 2026-04-27: 创建 Story 1.6 开发规格，状态设为 ready-for-dev。
- 2026-04-27: Story 1.6 开始实现，状态设为 in-progress。
- 2026-04-27: 完成 Dashboard shared/API/mobile 实现与测试，状态设为 review。
- 2026-05-09: 收口 Story 1.6 review findings，状态改为 done。
