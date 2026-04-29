---
date: 2026-04-29
project: money-tracker
project_name: 了然 (Liaoran)
author: Amelia (Developer) · 与 Sue 协作
workflow: bmad-correct-course
status: draft-pending-approval
scope_classification: Major
handoff_to:
  - Product Manager (PRD NFR 补丁)
  - Solution Architect (架构文档 5 处补丁)
  - Product Owner + Developer (Epic 1.5 拆解与执行)
---

# Sprint Change Proposal — Epic 1 保真收口与 DS/导航前置

## 1. Issue Summary（问题概要）

### 1.1 触发背景

Epic 1「零输入首次体验」在 2026-04-29 完成 retrospective，sprint-status.yaml 标记所有 8 个 Story 为 `done`。但在回顾会后，Project Lead (Sue) 在走查已交付页面时发现三类结构性问题：

1. **底部 Tab 导航外壳缺失**：进入应用后的主导航容器未实现，各功能页面之间缺少稳定的穿梭容器
2. **Epic 1 页面交互与高保真原型偏差明显**："我的"页面、首页进入的月度报表二级页等与 `E-Assets/page-designs/` 定义的高保真设计相差甚远
3. **Design System 组件层未前置**：问题 2 的根因是 `_bmad-output/D-Design-System/components/` 定义的 20 个组件中，仅有 4 个在 `packages/ui/src/` 实际实现

这三个问题与 Epic 1 retrospective（`_bmad-output/implementation-artifacts/epic-1-retro-2026-04-29.md`）§3.1/§3.3 记录的"状态可信度"和"高保真到 AC 映射漏项"相互印证，构成了进入 Epic 2 前必须收口的结构性债务。

### 1.2 发现上下文

- **时间点**：Epic 1 retro 会议结束后由 Sue 复核 Epic 1 实际交付页面
- **方法**：对照 `E-Assets/page-designs/` 高保真原型走查已上线页面
- **参与**：Sue（Project Lead）发起 Correct Course 流程；Amelia（Developer）主导影响分析

### 1.3 证据

| 证据 | 来源 | 说明 |
|---|---|---|
| 16/20 DS 组件未实现 | `ls packages/ui/src/` vs `_bmad-output/D-Design-System/components/` | 仅 button / text-input / text / provider 落地；avatar / badge / bottom-tab-bar / card / chart / divider / filter-chip / header / modal-sheet / progress / search-bar / skeleton / tab / toast / toggle / tooltip 均缺失 |
| Epic 1 Story AC 失效 | 全部 Story 1.x 均含 AC "组件实现遵循 `D-Design-System/components/*.md`" | 组件不存在 → 开发者现场近似实现 → 视觉偏差累积 |
| 架构文档 Tab 定义不完整 | `architecture.md:624-627` | `(main)/` 只列 dashboard + report，未列 my-hub，与 `epics.md:177` Page designs 清单不一致 |
| 高保真到 AC 映射漏项案例 | Epic 1 retro §3.3 | Story 1-8 原型含性别/生日字段，AC 未覆盖，初版未落地 |
| 状态不一致 | Epic 1 retro §3.1 | Story 1-1 仍为 ready-for-dev、Story 1-6 仍为 review；sprint-status 已标 done |
| 跨 Story 契约问题 | Epic 1 retro §3.2 | 认证 token 来源（Story 1.2 vs 1.8）、交易方向、pending 口径、异步分类可靠性 |
| Sue 实地观察 | 本次触发 | "我的"页面、月度报表页样式与高保真差距明显 |

---

## 2. Impact Analysis（影响分析）

### 2.1 Epic 影响

