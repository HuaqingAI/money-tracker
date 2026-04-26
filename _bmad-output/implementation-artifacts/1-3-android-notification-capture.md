# Story 1.3: Android 通知权限与捕获设置

Status: review

## Story

As a Android 用户,
I want 授权应用监听支付通知并获得厂商专属设置引导,
So that 应用能自动捕获我的消费记录，无需手动输入。

## Acceptance Criteria

### AC1: 权限说明页与跳转

**Given** 新用户完成注册（Story 1.2）
**When** 进入权限设置页
**Then** 清晰解释为什么需要通知权限（价值说明，非技术说明）
**And** 展示“授权”按钮，点击后跳转系统通知监听设置
**And** 视觉与 `E-Assets/page-designs/01.4-permission.html` 和 `01.4-permission.md` 的信息结构保持一致

### AC2: Android 厂商专属引导

**Given** 用户设备为特定 Android 厂商
**When** 检测到 MIUI / EMUI / ColorOS / FuntouchOS / Samsung
**Then** 展示对应厂商的通知监听保活设置步骤引导
**And** 其余厂商展示通用引导

### AC3: 结构化通知提取

**Given** 用户授权通知监听
**When** 收到支付宝 / 微信 / 银行通知
**Then** 客户端仅执行本地正则提取，输出结构化 JSON：
`{ amountCents, merchantName, transactionTime, platform }`
**And** schema 定义在 `packages/shared/schemas/notification-capture.ts`
**And** 原始通知文本不离开设备

### AC4: 规则配置与服务端接收

**Given** 通知规则可配置
**When** 应用启动或页面加载时获取规则
**Then** 优先从 `GET /api/config/notification-rules` 拉取远程规则
**And** 拉取失败回退到 `apps/mobile/config/notification-patterns.json`
**And** 结构化 JSON 可通过 `POST /api/billing/capture` 上传，服务端执行去重与归一化

### AC5: 跳过路径

**Given** 用户选择跳过通知授权
**When** 点击“稍后设置”
**Then** 允许跳过并进入账单导入页（Story 1.4）
**And** 首页保留重新进入权限设置页的入口

## Tasks / Subtasks

