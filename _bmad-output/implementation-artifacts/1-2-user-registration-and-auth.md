# Story 1.2: 用户注册与认证

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 新用户,
I want 通过微信登录入口或手机号 OTP 快速完成注册与登录,
so that 我可以用最少操作进入后续首次使用流程。

## Acceptance Criteria

1. 注册页提供微信登录入口、手机号输入、验证码发送/验证、隐私协议勾选与查看入口，且页面使用 Expo Router 路由与现有 Tamagui/UI 组件体系实现。
2. `POST /api/auth/otp-send`、`POST /api/auth/otp-verify`、`POST /api/auth/refresh` 使用 `packages/shared/schemas/auth.ts` 做 Zod 入参校验，并返回统一 `ApiResponse<T>` 格式。
3. OTP 登录成功后区分新老用户：新用户进入 `/(setup)/permissions`，老用户进入 `/(main)/dashboard`；新用户必须先同意隐私协议，并记录 `consentAt`。
4. 移动端使用 Zustand `auth-store` 持久化 access token / refresh token / 用户基础信息到 AsyncStorage，并在冷启动时执行认证路由守卫。
5. 为共享认证契约、API 认证逻辑、移动端认证辅助逻辑补充单元测试；完成仓库 build / test / lint 验证。

## Tasks / Subtasks

