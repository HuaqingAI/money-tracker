# Story 1.5: AI 自动分类与确认

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 用户,
I want 导入或自动捕获的交易被 AI 自动分类，并由我确认或修正,
so that 我的消费记录能正确归类，不需要逐条手动整理。

## Acceptance Criteria

1. 导入处理页位于 `apps/mobile/app/(setup)/import-processing.tsx`，从 CSV 导入成功后进入；页面实现 01.6 “Trust Theater”处理动画，最少展示 5 秒，AI 处理 5 秒内完成时仍播满 5 秒，超过 5 秒则持续到完成，30 秒后进入部分完成状态，并匹配 `E-Assets/page-designs/01.6-import-processing.html`、`E-Assets/content/scenario-01-content-final.md` 与 `C-UX-Scenarios/01-dannys-zero-input-first-experience/01.6-import-processing/01.6-import-processing.md`。
2. 后端在交易入库后通过服务层触发分类，不允许移动端直接调用 AI；新增 `apps/api/lib/services/classify-service.ts`，内部调用 `packages/shared/ai/ai-client.ts` 的 `classify()`，单笔主模型超时阈值 8 秒，重试 1 次后切换 Qwen 降级。
3. 新增 `packages/shared/ai/ai-client.ts` 与 `packages/shared/ai/fallback.ts`，定义 AI 分类输入/输出、主/备 provider 接口和 circuit breaker；连续 3 次主模型失败后进程内切换到 Qwen，30 分钟后自动回切，并用注释标记 `TODO: multi-instance 需迁移到 Redis`。
4. 分类结果写入 `billing.transactions`，交易保持 `status = pending_confirmation`；需要记录 `category_id`、AI 置信度、分类 provider 与分类时间。数据库变更必须通过新的 Supabase migration，且同步 `packages/shared/types/database.ts`。
5. 新增确认列表页 `apps/mobile/app/(setup)/classification-confirmation.tsx`；每条交易展示金额、商户、AI 分类建议、置信度，支持逐条“确认”、逐条“改分类”、逐条“拒绝”和“全部确认”。
6. 新增确认 API：`GET /api/billing/pending-confirmations` 返回当前用户待确认交易和分类选项；`POST /api/billing/transactions/:id/confirm` 将当前用户交易更新为 `confirmed`；`POST /api/billing/transactions/:id/reject` 将当前用户交易更新为 `rejected` 并保存用户选择的正确分类；`POST /api/billing/transactions/confirm-bulk` 批量确认当前用户待确认交易。所有 API 使用统一 `ApiResponse<T>`、Bearer 鉴权和用户隔离。
7. 用户修正分类时，后端写入/更新 `billing.category_rules` 作为反馈闭环，规则关键词来源于商户或描述，不得跨用户共享；后续分类优先使用用户规则，再调用 AI。
8. 通知捕获的新交易也纳入同一分类服务入口；若当前通知链路仍停留在 `billing.notification_captures` staging，本 Story 至少提供可复用服务函数和单元测试，不强行伪造未落地的通知入账链路。
9. 处理页和确认页具备加载、慢处理、部分完成、错误、重试和空状态；离开处理页后后端继续处理，完成或部分完成后进入确认列表；确认完毕后完成 onboarding 并进入 Dashboard。
10. 为 shared AI/确认契约、fallback circuit breaker、分类服务、确认 API、反馈规则、移动端处理页状态机/API client/确认页关键交互补充单元测试；完成 `pnpm build` 与 `pnpm test` 验证。

## Tasks / Subtasks