- [x] Task 1: 落地通知捕获共享模型与解析能力 (AC: #3, #4)
  - [x] 1.1 新增 `packages/shared/schemas/notification-capture.ts`，定义通知包络、规则、结构化捕获结果的 Zod schema
  - [x] 1.2 新增 `packages/shared/constants/default-notification-rules.ts`，覆盖支付宝、微信、工商银行、招商银行、建设银行与通用银行
  - [x] 1.3 新增 `packages/shared/utils/notification-capture.ts`，实现本地正则提取、金额归一化、时间归一化与 5 分钟窗口去重
  - [x] 1.4 新增 `packages/shared/utils/notification-capture.test.ts`，验证标准格式提取与重复判断

- [x] Task 2: 落地 API 规则分发与结构化接收接口 (AC: #4)
  - [x] 2.1 新增 `GET /api/config/notification-rules`，返回默认规则或环境变量覆盖规则
  - [x] 2.2 新增 `POST /api/billing/capture`，接收结构化 JSON 并执行内存态去重与归一化
  - [x] 2.3 新增 API 单元测试，验证成功路径与重复交易判定

- [x] Task 3: 落地 Android 权限页与厂商引导 (AC: #1, #2, #5)
  - [x] 3.1 新增 `apps/mobile/config/android-notification-guides.ts`，配置 5 个厂商和通用引导
  - [x] 3.2 新增 `apps/mobile/lib/android-notification.ts`，封装设备识别、权限状态、远程规则拉取、结构化上传
  - [x] 3.3 新增 `apps/mobile/app/permission.tsx`，实现权限价值说明、隐私承诺卡片、厂商步骤与系统设置跳转
  - [x] 3.4 新增 `apps/mobile/app/import.tsx` 作为 Story 1.4 占位入口
  - [x] 3.5 更新 `apps/mobile/app/index.tsx`，保留进入权限页与账单导入页的入口
  - [x] 3.6 新增 `apps/mobile/lib/android-notification.test.ts`，验证远程规则拉取、上传与设置跳转

- [x] Task 4: 补充运行时配置与 Story 工件 (AC: #1, #4)
  - [x] 4.1 更新 `apps/mobile/app.config.ts`，暴露通知规则 URL
  - [x] 4.2 新增 `apps/mobile/config/notification-patterns.json` 作为本地回退规则源
  - [x] 4.3 创建 Story 1.3 文档并更新 `sprint-status.yaml`

## Dev Notes

### 架构约束

- 保持 monorepo 单向依赖：`apps/mobile -> packages/shared`，`apps/api -> packages/shared`
- 不引入新的原生依赖；当前以可编译、可测试的服务抽象承接 Story 1.3，后续再接入真实 `NotificationListenerService`
- 原始通知文本不经过 API；API 仅接收结构化 JSON
- 去重规则按 Story 1.3 要求，以 `amountCents + merchantName + transactionTime` 的 5 分钟窗口判断

### 实现说明

- 规则源优先顺序：远程 `GET /api/config/notification-rules` -> 本地 `notification-patterns.json` -> shared 默认规则
- 当前移动端权限状态与设备信息使用 mockable service 封装，避免 UI 与未来 Native 实现耦合
- `POST /api/billing/capture` 当前使用内存存储承接去重，后续可平滑替换为 `billing.transactions` 持久化

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#横切关注点]
- [Source: _bmad-output/C-UX-Scenarios/01-dannys-zero-input-first-experience/01.4-permission/01.4-permission.md]
- [Source: _bmad-output/E-Assets/page-designs/01.4-permission.html]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-04-24：进入 worktree 后发现当前处于 detached HEAD，先切换到 `story/1-3-android-notification-capture`
- 2026-04-24：Story 1.3 文档缺失，依据 `epics.md`、架构文档与 UX 文档补全 Story 工件并同步实现

### Completion Notes List

- 2026-04-24：新增通知捕获共享 schema、默认规则、正则提取、归一化和去重逻辑，并补齐对应单测
- 2026-04-24：新增 `GET /api/config/notification-rules` 与 `POST /api/billing/capture`，完成远程规则分发和结构化捕获入站链路
- 2026-04-24：新增 Android 厂商引导配置、权限页、导入占位页及移动端通知服务抽象
- 2026-04-24：当前未直接接入真 Native `NotificationListenerService`；已预留 service 层和配置接口，后续可无破坏切换

### File List

- `packages/shared/index.ts`
- `packages/shared/schemas/notification-capture.ts`
- `packages/shared/constants/default-notification-rules.ts`
- `packages/shared/utils/notification-capture.ts`
- `packages/shared/utils/notification-capture.test.ts`
- `apps/api/lib/notification-rules.ts`
- `apps/api/lib/capture-store.ts`
- `apps/api/app/api/config/notification-rules/route.ts`
- `apps/api/app/api/config/notification-rules/route.test.ts`
- `apps/api/app/api/billing/capture/route.ts`
- `apps/api/app/api/billing/capture/route.test.ts`
- `apps/mobile/app/index.tsx`
- `apps/mobile/app/permission.tsx`
- `apps/mobile/app/import.tsx`
- `apps/mobile/lib/android-notification.ts`
- `apps/mobile/lib/android-notification.test.ts`
- `apps/mobile/config/android-notification-guides.ts`
- `apps/mobile/config/notification-patterns.json`
- `apps/mobile/app.config.ts`
- `_bmad-output/implementation-artifacts/1-3-android-notification-capture.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-04-24：首次创建 Story 1.3 工件并完成 Android 通知权限引导、结构化捕获与 API 接口的最小可交付闭环
