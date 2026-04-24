# Story 1.1: 欢迎页与引导页

Status: ready-for-dev

## Story

As a 新用户,
I want 看到产品价值主张和核心功能介绍,
so that 我理解“了然”能帮我解决什么问题，并愿意继续注册。

## Acceptance Criteria

### AC1: 欢迎页首屏价值传达

**Given** 用户首次打开应用  
**When** 加载欢迎页  
**Then** 展示品牌 Hero 图和核心价值主张文案  
**And** 视觉匹配 `E-Assets/page-designs/01.1-welcome.html`  
**And** 图片/视觉参考取自 `E-Assets/icons/` 和 `E-Assets/images/heroes/`  
**And** 文案取自 `E-Assets/content/scenario-01-content-final.md`  
**And** 组件实现遵循 `D-Design-System/components/*.md`  
**And** 样式 Token 取自 `D-Design-System/design-tokens.md`  
**And** 交互须匹配 `C-UX-Scenarios/01-dannys-zero-input-first-experience/01.1-welcome/01.1-welcome.md`

### AC2: Onboarding 轮播引导

**Given** 用户在欢迎页点击“开始体验”  
**When** 进入引导页  
**Then** 展示 3 张轮播卡片，每张突出一个核心功能  
**And** 支持左右滑动切换，底部圆点指示当前位置  
**And** 提供“跳过”按钮直接进入注册页  
**And** 视觉匹配 `E-Assets/page-designs/01.2-onboarding.html`  
**And** 内容叙事、交互和页面状态匹配 `C-UX-Scenarios/01-dannys-zero-input-first-experience/01.2-onboarding/01.2-onboarding.md`

### AC3: 路由衔接到注册页

**Given** 用户完成轮播或点击“跳过”  
**When** 点击最后一页 CTA 或“跳过”  
**Then** 导航到注册页（Story 1.2）  
**And** 路由使用 Expo Router `(auth)/welcome.tsx` → `(auth)/onboarding.tsx` → `(auth)/register.tsx`

## Tasks / Subtasks

