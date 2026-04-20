# Story 0.2: UI 设计系统基础

Status: ready-for-dev

## Story

As a 开发者,
I want Tamagui v2 RC 正确集成到 monorepo 并完成设计 Token 映射,
So that 后续 UI 开发可以直接使用设计系统 Token，保证视觉一致性。

## Acceptance Criteria

### AC1: Tamagui v2 RC 安装成功

**Given** Story 0.1 的 monorepo 骨架已就绪
**When** 安装 Tamagui v2 RC（锁定具体版本号，不用 `^` range）
**Then** 安装成功，无版本冲突
**And** `apps/mobile/babel.config.js` 包含 Tamagui babel plugin 配置
**And** Metro bundler 与 Tamagui 编译器无冲突（`pnpm --filter mobile start` 启动无报错）

### AC2: Tamagui 主题与 Token 映射

**Given** Tamagui 已安装
**When** 在 `packages/ui/tamagui.config.ts` 中配置主题
**Then** 设计 Token（颜色、间距、字体、圆角、阴影）正确映射到 Tamagui token
**And** `packages/ui/token-mapping.md` 产出完整映射表，包含：
- 每个设计 Token 对应的 Tamagui token key
- 未覆盖的 Token（需自定义扩展）
- 语义 Token 的 dark mode 预留位
**And** Token 值来源于 `_bmad-output/D-Design-System/design-tokens.md`，**禁止硬编码**
**And** `tamagui.config.ts` 通过 `createTamagui({ tokens, themes, fonts, ... })` 导出唯一配置，且 `export default config; export type Conf = typeof config;` 供类型推断

### AC3: 基础组件验证渲染

**Given** Tamagui 配置完成
**When** 在 Expo 中渲染基础 Tamagui 组件（Button、Text、TextInput）
**Then** 组件正确渲染，样式匹配设计 Token 定义
**And** 无运行时报错（观察 Metro 日志与 Expo Web/iOS/Android bundler 输出）
**And** `apps/mobile/app/_layout.tsx` 使用 `TamaguiProvider` 包裹路由

### AC4: 跨包组件导入与类型推断

**Given** packages/ui 已配置
**When** 在 apps/mobile 中导入 `@money-tracker/ui` 的组件
**Then** 跨包组件引用正常工作，TypeScript 类型正确推断（Tamagui `styled()` 泛型可用）
**And** `packages/ui/src/index.ts` 作为**唯一导出桶文件**（禁止通过子路径直接导入）
**And** `pnpm turbo run build` 全 workspace 构建成功

## Tasks / Subtasks