| Epic | 原状态 | 变更后 | 影响 |
|---|---|---|---|
| Epic 0 基础设施 | done | 不变 | Story 0-2 AC 已满足，不回退状态；DS 组件层缺口视为"未在 Epic 0 定义的新范围"，进入 Epic 1.5 |
| Epic 1 零输入首次体验 | done | 不变 | 状态保留；补齐工作集中到 Epic 1.5；Epic 1 retro 未闭合的 Action #1/#2 并入 Epic 1.5 Story 1.5-8 |
| **Epic 1.5（新增）** | — | backlog → in-progress | 新增 8 个 Story，承担：DS 组件层、导航外壳、关键页面保真重做、架构契约补丁、状态收口 |
| Epic 2 交易管理 | backlog | 依赖项变更 | Dependencies 从 `E1` 调整为 `E1, E1.5`；开工时间相应后推，但单 Story UI 实施成本下降 |
| Epic 3-8 | backlog | 不变 | 依赖 E1 的语义等价于依赖 E1.5（组件层 + 契约）；不需改动 epics.md |

### 2.2 Story 影响

**Story 新增（Epic 1.5，8 个）**：

1. `1.5-1` 认证契约正式化（决策 + 架构补丁）
2. `1.5-2` 交易方向与 pending 口径决策（决策 + schema 迁移）
3. `1.5-3` DS 组件层实现（16 个未落地组件 + Storybook 基线）
4. `1.5-4` 底部 Tab 导航外壳（dashboard / report / my-hub 三 Tab）
5. `1.5-5` "我的"页面高保真重做（依赖 1.5-3）
6. `1.5-6` 月报页面高保真重做（依赖 1.5-2 + 1.5-3）
7. `1.5-7` Epic 1 其他页面高保真映射检查与修补（依赖 1.5-3）
8. `1.5-8` 状态收口（Story 1-1 / 1-6 状态同步 + Dashboard review findings 关闭）

**Story 状态同步（Epic 1 内）**：

- `Story 1-1 welcome-and-onboarding.md`：ready-for-dev → done（若代码已完成）或保留 ready-for-dev + 补齐文件
- `Story 1-6 dashboard-home.md`：review → done（若 findings 已处理）或保留 review + 关闭剩余 patch

### 2.3 工件冲突

| 工件 | 冲突 | 处理 |
|---|---|---|
| `prd-bridge.md` | 缺少视觉保真度 NFR | 新增 NFR「视觉保真度：核心 90% / 次要 80%」 |
| `architecture.md` | 5 处不一致或缺失 | 按下方 §4.2 的 5 条补丁更新 |
| `epics.md` | 缺少 Epic 1.5 定义；E2 Dependencies 需更新 | 按下方 §4.3 插入 Epic 1.5 全量定义并调整依赖 |
| `sprint-status.yaml` | 缺少 E1.5 条目 | 按下方 §4.4 新增 |
| DS 实现清单文档 | 不存在 | 新增 `ds-component-implementation-checklist.md` |
| 高保真映射模板 | 不存在 | 新增 `high-fidelity-mapping-checklist.md` |
| `CLAUDE.md` | Definition of Done 缺少真机验收、DS 合规 | 新增 DoD 章节 |

### 2.4 技术影响

| 维度 | 影响 |
|---|---|
| 代码库 | `packages/ui/src/` 新增 16 个组件文件；`apps/mobile/app/(main)/` 新增 `_layout.tsx` Tab 容器 + `my.tsx`；个别页面重做（profile + report） |
| 依赖 | 可能新增 Storybook for React Native Web；其他依赖不变（Tamagui/Lucide 已集成） |
| 数据库 | `billing.transactions` 可能新增 `direction` 枚举字段 + migration（取决于 1.5-2 决策结果） |
| 认证 | Token 契约文档化；短期无代码改动，但后续 API 路由需按契约统一 |
| CI/CD | 可选新增 Storybook build 任务；可选新增 visual regression 基线 |
| 测试 | DS 组件单元测试 + Storybook；页面级视觉回归为选做 |
| 部署 | 无影响 |

---

## 3. Recommended Approach（推荐方案）

### 3.1 三选项比对