- [x] Task 1: 建立 AI 分类与确认共享契约 (AC: #2, #3, #5, #6)
  - [x] 1.1 新增 `packages/shared/ai/ai-client.ts`，定义 `ClassifyTransactionInput`、`ClassifyTransactionResult`、`AiClient`、provider 类型和分类错误类型
  - [x] 1.2 新增 `packages/shared/ai/fallback.ts`，实现主/备 provider 选择、连续失败计数、30 分钟回切和可测试的时间注入
  - [x] 1.3 扩展 `packages/shared/constants/billing.ts`、`types/billing.ts`、`schemas/billing.ts`，定义待确认列表、确认/拒绝/批量确认请求与响应
  - [x] 1.4 更新 `packages/shared/index.ts` 导出新契约，并补充 shared 单元测试

- [x] Task 2: 数据库迁移与类型同步 (AC: #4, #7)
  - [x] 2.1 新增 Supabase migration，为 `billing.transactions` 增加 AI 分类元数据字段：`ai_confidence`、`ai_provider`、`classified_at`、必要索引和约束
  - [x] 2.2 如现有 `billing.category_rules` 字段不足以表达反馈闭环，仅通过 migration 做最小兼容扩展；不得改写已发布 migration
  - [x] 2.3 更新 `packages/shared/types/database.ts`，保持 DB snake_case 与 API camelCase 分层

- [x] Task 3: 实现后端分类服务与 AI fallback (AC: #2, #3, #4, #7, #8)
  - [x] 3.1 新增 `apps/api/lib/services/classify-service.ts`，按用户规则优先、AI 兜底的顺序为待分类交易写入 `category_id` 和 AI 元数据
  - [x] 3.2 新增 provider 适配层或默认 provider 工厂，使用环境变量配置主模型/备模型；无密钥时返回受控开发态结果，不能在生产静默假成功
  - [x] 3.3 将 CSV 导入流程接入分类服务：导入成功后对本次新增交易触发分类，失败不回滚交易入库，但需要可被处理页识别为部分完成
  - [x] 3.4 为通知捕获提供复用分类入口；不改变 Story 1.3 未完成的入账边界
  - [x] 3.5 补充分类服务、规则优先级、AI 超时重试、Qwen 降级和部分失败单元测试

- [x] Task 4: 实现待确认交易 API 与反馈闭环 (AC: #5, #6, #7)
  - [x] 4.1 新增 `apps/api/lib/billing/confirmation-service.ts`，封装待确认查询、分类选项、逐条确认、拒绝改分类、批量确认和反馈规则 upsert
  - [x] 4.2 新增 `GET /api/billing/pending-confirmations`
  - [x] 4.3 新增 `POST /api/billing/transactions/[id]/confirm`
  - [x] 4.4 新增 `POST /api/billing/transactions/[id]/reject`
  - [x] 4.5 新增 `POST /api/billing/transactions/confirm-bulk`
  - [x] 4.6 补充 route/service 单元测试，覆盖未授权、跨用户隔离、非 pending 交易、非法分类、批量确认空列表和反馈规则写入

- [x] Task 5: 实现移动端处理页状态机与 API client (AC: #1, #9)
  - [x] 5.1 扩展 `apps/mobile/lib/billing-api.ts` 或新增 `classification-api.ts`，封装分类进度、待确认列表、确认/拒绝/批量确认请求，并校验 API JSON shape
  - [x] 5.2 改造 `apps/mobile/app/(setup)/import-processing.tsx`，实现最少 5 秒 Trust Theater、慢处理提示、30 秒部分完成、错误重试、完成跳转
  - [x] 5.3 处理页使用本次导入摘要和分类结果生成 live feed/分类标签，不引入新的动画依赖；用 Tamagui/React Native 基础动画实现可编译版本
  - [x] 5.4 离开处理页时完成 onboarding 规则与 Dashboard 跳转保持一致，不破坏 Story 1.4 的导入成功链路
  - [x] 5.5 补充处理页状态机/API client 单元测试

- [x] Task 6: 实现移动端分类确认页 (AC: #5, #6, #7, #9)
  - [x] 6.1 新增 `apps/mobile/app/(setup)/classification-confirmation.tsx`，展示待确认交易、AI 分类建议、置信度和分类选择
  - [x] 6.2 实现逐条确认、逐条改分类、逐条拒绝和全部确认；成功后局部更新列表，列表清空后进入 Dashboard
  - [x] 6.3 空状态提示“当前没有待确认交易”，提供进入 Dashboard 入口
  - [x] 6.4 补充确认页关键交互测试或将可测试状态逻辑抽到纯函数测试

- [x] Task 7: 验证、编译测试与 Story 收尾 (AC: #10)
  - [x] 7.1 运行 story 范围 shared/api/mobile 单元测试并修复失败
  - [x] 7.2 运行 `pnpm test`
  - [x] 7.3 运行 `pnpm build`
  - [x] 7.4 更新本 Story 的 Dev Agent Record、File List、Change Log，并将 Story 状态推进到 `review`
  - [x] 7.5 更新 `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Review Findings

- [x] [Review][Patch] 导入后分类未限定本次新增交易 [apps/api/app/api/billing/import-csv/route.ts:81]
- [x] [Review][Patch] 导入成功响应被同步 AI 分类阻塞，处理页无法真实承接后台识别 [apps/api/app/api/billing/import-csv/route.ts:81]
- [x] [Review][Patch] 单条/批量确认允许未分类 pending 交易直接进入 confirmed [apps/api/lib/billing/confirmation-service.ts:162]
- [x] [Review][Patch] 批量确认部分命中时仍返回成功，移动端会直接进入 Dashboard [apps/api/lib/billing/confirmation-service.ts:412]
- [x] [Review][Patch] AI circuit breaker 每次请求重建，无法满足进程内连续失败后降级 [apps/api/lib/services/classify-service.ts:413]
- [x] [Review][Patch] Qwen fallback key 存在但 base URL 缺失时会构造无效请求 [apps/api/lib/services/classify-service.ts:334]
- [x] [Review][Patch] 确认页缺少独立“改分类”流程，反馈规则只挂在 reject 上 [apps/mobile/app/(setup)/classification-confirmation.tsx:116]
- [x] [Review][Patch] 拒绝接口强制要求 categoryId，确认页也不能直接拒绝当前 AI 建议 [packages/shared/schemas/billing.ts:109]
- [x] [Review][Patch] 确认页空态会掩盖仍在分类中的交易 [apps/mobile/app/(setup)/classification-confirmation.tsx:206]
- [x] [Review][Patch] 确认页 mutation 失败无可见错误/恢复路径 [apps/mobile/app/(setup)/classification-confirmation.tsx:216]
- [x] [Review][Patch] 缺少确认页关键交互测试覆盖 [apps/mobile/app/(setup)/classification-confirmation.tsx:141]

## Dev Notes

### 架构约束

- API 响应必须保持 `{ success: boolean, data?: T, error?: { code: string, message: string } }`。
- 金额继续使用整数分，展示层才 `/100`。
- 数据库字段使用 snake_case，API/mobile VO 使用 camelCase；需要 mapper 时放在 `apps/api/lib/...`，不要让 mobile 读取 DB 结构。
- `packages/shared` 不能引入 React、Next、Expo 或 Node-only 依赖；AI client 在 shared 中只放接口、类型、fallback 纯逻辑。
- 前端不得直接调用 `/api/ai/classify`；分类由后端服务在交易入库或处理流程中触发。
- 生产环境 AI 配置缺失必须返回受控错误或部分完成，不能生成假分类；测试和开发态可使用确定性 stub，并必须有清晰分支。
- 数据库变更只能新增 migration，不得改写 `003_create_billing_schema.sql`、`011_seed_csv_parse_rules.sql`、`012_harden_csv_import.sql` 等已发布迁移。

### 现有代码上下文

- CSV 导入已在 `apps/api/lib/billing/import-service.ts` 写入 `billing.transactions`，状态为 `pending_confirmation`，并返回 `importId`/导入摘要。
- `billing.transactions` 当前已有 `category_id`、`status`、`source`、`merchant`、`description`、`transaction_at`；缺少 AI 置信度、provider、分类时间，需要本 Story migration 补齐。
- `billing.category_rules` 已存在，包含 `keyword`、`category_id`、`user_id`、`hit_count`、`source`，可作为用户修正反馈闭环的基础。
- Dashboard 已通过 `GET /api/billing/transactions` 读取最近交易；不要把确认列表塞进 Dashboard API，需新增面向待确认工作流的端点。
- 移动端 `apps/mobile/lib/billing-api.ts` 已有 CSV 上传和严格响应解析，可复用其 `ApiClientError` 与 JSON shape 校验风格。
- 移动端 `apps/mobile/app/(setup)/import-processing.tsx` 目前只是导入摘要占位页，本 Story 负责替换为处理动画和确认入口。
- `rg` 在当前 Windows 环境可能被拒绝执行；必要时使用 PowerShell 枚举文件。

### UX / 文案要求

- 处理页核心文案使用：
  - “正在识别 {current}/{total} 笔交易...”
  - “通常需要 10-20 秒”
  - “最新识别”
  - “已识别 {recognized} 笔交易”
  - “AI 已识别 {coverage}%”
  - “即将为你展示消费全貌...”
  - “处理量较大，请稍候...”
  - “部分交易还在学习中，后续会越来越准”
- 低覆盖/部分失败文案不能把责任转嫁给用户；避免“需要你来帮忙分类”。
- Story 1.5 确认页是用户修正入口，可以明确提供“改分类”，但处理页必须保持零操作观看体验。
- 不新增图表、分享、手动记账、预算或未设计页面。

### Previous Story Learnings

- Story 1.4 已建立 CSV 导入契约、服务层、移动端上传和导入处理占位；本 Story 应扩展这些文件而不是重写导入链路。
- Story 1.4 review 后修复过“持久化失败却返回成功”的问题；本 Story 分类失败也不能返回假成功，应通过部分完成状态呈现。
- Story 1.6 Dashboard 已实现 pending 数量和最近交易展示，但待确认列表未落地；本 Story 需要提供真实确认页，供 Dashboard 后续入口复用。
- Story 1.7 月报严格只统计 confirmed 交易；本 Story 的确认操作会影响月报和 Dashboard 口径，不能把 rejected 交易误算为已确认支出。

### Project Structure Notes

- Shared AI/契约：`packages/shared/ai/`、`packages/shared/constants/billing.ts`、`packages/shared/types/billing.ts`、`packages/shared/schemas/billing.ts`
- API 服务：`apps/api/lib/services/classify-service.ts`、`apps/api/lib/billing/confirmation-service.ts`
- API routes：`apps/api/app/api/billing/pending-confirmations/route.ts`、`apps/api/app/api/billing/transactions/[id]/confirm/route.ts`、`apps/api/app/api/billing/transactions/[id]/reject/route.ts`、`apps/api/app/api/billing/transactions/confirm-bulk/route.ts`
- Mobile：`apps/mobile/app/(setup)/import-processing.tsx`、`apps/mobile/app/(setup)/classification-confirmation.tsx`、`apps/mobile/lib/billing-api.ts` 或 `apps/mobile/lib/classification-api.ts`
- Database：新增 `supabase/migrations/013_*.sql` 或下一个可用序号，并同步 `packages/shared/types/database.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5]
- [Source: _bmad-output/planning-artifacts/epics.md#FR3]
- [Source: _bmad-output/planning-artifacts/architecture.md#AI 服务抽象层]
- [Source: _bmad-output/planning-artifacts/architecture.md#Scenario 01 功能映射]
- [Source: _bmad-output/planning-artifacts/architecture.md#数据类型分层]
- [Source: _bmad-output/C-UX-Scenarios/01-dannys-zero-input-first-experience/01.6-import-processing/01.6-import-processing.md]
- [Source: _bmad-output/E-Assets/content/scenario-01-content-final.md#01.6 Import Processing]
- [Source: apps/api/lib/billing/import-service.ts]
- [Source: apps/mobile/app/(setup)/import-processing.tsx]
- [Source: supabase/migrations/003_create_billing_schema.sql]
- [Source: _bmad-output/implementation-artifacts/1-4-csv-bill-import.md#Previous Story Learnings]
- [Source: _bmad-output/implementation-artifacts/1-6-dashboard-home.md#Dev Notes]
- [Source: _bmad-output/implementation-artifacts/1-7-monthly-report.md#Dev Notes]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-28: 用户选择编译验证、单元测试、AI 判断确认模式。
- 2026-04-28: 当前 Codex worktree 初始为 detached HEAD，且 `git fetch origin` 因 TLS 握手失败未能更新；HEAD 已包含 `origin/main`，基于当前提交创建 `story/1-5-ai-classification-and-confirmation`。
- 2026-04-28: `rg --files` 在当前 Windows 环境被拒绝执行，改用 PowerShell 文件枚举读取上下文。
- 2026-04-28: `_bmad-output/project-context.md` 不存在，使用 AGENTS.md、epics、架构/UX 工件和相邻 Story 1.4/1.6/1.7 作为上下文。
- 2026-04-28: `pnpm --filter mobile exec tsc --noEmit` 初次受阻于 `@money-tracker/ui` declaration 未构建；补跑 `pnpm --filter @money-tracker/ui build` 后通过。
- 2026-04-28: `pnpm build` 初次暴露 API/shared/mobile lint 排序与 React hook 规则问题；清理 import/export 顺序、未使用类型和动画 ref 访问后通过。
- 2026-04-28: 验收核对时发现 fallback 默认 timer 未真实超时；补充默认 `Promise.race` 超时实现和单元测试，确保生产默认路径也执行 8 秒阈值。
- 2026-04-28: 本地 dev API 返回 `transactions.ai_confidence does not exist`；确认原因是运行中的 Supabase DB 未应用新增 migration，已用 `supabase_admin` 对本地容器应用 `013_add_ai_classification_metadata.sql` 并重启 PostgREST。
- 2026-04-28: 用户反馈“只有第一条识别成功，其它一直执行识别”；确认原因包含导入路由 fire-and-forget 分类在 Next dev 中不稳定，以及处理页误用待确认数量作为未识别数量。

### Completion Notes List

- 2026-04-28: 创建 Story 1.5 开发规格，明确 AI 分类后端触发、Trust Theater 处理页、分类确认页、确认 API、反馈规则和验证要求。
- 2026-04-28: Story 1.5 开始实现，状态设为 in-progress。
- 2026-04-28: 完成 shared AI 分类契约、fallback/circuit breaker、确认 API 契约与 schema，并补充 shared 单元测试。
- 2026-04-28: 新增 Supabase migration 与 DB 类型同步，为 `billing.transactions` 增加 AI 分类元数据字段、约束和索引。
- 2026-04-28: 实现后端分类服务、开发态/生产态 provider 工厂、用户规则优先、CSV 导入后异步分类触发和分类服务单元测试。
- 2026-04-28: 实现待确认查询、逐条确认、拒绝并保存修正分类、批量确认 API 与反馈规则 upsert，并补充 service/route 测试。
- 2026-04-28: 改造移动端导入处理页为 Trust Theater 处理流，新增分类确认页，扩展 billing API client，并补充状态机/API client 测试。
- 2026-04-28: 最终验证通过：`pnpm lint`、`pnpm test`、`pnpm build`。
- 2026-04-28: 本地 DB schema 已应用 Story 1.5 migration；`pending-confirmations` route/service 目标测试与 API lint 通过。
- 2026-04-28: 修复导入后分类触发为后端等待执行，同时让 pending confirmations 返回分类摘要；处理页改用 `classifiedAt` 摘要判断完成。已对当前本地用户补跑分类，4 条 pending 交易全部完成分类。
- 2026-04-28: 修复后再次验证通过：`pnpm lint`、`pnpm test`、`pnpm build`。
- 2026-04-29: 按 code review 选择 `0` 批量修复全部 patch findings，并将 Story 状态推进到 done。

### File List

- `_bmad-output/implementation-artifacts/1-5-ai-classification-and-confirmation.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/api/app/api/billing/import-csv/route.ts`
- `apps/api/app/api/billing/pending-confirmations/route.test.ts`
- `apps/api/app/api/billing/pending-confirmations/route.ts`
- `apps/api/app/api/billing/transactions/[id]/confirm/route.test.ts`
- `apps/api/app/api/billing/transactions/[id]/confirm/route.ts`
- `apps/api/app/api/billing/transactions/[id]/reject/route.test.ts`
- `apps/api/app/api/billing/transactions/[id]/reject/route.ts`
- `apps/api/app/api/billing/transactions/confirm-bulk/route.test.ts`
- `apps/api/app/api/billing/transactions/confirm-bulk/route.ts`
- `apps/api/lib/billing/confirmation-error.ts`
- `apps/api/lib/billing/confirmation-service.test.ts`
- `apps/api/lib/billing/confirmation-service.ts`
- `apps/api/lib/services/classify-service.test.ts`
- `apps/api/lib/services/classify-service.ts`
- `apps/mobile/app/(setup)/classification-confirmation.tsx`
- `apps/mobile/app/(setup)/import-processing.tsx`
- `apps/mobile/lib/billing-api.test.ts`
- `apps/mobile/lib/billing-api.ts`
- `apps/mobile/lib/classification-flow.test.ts`
- `apps/mobile/lib/classification-flow.ts`
- `packages/shared/ai/ai-client.ts`
- `packages/shared/ai/fallback.test.ts`
- `packages/shared/ai/fallback.ts`
- `packages/shared/constants/billing.ts`
- `packages/shared/index.ts`
- `packages/shared/schemas/billing.test.ts`
- `packages/shared/schemas/billing.ts`
- `packages/shared/types/billing.ts`
- `packages/shared/types/database.ts`
- `supabase/migrations/013_add_ai_classification_metadata.sql`

### Change Log

- 2026-04-28: 创建 Story 1.5 AI 自动分类与确认开发规格，状态设为 ready-for-dev。
- 2026-04-28: Story 1.5 开始实现，状态设为 in-progress。
- 2026-04-28: 完成 AI 自动分类与确认实现，包含 shared 契约、DB migration、分类服务、确认 API、移动端处理/确认页和测试；状态推进到 review。
- 2026-04-28: 修复处理页识别进度口径和导入后分类执行可靠性，避免只有首条交易完成分类后页面持续显示识别中。
- 2026-04-29: 批量处理 code review patch findings：导入后后台分类限定本次新增交易，确认 API 收紧已分类条件，确认页补齐改分类/拒绝/错误/空态测试，Story 状态推进到 done。