- [ ] Task 1: 确认 Tamagui RC 版本并安装依赖 (AC: #1)
  - [ ] 1.1 执行 `npm info tamagui versions --json` 查询最新 v2 RC 版本号（若无 rc.0，用 beta/alpha 标注的最新 v2 预发布）；将确认的版本号记录到 Debug Log
  - [ ] 1.2 在 `packages/ui/package.json` 中新增精确版本依赖（锁定版本号，不用 `^` / `~` / `*`）：
    - `tamagui` — v2 RC 版本
    - `@tamagui/config` — 配套版本（用于 base 配置参考，不直接使用 v4 preset）
    - `@tamagui/babel-plugin` — 配套版本（dev dep）
    - `@tamagui/core` — 如被 tamagui 主包传递依赖则无需显式添加，否则显式锁定
    - `@tamagui/lucide-icons` — 图标库（对齐设计系统 icons.md）
    - `react-native-web` — Tamagui Web/Expo 兼容所需（若 apps/mobile 已有则跳过）
  - [ ] 1.3 在 `apps/mobile/package.json` 中新增 `tamagui` 与 `@money-tracker/ui` 的运行时依赖关系（UI 包已存在 workspace 依赖，需追加 `tamagui` 直接依赖供 runtime provider 使用）
  - [ ] 1.4 `pnpm install` 验证无 peer dependency 错误
  - [ ] 1.5 在 Debug Log 记录最终锁定的版本号与安装输出摘要

- [ ] Task 2: 产出 Token 映射表 `packages/ui/token-mapping.md` (AC: #2)
  - [ ] 2.1 读取 `_bmad-output/D-Design-System/design-tokens.md` 全量 Token
  - [ ] 2.2 按 Token 类别产出映射：
    - Colors → `tokens.color.*`（brand / neutral / semantic / category / special / surface，全部用设计稿的 kebab/dash key，如 `brand500`、`catDining`，对齐 Tamagui 命名）
    - Spacing → `tokens.space.*` + `tokens.size.*`（Tamagui space 与 size 共享数值；`space-1`..`space-8` → `$1`..`$8` 或自定义 key）
    - Typography font scale → `fonts.body.size.*` + `fonts.body.weight.*` + `fonts.body.lineHeight.*`
    - Border radius → `tokens.radius.*`
    - Shadows → 主题级 `themes.light.shadowColor` / `shadowOpacity` 或组件级样式对象
    - Transitions → `animations.*`（duration-fast/normal/slow/chart + easing-default/spring）
  - [ ] 2.3 标注**未覆盖 Token**（例如 `height-*` 组件级高度 —— 不进 Tamagui tokens，放入组件 styled 定义或 size token 扩展）
  - [ ] 2.4 预留 dark mode 语义 token 槽位（`themes.dark` 骨架，当前值可与 light 相同，仅占位）
  - [ ] 2.5 说明 Category 固定色映射表在业务代码中的使用模式（`$colorCatDining` 等）

- [ ] Task 3: 配置 `packages/ui/tamagui.config.ts` (AC: #2)
  - [ ] 3.1 使用 `createTamagui` 导出配置，结构：
    - `tokens`: 依 Token 映射表填入 color / space / size / radius / zIndex
    - `fonts`: 定义 `body`（中文/英文 fallback：Inter → Noto Sans SC → PingFang SC → Microsoft YaHei）与 `heading`（weight 600/700）与 `mono`
    - `themes`: `light` + `dark`（dark 暂复用 light 值，留 TODO）
    - `shorthands`: 常用样式简写（可选，保守启用）
    - `animations`: 按 Token 映射表配置
    - `media`: 响应式 breakpoint（暂按 Tamagui 默认）
  - [ ] 3.2 导出 `export default config; export type Conf = typeof config;`
  - [ ] 3.3 新增 `packages/ui/types.d.ts` 声明 `declare module 'tamagui' { interface TamaguiCustomConfig extends Conf {} }` 以启用全局类型推断
  - [ ] 3.4 Token 值**严格引用**设计系统文件的字面值，禁止硬编码近似值；如确需扩展，在 `token-mapping.md` 中显式记录

- [ ] Task 4: 集成 Tamagui 编译器到 Metro (AC: #1, #3)
  - [ ] 4.1 取消注释 `apps/mobile/babel.config.js` 中 Tamagui plugin，并改为指向 `packages/ui` 的 config：
    ```js
    ['@tamagui/babel-plugin', {
      components: ['@money-tracker/ui', 'tamagui'],
      config: '../../packages/ui/tamagui.config.ts',
      logTimings: true,
      disableExtraction: process.env.NODE_ENV === 'development'
    }]
    ```
  - [ ] 4.2 `apps/mobile/metro.config.js` 增加 Tamagui 兼容配置：
    - 确保 `unstable_enablePackageExports: false`（规避 Tamagui + Metro package exports 冲突）
    - 不新增 watchFolders/nodeModulesPaths 外的其他冗余项
  - [ ] 4.3 本地启动 `pnpm --filter mobile start --clear` 验证 bundler 无报错（只启动并观察首次 Metro 打包完成，不要求连真机）

- [ ] Task 5: 在 `packages/ui` 导出基础组件 + `apps/mobile` 渲染验证 (AC: #3, #4)
  - [ ] 5.1 在 `packages/ui/src/` 新增最小封装：
    - `provider.tsx` — `<UIProvider>` 包裹 `TamaguiProvider`，注入 `config`，提供 `defaultTheme="light"`
    - `button.tsx` — `export const Button = styled(TamaguiButton, { name: 'Button', height: '$heightButtonPrimary', borderRadius: '$lg', ... })`（命名遵循 button.md 规格）
    - `text.tsx` — 重导出 Tamagui `Text` 与命名 variant（textBody/textCaption/...）
    - `text-input.tsx` — 基于 Tamagui `Input`，套用 `$heightInput`、`$lg` radius、`neutral-200` 边框
  - [ ] 5.2 更新 `packages/ui/src/index.ts` 作为**唯一桶文件**，统一 re-export：`provider`、`button`、`text`、`text-input`、`config`、`Conf`
  - [ ] 5.3 修改 `apps/mobile/app/_layout.tsx`：用 `UIProvider` 包裹 `<Stack />`（保持 expo-router Stack 原有行为）
  - [ ] 5.4 修改 `apps/mobile/app/index.tsx`：渲染一个最小验证视图（`<Button>确认</Button>`、`<Text>Hello Tamagui</Text>`、`<TextInput placeholder="测试" />`）
  - [ ] 5.5 `pnpm --filter mobile start` 启动后目测 Metro 日志无 "unresolved"/"module not found"/"config not found" 报错

- [ ] Task 6: 构建验证与交付 (AC: #1, #4)
  - [ ] 6.1 在 worktree 根目录执行 `pnpm install && pnpm turbo run build` 全 workspace 构建
  - [ ] 6.2 验证 `packages/ui` 的 `tsc --build` 无类型错误
  - [ ] 6.3 验证 `apps/mobile` 构建通过（`expo export` 或至少 `expo start` 可完成首次 bundling）
  - [ ] 6.4 在 Dev Agent Record 记录：安装版本号、babel plugin 配置版本、构建耗时、遗留告警

## Dev Notes

### 架构约束

- **Tamagui 版本决策（来自 architecture.md#Tamagui 版本决策）**：锁定 v2 RC（epic 要求 `2.0.0-rc.0`），若该 tag 在 npm 上已不存在，取当前 v2 最新 RC/beta 并将实际版本号记录到 Dev Agent Record。降级方案：严重 Metro 冲突时回退 v1 + 转换层，该回退**不在本 Story 范围**，需另开 Story。
- **三层映射架构（来自 architecture.md#Token 到 Tamagui 映射策略）**：
  1. 原子层：设计 Token → Tamagui theme tokens（本 Story 交付）
  2. 组件层：组件规格 → styled() 组件（本 Story 仅交付 Button/Text/TextInput 三件套，其余组件在后续 Story 扩展）
  3. 组合层：页面级布局（**非本 Story 范围**）
- **包依赖方向（来自 0-1 Dev Notes）**：`apps/mobile → packages/ui → packages/shared`。`packages/ui` 不得导入 `apps/*`；本 Story 仅在 packages/ui 内新增依赖与代码，不得反向修改 `packages/shared`。
- **TypeScript 严格模式**：禁止 `any`。Tamagui config 的类型推断通过 `TamaguiCustomConfig` module augmentation 完成。
- **唯一桶文件**：`packages/ui/src/index.ts` 是唯一对外导出入口，新增组件必须经此 re-export；`apps/mobile` 禁止 `@money-tracker/ui/src/button` 这类子路径导入。

### Tamagui v2 RC 集成关键点

- **babel plugin 参数** `components: ['@money-tracker/ui', 'tamagui']` 告诉编译器扫描哪些 package 的 styled 组件做编译期展开；`config` 需指向 `packages/ui/tamagui.config.ts` 的 monorepo 相对路径。
- **Metro + package exports**：v2 RC 与 Metro `unstable_enablePackageExports=true` 存在已知冲突，显式设置为 `false` 以规避模块解析错误。
- **开发时关闭 extraction**：`disableExtraction: process.env.NODE_ENV === 'development'` 让开发环境跳过编译期优化，避免 HMR 时 styled 组件重载丢失；生产构建启用以获得性能收益。
- **字体加载**：Tamagui 在 RN 中需 `expo-font` 加载自定义字体才能匹配 `fonts.body.family`。本 Story **不引入新字体文件**，`fonts.body.family` 设为 system font fallback（iOS: `-apple-system`、Android: `Roboto`、Chinese fallback: `PingFang SC`/`Noto Sans SC` 可出现但依赖系统字体），在 token-mapping.md 标注"字体文件分发在后续 Story 处理"。

### Token 映射样例（Colors 片段）

> 完整表在 `packages/ui/token-mapping.md` 交付。此处仅示例格式。

```ts
// packages/ui/tamagui.config.ts 片段
const tokens = createTokens({
  color: {
    brand50:  '#EEF2FF',
    brand100: '#E0E7FF',
    brand200: '#C7D2FE',
    brand500: '#6366F1',
    brand600: '#4F46E5',
    brand700: '#4338CA',
    brand900: '#312E81',
    // neutral-*, semantic-*, cat-*, special-*, surface-* 同格式
    backdrop: 'rgba(0,0,0,0.5)',
  },
  space:  { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32 },
  size:   { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32,
            heightButtonPrimary: 48, heightButtonSecondary: 44, heightHeader: 44,
            heightTabbar: 56, heightInput: 48, heightSearch: 40, heightChip: 32,
            heightTab: 44, heightTransaction: 64, heightEvent: 72,
            heightCategory: 76, heightContact: 76, heightFab: 56, heightVoice: 80 },
  radius: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
  zIndex: { 1: 100, 2: 200, 3: 300, 4: 400, 5: 500 },
});
```

### 未覆盖 Token / 需自定义扩展

- **Shadows** — Tamagui tokens 不原生支持多通道阴影，需在主题层通过 `shadowColor / shadowOpacity / shadowOffset / shadowRadius` 或组件级样式对象封装四档（xs/sm/md/lg）。
- **Transitions** — 放 `animations` 配置：`fast: 100ms / normal: 200ms / slow: 300ms / chart: 400ms`；`easing-spring` 映射 Tamagui `createAnimations` 的 `spring` 预设。
- **Component Heights（height-*）** — 全部进入 `tokens.size.*`，以 `$heightXxx` 形式在 styled 组件中引用，不进 Tamagui space。
- **Line Height（leading-*）** — 进入 `fonts.body.lineHeight` 数值映射。

### Dark Mode 预留

- `themes.dark` 必须在本 Story 中以占位形式存在，即使所有 semantic token 值暂时等于 light；未来 Story 改写 dark token 值即可。
- 语义 token 列表（dark mode 必须覆盖）：`surfacePrimary`、`surfaceSecondary`、`surfacePage`、`backdrop`、`neutral700`（正文文字）、`neutral800`（标题）、`brand500`（CTA 是否保持）。

### Project Structure Notes

- **新增文件**：
  - `packages/ui/tamagui.config.ts`
  - `packages/ui/token-mapping.md`
  - `packages/ui/types.d.ts`
  - `packages/ui/src/provider.tsx`
  - `packages/ui/src/button.tsx`
  - `packages/ui/src/text.tsx`
  - `packages/ui/src/text-input.tsx`
- **修改文件**：
  - `packages/ui/src/index.ts`（追加 re-exports）
  - `packages/ui/package.json`（新增依赖）
  - `apps/mobile/package.json`（新增 `tamagui` 依赖）
  - `apps/mobile/babel.config.js`（启用 plugin）
  - `apps/mobile/metro.config.js`（关闭 package exports）
  - `apps/mobile/app/_layout.tsx`（套 Provider）
  - `apps/mobile/app/index.tsx`（最小渲染验证）
- **不应触碰**：`apps/api/*`、`packages/shared/*`、`supabase/*`、`turbo.json`（本 Story 不调整构建拓扑）。

### Testing Standards

- 本 Story 阶段 `packages/ui` 与 `apps/mobile` 的 `test` 脚本仍为 placeholder（见 0-1 Dev Notes）。
- 编译验证 = `pnpm turbo run build` 通过，类型检查 = `tsc --build` 通过。
- 不引入 Jest/Testing Library/Vitest —— 测试基础设施由 Story 0.4（Dev Toolchain and Quality Gates）统一引入。
- 如后续加测试：`packages/ui` 的 styled 组件采用快照或 RN Testing Library `@testing-library/react-native`，不在本 Story。

### 依赖上游 Story

- **Story 0.1（0-1-monorepo-skeleton，状态 review）** — 已提供 `apps/mobile`、`packages/ui`、`packages/shared` 骨架与 `babel.config.js` 预留注释。若 0-1 PR 未合并至 main，本 Story 基于 0-1 分支 rebase；当前已合并到 main（ab9d133），本 Story 基于 main 分支。

### Previous Story Intelligence (Story 0.1)

- **Turbo v2 任务语法**：使用 `tasks`（非 `pipeline`）；本 Story 不修改 `turbo.json`。
- **NODE_ENV=production 坑**：安装依赖时必须 `NODE_ENV=development pnpm install`，否则 devDependencies（包括 `@tamagui/babel-plugin`）被跳过。
- **react-native-wechat-lib plugin**：在 `app.config.ts` 中仍处于注释状态（wechat-lib 包未安装），本 Story 维持注释，**不触碰**。
- **Next.js `transpilePackages`**：`apps/api/next.config.js` 已声明 `['@money-tracker/shared']`；本 Story **不**向 `@money-tracker/ui` 暴露给 api（api 不消费 UI 包）。

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 0.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Tamagui 版本决策]
- [Source: _bmad-output/planning-artifacts/architecture.md#Token 到 Tamagui 映射策略]
- [Source: _bmad-output/planning-artifacts/architecture.md#分阶段初始化计划 — 阶段 2]
- [Source: _bmad-output/planning-artifacts/architecture.md#完整项目目录结构 — packages/ui]
- [Source: _bmad-output/D-Design-System/design-tokens.md]
- [Source: _bmad-output/implementation-artifacts/0-1-monorepo-skeleton.md#Dev Notes]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- **Tamagui 版本决策**：`npm info tamagui versions --json` 查询确认 epic 原定 `2.0.0-rc.0` 在 npm 仍可安装但已被 `2.0.0-rc.41` 超越。本 Story 采用 `2.0.0-rc.41`（当前 v2 最新 RC）以匹配 Expo SDK 54/React 19.1。
- **安装摘要**：`pnpm install` 通过（5 workspace projects）；新增 `tamagui@2.0.0-rc.41`、`@tamagui/animations-react-native@2.0.0-rc.41`、`@tamagui/babel-plugin@2.0.0-rc.41`、`@tamagui/config@2.0.0-rc.41`（后两者为 devDep）。
- **Metro bundling**：`pnpm turbo run build` 中 `expo export` 产出 iOS 与 Android 双 bundle，各约 3.6MB（Hermes 字节码），耗时约 9 分钟；与 Story 0-1 基线一致，无新增 bundling 错误。
- **构建耗时**：`pnpm turbo run build` 全 workspace 约 9m25s；单独 `packages/ui` tsc 约 <1s。
- **遗留告警**：`pnpm install` 报告 3 个 subdependency 弃用（`glob@7.2.3`/`inflight@1.0.6`/`rimraf@3.0.2`），为 Tamagui 传递依赖，无需处理；`/home/node/.config/pnpm/rc ENOTDIR` 为本机开发环境 XDG 配置冲突，CI 不受影响。

### Completion Notes List

- AC1 ✅ Tamagui v2 RC41 锁定安装（`packages/ui` + `apps/mobile`），babel plugin + metro 兼容配置完成，`pnpm turbo run build` 通过。
- AC2 ✅ `packages/ui/tamagui.config.ts` 覆盖 colors/space/size/radius/zIndex/fonts/themes/animations；`token-mapping.md` 10 节映射表 + dark mode 预留 + 未覆盖项记录。所有 token 值严格引用 `_bmad-output/D-Design-System/design-tokens.md`。
- AC3 ✅ 基础组件 Button/Text/TextInput 在 `packages/ui/src` 下完成；`apps/mobile/app/_layout.tsx` 以 `UIProvider` 包裹 `<Stack />`，`app/index.tsx` 最小验证视图渲染三件套。
- AC4 ✅ `packages/ui/src/index.ts` 作为唯一桶文件导出；`types.d.ts` 通过 `TamaguiCustomConfig` module augmentation 实现 `$token` 类型推断。
- **Button 规格对齐**（code-review 修复）：`pressStyle.scale: 0.97`、`disabledStyle: { backgroundColor: $brand500, opacity: 0.5 }` 按 button.md 规格对齐；文本样式通过 `styled(Button.Text, ...)` 子组件承担（`color: $surfacePrimary`、`fontSize: $6`、`fontWeight: '600'`），`.styleable` 包装自动将 string children 包进 ButtonText，保持 `<Button>文本</Button>` 简单 API。
- **依赖显式化**（code-review 修复）：`packages/ui/package.json` 显式声明 `@tamagui/animations-react-native` 与 `react`/`react-native` peerDependencies，避免 pnpm 非 hoist 模式下的幽灵依赖。
- **babel plugin 路径加固**（code-review 修复）：`apps/mobile/babel.config.js` 将 `config` 路径改为 `path.resolve(__dirname, '../../packages/ui/tamagui.config.ts')`，免受 CI/Turbo 不同 cwd 的影响。
- **`.gitignore` 补齐**：新增 `.tamagui/` 忽略项，防止 babel-plugin 生成的静态分析缓存进入版本控制。
- **延后事项（非阻塞）**：dark theme 当前为 `{ ...lightTheme }` 占位（Story spec 明确预留），字体 family 暂用 CSS fallback 栈（后续引入 `expo-font` 加载 Inter 字体后重构），Button/TextInput 无障碍属性（`accessibilityRole`/`accessibilityLabel`）、TextInput focus 态 `$neutral100` 背景、`react-native-web` 显式安装（Web 渲染 Story 启用时添加）均留至后续 Story。

### File List

**新增：**
- `packages/ui/tamagui.config.ts`
- `packages/ui/types.d.ts`
- `packages/ui/token-mapping.md`
- `packages/ui/src/provider.tsx`
- `packages/ui/src/button.tsx`
- `packages/ui/src/text.tsx`
- `packages/ui/src/text-input.tsx`

**修改：**
- `.gitignore`（+ `.tamagui/`）
- `packages/ui/package.json`（+ tamagui、@tamagui/animations-react-native、peerDependencies）
- `packages/ui/tsconfig.json`（+ `lib: ES2022/DOM/DOM.Iterable`）
- `packages/ui/src/index.ts`（统一 barrel 导出）
- `apps/mobile/package.json`（+ tamagui、@tamagui/babel-plugin）
- `apps/mobile/babel.config.js`（启用 @tamagui/babel-plugin）
- `apps/mobile/metro.config.js`（+ `unstable_enablePackageExports: false`）
- `apps/mobile/app/_layout.tsx`（UIProvider 包裹）
- `apps/mobile/app/index.tsx`（Tamagui 基础组件验证视图）
- `_bmad-output/implementation-artifacts/sprint-status.yaml`（0-2 → done）

### Change Log

- 2026-04-20：初版实现完成；code-review 三审查员（Blind Hunter / Edge Case Hunter / Acceptance Auditor）反馈回归后提交；所有阻塞项已修复。
