# Story 1.8: 基础账户管理与 PIPL 合规

Status: done

## Story

As a 用户,
I want 管理我的基本个人信息并控制我的数据隐私,
so that 我对自己的账户和数据有掌控感，符合个人信息保护要求。

## Acceptance Criteria

### AC1: 我的页面展示基础账户信息

**Given** 用户已登录  
**When** 进入“我的”页面  
**Then** 展示用户头像、昵称、手机号（脱敏显示）  
**And** 提供基础设置入口：个人资料编辑、退出登录  

### AC2: 可编辑昵称与头像

**Given** 用户点击“编辑资料”  
**When** 进入资料编辑页  
**Then** 可修改昵称、头像  
**And** 修改通过 `PUT /api/user/profile` 保存，Zod 验证入参  

### AC3: PIPL 删除账户流程

**Given** PIPL 合规要求  
**When** 用户点击“删除账户”  
**Then** 展示二次确认弹窗，明确说明数据将被永久删除  
**And** 确认后调用 `DELETE /api/user/delete-account`  
**And** 后端执行级联删除，覆盖所有已落地的用户关联数据  
**And** 删除完成后强制退出登录，清除本地存储  

### AC4: 基础设置页

**Given** 用户查看设置页  
**When** 进入基础设置  
**Then** 展示：隐私协议查看、数据删除入口、当前登录方式、应用版本  

### AC5: 退出登录

**Given** 用户点击“退出登录”  
**When** 确认退出  
**Then** 清除 Zustand auth-store 中的 JWT 和用户信息  
**And** 清除 AsyncStorage 持久化数据  
**And** 导航到欢迎页  

## Tasks / Subtasks