- [x] Task 1: 建立共享认证契约与常量 (AC: #2, #4)
  - [x] 1.1 新增 `packages/shared/schemas/auth.ts`，定义 OTP 发送、OTP 验证、refresh、wechat callback 请求 schema
  - [x] 1.2 新增 `packages/shared/types/auth.ts` 与 `packages/shared/constants/auth.ts`，统一 session、路由目标、错误码、时长常量
  - [x] 1.3 更新 `packages/shared/index.ts` 导出认证相关 contracts
- [x] Task 2: 实现 API 认证逻辑 (AC: #2, #3)
  - [x] 2.1 新增 `apps/api/lib/auth/` 认证服务，完成 OTP challenge、JWT/access token、refresh token、用户内存仓储逻辑
  - [x] 2.2 新增 `app/api/auth/otp-send/route.ts`、`otp-verify/route.ts`、`refresh/route.ts`
  - [x] 2.3 新增 `app/api/auth/wechat-callback/route.ts`，提供微信 callback contract 与开发态回调支撑
- [x] Task 3: 实现移动端认证页、认证 store 与路由守卫 (AC: #1, #3, #4)
  - [x] 3.1 新增 `apps/mobile/stores/auth-store.ts` 与认证 API client / JWT helper
  - [x] 3.2 新增 `app/(auth)/register.tsx` 及认证组件，完成手机号 OTP 流程、协议勾选与微信入口
  - [x] 3.3 新增 `app/(setup)/permissions.tsx`、`app/(main)/dashboard.tsx` 最小占位路由，并在根 layout 中加入冷启动认证守卫
- [x] Task 4: 测试、编译验证与代码审查修补 (AC: #5)
  - [x] 4.1 为 shared / api / mobile 认证逻辑补充 co-located 单元测试
  - [x] 4.2 运行 `pnpm build`、`pnpm test`、`pnpm lint` 并修复失败项
  - [x] 4.3 根据 AI 代码审查结果修补必须处理的问题

## Dev Notes

- 当前仓库还没有 Story 1.1 的 Welcome / Onboarding 实现，路由守卫需优先保证未登录用户进入注册页，而不是依赖不存在的欢迎页。
- 认证实现必须遵守现有 monorepo 边界：`apps/mobile -> packages/shared`，`apps/api -> packages/shared`，禁止从 `packages/*` 反向依赖应用代码。
- API 层继续沿用 `withRequestLogging()`、`ApiResponse<T>`、业务错误码大写蛇形命名。
- Expo Router 路径以架构文档为准：`/(auth)/register`、`/(setup)/permissions`、`/(main)/dashboard`。
- 当前仓库尚未接入微信原生 SDK；本 Story 需要先落地登录入口、API contract、开发态 callback 支撑，避免直接引入高风险原生依赖。

### Project Structure Notes

- 移动端新增文件应放在 `apps/mobile/app/`、`apps/mobile/components/`、`apps/mobile/lib/`、`apps/mobile/stores/`。
- API 认证逻辑放在 `apps/api/app/api/auth/` 与 `apps/api/lib/auth/`。
- 共享 schema / types / constants 放在 `packages/shared/` 下并由根导出文件统一导出。

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#类别 2：认证与安全]
- [Source: _bmad-output/planning-artifacts/architecture.md#类别 3：API 与通信]
- [Source: _bmad-output/planning-artifacts/architecture.md#命名规范]
- [Source: _bmad-output/planning-artifacts/architecture.md#项目结构与边界]
- [Source: _bmad-output/01-dannys-zero-input-first-experience-Prototype/stories/01.3.S1-registration-ui-structure.md]
- [Source: _bmad-output/01-dannys-zero-input-first-experience-Prototype/stories/01.3.S2-registration-auth-flow.md]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-24: 执行 `pnpm install`，补齐移动端认证依赖与锁文件。
- 2026-04-24: 执行 `pnpm build`、`pnpm test`、`pnpm lint` 完成全仓验证。
- 2026-04-24: 修复 Windows worktree 下 `apps/api` 的 Next.js standalone 构建失败问题。
- 2026-04-24: 完成 AI 代码审查并修补开发态 OTP 可用性与老用户协议校验规则。

### Completion Notes List

- 完成 `packages/shared` 认证契约、认证常量与 Zod schema 导出，统一 mobile / api 认证边界。
- 完成 `apps/api` OTP 发送、OTP 验证、refresh 与微信 callback contract，实现内存仓储版认证闭环与统一 `ApiResponse<T>` 返回。
- 完成 `apps/mobile` 注册页、权限页、Dashboard 占位页、Zustand 持久化 `auth-store` 与冷启动路由守卫。
- 根据 AI 审查结果修补了两个必须处理的问题：Windows worktree 构建兼容性，以及开发态验证码不可见/老用户被强制勾选协议的问题。
- 当前 Story 范围内采用内存仓储与开发态 OTP 回显，未扩展到真实短信通道或微信原生 SDK 接入。
- 已验证 `pnpm build`、`pnpm test`、`pnpm lint` 全部通过。

### File List

- _bmad-output/implementation-artifacts/1-2-user-registration-and-auth.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- apps/api/app/api/auth/auth-routes.test.ts
- apps/api/app/api/auth/otp-send/route.ts
- apps/api/app/api/auth/otp-verify/route.ts
- apps/api/app/api/auth/refresh/route.ts
- apps/api/app/api/auth/wechat-callback/route.ts
- apps/api/lib/auth/repository.ts
- apps/api/lib/auth/service.test.ts
- apps/api/lib/auth/service.ts
- apps/api/lib/auth/token.ts
- apps/api/lib/auth/types.ts
- apps/api/next.config.js
- apps/mobile/app/(auth)/_layout.tsx
- apps/mobile/app/(auth)/register.tsx
- apps/mobile/app/(main)/_layout.tsx
- apps/mobile/app/(main)/dashboard.tsx
- apps/mobile/app/(setup)/_layout.tsx
- apps/mobile/app/(setup)/permissions.tsx
- apps/mobile/app/_layout.tsx
- apps/mobile/app/index.tsx
- apps/mobile/components/auth/agreement-checkbox.tsx
- apps/mobile/components/auth/phone-auth-form.tsx
- apps/mobile/components/auth/wechat-login-button.tsx
- apps/mobile/lib/auth-api.test.ts
- apps/mobile/lib/auth-api.ts
- apps/mobile/package.json
- apps/mobile/stores/auth-store.test.ts
- apps/mobile/stores/auth-store.ts
- packages/shared/constants/auth.ts
- packages/shared/index.ts
- packages/shared/schemas/auth.test.ts
- packages/shared/schemas/auth.ts
- packages/shared/types/auth.ts
- pnpm-lock.yaml

### Change Log

- 2026-04-24: 完成 Story 1.2 的共享认证契约、API OTP/refresh/callback、移动端注册与路由守卫实现，并通过编译、测试、lint 与 AI 代码审查修补。
