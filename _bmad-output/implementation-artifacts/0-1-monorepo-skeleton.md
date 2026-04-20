# Story 0.1: Monorepo 骨架搭建

Status: review

## Story

As a 开发者,
I want 一个配置正确的 Turborepo + pnpm monorepo 项目骨架,
So that 所有后续开发工作在统一的项目结构和依赖管理下进行。

## Acceptance Criteria

### AC1: pnpm install 成功

**Given** 一台干净的开发机器
**When** 执行 `pnpm install`
**Then** 所有依赖安装成功，无 peer dependency 错误
**And** `.npmrc` 包含 `shamefully-hoist=true` 和 `strict-peer-dependencies=false`

### AC2: 目录结构正确

**Given** monorepo 项目结构已创建
**When** 检查目录结构
**Then** 存在以下 workspace 包:
- `apps/mobile` — Expo SDK 54 bare minimum
- `apps/api` — Next.js 15 App Router bare minimum
- `packages/shared` — TypeScript 类型 + Zod schemas 占位
- `packages/ui` — Tamagui 组件包占位
**And** `pnpm-workspace.yaml` 正确定义所有 workspace
**And** `turbo.json` 定义 build/lint/test pipeline

### AC3: Expo 移动端启动

**Given** apps/mobile 已配置
**When** 执行 `pnpm --filter mobile start`
**Then** Expo 开发服务器成功启动，无编译错误
**And** `app.config.ts` 支持动态环境变量读取
**And** `app.config.ts` 配置 `react-native-wechat-lib` plugin
**And** `metro.config.js` 配置 `watchFolders` 指向 workspace root

### AC4: Next.js API 启动

**Given** apps/api 已配置
**When** 执行 `pnpm --filter api dev`
**Then** Next.js 开发服务器成功启动，无编译错误
**And** `/api/health` 返回 `{ success: true }`

### AC5: 共享包类型解析

**Given** packages/shared 已配置
**When** 在 apps/mobile 或 apps/api 中导入 `@money-tracker/shared`
**Then** 类型正确解析，TypeScript 编译无错误
**And** `tsconfig.base.json` 配置 strict mode，禁止 `any`
**And** TypeScript project references（composite + references）配置正确

### AC6: 环境变量模板

**Given** `.env.example` 已创建
**When** 检查环境变量模板
**Then** 包含所有必需的环境变量占位（Supabase URL/Key、JWT Secret、AI API Key 等）
**And** 支持 `.env.local` / `.env.development` / `.env.production` 分层

## Tasks / Subtasks