- [x] Task 1: 建立账户与设置的客户端基础设施 (AC: #1, #4, #5)
  - [x] 1.1 安装并配置 Story 1.8 所需的最小依赖：`zustand`、`@react-native-async-storage/async-storage`、`@tanstack/react-query`
  - [x] 1.2 在 `apps/mobile/lib/` 建立 API 客户端、运行时配置读取与通用错误处理
  - [x] 1.3 在 `apps/mobile/stores/auth-store.ts` 建立持久化认证 store，包含 JWT、用户资料、登录方式与清空动作
  - [x] 1.4 在 `apps/mobile/app/_layout.tsx` 接入 QueryClient、认证态判断与基础受保护路由

- [x] Task 2: 实现“我的”页、资料编辑页与设置页 (AC: #1, #2, #4)
  - [x] 2.1 新增“我的”页，展示头像、昵称、脱敏手机号、编辑资料入口、设置入口、退出登录入口
  - [x] 2.2 新增资料编辑页，支持昵称与头像 URL 编辑，并接入 `PUT /api/user/profile`
  - [x] 2.3 新增基础设置页，展示隐私协议入口、删除账户入口、当前登录方式、应用版本
  - [x] 2.4 复用 `@money-tracker/ui` 现有组件；缺失 UI 以 story 范围内最小补充实现

- [x] Task 3: 实现用户资料 API 与服务层 (AC: #2)
  - [x] 3.1 在 `packages/shared/schemas/` 新增用户资料 DTO 的 Zod schema，并在 `packages/shared/index.ts` 暴露
  - [x] 3.2 在 `apps/api/app/api/user/profile/route.ts` 实现 `GET` / `PUT`，统一返回 `ApiResponse`
  - [x] 3.3 在 `apps/api/lib/services/`、`mappers/`、`db/repositories/` 实现用户资料读取/更新最小链路
  - [x] 3.4 明确当前数据模型使用 `auth.user_profiles` 扩展表，不重新设计第二套用户表

- [x] Task 4: 实现删除账户 API 与 PIPL 删除流程 (AC: #3)
  - [x] 4.1 在 `apps/api/app/api/user/delete-account/route.ts` 实现 `DELETE`，统一返回 `ApiResponse`
  - [x] 4.2 通过服务层集中执行删除逻辑，优先调用 Supabase Admin 能力删除 `auth.users` 主记录
  - [x] 4.3 对尚未落地的 Phase 2 表保持前向兼容：以扩展点方式预留，不伪造 schema
  - [x] 4.4 删除成功后移动端清空 auth-store 与 AsyncStorage，并跳回欢迎页

- [x] Task 5: 实现退出登录与客户端交互闭环 (AC: #5)
  - [x] 5.1 在 auth-store 暴露 `clearSession` 动作
  - [x] 5.2 在我的页和设置页加入退出登录入口
  - [x] 5.3 退出登录后重置客户端缓存（包含 QueryClient 和 auth-store）

- [x] Task 6: 编写测试与完成验证 (AC: #1, #2, #3, #4, #5)
  - [x] 6.1 为共享 schema 与纯函数补单元测试
  - [x] 6.2 为 API route / service / repository 补服务端测试
  - [x] 6.3 为移动端 auth-store 补测试；页面交互以 lint + type-check + build 验证为主
  - [x] 6.4 运行 story 范围内构建、测试、lint，并记录结果

### Review Findings

- [x] [Review][Decision] 隐私协议查看入口当前只提供摘要页，是否接受为 MVP 范围？ - 决策：接受 MVP 范围，但入口改为与登录协议一致的 WebView 承载隐私说明，后续可直接替换为完整隐私说明页面内容。
- [x] [Review][Patch] 未登录或会话失效用户可停留在受保护的 `(main)` 页面 [apps/mobile/app/_layout.tsx:68]
- [x] [Review][Patch] 服务端 500 响应会把 Supabase/数据库底层错误信息返回给客户端 [apps/api/app/api/user/profile/route.ts:17]
- [x] [Review][Patch] “我的”页退出登录入口缺少 AC5 要求的确认流程 [apps/mobile/app/(main)/me.tsx:59]

## Dev Notes

### 实现摘要

- `packages/shared` 新增用户资料类型、Zod schema 和手机号脱敏工具。
- `apps/api` 新增 `GET/PUT /api/user/profile` 与 `DELETE /api/user/delete-account`，并补齐 repository / service / mapper / auth middleware 最小链路。
- `apps/mobile` 新增 QueryClient、auth-store、API client、账户区路由、我的页、资料编辑页、设置页、隐私说明 WebView 页。
- “我的”页支持显示昵称、脱敏手机号、登录方式、头像 URL 渲染/回退头像，并提供编辑资料、设置、直接退出登录入口。
- 设置页提供隐私摘要入口、删除账户入口、当前登录方式、应用版本；删除成功和退出登录都会清空 QueryClient 与持久化 auth-store。

### Verification

- PASS: `pnpm --filter @money-tracker/shared build`
- PASS: `pnpm --filter @money-tracker/ui build`
- PASS: `pnpm --filter @money-tracker/shared test`
- PASS: `pnpm --filter api test`
- PASS: `pnpm --filter mobile test`
- PASS: `pnpm --filter api exec tsc --noEmit`
- PASS: `pnpm --filter mobile exec tsc --noEmit`
- PASS: `pnpm --filter mobile lint`
- PASS: root `pnpm test`
- PASS with review follow-up: 我的页补上直接退出登录入口，并支持头像 URL 实际渲染
- BUILD BLOCKED BY ENVIRONMENT: root `pnpm build` 中 `apps/api` 的 Next standalone traced files 复制阶段在 Windows 下因 `symlink` 权限报 `EPERM`；`next build` 的 compile / lint / type-check 已完成，失败发生在 `.next/standalone` 文件复制阶段

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Branch: `story/1-8-basic-account-and-pipl-compliance`
- BACKEND_ROOT_ABS: `C:\Users\boil\.codex\worktrees\1159\money-tracker`

### Completion Notes List

- 2026-04-24 Create Story 完成：
  - 基于 `main` 创建并推送分支 `story/1-8-basic-account-and-pipl-compliance`
  - 校正 PIPL 删除链路的数据模型描述，明确为 `auth.users` + `auth.user_profiles`
- 2026-04-24 Implementation 完成：
  - 交付账户页、资料编辑页、设置页、隐私摘要页
  - 交付用户资料 API、删除账户 API 和最小认证识别链路
  - 交付共享 schema / 类型 / 脱敏工具与对应测试
  - 根据 review 收口 AC：我的页补充直接退出登录入口与头像 URL 渲染

### File List

- `_bmad-output/implementation-artifacts/1-8-basic-account-and-pipl-compliance.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/api/app/api/user/profile/route.ts`
- `apps/api/app/api/user/profile/route.test.ts`
- `apps/api/app/api/user/delete-account/route.ts`
- `apps/api/app/api/user/delete-account/route.test.ts`
- `apps/api/lib/api-response.ts`
- `apps/api/lib/db/repositories/user-repo.ts`
- `apps/api/lib/mappers/user-mapper.ts`
- `apps/api/lib/middleware/require-authenticated-user.ts`
- `apps/api/lib/middleware/request-logger.test.ts`
- `apps/api/lib/services/user-service.ts`
- `apps/api/lib/services/user-service.test.ts`
- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app/index.tsx`
- `apps/mobile/app/(app)/_layout.tsx`
- `apps/mobile/app/(app)/me.tsx`
- `apps/mobile/app/(app)/profile.tsx`
- `apps/mobile/app/(app)/settings.tsx`
- `apps/mobile/app/(app)/privacy.tsx`
- `apps/mobile/lib/api-client.ts`
- `apps/mobile/lib/query-client.ts`
- `apps/mobile/lib/runtime-config.ts`
- `apps/mobile/lib/session.ts`
- `apps/mobile/stores/auth-store.ts`
- `apps/mobile/stores/auth-store.test.ts`
- `apps/mobile/package.json`
- `apps/mobile/tsconfig.json`
- `packages/shared/index.ts`
- `packages/shared/types/user.ts`
- `packages/shared/schemas/user.ts`
- `packages/shared/schemas/user.test.ts`
- `packages/shared/utils/mask-phone-number.ts`
- `packages/shared/utils/mask-phone-number.test.ts`
- `pnpm-lock.yaml`