| 选项 | Effort | Risk | 是否可行 | 关键问题 |
|---|---|---|---|---|
| Option 1 直接调整（现有 Epic 内消化）| High | High | ❌ 不可行 | 会污染 Epic 1 done 状态或把 UI 补齐工作塞入 Epic 2 主线，放大 retro §3.1 已指出的状态可信度问题 |
| Option 2 回滚（回退 Epic 1 部分 story）| Very High | High | ❌ 不可行 | 已通过 review 的契约与业务逻辑修复会被牵连重来，成本远超收益 |
| Option 3 MVP 复盘（缩减范围）| Low | Low | ⚠️ 局部可行 | 仅作为 PRD NFR 补丁组件；不能独立解决 UI / 导航 / 组件层缺口 |
| **Hybrid = 新增 Epic 1.5 + PRD NFR 补丁** | **Medium** | **Low-Medium** | ✅ **推荐** | 边界清晰、不污染已完成 Epic、DS 产出长期复用 |

### 3.2 推荐方案：Hybrid

**方案组成**：

1. **插入式新增 Epic 1.5**，作为 Epic 1 和 Epic 2 之间的收口型 Epic
2. **PRD 新增视觉保真度 NFR**（核心 90% / 次要 80%）
3. **架构文档 5 处补丁**（导航组合、UI 组件契约、认证契约、交易模型）
4. **E2 Dependencies 更新**：E1 → E1, E1.5

**理由**：

- **实施成本**：E1.5 边界清晰，开发者聚焦 UI / DS，减少上下文切换
- **时间线影响**：短期延后 E2 开工；E2-E8 单 Story UI 成本下降，长期中性或正向
- **技术风险**：DS 组件层 + 导航外壳是标准前端工作，无深度未知；架构契约补丁是"文档化已有决策"，不引入代码风险
- **团队士气**：已完成 Epic 状态不回退，retro 的"Epic 1 可接受"判定保留
- **长期维护**：DS 组件层一次建成长期复用；高保真映射 checklist 沉淀为流程资产
- **业务价值**：交付与产品承诺一致的首次体验感知
- **产品契约**：把 retro §5 技术债里的认证契约、交易方向/pending 口径作为 E2 开工前闸门前置收口，避免 E2 重演 Story 1-8 类问题

### 3.3 范围边界

**E1.5 包含**：

- DS 组件层（16 个）+ Storybook 组件级基线（必做）
- 底部 Tab 导航外壳（3 Tab）
- "我的"页面 + 月报页面高保真重做
- Epic 1 其他页面高保真逐项映射检查与修补
- 认证契约正式化（Retro 行动项 #3）
- 交易方向 + pending 口径决策与 schema 补丁（Retro 行动项 #4）
- Story 1-1 / 1-6 状态收口（Retro 行动项 #1 / #2）

**E1.5 不包含**：

- 头像 Supabase Storage 长期持久化（留给 Phase 2）
- 分类规则管理闭环（Retro 行动项 #7，属于 Story 2.4 前置，保留在 Epic 2 范围）
- Windows 环境标准化（Epic 0 retro 遗留项，不在本变更范围）
- 页面级 visual regression 截屏基线（选做，E1.5 时间充裕再启用）

---

## 4. Detailed Change Proposals（详细变更清单）

### 4.1 PRD 补丁

**文件**：`_bmad-output/planning-artifacts/prd-bridge.md`

**新增 NFR**（位置：NFR 章节末尾）：

```
NFR8: 视觉保真度
- 核心路径（欢迎 / 登录 / Dashboard / 月报 / 账单导入 / 我的 /
  AI 分类确认 / 引导）页面必须与 `_bmad-output/E-Assets/page-designs/`
  高保真原型对齐度 >= 90%
- 次要路径（错误态 / 空态 / 厂商引导子页 / 隐私协议详情 /
  PIPL 删除确认）对齐度 >= 80%
- 验收方式：
  (a) UX designer + Dev 逐项对照 high-fidelity-mapping-checklist.md
  (b) DS 组件级 Storybook 基线覆盖
  (c) 视觉偏差登记到 Story review findings
```