- [x] Task 1: 初始化 monorepo 根配置 (AC: #1, #2)
  - [x] 1.1 创建 `package.json`（root，workspaces 管理脚本）
  - [x] 1.2 创建 `.npmrc`（`shamefully-hoist=true`, `strict-peer-dependencies=false`）
  - [x] 1.3 创建 `pnpm-workspace.yaml`（定义 `apps/*`, `packages/*`）
  - [x] 1.4 创建 `turbo.json`（定义 build/lint/test pipeline，声明依赖拓扑）
  - [x] 1.5 创建 `tsconfig.base.json`（strict mode, 禁止 any, composite, paths 别名）
  - [x] 1.6 创建 `.gitignore`（node_modules, .env*, .turbo, dist, .expo 等）
  - [x] 1.7 创建 `.env.example`（所有必需环境变量占位）

- [x] Task 2: 创建 apps/mobile — Expo 移动端 (AC: #3)
  - [x] 2.1 初始化 Expo SDK 54 最小项目（`app.json`, `package.json`）
  - [x] 2.2 创建 `app.config.ts`（动态环境变量 + `react-native-wechat-lib` plugin 配置）
  - [x] 2.3 创建 `metro.config.js`（`watchFolders` 指向 monorepo root，`nodeModulesPaths` 解析共享包）
  - [x] 2.4 创建 `tsconfig.json`（extends base, references 指向 shared/ui）
  - [x] 2.5 创建 `babel.config.js`（最小配置，预留 Tamagui plugin 位置）
  - [x] 2.6 创建最小 `app/_layout.tsx` 和 `app/index.tsx` 入口文件

- [x] Task 3: 创建 apps/api — Next.js 后端 (AC: #4)
  - [x] 3.1 初始化 Next.js 15 App Router 项目（`package.json`, `next.config.js`）
  - [x] 3.2 创建 `tsconfig.json`（extends base, references 指向 shared）
  - [x] 3.3 创建 `app/layout.tsx`（最小 layout）
  - [x] 3.4 创建 `app/api/health/route.ts`（返回 `{ success: true }`）

- [x] Task 4: 创建 packages/shared (AC: #5)
  - [x] 4.1 创建 `package.json`（name: `@money-tracker/shared`）
  - [x] 4.2 创建 `tsconfig.json`（composite: true, 纯 TS 无 React 依赖）
  - [x] 4.3 创建占位目录结构：`types/`, `schemas/`, `utils/`, `constants/`, `api/`, `ai/`
  - [x] 4.4 创建 `types/api-response.ts`（`ApiResponse<T>` 泛型定义）
  - [x] 4.5 创建 `index.ts` 统一导出

- [x] Task 5: 创建 packages/ui (AC: #5)
  - [x] 5.1 创建 `package.json`（name: `@money-tracker/ui`）
  - [x] 5.2 创建 `tsconfig.json`（composite: true, references 指向 shared）
  - [x] 5.3 创建 `src/index.ts` 占位导出

- [x] Task 6: 验证与清理 (AC: #1-6 全部)
  - [x] 6.1 执行 `pnpm install`，确认无 peer dependency 错误
  - [x] 6.2 验证 `pnpm --filter api dev` 启动成功，`/api/health` 返回正确
  - [x] 6.3 验证 `pnpm --filter mobile start` 可以启动（或 `expo start` 无报错）
  - [x] 6.4 验证跨包类型导入（apps/api 导入 @money-tracker/shared 编译通过）
  - [x] 6.5 验证 `pnpm turbo run build` 全包构建成功

## Dev Notes

### 架构约束

- **技术栈版本（来自 architecture.md）**：
  - Expo SDK 54 (RN 0.81.5, React 19.1.0) — 注意：Expo SDK 55 已发布，但架构决策锁定 SDK 54
  - Next.js 15 App Router — 注意：Next.js 16 已发布，但架构决策锁定 15
  - TypeScript 5.7+ strict mode — 注意：TS 6.0 已发布，使用 5.7.x 系列稳定版
  - Turborepo latest (当前 2.9.x)
  - pnpm 9.x (当前 9.15.x)

- **命名规范**：文件 kebab-case，组件 PascalCase，函数/hooks camelCase
- **API 响应格式**：`{ success: boolean, data?: T, error?: { code: string, message: string } }`
- **TypeScript 严格模式**：禁止 `any`，tsconfig strict: true
- **不引入架构文档未列出的新依赖**

### Amelia (开发者) 关键反馈（来自 architecture Party Mode）

1. `.npmrc` 必须配置 `shamefully-hoist=true`, `strict-peer-dependencies=false` — pnpm + RN 原生模块 peer deps 是已知高耗时问题
2. Metro bundler monorepo 配置 — `watchFolders` 指向 workspace root, `nodeModulesPaths` 解析共享包
3. TypeScript project references — `tsconfig.json` composite + references，包间类型检查
4. 环境变量分层 — `.env.local` / `.env.development` / `.env.production`，Expo 用 `app.config.ts` 动态读取
5. Turborepo remote cache — 可选，加速 CI

### 项目结构（本 Story 需创建部分）

```
money-tracker/
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                    # root scripts + devDependencies
├── .npmrc
├── tsconfig.base.json
├── .gitignore
├── .env.example
├── apps/
│   ├── mobile/                     # Expo SDK 54
│   │   ├── app.json
│   │   ├── app.config.ts
│   │   ├── babel.config.js
│   │   ├── metro.config.js
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── app/
│   │       ├── _layout.tsx
│   │       └── index.tsx
│   └── api/                        # Next.js 15
│       ├── next.config.js
│       ├── package.json
│       ├── tsconfig.json
│       └── app/
│           ├── layout.tsx
│           └── api/
│               └── health/
│                   └── route.ts
├── packages/
│   ├── shared/                     # 纯 TypeScript
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── index.ts
│   │   ├── types/
│   │   │   └── api-response.ts
│   │   ├── schemas/
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── api/
│   │   └── ai/
│   └── ui/                         # Tamagui 组件包占位
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts
```

### 包依赖方向（严格单向，来自 architecture.md）

```
apps/mobile  → packages/ui + packages/shared
apps/api     → packages/shared
packages/ui  → packages/shared（仅类型）
packages/shared → 无内部依赖
```

禁止反向依赖。`packages/*` 不得导入 `apps/*`。`packages/shared` 不得有 React 依赖。

### .env.example 应包含的变量

```bash
# Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# AI
AI_PRIMARY_API_KEY=your-gpt-codex-api-key
AI_PRIMARY_BASE_URL=https://api.openai.com/v1
AI_FALLBACK_API_KEY=your-qwen-api-key
AI_FALLBACK_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# Auth
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret
SMS_ACCESS_KEY_ID=your-aliyun-sms-key
SMS_ACCESS_KEY_SECRET=your-aliyun-sms-secret
SMS_SIGN_NAME=了然
SMS_TEMPLATE_CODE=SMS_000000

# App
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### turbo.json pipeline 配置要点

```json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
    "lint": {},
    "test": {},
    "dev": { "cache": false, "persistent": true }
  }
}
```

### metro.config.js 关键配置

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
```

### app.config.ts react-native-wechat-lib plugin

```typescript
export default ({ config }) => ({
  ...config,
  plugins: [
    // 预留 Tamagui plugin 位置
    // 微信 SDK — Expo build 时自动注入 AppID
    ['react-native-wechat-lib', { appId: process.env.WECHAT_APP_ID || '' }],
  ],
});
```

### health endpoint

```typescript
// apps/api/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: true });
}
```

### References

- [Source: architecture.md#分阶段初始化计划 — 阶段 1]
- [Source: architecture.md#初始化配置清单]
- [Source: architecture.md#完整项目目录结构]
- [Source: architecture.md#Starter Template 评估 — Option C]
- [Source: architecture.md#包依赖方向]
- [Source: epics.md#Story 0.1]
- [Source: prd-bridge.md#FR20]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Turbo 2.x 使用 `tasks` 而非 `pipeline`（已修正 turbo.json）
- NODE_ENV=production 导致 devDependencies 未安装（使用 NODE_ENV=development 重装）
- Next.js build 需要 page.tsx 避免错误页面预渲染问题（已添加）
- react-native-wechat-lib plugin 在包未安装时需注释掉（已处理）
- `pnpm turbo run build` 全部 4 个包构建成功（13m22s）
- `pnpm turbo run test` 全部 4 个包测试通过（placeholder echo）
- **Post-merge 调试（2026-04-20）**：
  - 现象：`pnpm --filter mobile start` 启动正常，但真机扫码进入应用即崩溃，报 `TypeError: getDevServer is not a function (it is Object)`（iOS / Android 均复现）
  - 初判：Metro 在 monorepo 下解析到 `react-native` 两份副本 → 为 `metro.config.js` 追加 `disableHierarchicalLookup: true` + `extraNodeModules` Proxy，强制 singleton → 未解决
  - 二判：定位到 `@expo/metro-runtime@4.0.1/src/messageSocket.native.ts` 第 4 行 `require('react-native/Libraries/Core/Devtools/getDevServer')` 未取 `.default`，而 RN 0.81 的 `getDevServer.js` 改用 ESM `export default` → 该包自身 bug
  - 三判（用户质疑后修正）：既然是三方包 bug，不应自行 patch；根因是 `apps/mobile/package.json` 中 Expo 生态子包版本错乱（非 SDK 54 bundle），pnpm 才拉出旧的 `@expo/metro-runtime@4.0.1`。改为按 `expo/bundledNativeModules.json` 对齐所有版本，`@expo/metro-runtime` 随之升至 `6.1.2`（已移除该 bug），最终解决
  - 附加：保险起见将 `newArchEnabled` 由 `true` 改为 `false`（Tamagui v2 + 微信 SDK 在新架构下的兼容性 Story 0-2/0-3 再单独验证）；在 `app.config.ts` plugins 中显式登记 `expo-router`

### Completion Notes List

- 所有 6 个 Task（26 个 subtask）均已完成
- 4 个 workspace 包均可独立构建
- Expo mobile export 生成 iOS/Android bundles（924/920 modules）
- Next.js API 构建成功，health endpoint 返回 `{ success: true }`
- TypeScript strict mode 编译通过，跨包类型解析正常
- wechat-lib plugin 已在 app.config.ts 中预留（注释状态，待包安装后启用）
- **Post-merge 修复（PR #1 合并后）**：真机扫码运行时发现 `TypeError: getDevServer is not a function (it is Object)`，根因是 `apps/mobile/package.json` 中多个 Expo 生态子包版本与 SDK 54 不匹配（`expo-router` 写成 `~4.0.0` 属 SDK 52、`expo-status-bar` `~2.0.0` 属 SDK 51、`react-native-safe-area-context` `~5.4.0`、`react-native-screens` `~4.10.0`），导致 pnpm 传递依赖解析出 `@expo/metro-runtime@4.0.1`（其 `messageSocket.native.ts` 对 RN 0.81 的 `getDevServer` ESM default export 存在 CJS interop bug）。已按 `node_modules/expo/bundledNativeModules.json` 源真值将所有版本对齐 SDK 54，`@expo/metro-runtime` 随之升到 `6.1.2`，bug 消失，iOS / Android 真机均可正常运行。
- **经验教训**：后续 Story 初始化 Expo 包时，应使用 `expo install <pkg>` 而不是手写版本号，让 Expo CLI 按 SDK 对齐版本，避免同类问题。

### File List

- `package.json` — monorepo root, turbo/typescript devDeps, pnpm 9.15.9
- `.npmrc` — shamefully-hoist=true, strict-peer-dependencies=false
- `pnpm-workspace.yaml` — apps/*, packages/*
- `turbo.json` — build/lint/test/dev/clean tasks
- `tsconfig.base.json` — strict mode, composite, ESNext module, bundler resolution
- `.gitignore` — node_modules, .next, .expo, .turbo, .env*, coverage, dist
- `.env.example` — Supabase, AI, WeChat, SMS, App URL 变量占位
- `apps/mobile/package.json` — Expo SDK 54, React 19.1.0, RN 0.81.5（post-merge 已将 `expo-router ~6.0.23`、`expo-status-bar ~3.0.9`、`react-native-safe-area-context ~5.6.0`、`react-native-screens ~4.16.0` 对齐 SDK 54 bundle，并新增 `react-dom 19.1.0`）
- `apps/mobile/app.config.ts` — 动态配置, env vars, wechat plugin 预留（post-merge `newArchEnabled: false`，plugins 显式注册 `expo-router`）
- `apps/mobile/metro.config.js` — monorepo watchFolders + nodeModulesPaths（post-merge 追加 `disableHierarchicalLookup: true` 与 `extraNodeModules` Proxy，强制 singleton 解析）
- `apps/mobile/babel.config.js` — babel-preset-expo, Tamagui 预留
- `apps/mobile/tsconfig.json` — extends base, paths, references shared/ui
- `apps/mobile/app/_layout.tsx` — expo-router Stack layout
- `apps/mobile/app/index.tsx` — 最小入口页面
- `apps/api/package.json` — Next.js 15.3, React 19.1.0
- `apps/api/next.config.js` — transpilePackages: @money-tracker/shared
- `apps/api/tsconfig.json` — extends base, Next.js plugin, paths, references
- `apps/api/app/layout.tsx` — 最小 HTML layout
- `apps/api/app/page.tsx` — 首页, 链接到 /api/health
- `apps/api/app/api/health/route.ts` — GET → { success: true }
- `packages/shared/package.json` — @money-tracker/shared, zod ^3.24.0
- `packages/shared/tsconfig.json` — composite: true, extends base
- `packages/shared/types/api-response.ts` — ApiResponse<T> 泛型
- `packages/shared/index.ts` — 统一导出
- `packages/ui/package.json` — @money-tracker/ui, depends on shared
- `packages/ui/tsconfig.json` — composite: true, jsx: react-jsx, references shared
- `packages/ui/src/index.ts` — 占位导出

## Change Log

> 所有变更均在 Story 0-1 PR #1 合并之后发生，作为 post-merge 修复直接提交到 main，再由当前 PR 回填到 Story 文档，不改动 AC。

| Commit | 类型 | 说明 |
|---|---|---|
| `751020c` | fix(mobile) | `metro.config.js` 追加 `disableHierarchicalLookup: true` 与 `extraNodeModules` Proxy，强制 monorepo 下 `react-native` 等 singleton 包只从 `apps/mobile/node_modules` 解析，避免重复副本 |
| `747f903` | fix(mobile) | 临时 `pnpm patch @expo/metro-runtime@4.0.1`，修正 `messageSocket.native.ts` 对 RN 0.81 `getDevServer` ESM default export 的 CJS interop；**已在后续 commit 80b48cf 中随版本升级撤销该 patch** |
| `80b48cf` | fix(mobile) | 按 `node_modules/expo/bundledNativeModules.json` 将 `apps/mobile/package.json` 所有 Expo 生态子包对齐 SDK 54（`expo-router ~6.0.23`、`expo-status-bar ~3.0.9`、`react-native-safe-area-context ~5.6.0`、`react-native-screens ~4.16.0`），新增 `react-dom 19.1.0`；`@expo/metro-runtime` 经传递依赖升到 6.1.2，bug 消失；移除上一步的 pnpm patch |
| `5f8ce3a` | chore(mobile) | `app.config.ts` 将 `newArchEnabled: true` 改为 `false`（Fabric/TurboModules 与 Tamagui v2 RC + 微信 SDK 的兼容性放到 Story 0-2/0-3 再验证）；在 plugins 中显式注册 `'expo-router'` |
| `49d2847` | chore(doc) | Story 0-1 状态 `draft → review` |
| 本 PR | docs | 将上述 4 条修复的背景、根因、经验教训回填到 Dev Agent Record / Debug Log / File List |

### 治理决策：为何未触发 Correct-Course

- `architecture.md` 仅约束顶层版本（Expo SDK 54、RN 0.81.5、React 19.1.0、Tamagui v2 RC），未指定 `expo-router`、`expo-status-bar`、`react-native-safe-area-context`、`react-native-screens`、`react-dom` 等子包版本
- 本次变更全部是把 `apps/mobile/package.json` 中与 SDK 54 不匹配的子包「拉回」到 SDK 54 bundle 指定的版本，属于实现层对齐而非架构层变更
- `newArchEnabled: false` 是运行期开关，非架构契约；若后续决定长期保持旧架构，再评估是否单独走 CC
- 因此经用户裁决，本次不走 `bmad-correct-course`，仅以文档 PR 形式回填变更记录
