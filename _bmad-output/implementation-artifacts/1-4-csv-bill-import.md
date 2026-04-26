# Story 1.4: CSV 账单导入

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 用户,
I want 上传支付宝或微信的 CSV 账单文件,
so that 我的历史消费记录能被快速导入到应用中。

## Acceptance Criteria

1. 账单导入页位于 `apps/mobile/app/(setup)/bill-import.tsx`，已登录用户可从权限页进入；页面展示支付宝 CSV、微信 CSV 两种来源、支付宝导出教程、文件选择/上传状态、错误提示与“跳过，先看看”入口，并匹配 01.5 设计与文案要求。
2. 移动端使用 Expo 文件选择器选择 `.csv` 文件，上传到 `POST /api/billing/import-csv`，请求携带 Bearer token，文件大小限制 10MB；非法格式、超限、取消选择、网络失败都展示可恢复的友好状态。
3. 后端 `POST /api/billing/import-csv` 使用 `multipart/form-data` 接收文件，返回统一 `ApiResponse<ImportCsvResult>`；支持支付宝 GBK/GB18030 CSV 与微信 UTF-8 CSV，失败时先做编码回退，仍失败则返回 `IMPORT_ENCODING_ERROR`。
4. CSV 解析规则从 `billing.csv_parse_rules` 每次请求动态读取 `is_active = true` 的最新规则；规则至少包含 `platform`、`encoding`、`headerMatch`、`skipRows`、`columnMapping`、`dateFormat`。提供 `PUT /api/admin/csv-rules` 更新规则，满足热更新要求。
5. 解析结果归一化为统一交易格式：`amount_cents` 为整数分、`transaction_at` 为 UTC ISO 时间、`merchant`/`description` 保留原始含义、`source` 为 `alipay_csv` 或 `wechat_csv`、`status = pending_confirmation`。
6. 后端自动去重：同一用户、相同来源、相同金额、商户、交易时间的交易不重复导入；重复导入同一文件返回摘要中的 `duplicateCount`，不创建重复记录。
7. 导入成功后返回摘要：`totalCount`、`importedCount`、`duplicateCount`、`failedCount`、`importId`、`platform`；移动端展示成功状态并导航到 `/(setup)/import-processing`，同时保留“跳过”到 Dashboard 的路径。
8. 为共享 CSV schema/类型、后端解析器/规则仓储/导入服务/API route、移动端导入 API client/页面状态补充单元测试；完成 `pnpm build` 与 `pnpm test` 验证。

## Tasks / Subtasks