- [ ] Task 1: 建立 Story 1.1 的 Expo Router 路由骨架 (AC: #3)
  - [ ] 1.1 新增 `apps/mobile/app/(auth)/_layout.tsx`，为欢迎页、引导页、注册占位页提供独立路由组
  - [ ] 1.2 将 `apps/mobile/app/index.tsx` 从当前 Tamagui 占位首页改为跳转到 `/(auth)/welcome`
  - [ ] 1.3 新增 `apps/mobile/app/(auth)/register.tsx` 作为 Story 1.2 前的临时落点，只承载路由衔接和占位说明，不实现真实认证逻辑

- [ ] Task 2: 实现欢迎页视觉结构与首屏交互 (AC: #1, #3)
  - [ ] 2.1 实现全屏、不可滚动、safe-area aware 的欢迎页布局，包含品牌区、Hero 区、价值主张区、底部 CTA 区
  - [ ] 2.2 按 `scenario-01-content-final.md` 中已精修的文案实现欢迎页文案：
    - [ ] 标题：`花了多少，自动知道`
    - [ ] 副标题：`支付宝、微信的每笔消费，自动归类，不用动手记`
    - [ ] CTA：`开始体验`
  - [ ] 2.3 在不新增依赖的前提下，用现有 React Native/Tamagui 原语复刻 Hero 与品牌视觉层次；不引入 SVG/Lottie/轮播第三方库
  - [ ] 2.4 为欢迎页加入轻量入场动画和 CTA 按压反馈；如系统开启减少动态效果，降级为静态呈现
  - [ ] 2.5 点击“开始体验”时导航到 `/(auth)/onboarding`

- [ ] Task 3: 实现 3 屏 Onboarding 轮播与状态流转 (AC: #2, #3)
  - [ ] 3.1 建立 Onboarding 纯数据配置模块，定义 3 张轮播卡片的标题、副标题、视觉说明、按钮状态
  - [ ] 3.2 使用现有 React Native 能力实现横向分页轮播与手势切换，不新增 carousel 依赖
  - [ ] 3.3 实现顶部“跳过”、底部进度圆点、Slide 1/2 的“下一步”、Slide 3 的“开始体验”
  - [ ] 3.4 按精修文案实现 3 张 Slide：
    - [ ] Slide 1 标题：`不用动手记一笔`
    - [ ] Slide 1 副标题：`支付宝、微信支付……消费到账自动识别\\n不用手动输入，也不会漏掉`
    - [ ] Slide 2 标题：`每笔花销，自动归类，一目了然`
    - [ ] Slide 2 副标题：`餐饮、交通、购物……打开就是分好的\\n不用整理，不用对账`
    - [ ] Slide 3 标题：`你的AI财务管家，已就位`
    - [ ] Slide 3 副标题：`月度报告自动生成，异常消费主动提醒\\n从今天起，有人帮你看着钱了`
  - [ ] 3.5 “跳过”和最后一页 CTA 都导航到 `/(auth)/register`
  - [ ] 3.6 Android 返回行为符合 UX：在 Slide 2/3 返回上一张 Slide；在 Slide 1 返回欢迎页

- [ ] Task 4: 增加最小可回归验证并完成交付记录 (AC: #1, #2, #3)
  - [ ] 4.1 为 Onboarding 纯数据模块添加单元测试，验证 slide 数量、关键 CTA 文案、最终路由目标
  - [ ] 4.2 运行 `pnpm --filter mobile lint`
  - [ ] 4.3 运行 `pnpm --filter mobile test`
  - [ ] 4.4 运行 `pnpm --filter mobile build`
  - [ ] 4.5 更新 Dev Agent Record 的 File List、Completion Notes、Change Log

## Dev Notes

### 架构约束

- 当前移动端入口已经使用 `expo-router`，且 `apps/mobile/app/_layout.tsx` 已用 `UIProvider` 包裹根栈；Story 1.1 只需要在 `app/(auth)` 路由组内扩展，不要重做根 Provider
- `apps/mobile` 当前仍停留在 Story 0.2 的 Tamagui 验证页；Story 1.1 应替换这个占位流为真实首屏/引导流
- 只使用 `@money-tracker/ui` 对外 barrel 导出；不要写 `@money-tracker/ui/src/...` 形式的子路径导入
- 现有仓库未安装 SVG、Lottie、专用 carousel、icon runtime 等额外依赖；本 Story 禁止为欢迎页/Onboarding 额外引入新依赖
- 视觉“匹配”以信息层级、布局节奏、Token、动效意图为准；在现有依赖下使用 Tamagui/React Native 原语实现，不要求在 Story 1.1 直接消费设计资产中的 SVG 原文件
- Story 1.1 只负责导航到注册页，不实现微信 OAuth、OTP、隐私协议等真实认证逻辑；这些属于 Story 1.2

### 文件结构要求

- 优先保持 Expo Router 路由文件轻薄，把页面主体抽到屏幕级模块中，避免把所有逻辑堆进 `app/(auth)/*.tsx`
- 建议新增目录：
  - `apps/mobile/screens/onboarding/`：承载欢迎页、引导页、共享 slide 数据与小型局部组件
  - `apps/mobile/app/(auth)/`：只保留路由文件与组级 layout
- `register.tsx` 在 Story 1.1 仅作为占位页和路由目标；后续 Story 1.2 可以直接在该文件上继续扩展，避免重复改路由

### 设计与交互实现要求

- Welcome 页必须单屏、不可滚动、底部 CTA 固定，且使用 safe area
- Onboarding 必须是 3 屏，不扩展成 4 屏；因为当前 `scenario-01-content-final.md` 精修稿按 3 屏叙事收敛
- Final CTA 使用 `开始体验`，不要用 `立即体验`
- Welcome 和 Onboarding 的文案均以 `scenario-01-content-final.md` 的精修稿为准，优先级高于早期拆分原型文档中的旧文案
- 顶部“跳过”是文本按钮，视觉层级低于主 CTA
- 进度指示器采用 `D-Design-System/components/progress.md` 的 `dots` 变体意图
- CTA 样式遵循 `D-Design-System/components/button.md`；每屏仅保留一个主要视觉焦点按钮

### 测试要求

- 当前仓库的移动端自动化测试基础仍然偏轻；不要为了 Story 1.1 新引入 UI 测试框架
- 单元测试聚焦纯数据模块和路由目标常量，确保在现有 Vitest 环境下稳定运行
- 组件和动效的正确性主要通过 `pnpm --filter mobile build`、lint 和页面代码结构验证

### Previous Story Intelligence

- Story 0.2 已经完成 Tamagui v2 RC 基座、Token 映射、`UIProvider` 注入和基础 `Button`/`Text`/`TextInput` 封装；Story 1.1 必须复用这些能力，而不是重新搭 UI 基建
- Story 0.2 明确要求 `packages/ui/src/index.ts` 作为唯一对外入口；如本 Story 需要补充通用 UI，继续从该 barrel 暴露
- 当前 `apps/mobile/app/index.tsx` 还是 Story 0.2 的演示页，这是 Story 1.1 最直接的替换点

### Project Structure Notes

- 本 Story 应只触及 `apps/mobile`，以及在确有必要时触及 `packages/ui`
- 不应触碰 `apps/api/*`、`packages/shared/*`、`supabase/*`、`deploy/*`
- 若欢迎页/Onboarding 需要纯展示型局部组件，优先放在 `apps/mobile/screens/onboarding/`，不要把仅 Story 1.1 使用的组件过早提升到 `packages/ui`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Scenario 01 功能映射]
- [Source: _bmad-output/planning-artifacts/architecture.md#项目结构]
- [Source: _bmad-output/C-UX-Scenarios/01-dannys-zero-input-first-experience/01.1-welcome/01.1-welcome.md]
- [Source: _bmad-output/C-UX-Scenarios/01-dannys-zero-input-first-experience/01.2-onboarding/01.2-onboarding.md]
- [Source: _bmad-output/E-Assets/content/scenario-01-content-final.md#01.1 Welcome]
- [Source: _bmad-output/E-Assets/content/scenario-01-content-final.md#01.2 Onboarding]
- [Source: _bmad-output/E-Assets/page-designs/01.1-welcome.html]
- [Source: _bmad-output/E-Assets/page-designs/01.2-onboarding.html]
- [Source: _bmad-output/D-Design-System/design-tokens.md]
- [Source: _bmad-output/D-Design-System/components/button.md]
- [Source: _bmad-output/D-Design-System/components/progress.md]
- [Source: _bmad-output/implementation-artifacts/0-2-ui-design-system-baseline.md#Dev Notes]

## Dev Agent Record

### Agent Model Used

GPT-5

### Debug Log References

### Completion Notes List

### File List

### Change Log