**理由**：Epic 1 交付暴露出无量化保真度约束时"视觉匹配 page-designs"AC 易被主观判定。需要明确的分级阈值 + 可执行验收方法。

---

### 4.2 架构文档补丁

**文件**：`_bmad-output/planning-artifacts/architecture.md`

#### 补丁 A-1：导航方案（修改现有章节，L394 附近）

```
OLD:
**导航方案：** Expo Router v4
- 文件系统路由，Tab + Stack 嵌套
- Deep linking 预留（微信分享跳转）

NEW:
**导航方案：** Expo Router v4
- 文件系统路由，Tab + Stack 嵌套
- Deep linking 预留（微信分享跳转）
- Tab 组合（MVP Phase 1 定版）：
  * Tab 1 首页  → (main)/dashboard
  * Tab 2 报表  → (main)/report（含月报、趋势等子页）
  * Tab 3 我的  → (main)/my（账户、设置、隐私）
- FAB 浮动按钮挂载在 Tab 1 Dashboard，不进入 Tab Bar
- Tab 切换状态由 ui-store.currentTab 持有
```

#### 补丁 A-2：(main)/ 目录结构（修改 L624-627）

```
OLD:
│   │   │   └── (main)/                     # 主应用路由组
│   │   │       ├── _layout.tsx             # Tab 导航 layout
│   │   │       ├── dashboard.tsx           # 01.7 Dashboard
│   │   │       └── report.tsx              # 01.8 月报

NEW:
│   │   │   └── (main)/                     # 主应用路由组
│   │   │       ├── _layout.tsx             # Tab 导航 layout（Tabs.Screen × 3）
│   │   │       ├── dashboard.tsx           # 01.7 Dashboard（Tab 1）
│   │   │       ├── report.tsx              # 01.8 月报（Tab 2 入口 + 趋势子页）
│   │   │       └── my.tsx                  # 08.0 我的（Tab 3 入口 + 子页堆栈）
```

#### 补丁 A-3：UI 组件契约（修改 L740-763 附近）

在 `packages/ui/src/` 的目录列表上方新增一段：

