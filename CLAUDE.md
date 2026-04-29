# CLAUDE.md — money-tracker

AI驱动的零记账智能财务管家 -- 通过AI自动捕获和智能管理，消灭"手动记账"。

## 产品概要

- **定位**：零记账的AI财务管家
- **目标用户**：已婚家庭、城市白领、副业人群、人情往来用户
- **商业模式**：B2C Freemium（免费层 F1-F3 获客，付费层 F4-F13 变现）
- **三层架构**：零记账引擎（免费）→ 多维理解（付费）→ AI管家（付费高级）
- **技术栈**：React Native (Expo) + Next.js 14+ + Supabase + AI API + Vercel
- **详细需求**：见 `_bmad-output/product-brief.md`

## 开发规范

- TypeScript 严格模式，禁止 `any`
- 文件命名 kebab-case，组件 PascalCase，函数/hooks camelCase
- 组件使用函数式 + Hooks，禁止 class 组件
- 金额使用分（cents）存储，整数运算，展示时 /100
- 日期时间 UTC 存储，展示时转用户时区
- 数据库变更必须通过 Supabase migration
- API 响应格式：`{ success: boolean, data?: T, error?: { code: string, message: string } }`

## Definition of Done（DoD）

任何 Story 声明为 `done` 前必须同时满足以下条目。由 `sprint-change-proposal-2026-04-29.md` 引入，2026-04-29 起生效。

**通用 DoD**

- Story AC 全部满足且单元测试通过
- ESLint / TypeScript 严格模式无错误（`pnpm lint` 和 `pnpm typecheck` 全绿）
- sprint-status.yaml 与 Story 文件状态一致（避免 Epic 1 retro §3.1 状态不可信问题）
- review findings 全部 close 或 explicitly triaged 为后续 Story
- 涉及 schema 变更必须通过 Supabase migration 并在 Dev Agent Record 记录迁移脚本

**UI Story 追加 DoD**

- 必须完成 `_bmad-output/planning-artifacts/high-fidelity-mapping-checklist.md` 实例并附在 Story 文件或 review 资料
- 自评保真度：核心路径 >= 90% / 次要路径 >= 80%；低于阈值不得进入 review
- 新增/修改 UI 组件必须提交对应 Storybook Story
- 所有组件实现来自 `packages/ui/src/`，禁止页面内现场近似实现
- Token 使用遵循 `_bmad-output/D-Design-System/design-tokens.md`，禁止硬编码颜色/间距/圆角

**受保护 API / 权限 Story 追加 DoD**

- 遵循 `architecture.md`「应用认证契约」章节的 token 来源、验签、user 识别规则
- 单元测试覆盖三种分支：无 token / 过期 token / 有效 token
- 涉及登录后 API 写入 / 图片选择 / 系统权限 / 文件选择 / 语音 / 截图的 Story：必须在 Dev Agent Record 记录至少一条真机或等效网络验收证据（URL 不得为 localhost）

**交易/聚合 Story 追加 DoD**

- direction 与 pending 口径遵循 `architecture.md`「交易方向与状态口径」章节
- Dashboard / 月报 / 列表 / 手动记账 四处聚合口径一致，有单元测试交叉验证

---
<!-- bmad-project-config -->
## Workflow Commands

Workflow files are located in the `workflow/` directory, to be executed step-by-step by AI Agents.

### dev-story — Develop a Story

**Trigger**: User says `start story` followed by a Story number (e.g. `1-2`)

Execution: Read `workflow/story-dev-workflow-single-repo.md` and follow the workflow steps.

**Cross-session handoff**: If a previous session only completed "Create Story" or only "Implementation", the user can use the same trigger phrase in a new session, attaching in the same message: **`BACKEND_ROOT_ABS`** (required), `BACKEND_ROOT` (optional relative path), `BRANCH`, which step was reached, and whether to continue with implementation or code review only. See the "Cross-session startup phrases" section in the workflow file.


## Project Standards

- Coding standards: refer to project-specific documentation (e.g. `docs/CODE_STYLE.md` or equivalent)
- Before making changes, read relevant existing code to understand patterns and conventions
<!-- /bmad-project-config -->
