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
- API 响应格式：`{ success: boolean, data?: T, error?: string }`

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