```
UI 组件契约来源：`_bmad-output/D-Design-System/components/*.md`
- 每个组件实现前必须读对应 component spec
- Props / 状态 / accessibility / tokens 绑定以 spec 为准
- Storybook Story 与组件实现同步提交
```

#### 补丁 A-4：认证契约章节（新增）

在认证相关章节末尾新增一节 **"应用认证契约"**：

```
### 应用认证契约

**Token 来源**：
- 应用业务 API（/api/** 除 /api/auth/**）统一使用应用自签 JWT
  (access 15min + refresh 7d)
- JWT payload 必含 `sub`（user_id）、`iat`、`exp`、`type`（access/refresh）
- 不依赖 Supabase Auth 返回的 token 直接访问 /api/**

**验签位置**：
- Next.js `middleware.ts` 统一拦截受保护路由，验签失败返回
  `{ success: false, error: { code: "AUTH_UNAUTHORIZED" } }`
- 业务 handler 内通过 `getAuthenticatedUser(request)` 获取已验证 user

**用户识别**：
- user_id 来自 JWT `sub` claim，不相信客户端传入的 userId

**Fallback**：
- Supabase Auth 仍作为 OAuth / OTP 签发源，但不直接作为业务 API token
- 应用签发 JWT 时持久化映射关系到 auth.users

**测试要求**：
- 受保护路由必须有单元测试验证：无 token / 过期 token /
  有效 token 三种分支
- 真机或等效网络路径必须覆盖至少一个登录后 API 写入操作
```

#### 补丁 A-5：交易模型扩展（新增）

在 billing 章节新增一节 **"交易方向与状态口径"**：

```
### 交易方向与状态口径

**方向字段（direction）**：
- 枚举：`expense | income | refund | closed`
- 来源：通知解析 / CSV 解析 / 手动记账显式设置
- 无法判定时默认 `expense`，但必须标记 `direction_confidence: low`
  并进入 pending_confirmation

**状态口径（status）**：
- `pending_confirmation`：AI 已分类但用户未确认
- `confirmed`：用户确认或自动规则命中置信度阈值
- `rejected`：用户拒绝（不参与任何聚合）

**聚合口径（统一规则）**：
- Dashboard 月度概览：包含 confirmed + pending_confirmation，
  分开展示两个数值（"本月支出 X，其中 Y 待确认"）
- 月报：默认只统计 confirmed；提供开关查看"含待确认"
- 交易列表：按用户筛选（默认显示 confirmed + pending_confirmation）
- 手动记账：默认 confirmed（用户显式输入视为已确认）

**收入排除规则**：
- direction = income 不进入"支出"聚合
- Dashboard 的"本月支出"卡片排除 income 与 refund
```

---

### 4.3 Epics 文档更新

**文件**：`_bmad-output/planning-artifacts/epics.md`

#### 在 Epic 1 与 Epic 2 之间插入 Epic 1.5

```
### Epic 1.5: Design System 组件层 · 导航外壳 · Epic 1 保真与契约收口
作为 Epic 1 的结构性收口 Epic，前置 Design System 完整组件层，实现主
应用底部 Tab 导航外壳，重做 Epic 1 重要页面使其对齐高保真原型，并把
Epic 1 retro 识别的认证契约、交易方向/pending 口径作为 Epic 2 开工闸
门正式写入架构文档。

**FRs covered:** 无新 FR；加强 FR4 / FR5 / FR6 / FR19 的 NFR8 视觉保
真度达成
**Phase:** MVP（Epic 1 收口）
**Dependencies:** E0, E1
**Page designs:** 复用 01-08 中涉及的 page designs；"我的"和"月报"重做
**NFR:** NFR8 视觉保真度（核心 90% / 次要 80%）
```

然后追加 8 个 Story（结构与现有 Epic 1 保持一致，用 BMM story template）。Story 详情将由 `bmad-create-story` 在 E1.5 正式开工时逐个产出，本次 change proposal 仅固化 Story ID / 标题 / 核心 AC 骨架。

#### 更新 Epic 2 的 Dependencies

```
OLD:
### Epic 2: 交易管理与手动补录
**Dependencies:** E1

NEW:
### Epic 2: 交易管理与手动补录
**Dependencies:** E1, E1.5
```

---

### 4.4 Sprint Status 更新

**文件**：`_bmad-output/implementation-artifacts/sprint-status.yaml`

```yaml
# 在 epic-1-retrospective: done 之后、epic-2: backlog 之前插入：

  # Epic 1.5: DS 组件层 · 导航外壳 · Epic 1 保真收口
  epic-1.5: backlog
  1.5-1-auth-contract-formalization: backlog
  1.5-2-transaction-direction-and-pending-semantics: backlog
  1.5-3-ds-component-layer-implementation: backlog
  1.5-4-bottom-tab-navigation-shell: backlog
  1.5-5-profile-page-high-fidelity-redo: backlog
  1.5-6-monthly-report-high-fidelity-redo: backlog
  1.5-7-epic1-pages-fidelity-audit-and-fix: backlog
  1.5-8-epic1-state-and-review-findings-closure: backlog
  epic-1.5-retrospective: optional
```

### 4.5 新增文档

**文件 1**：`_bmad-output/planning-artifacts/ds-component-implementation-checklist.md`

```
# DS Component Implementation Checklist

## 组件清单（16 个未实现）
- [ ] avatar
- [ ] badge
- [ ] bottom-tab-bar
- [ ] card
- [ ] chart
- [ ] divider
- [ ] filter-chip
- [ ] header
- [ ] modal-sheet
- [ ] progress
- [ ] search-bar
- [ ] skeleton
- [ ] tab
- [ ] toast
- [ ] toggle
- [ ] tooltip

## 每个组件的验收标准
1. 实现于 packages/ui/src/<component>.tsx
2. Props / 状态完全对齐 D-Design-System/components/<component>.md
3. 使用 Tamagui token，不硬编码颜色/间距
4. 单元测试覆盖渲染 + 关键交互
5. Storybook Story 覆盖默认态 / 变体 / 禁用态 / 错误态
6. 从 packages/ui/src/index.ts 导出
7. Accessibility 属性完整（role / label）
```

**文件 2**：`_bmad-output/planning-artifacts/high-fidelity-mapping-checklist.md`

```
# High-Fidelity Mapping Checklist（页面保真映射模板）

## 使用方式
每个涉及页面/组件 UI 的 Story review 前，由 Dev 填写本模板：

## 模板
- 对应 page design: E-Assets/page-designs/XX.X-xxx.html
- 对应 UX scenario: C-UX-Scenarios/XX-xxx/XX.X-xxx/XX.X-xxx.md
- 字段清单（从高保真 html/图中提取所有可见字段）:
  [ ] 字段 1 — 已进 AC / schema / API / UI / 测试
  [ ] 字段 2 — ...
- 状态清单（加载 / 空态 / 错误态 / 成功态）:
  [ ] 状态 A
  [ ] 状态 B
- 交互清单（点击 / 长按 / 滑动 / 下拉刷新）:
  [ ] 交互 A
- Token 清单（颜色 / 间距 / 字体 / 圆角）:
  [ ] 全部来自 D-Design-System/design-tokens.md
- 保真度自评: 核心路径 (>=90%) / 次要路径 (>=80%)
- 偏差登记: 若低于阈值，记录原因与后续修复计划
```

### 4.6 CLAUDE.md DoD 补丁

**文件**：`money-tracker/CLAUDE.md`

在"开发规范"之后新增 **"Definition of Done（DoD）"** 章节：

```
## Definition of Done

- 功能达成 Story AC 且单元测试通过
- ESLint / TypeScript 严格模式无错误
- 涉及 UI 的 Story 必须完成 high-fidelity-mapping-checklist.md
- 新增/修改 UI 组件必须提交 Storybook Story
- 涉及登录后 API 写入 / 图片选择 / 系统权限 / 文件选择 /
  语音 / 截图的 Story：必须记录至少一条真机或等效网络验收证据
- Review findings 全部 close 或 explicitly triaged
- sprint-status.yaml 与 Story 文件状态一致
```

### 4.7 Story 1-1 / Story 1-6 状态收口

**Story 1.5-8** 内部动作（不展开 Story 全文，此处仅列实质工作）：

- 核实 Story 1-1 代码是否已完成
  - 若已完成：补齐 `1-1-welcome-and-onboarding.md` Tasks 勾选、Dev Agent Record、review findings、状态改 `done`
  - 若未完成：回滚 sprint-status.yaml 中 `1-1-welcome-and-onboarding: done` 为 `in-progress` 并安排补齐
- 核实 Story 1-6 Dashboard review findings 四项：
  1. Dashboard loading/error gate
  2. 通知权限重入口
  3. 正数收入月份被计为支出
  4. `.env.local` ignore 规则
  - 若均已修复：勾选 + 状态改 `done`
  - 若未修复：作为 Epic 1.5 进入 Epic 2 前阻塞项处理

---

## 5. Implementation Handoff（落地移交）

### 5.1 Scope Classification

**Major**（跨 PRD + Architecture + Epic + Story 多工件、新增独立 Epic、引入架构决策）

### 5.2 Handoff 对象与职责

| 角色 | 对象 | 交付物 |
|---|---|---|
| **Product Manager (John)** | PRD NFR8 补丁 | 在 `prd-bridge.md` 追加 NFR8 章节并触发 `bmad-validate-prd` 回归验证 |
| **Solution Architect (Winston)** | 架构文档 5 处补丁（A-1~A-5） | 在 `architecture.md` 落地 A-1~A-5；必要时同步 `architecture.md` 的目录结构图 |
| **Product Owner (Alice) + Developer (Amelia)** | Epic 1.5 Story 拆解 | 对 1.5-1 ~ 1.5-8 逐个使用 `bmad-create-story` 生成 Story 文件；前两个 Story（1.5-1 / 1.5-2）以决策类 Story 优先 |
| **Developer (Amelia)** | 实施 Epic 1.5 | 按 Story 依赖顺序（1.5-1/1.5-2 → 1.5-3 → 1.5-4 → 1.5-5/1.5-6/1.5-7 → 1.5-8）实施 |
| **Test Architect (Murat) + QA (Dana)** | DoD 更新 + 保真 checklist 落地 | `CLAUDE.md` DoD 章节；Storybook 基线；高保真 mapping checklist 进入每个 UI Story review |

### 5.3 执行顺序建议

```
Step 1（本次 Correct Course 完成后立即）：
  - 更新 epics.md（插入 E1.5）
  - 更新 sprint-status.yaml（新增 E1.5 + 调整 E2 依赖）
  - 创建 ds-component-implementation-checklist.md
  - 创建 high-fidelity-mapping-checklist.md
  - 更新 CLAUDE.md DoD 章节
  - 由用户触发 PM 完成 PRD NFR8 补丁

Step 2（Story 1.5-1 / 1.5-2 决策落地）：
  - 认证契约文档化进入 architecture.md 补丁 A-4
  - 交易方向 + pending 口径决策进入 architecture.md 补丁 A-5
  - 若决策涉及 schema，产出 supabase migration

Step 3（DS 组件层与导航）：
  - Story 1.5-3 批量实现 16 个 DS 组件 + Storybook
  - Story 1.5-4 实现 (main)/_layout.tsx Tab 容器

Step 4（页面保真补齐）：
  - Story 1.5-5 "我的"重做
  - Story 1.5-6 月报重做
  - Story 1.5-7 其他页面逐项审计

Step 5（收口）：
  - Story 1.5-8 Story 1-1 / 1-6 状态与 review findings 关闭
  - Epic 1.5 retrospective（可选）
```

### 5.4 Epic 2 开工前闸门

进入 Epic 2 之前必须满足：

- [ ] Epic 1.5 全部 Story done
- [ ] `architecture.md` 补丁 A-1 ~ A-5 已合入
- [ ] `prd-bridge.md` NFR8 已合入
- [ ] DS 组件层 16 个组件全部实现 + Storybook 覆盖
- [ ] CLAUDE.md DoD 章节就绪
- [ ] Story 1-1 / 1-6 状态与实际交付一致
- [ ] Dashboard review findings 全部关闭
- [ ] Epic 1.5 retro 完成或明确跳过

### 5.5 成功标准

- 进入应用后存在稳定可用的 3-Tab 导航容器
- "我的"和月报页面视觉达成 NFR8 核心路径 90% 保真度
- `packages/ui/src/` 存在 20 个组件（4 原有 + 16 新增），全部有对应 Storybook
- `architecture.md` 5 处补丁与实际代码一致（无"文档说有但代码没有"现象）
- Epic 1 retro Action #1 / #2 / #3 / #4 / #5 / #6 全部 close 或 triaged

---

## 6. 附录

### 6.1 本提案未覆盖范围（明示）

- 头像 Supabase Storage 长期持久化 → 留待 Phase 2
- 分类规则管理闭环（Retro Action #7）→ 属 Story 2.4 前置
- Windows 开发环境标准化 → Epic 0 遗留项
- 页面级 visual regression 截屏基线 → E1.5 选做
- iOS 捕获方案（FR7）→ 保留在 Epic 2 范围

### 6.2 引用

- Epic 1 Retrospective: `_bmad-output/implementation-artifacts/epic-1-retro-2026-04-29.md`
- Design System: `_bmad-output/D-Design-System/`
- 架构当前版本: `_bmad-output/planning-artifacts/architecture.md`
- PRD: `_bmad-output/planning-artifacts/prd-bridge.md`
- Sprint Status: `_bmad-output/implementation-artifacts/sprint-status.yaml`