- [x] Task 1: 建立共享 CSV 导入契约 (AC: #2, #3, #4, #7)
  - [x] 1.1 新增 `packages/shared/schemas/billing.ts`，定义导入结果、解析规则、管理员规则更新的 Zod schema
  - [x] 1.2 新增 `packages/shared/types/billing.ts` 与 `packages/shared/constants/billing.ts`，统一平台、错误码、大小限制、路由常量
  - [x] 1.3 更新 `packages/shared/index.ts` 导出 billing contracts，并补充 schema 单元测试
- [x] Task 2: 实现后端 CSV 解析、规则读取与去重入库 (AC: #3, #4, #5, #6, #7)
  - [x] 2.1 新增 `apps/api/lib/billing/csv-parser.ts`，实现支付宝/微信 CSV 文本解析、编码回退、金额转分、UTC 时间归一化
  - [x] 2.2 新增 `apps/api/lib/billing/csv-rule-repository.ts`，从 Supabase `billing.csv_parse_rules` 读取最新 active 规则，并在无数据库/无规则时提供受控开发态默认规则
  - [x] 2.3 新增 `apps/api/lib/billing/import-service.ts`，完成用户鉴权上下文、交易去重、批量插入与导入摘要生成
  - [x] 2.4 新增 `apps/api/app/api/billing/import-csv/route.ts`，接入 `withRequestLogging()`、`requireAuthenticatedUser()` 与统一 `ApiResponse<T>`
  - [x] 2.5 新增 `apps/api/app/api/admin/csv-rules/route.ts`，实现规则更新入口；MVP 可用服务端环境变量保护，但不得开放未鉴权写入
- [x] Task 3: 实现移动端账单导入页与 API client (AC: #1, #2, #7)
  - [x] 3.1 新增 `apps/mobile/lib/billing-api.ts`，支持 multipart 上传、Bearer token、非 JSON/错误响应兜底
  - [x] 3.2 新增 `apps/mobile/app/(setup)/bill-import.tsx` 与必要的 `components/billing/` 组件，展示来源选择、支付宝教程、文件状态、错误状态和跳过入口
  - [x] 3.3 新增 `apps/mobile/app/(setup)/import-processing.tsx` 最小处理页，占位承接成功跳转；完整 Trust Theater 属于 Story 1.5
  - [x] 3.4 更新 `apps/mobile/app/(setup)/permissions.tsx`，授权/跳过后进入 `/(setup)/bill-import`，不得直接结束 onboarding
- [x] Task 4: 数据库规则种子与类型同步 (AC: #4, #5)
  - [x] 4.1 补充 Supabase migration 或 seed，写入支付宝/微信默认 active CSV 解析规则，遵守“数据库变更必须通过 migration”
  - [x] 4.2 如数据库类型受 migration 影响，更新 `packages/shared/types/database.ts`
- [x] Task 5: 测试、编译验证与故事收尾 (AC: #8)
  - [x] 5.1 为 shared / api / mobile 补充 co-located 单元测试，覆盖合法导入、非法格式、10MB 限制、GBK 回退、重复导入摘要
  - [x] 5.2 运行 `pnpm build` 与 `pnpm test`，修复失败项
  - [x] 5.3 更新本 Story 的 Dev Agent Record、File List、Change Log，并将 Story 状态推进到 `review`

## Dev Notes

- 本 Story 工作目录必须使用 worktree：`C:\Users\boil\.codex\worktrees\3a70\worktrees\story\1-4-csv-bill-import`，分支 `story/1-4-csv-bill-import`。原目录 `C:\Users\boil\.codex\worktrees\3a70\money-tracker` 是 detached HEAD，不要在原目录开发。
- 本分支基于 `origin/main`。Story 1.3 当前仍在 `story/1-3-android-notification-capture` PR 中，1.4 不得依赖 1.3 未合并代码；只能复用 main 已有的 `/(setup)/permissions` 占位和认证流。
- 当前 `origin/main` 已有 `billing.transactions`、`billing.csv_parse_rules`、`requireAuthenticatedUser()`、`successResponse()`/`errorResponse()`、移动端 `api-client.ts` 与 `auth-store`。优先扩展这些模式，避免重复造一套 API/认证/响应封装。
- `apps/api` 当前没有 CSV 解析依赖。若实现需要新依赖，优先选择纯 JS 且服务端可运行的库；新增依赖前确认必要性并记录在 Completion Notes。不要把 `iconv-lite` 或 CSV parser 放进 `packages/shared`，避免 shared 变成运行时重依赖包。
- 移动端当前没有 `expo-document-picker` 依赖。若使用 Expo 官方文件选择器，应通过 Expo 兼容版本安装，并保持 `apps/mobile/package.json` 与 `pnpm-lock.yaml` 同步。
- 金额必须全程整数分，不允许浮点金额入库。展示金额才 `/100`。
- 日期时间入库必须是 UTC ISO/timestamptz；支付宝/微信 CSV 的本地时间按中国时区解释后转 UTC。
- 去重范围限定同一用户，不能跨用户去重；服务端使用 service role client 时仍必须显式写入 `user_id = auth user id`。
- `PUT /api/admin/csv-rules` 是 Story 要求的热更新入口，但 MVP 不应暴露公开写规则能力。可使用 `CSV_RULES_ADMIN_TOKEN` 或同等服务端密钥检查；无密钥时返回受控错误，不可静默成功。
- Import Processing 页面在本 Story 只做承接和摘要展示，Story 1.5 会实现 AI 分类与 5s Trust Theater。不要在本 Story 直接实现 AI 分类。

### Project Structure Notes

- 共享契约：`packages/shared/schemas/billing.ts`、`packages/shared/types/billing.ts`、`packages/shared/constants/billing.ts`
- API route：`apps/api/app/api/billing/import-csv/route.ts`、`apps/api/app/api/admin/csv-rules/route.ts`
- API 服务：`apps/api/lib/billing/`
- 移动端页面：`apps/mobile/app/(setup)/bill-import.tsx`、`apps/mobile/app/(setup)/import-processing.tsx`
- 移动端组件：`apps/mobile/components/billing/`
- 移动端 API：`apps/mobile/lib/billing-api.ts`
- 数据库变更：`supabase/migrations/010_seed_csv_parse_rules.sql` 或后续顺序号，避免改写已发布 migration

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4]
- [Source: _bmad-output/planning-artifacts/epics.md#FR2]
- [Source: _bmad-output/planning-artifacts/epics.md#NFR1]
- [Source: _bmad-output/planning-artifacts/epics.md#NFR6]
- [Source: _bmad-output/planning-artifacts/architecture.md#Scenario 01 功能映射]
- [Source: _bmad-output/planning-artifacts/architecture.md#数据类型分层]
- [Source: _bmad-output/planning-artifacts/research/technical-bill-import-feasibility-research-2026-04-09.md#Technology Stack Analysis]
- [Source: _bmad-output/C-UX-Scenarios/01-dannys-zero-input-first-experience/01.5-bill-import/01.5-bill-import.md]
- [Source: _bmad-output/C-UX-Scenarios/01-dannys-zero-input-first-experience/01.6-import-processing/01.6-import-processing.md]
- [Source: _bmad-output/E-Assets/content/scenario-01-content-final.md#01.5 Bill Import]
- [Source: apps/api/lib/api-response.ts]
- [Source: apps/api/lib/middleware/require-authenticated-user.ts]
- [Source: supabase/migrations/003_create_billing_schema.sql]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-26: 在正确 worktree `C:\Users\boil\.codex\worktrees\3a70\worktrees\story\1-4-csv-bill-import` 继续实现；`_bmad-output/project-context.md` 不存在，使用 Story Dev Notes、AGENTS.md 与现有代码模式作为上下文。
- 2026-04-26: 首次验证发现 worktree 缺少 `node_modules`，执行 `pnpm install` 后恢复 shared/api/mobile 构建与测试能力。
- 2026-04-26: mobile build 首次失败因 `expo-document-picker` 仅更新 lockfile 未实际链接，执行 `pnpm install` 后通过。
- 2026-04-26: 收紧编码失败测试，修正 CSV fallback 解码乱码时返回 `IMPORT_ENCODING_ERROR` 的路径。

### Completion Notes List

- 2026-04-26: 修复本地上传 CSV 时 API 500：API dev 输出目录改为 `.next-dev` 避免 `pnpm build` 覆盖运行中的 dev 产物；开发环境下导入规则/交易持久化不可用时使用受控 fallback 让验证流程可继续，生产环境仍返回服务不可用；移动端 Sentry 无 DSN 时初始化为 disabled，消除 `Sentry.wrap` 早于 init 的 warning。

- 2026-04-26: 登录成功后的 `apps/mobile/app/(main)/me.tsx` Account 菜单新增“账单导入”入口，跳转 `/(setup)/bill-import`，便于跳过后再次进入导入流程；新增 `docs/demo-bill-import-wechat.csv` 作为微信 CSV 验证样例。

- 建立 shared billing 契约：CSV 平台/来源/错误码/路由/10MB 限制常量，Zod schema 和导出桶。
- 实现后端 CSV 导入链路：动态读取 active 解析规则、开发态默认规则 fallback、CSV 解析、GB18030/GBK/UTF-8 编码回退、金额整数分、北京时间转 UTC ISO、同用户同来源同金额同商户同时间去重、批量写入 `billing.transactions`。
- 新增 `POST /api/billing/import-csv` multipart API 与 `PUT /api/admin/csv-rules` 热更新 API；管理员规则写入由 `CSV_RULES_ADMIN_TOKEN` 保护，未配置或错误 token 不会静默成功。
- 新增 Supabase migration `010_seed_csv_parse_rules.sql` 写入支付宝/微信默认 active 规则；`packages/shared/types/database.ts` 已有目标表结构，本 Story 无需更新。
- 移动端新增 Expo DocumentPicker CSV 选择、multipart Bearer 上传、错误兜底、账单导入页、导入处理摘要页；权限页下一步改为进入导入页，跳过/完成导入后再进入 Dashboard。
- 新增依赖：`apps/mobile` 添加 Expo 54 兼容版本 `expo-document-picker@~14.0.8`，并同步 `pnpm-lock.yaml`。
- 验证通过：`pnpm build`、`pnpm test`。

### File List

- `_bmad-output/implementation-artifacts/1-4-csv-bill-import.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/api/app/api/admin/csv-rules/route.test.ts`
- `apps/api/app/api/admin/csv-rules/route.ts`
- `apps/api/app/api/billing/import-csv/route.test.ts`
- `apps/api/app/api/billing/import-csv/route.ts`
- `apps/api/lib/billing/csv-parser.test.ts`
- `apps/api/lib/billing/csv-parser.ts`
- `apps/api/lib/billing/csv-rule-repository.ts`
- `apps/api/lib/billing/default-csv-rules.ts`
- `apps/api/lib/billing/errors.ts`
- `apps/api/lib/billing/import-service.test.ts`
- `apps/api/lib/billing/import-service.ts`
- `apps/api/next.config.js`
- `apps/api/package.json`
- `apps/api/tsconfig.json`
- `apps/mobile/app/(setup)/bill-import.tsx`
- `apps/mobile/app/(setup)/import-processing.tsx`
- `apps/mobile/app/(setup)/permissions.tsx`
- `apps/mobile/app/(main)/me.tsx`
- `apps/mobile/components/billing/bill-import-source-card.tsx`
- `apps/mobile/components/billing/types.ts`
- `apps/mobile/lib/billing-api.test.ts`
- `apps/mobile/lib/billing-api.ts`
- `apps/mobile/lib/sentry.test.ts`
- `apps/mobile/lib/sentry.ts`
- `apps/mobile/package.json`
- `.gitignore`
- `docs/demo-bill-import-wechat.csv`
- `packages/shared/constants/billing.ts`
- `packages/shared/index.ts`
- `packages/shared/schemas/billing.test.ts`
- `packages/shared/schemas/billing.ts`
- `packages/shared/types/billing.ts`
- `pnpm-lock.yaml`
- `supabase/migrations/010_seed_csv_parse_rules.sql`

### Change Log

- 2026-04-26: 修复上传接口本地 500、API dev/build 产物互相覆盖和移动端 Sentry 初始化 warning；`pnpm build`、`pnpm test` 通过。

- 2026-04-26: 为登录成功后的 Me 页面补充“账单导入”入口，并新增可用于验证的微信 CSV demo 文件。

- 2026-04-26: 创建 Story 1.4 开发规格，状态设为 ready-for-dev。
- 2026-04-26: 完成 CSV 账单导入 shared/API/mobile/migration 实现与单元测试，`pnpm build`、`pnpm test` 通过，状态推进到 review。
