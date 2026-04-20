---
workflow: bmad-check-implementation-readiness
date: 2026-04-19
project: money-tracker
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-epic-quality-review
  - step-06-final-assessment
filesIncluded:
  prd: _bmad-output/planning-artifacts/prd-bridge.md
  prd_references:
    - _bmad-output/planning-artifacts/product-brief-money-tracker.md
    - _bmad-output/planning-artifacts/product-brief-money-tracker-distillate.md
    - _bmad-output/planning-artifacts/prd-bridge-validation-report.md
  architecture: _bmad-output/planning-artifacts/architecture.md
  epics: _bmad-output/planning-artifacts/epics.md
  ux:
    - _bmad-output/C-UX-Scenarios/00-ux-scenarios.md
    - _bmad-output/C-UX-Scenarios/accessibility-standards.md
    - _bmad-output/C-UX-Scenarios/01-dannys-zero-input-first-experience/
    - _bmad-output/C-UX-Scenarios/02-dannys-family-shared-ledger/
    - _bmad-output/C-UX-Scenarios/03-lilys-spending-mirror/
    - _bmad-output/C-UX-Scenarios/04-dannys-gift-accounting/
    - _bmad-output/C-UX-Scenarios/05-meis-multi-identity-accounting/
    - _bmad-output/C-UX-Scenarios/06-manual-input-and-category-management/
    - _bmad-output/C-UX-Scenarios/07-ai-butler-intelligence/
    - _bmad-output/C-UX-Scenarios/08-account-and-settings/
---

# Implementation Readiness Assessment Report

**Date:** 2026-04-19
**Project:** money-tracker

## Step 1: Document Inventory

### PRD
- **Primary:** `_bmad-output/planning-artifacts/prd-bridge.md` (19,648 B, 2026-04-14)
- **References:** `product-brief-money-tracker.md`, `product-brief-money-tracker-distillate.md`, `prd-bridge-validation-report.md`

### Architecture
- `_bmad-output/planning-artifacts/architecture.md` (50,594 B, 2026-04-14)

### Epics & Stories
- `_bmad-output/planning-artifacts/epics.md` (77,222 B, 2026-04-19)

### UX Design (sharded, located outside planning-artifacts)
- `_bmad-output/C-UX-Scenarios/` — 1 overview + 1 a11y standard + 8 scenario folders

### Findings
- No duplicate whole+sharded conflicts
- All four required document types present
- PRD uses `prd-bridge.md` naming; user confirmed as primary PRD
- UX sourced from WDS pipeline output (`C-UX-Scenarios/`), outside `{planning_artifacts}` — confirmed valid

## Step 2: PRD Analysis

**PRD Source:** `_bmad-output/planning-artifacts/prd-bridge.md`
**Type:** PRD Bridge — 索引文档（桥接 WDS 产物与 BMAD 工作流）
**Status:** active，2026-04-14 最近增强（P1 修复已补全可测量指标）

### Functional Requirements Extracted

**MVP — Phase 1 (F1-F3 + 注册登录 + iOS 替代捕获)**

- **FR1: 账单自动捕获（Android 通知监听）** — NotificationListenerService 捕获支付宝/微信/银行推送，提取金额/商户/时间；客户端只采集原始数据，后端负责解析/去重/分类；捕获覆盖率 ≥ 80%；5 个厂商专属设置引导（小米/华为/OPPO/Vivo/三星）。
- **FR2: 账单手动导入（CSV 文件）** — 支付宝 CSV (GBK) + 微信 CSV (UTF-8)；后端解析、去重、归一化；解析规则支持热更新。
- **FR3: AI 自动分类** — 导入交易自动分类进 `pending_confirmation`，用户 confirm/reject 并作为训练反馈；"Trust Theater" 前端最少 5s 处理动画与后端解耦。
- **FR4: Dashboard 首页** — 月度概览、待确认入口、最近流水、AI Spotlight（刷新 ≥ 每日 1 次，"有用"率 ≥ 70%）、导入进度横幅、AI 覆盖率指示器、家庭/身份快照扩展位、上下文空状态、FAB。
- **FR5: 月度报表** — 月度按分类汇总；同比/环比（有历史数据时）。
- **FR6: 用户注册与认证** — 微信一键登录（OAuth）+ 手机号 OTP；强制同意隐私协议并记录 consent_at；新/老用户差异化跳转。
- **FR7: iOS 替代捕获方案** — Siri 语音快捷（~3s）+ Widget 一键（~1s）+ 截屏 OCR；MVP 阶段 iOS 优先级低于 Android。

**Phase 2 (F4-F8)**

- **FR8: 付费订阅与支付** — 定价/对比；Android：微信支付 + 支付宝；iOS：Apple IAP；订阅状态（provider/plan/expires_at）。
- **FR9: 家庭共享账本** — 创建家庭、邀请成员、汇总视图、visibility 字段（仅自己可见）、共享 Dashboard。
- **FR10: 受益人标注** — 标记"为谁花"（自己/配偶/孩子/家庭共用）；两阶段 AI 规则引擎（建议→用户确认→持久化规则自动应用未来交易）；按受益人统计。
- **FR11: 交易浏览与详情** — 列表（分类筛选、时间排序）；详情展示 AI 品牌/分类/置信度；用户修正 AI 分类（反馈闭环）。
- **FR12: 消费趋势与分享** — 多月折线图；消费习惯雷达图；分享卡片 + 微信分享。
- **FR13: 人情账管理** — 按人组织的人情网络（非线性）；随礼历史跨年；智能回礼建议（历史金额 + 物价涨幅 + 亲疏 + 宴会规格）；丧事场景措辞敏感处理；季节性预警；**礼金簿 OCR 导入（04.1a）**：5 步拍照→OCR→审核→关联→完成，多页、置信度、行内编辑。
- **FR14: 多身份核算** — 创建/切换身份（打工人/老板/自由职业）；独立收支；副业利润计算器（收入 − 显性 − 隐性成本）。
- **FR15: 手动记账与分类管理** — 表单/语音/截图三种快速补充；分类规则查看与调整；目标 3 秒内一笔补充。

**Phase 3 (F9-F13)**

- **FR16: AI 对话管家** — 自然语言财务问答；流式响应（打字机）；注入用户财务上下文；结构化数据卡片（JSON 流→图表/表格）；可点击引用跳转详情；Action Buttons。
- **FR17: 洞察推送** — AI 主动发现异常/趋势；推送 + App 内 Feed；自适应节奏；**异常阈值：单笔 > 同类历史均值 3 倍**；**频率上限：每日 ≤ 3 条；连续 7 天无互动降至每周 ≤ 1 条**；**"有用"反馈率 ≥ 40%**；ML 反馈闭环。
- **FR18: 消费优化建议** — **每次推送 ≥ 1 条含明确品类 + 目标金额的建议**；独立页面消费模拟；同类对比（同年龄/城市匿名统计）；**30 天自动追踪效果报告，无需手动打卡**。
- **FR19: 账户与设置** — 个人资料、订阅状态、数据安全与隐私、通知偏好。

**基础设施（无 UX 场景）**

- **FR20: Monorepo 项目初始化** — Turborepo + pnpm workspace；Expo + Next.js + shared packages；分阶段初始化验证。
- **FR21: 数据库 Schema 与 Migration** — 领域拆分（auth/billing/analytics）；RLS 策略；种子数据。
- **FR22: CI/CD Pipeline** — GitHub Actions PR 检查 + 自动部署；三层质量门禁；Docker → ACR → ECS。
- **FR23: 生产环境部署** — 阿里云 ECS Docker Compose；Nginx + SSL；Supabase 自托管精简方案。
- **FR24: 监控与错误追踪** — Sentry 双端 SDK；结构化日志；健康检查端点。

**Total FRs: 24**（产品功能 19 条 FR1-FR19，基础设施 5 条 FR20-FR24）

### Non-Functional Requirements Extracted

- **NFR1: 性能** — API < 200ms（普通接口 P95，APM 监控）；AI 分类 < 8s、CSV < 15s、OCR < 20s（P95，后端日志）；首屏 < 2s（骨架屏至数据填充，P75，移动端性能监控）。
- **NFR2: 安全** — 全表 RLS；JWT 15min access + 7 天 refresh；敏感字段 pgcrypto 加密（手机号/unionid）；不上传通知原文。
- **NFR3: 隐私与合规（PIPL）** — 数据删除权（级联 + 确认）；数据不出境（阿里云 ECS 国内）；强制同意并记录 consent_at；ICP 备案（Web 上线前）。
- **NFR4: 可用性** — 注册转化率 ≥ 75%；微信登录占比 ≥ 60%；3 秒内完成一笔手动补充记账。
- **NFR5: 可靠性** — AI 主模型降级：GPT-5.3-Codex → Qwen 3.6-Plus；离线/弱网 Zustand persist + TanStack Query retry；JWT 过期重放处理。
- **NFR6: 可维护性** — TS strict，禁止 any；统一命名；测试 co-located；CI 门禁；CSV 解析规则热更新。
- **NFR7: 资源约束** — 2核4G ECS 内存边界（Supabase 精简 ~1.1GB + Next.js + Nginx）；MVP 年度基础设施成本 ~4000 元；所有开源库 MIT 免费。

**Total NFRs: 7**

### Additional Requirements / Constraints

- **成功标准（3 条 SMART）**
  1. 零记账体验验证（MVP 后 3 个月）：AI 捕获率 Android ≥ 80% / iOS ≥ 60%；手动输入 ≤ 3 次/周；分类准确率 ≥ 85%
  2. 获得留住用户（上线后 6 个月）：注册 ≥ 1000；30 日留存 ≥ 40%；应用评分 ≥ 4.5
  3. 经济自持（上线后 12 个月）：付费转化 ≥ 5%；月收入 ≥ 月运营成本；差异化功能使用率 ≥ 30%
- **设计保真度规范（6 层资产层级 L1-L6）** — 下游 create-epic / create-story / code-review 均有强制引用约束（L1 page-designs HTML、L2 icons/images、L3 content 文案、L4 components、L5 design-tokens、L6 UX 规格）。
- **开放问题（3 条）** — 竞品 AI 能力调研未完成；F4-F13 免费/付费边界需 Phase 2 Story 细化；iOS 零记账体验接受度需差异化期望管理。
- **阶段映射** — MVP: FR1-FR7 + FR20-FR24；Phase 2: FR8-FR15；Phase 3: FR16-FR19。

### PRD Completeness Assessment（初步）

- ✅ **要求可测量** — NFR1 已含 P95/P75 百分位和测量方法；FR17/FR18 已含阈值、频率、反馈率等量化指标；FR4 AI Spotlight 已含刷新频率和有用率
- ✅ **成功标准明确** — 3 条 SMART 目标带时间线
- ✅ **设计保真度链路清晰** — 6 层资产 → Story AC 强制引用
- ⚠️ **PRD 为 Bridge（索引型）** — 所有 UX 细节外链到 `C-UX-Scenarios/` 和 `E-Assets/`；在做 Epic Coverage 时必须连同引用文档一起检查是否齐全
- ⚠️ **开放问题未闭合** — 3 条开放问题仍存在，其中 F4-F13 免费/付费边界直接影响 Phase 2 的 Epic 设计
- ⚠️ **基础设施 FR20-FR24 无 UX 映射** — 需确认 Epic 中是否有对应的"基础设施 Epic/Story"吸收这些需求

## Step 3: Epic Coverage Validation

**Epics Source:** `_bmad-output/planning-artifacts/epics.md`（2026-04-19 最新）
**规模：** 9 个 Epic（E0-E8），42 个 Story

### Epic Scope Overview

| Epic | 名称 | Phase | 覆盖 FR | Story 数 |
|------|------|-------|---------|---------|
| E0 | 工程基础设施 | MVP 前置 | FR20, FR21, FR22, FR23, FR24 | 8 |
| E1 | 零输入首次体验 | MVP | FR1, FR2, FR3, FR4, FR5, FR6, FR19（基础部分） | 8 |
| E2 | 交易管理与手动补录 | Phase 2 | FR7, FR11, FR15 | 6 |
| E3 | 家庭财务协同与付费 | Phase 2 | FR8, FR9, FR10 | 4 |
| E4 | 消费趋势与分享 | Phase 2 | FR12 | 3 |
| E5 | 人情往来账 | Phase 2 | FR13 | 4 |
| E6 | 多身份核算 | Phase 2 | FR14 | 2 |
| E7 | AI 财务管家 | Phase 3 | FR16, FR17, FR18 | 4 |
| E8 | 高级账户与个性化设置 | Phase 3 | FR19（高级部分） | 3 |

### Coverage Matrix（PRD FR → Epic/Story 追溯）

| FR | PRD 描述（摘要） | Epic Coverage | 具体 Story | Status |
|----|---|---|---|---|
| FR1 | Android 通知监听捕获（5 厂商引导，>=80% 覆盖率） | E1 | 1.3 Android 通知权限与捕获设置 | ✅ Covered |
| FR2 | CSV 手动导入（支付宝 GBK / 微信 UTF-8，规则热更新） | E1 | 1.4 CSV 账单导入 | ✅ Covered |
| FR3 | AI 自动分类 + pending_confirmation + 5s Trust Theater | E1 | 1.5 AI 自动分类与确认 | ✅ Covered |
| FR4 | Dashboard 首页 + AI Spotlight + 导入进度 + FAB + 空状态 | E1 | 1.6 Dashboard 首页 | ✅ Covered |
| FR5 | 月度报表 + 分类分布 + 同比/环比 | E1 | 1.7 月度报表 | ✅ Covered |
| FR6 | 微信一键登录 + 手机号 OTP + 隐私协议 consent_at | E1 | 1.2 用户注册与认证 | ✅ Covered |
| FR7 | iOS 替代捕获（Siri 3s / Widget 1s / 截屏 OCR） | E2 | 2.5 iOS 替代捕获方案 | ✅ Covered |
| FR8 | 付费订阅（微信/支付宝/Apple IAP + 订阅状态） | E3 | 3.1 付费订阅与定价展示；3.4 付费墙触发与功能解锁 | ✅ Covered（含延伸） |
| FR9 | 家庭共享账本（family schema + visibility 字段） | E3 | 3.2 家庭账本创建与成员管理 | ✅ Covered |
| FR10 | 受益人标注 + 两阶段 AI 规则引擎 | E3 | 3.3 受益人标注与 AI 规则引擎 | ✅ Covered |
| FR11 | 交易列表 + 详情 + 置信度 + 分类修正反馈 | E2 | 2.1 交易列表与筛选；2.2 交易详情与分类修正 | ✅ Covered |
| FR12 | 多月趋势折线 + 雷达图 + 微信分享卡片 | E4 | 4.1 多月消费趋势图表；4.2 消费习惯雷达图；4.3 分享卡片生成与微信分享 | ✅ Covered |
| FR13 | 人情网络 + 智能回礼 + 季节预警 + 礼金簿 OCR | E5 | 5.1 人情网络与随礼记录；5.2 智能回礼与季节预警；5.3 礼金簿 OCR 导入；5.4 事件关联与数据入库 | ✅ Covered |
| FR14 | 多身份（切换） + 副业利润计算 | E6 | 6.1 财务身份创建与切换；6.2 身份独立收支与副业利润计算 | ✅ Covered |
| FR15 | 手动记账（表单/语音/截图，3s）+ 分类规则管理 | E2 | 2.3 手动快速记账；2.4 分类规则管理；2.6 语音记账与截屏 OCR | ✅ Covered |
| FR16 | AI 对话（流式 SSE + 结构化卡片 + Action Buttons） | E7 | 7.1 AI 对话式财务问答 | ✅ Covered |
| FR17 | 洞察推送（3 倍阈值 + 频率上限 + ML 反馈闭环） | E7 | 7.2 洞察推送与 Feed | ✅ Covered |
| FR18 | 消费优化（品类+目标金额 + 同类对比 + 30 天自动追踪）+ 模拟 | E7 | 7.3 消费优化建议；7.4 消费模拟 | ✅ Covered |
| FR19 | 账户与设置（个人资料/订阅/隐私/通知） | E1+E8 | 1.8 基础账户管理与 PIPL 合规；8.1 通知偏好；8.2 订阅状态管理；8.3 高级隐私与数据管理 | ✅ Covered（已拆分） |
| FR20 | Monorepo（Turborepo + pnpm + Expo + Next.js） | E0 | 0.1 Monorepo 骨架搭建；0.2 UI 设计系统基础 | ✅ Covered |
| FR21 | 数据库 Schema（auth/billing/analytics + RLS + 种子） | E0 | 0.3 数据库 Schema 与认证基础 | ✅ Covered |
| FR22 | CI/CD Pipeline（GitHub Actions + 三层门禁） | E0 | 0.4 开发工具链与质量门禁；0.5 CI/CD Pipeline | ✅ Covered |
| FR23 | 生产环境部署（ECS + Docker Compose + Nginx + SSL） | E0 | 0.6 生产环境部署 | ✅ Covered |
| FR24 | 监控与错误追踪（Sentry + pino + /api/health） | E0 | 0.7 监控与错误追踪 | ✅ Covered |

### Missing Requirements

**❌ 未发现 FR 层面的覆盖缺失。24 个 FR 全部追溯到具体 Story。**

### Stories 未直接映射到 PRD FR（基础设施支撑型）

| Story | 作用 | 支撑的 FR/NFR |
|-------|------|---------------|
| Story 0.2 UI 设计系统基础 | Tamagui v2 RC 集成 + 设计 Token 映射表 | 支撑全部 UI Story（L5 Token 规范）；不对应独立 FR 但为 PRD "设计保真度规范" 的前置条件 |
| Story 0.4 开发工具链与质量门禁 | ESLint/Prettier/Vitest/Turbo | 支撑 NFR6 可维护性 |
| Story 0.8 后台任务与定时调度基础设施 | node-cron worker + 任务注册接口 | 支撑 FR17（洞察推送 insight-analysis.ts）、FR13（季节预警 seasonal-alert.ts） |
| Story 3.4 付费墙触发与功能解锁 | Paywall 遮罩 + 订阅状态刷新 | 支撑 FR8（订阅）、FR16（AI 对话前 2 次免费门槛） — **属 FR8 延伸，非独立 FR** |

### Coverage Statistics

- **Total PRD FRs:** 24
- **FRs covered in epics:** 24
- **Coverage percentage: 100%** ✅
- **Total Stories:** 42
- **未直接映射到 FR 的基础/支撑 Story:** 4（均属架构/基础设施性支撑，合理）

### 关键观察（供 Step 5 Epic Quality Review 进一步核查）

1. **FR 全覆盖无盲点**：FR Coverage Map 与 Story 实际内容逐条比对一致
2. **FR19 合理拆分**：基础账户（删除权/PIPL 合规）前置到 MVP（Story 1.8），高级设置留到 Phase 3（E8），符合 partyModeDecisions 的决策
3. **付费门槛落地到位**：Story 3.4 覆盖了所有付费 Epic（E3/E4/E5/E6/E7）的 Paywall 入口，以及 FR16 的"前 2 次免费"门槛
4. **后台任务抽象合理**：Story 0.8 提前预置 `insight-analysis.ts` 和 `seasonal-alert.ts` 占位，避免 FR17/FR13 依赖底层调度
5. **潜在重叠**：Story 2.5（iOS 替代捕获含 OCR）与 Story 2.6（语音记账+OCR）在 OCR 实现上有重复描述，需要在 Step 5 Epic Quality Review 确认两者职责边界（当前看 2.5 属 iOS 专属，2.6 属跨平台通用语音+OCR，但文案需核对）
6. **Phase 2 免费/付费边界未在 Epic 层明示** — PRD 开放问题 #2 未闭合，但 Story 3.4 通过 Paywall 组件提供了机制级解决，具体"哪些 Epic 进免费/进付费"仍需产品决策

## Step 4: UX Alignment Assessment

**UX Source:** `_bmad-output/C-UX-Scenarios/`（WDS 管线产物，外部于 `{planning_artifacts}`）
**UX 规模：** 1 概览 + 1 无障碍标准 + 8 场景（28 页）
**Alignment Check Scope：** UX ↔ PRD Bridge ↔ Architecture 三方对齐

### UX Document Status

✅ **Found** — 来自 WDS 流水线的高保真 UX 资产（28 页，100% Outlined）

| 场景 | Persona | 页数 | 优先级 | Status | 文件夹 |
|------|---------|------|--------|--------|--------|
| 01 大强的零记账初体验 | 大强 Danny | 8 | P1 | Outlined | `01-dannys-zero-input-first-experience/` |
| 02 大强的家庭共享账本 | 大强 Danny | 3 | P1 | Outlined | `02-dannys-family-shared-ledger/` |
| 03 小丽的消费真相镜子 | 小丽 Lily | 4 | P1 | Outlined | `03-lilys-spending-mirror/` |
| 04 大强的人情账管理 | 大强 Danny | 2 | P2 | Outlined | `04-dannys-gift-accounting/`（含 04.1a 礼金簿 OCR） |
| 05 小美的多身份核算 | 小美 Mei | 2 | P2 | Outlined | `05-meis-multi-identity-accounting/` |
| 06 手动记账与分类补充 | 全部用户 | 3 | P2 | Outlined | `06-manual-input-and-category-management/` |
| 07 AI 管家智能层 | 全部用户 | 4 | P3 | Outlined | `07-ai-butler-intelligence/`（含 07.4 消费模拟） |
| 08 账户与设置管理 | 全部用户 | 2 | P3 | Outlined | `08-account-and-settings/` |

另含 `accessibility-standards.md` — 横切无障碍标准（WCAG 2.1 AA、触控尺寸、色彩对比度）

### UX ↔ PRD Alignment

#### A. 场景 → FR 对齐矩阵

| UX 场景 | 核心页面 | 对应 FR | 对齐状态 |
|---------|----------|---------|----------|
| 01 零记账初体验 | Welcome / Onboarding / 注册登录 / 权限授权 / CSV 导入 / 导入处理 / Dashboard / 月度报表 | FR1, FR2, FR3, FR4, FR5, FR6 | ✅ 完全对齐 |
| 02 家庭共享账本 | 订阅付费 / 共享家庭账本 / 受益人标注 | FR8, FR9, FR10 | ✅ 完全对齐 |
| 03 消费真相镜子 | 交易列表 / 交易详情 / 趋势图表 / 消费雷达 | FR11, FR12 | ✅ 完全对齐 |
| 04 人情账管理 | 人情网络 / 人情智能建议（+ 04.1a 礼金簿 OCR） | FR13 | ✅ 完全对齐（含 OCR 子流程） |
| 05 多身份核算 | 身份管理 / 身份损益表 | FR14 | ✅ 完全对齐 |
| 06 手动记账与分类 | 手动记账 / 分类管理 / iOS 快捷指令配置 | FR7, FR15 | ✅ 完全对齐（iOS 配置归入 06） |
| 07 AI 管家智能层 | AI 对话 / 洞察推送 / 优化建议 / 消费模拟 | FR16, FR17, FR18 | ✅ 完全对齐（含 07.4 独立页） |
| 08 账户与设置 | 设置 / 个人资料 | FR19 | ✅ 完全对齐 |

**结论：** 8 个场景、28 页 UX 覆盖 PRD 中 19 条产品 FR（FR1-FR19），无遗漏；FR20-FR24 为基础设施类需求，无 UX 场景（合理，不算 gap）。

#### B. UX 规格 vs PRD 量化指标一致性

| PRD 量化指标 | UX 规格支撑 | 对齐状态 |
|-------------|-------------|----------|
| FR3 Trust Theater ≥ 5s 动画 | 场景 01.6 导入处理页明确动画关键帧与时长 | ✅ |
| FR4 AI Spotlight ≥ 每日刷新、"有用"率 ≥ 70% | 场景 01.7 Dashboard AI Spotlight 卡片含反馈按钮 | ✅ |
| FR7 Siri ~3s / Widget ~1s | 场景 06.3 iOS 快捷指令配置指引（Siri + Widget + OCR） | ✅ |
| FR13 礼金簿 OCR 5 步流程 + 置信度 + 行内编辑 | 场景 04.1a 五步流程（拍照→OCR→审核→关联→完成） | ✅ |
| FR15 手动补充 ≤ 3s | 场景 06.1 手动记账页（表单/语音/截图） | ✅ |
| FR17 推送频率 ≤ 3/日、无互动降频 | 场景 07.2 洞察推送 Feed 含"有用/不相关"反馈 | ✅ |
| FR18 建议含品类+目标金额，30 天自动追踪 | 场景 07.3 优化建议含品类标签 + 追踪进度条 | ✅ |

### UX ↔ Architecture Alignment

#### A. 架构支撑 UX 场景矩阵

| UX 场景 | Architecture 支撑 | 对齐状态 |
|---------|-------------------|----------|
| 01 零记账 | Scenario 01 功能映射表（架构 §场景 01）+ 认证 JWT + CSV 解析 + AI 抽象层 + NotificationListenerService | ✅ 显式文件级映射 |
| 02 家庭共享账本 | 全场景技术选型 → 付费（微信/支付宝/Apple IAP）+ RLS family schema 预留 | ✅ 技术选型已覆盖 |
| 03 消费趋势 | 全场景技术选型 → Victory Native (RN) + Recharts (Web) + html2canvas 分享卡 | ✅ 图表栈已定 |
| 04 人情账 + 礼金簿 OCR | 全场景技术选型 → OCR 服务抽象；Story 5.3 补充批量 OCR API | ⚠️ 架构层单图 OCR；Epic 层补批量 |
| 05 多身份 | 全场景技术选型 → Web Speech API + RN Voice；identity 字段扩展 transaction 表 | ✅ 语音栈已定 |
| 06 手动记账 | Web Speech API + iOS Shortcut URL Scheme + OCR | ✅ 技术选型已覆盖 |
| 07 AI 对话 + 洞察 | 全场景技术选型 → SSE 流式 + Vercel AI SDK + AI 抽象层降级 | ✅ 显式选型 |
| 08 账户设置 | 认证与安全 + PIPL 合规（数据删除权 + pgcrypto） | ✅ 合规架构已定 |

#### B. NFR 性能指标 vs UX 交互需求

| UX 交互期望 | NFR 约束 | 架构实现 | 对齐状态 |
|-------------|----------|----------|----------|
| 首屏骨架屏→数据填充 | NFR1 首屏 < 2s (P75) | TanStack Query 预取 + 骨架组件 | ✅ |
| AI 对话打字机效果 | NFR1 API < 200ms | Next.js API Routes + SSE 流 | ✅ |
| CSV 导入进度反馈 | NFR1 CSV < 15s (P95) | 后端 stream 解析 + 进度推送 | ✅ |
| 离线/弱网缓存 | NFR5 Zustand persist + TanStack retry | 架构实现模式已规定 | ✅ |
| 3 秒内手动补充 | NFR4 可用性 | 表单优化 + 语音/OCR 快捷入口 | ✅ |

### Alignment Issues

| 严重度 | 问题 | 位置 | 建议处置 |
|--------|------|------|----------|
| 🟡 Minor | 架构 §全场景技术选型只声明单图 OCR 服务抽象，未区分批量 OCR API（礼金簿场景多页拍摄） | architecture.md 全场景技术选型 ↔ UX 04.1a | Story 5.3（礼金簿 OCR 导入）已补批量 API；架构文档可在后续增补一行注明，但非阻塞 |
| 🟡 Minor | 架构 §数据架构 Schema 清单未列出 `analytics.chat_sessions` / `analytics.insights` / `analytics.insight_feedback` 表 | architecture.md 类别 1 数据架构 ↔ UX 07.1 / 07.2 | Epic Story 7.1 和 7.2 在 AC 中补全 schema migration；架构文档可在 Phase 3 前增补，非 MVP 阻塞 |
| 🟡 Minor | 架构未显式声明后台任务运行时（定时洞察分析、季节预警） | architecture.md 类别 3 API ↔ UX 07.2 + UX 04 季节预警 | Epic Story 0.8（后台任务与定时调度基础设施）以 node-cron worker 补位，完整闭环 |
| 🟡 Minor | iOS 替代捕获（FR7）UX 场景归入 06 手动记账，但 PRD FR7 是独立条目 | PRD §FR7 ↔ UX 场景 06 | 已在 Epic Coverage Matrix 中澄清：Epic 2 Story 2.5 专做 iOS 捕获，06.3 UX 页支撑；无实际阻塞 |
| 🟢 Info | `accessibility-standards.md` 横切规范未被 PRD 显式引用 | C-UX-Scenarios/accessibility-standards.md ↔ PRD | 可在下游 Story AC 中直接引用；不影响需求完备性 |

### Warnings

**无阻塞性告警。** 四条 Minor 均为"架构文档描述层 vs Epic 层补位"的分工差异，不是需求缺失：
- Epic 层（Story 0.8、Story 5.3、Story 7.1、Story 7.2）均已补位
- Phase 2/3 开启前应将上述四条回填到 `architecture.md` 对应章节（accessibility-standards 引用、批量 OCR API、analytics schemas、worker 运行时），作为架构文档完善的增量工作

### UX Alignment Summary

- **UX 覆盖 PRD FR1-FR19：** 100% ✅
- **UX 覆盖 PRD 量化指标：** 7/7 ✅
- **Architecture 支撑 UX 场景：** 8/8（含 4 处 Epic 层补位）✅
- **NFR 性能约束 vs UX 交互期望：** 5/5 ✅
- **阻塞性告警：** 0 🟢
- **Minor 建议（非阻塞）：** 4 🟡

**综合结论：** UX 与 PRD、Architecture 三方对齐良好；设计保真度链路清晰（L1-L6 资产层级 + Epic Story AC 强制引用）；无任何阻塞实施启动的 UX 错配；Minor 项均有 Epic 层补位或可在 Phase 2/3 启动前轻量回填。

## Step 5: Epic Quality Review

**审查对象：** 9 个 Epic（E0-E8），42 个 Story
**审查标准：** BMAD `create-epics-and-stories` 最佳实践（用户价值 / 独立性 / 依赖 / Story 粒度 / AC 质量）

### A. 用户价值聚焦（User Value Focus）

| Epic | 标题 | 价值判断 |
|------|------|----------|
| E0 工程基础设施 | 技术/基础设施 Epic | 🟡 **合理例外** — greenfield 项目的工程启动 Epic 无直接用户价值，但为后续所有 Epic 的前置条件；partyModeDecisions 已明确拆出 |
| E1 零输入首次体验 | 注册→授权→导入→Dashboard 闭环 | ✅ 强用户价值 |
| E2 交易管理与手动补录 | 浏览/纠错/补录 | ✅ 强用户价值 |
| E3 家庭财务协同与付费 | 付费→解锁→家庭共享 | ✅ 强用户价值 |
| E4 消费趋势与分享 | 趋势图表+分享 | ✅ 强用户价值 |
| E5 人情往来账 | 人情网络+OCR 导入 | ✅ 强用户价值 |
| E6 多身份核算 | 身份切换+副业利润 | ✅ 强用户价值 |
| E7 AI 财务管家 | 对话+洞察+优化 | ✅ 强用户价值 |
| E8 高级账户与个性化设置 | 偏好/订阅管理/隐私 | ✅ 用户价值 |

**结论：** 8/9 Epic 为强用户价值，1/9（E0）为 greenfield 合理例外。

### B. Epic 独立性（Independence）

依赖关系（来自 `epics.md` Epic 列表声明）：

| Epic | 依赖 | 方向性 |
|------|------|--------|
| E0 | 无 | ✅ |
| E1 | E0 | ✅ 前向 |
| E2 | E1 | ✅ 前向 |
| E3 | E1 | ✅ 前向 |
| E4 | E1, E2 | ✅ 前向 |
| E5 | E1 | ✅ 前向 |
| E6 | E1 | ✅ 前向 |
| E7 | E1, E2 | ✅ 前向 |
| E8 | E1, E3 | ✅ 前向 |

**结论：** 零反向依赖（无任何 Epic N 要求 Epic N+1）；DAG 拓扑排序正常；依赖链清晰。

### C. Story 内部依赖（Within-Epic）

#### ✅ 正向依赖（符合规范）

- Story 1.5（AI 分类）依赖 1.3 或 1.4 的交易输入 — 正向 ✅
- Story 3.3（受益人）依赖 3.2（家庭账本） — 正向 ✅
- Story 5.4（事件关联）依赖 5.3（OCR） — 正向 ✅
- Story 6.2（副业利润）依赖 6.1（身份切换） — 正向 ✅
- Story 5.2（智能回礼）依赖 5.1（网络数据） — 正向 ✅

#### 🟡 弱前向引用（Minor）

- **Story 2.3（手动快速记账）** AC 写明"展示语音记账按钮和截屏 OCR 按钮（占位入口，具体功能在 Story 2.6 实现）" — 严格意义的 forward reference，但 2.3 核心功能（表单手动记账）可独立交付，入口为占位；不是阻塞性违规，建议标记为 placeholder，后续完善

### D. 数据库创建时机（Database Creation Timing）

符合"按需创建"原则：

| Migration | Story | 表 |
|-----------|-------|-----|
| 初始核心 | Story 0.3 | auth.users / auth.subscriptions / billing.transactions / billing.categories / billing.category_rules / billing.csv_parse_rules / analytics.monthly_summaries |
| 004 | Story 3.2 | family.families / family.family_members / billing.transactions.visibility |
| 005 | Story 5.1 | billing.gift_contacts / gift_events / gift_records |
| 006 | Story 6.1 | billing.identities / billing.transactions.identity_id |
| ⚠️ 未明确 | Story 7.1 | analytics.chat_sessions（仅提及，无 migration 编号） |
| ⚠️ 未明确 | Story 7.2 | analytics.insights / analytics.insight_feedback（仅提及，无 migration 编号） |

**🟡 Minor：** Story 7.1 和 7.2 在 AC 中提及新表但未像 3.2/5.1/6.1 那样明确写出 "创建 migration `007_*`" 语句；建议在实施前补齐 migration 编号与 DDL 规格。

### E. 起始模板（Starter Template）合规

Architecture 明确 "Option C 自定义 Monorepo，无现成 starter，分 4 阶段组装"。

- Epic 0 Story 0.1 "Monorepo 骨架搭建" 正确承担此责任 ✅
- AC 明确阶段 1 骨架（apps/ + packages/ 结构、.npmrc、turbo.json、pnpm-workspace.yaml、app.config.ts、metro.config.js、tsconfig.base.json、.env.example） ✅
- Story 0.2（Tamagui 集成）对应阶段 2 ✅
- Story 0.3（Supabase 数据层）对应阶段 3 ✅
- Story 0.4（开发工具链）对应阶段 4 ✅

### F. Acceptance Criteria 质量审查

#### ✅ 合规亮点

- **Given/When/Then 格式**：所有 42 个 Story 严格遵循 BDD 格式 ✅
- **量化指标充分**：
  - Story 1.3 提取成功率 ≥ 90%
  - Story 1.5 分类超时 8s / OCR 20s / 重试策略
  - Story 1.6 staleTime=5min/30s
  - Story 2.1 首屏 < 2s / cursor 分页 limit=20
  - Story 2.3 手动补充 ≤ 3s
  - Story 7.1 首字节延迟 P95 < 3s
  - Story 7.2 推送每日 ≤ 3 条 / 连续 7 天无互动降频
- **设计保真度 6 层引用全覆盖**：L1 page-designs HTML、L2 icons/images、L3 content、L4 components、L5 design-tokens、L6 UX 规格 — 所有用户场景 Story 严格引用 ✅
- **错误码 + 响应契约**：Story 1.2（AUTH_OTP_EXPIRED/INVALID）、Story 1.4（IMPORT_INVALID_FORMAT/IMPORT_FILE_TOO_LARGE）等统一 `{ success, data, error: { code, message } }` ✅

#### 🟡 可优化项（Minor）

| Story | 问题 | 建议 |
|-------|------|------|
| 1.3 Android 通知捕获 | "提取成功率 >= 90%" 未说明测量方式（测试集？生产监控？） | 实施前在 AC 补充测量方案（e.g. 单元测试集 + Sentry breadcrumb 标签） |
| 2.5 iOS 替代捕获 ↔ 2.6 语音+OCR | 两个 Story 均含 OCR 功能，2.5 声明"iOS 专属"，2.6 声明"跨平台"，但 Service 层实现未明确分工 | 实施前澄清 `packages/shared/ai/ocr-service.ts` 统一实现，2.5 负责 iOS 调用链（Siri Shortcut + Widget + Photos API），2.6 负责 UI 触发点 |
| 3.3 受益人 AI 规则 | "AI 分析标注模式生成规则建议" — 算法细节未明示 | 实施前补充：规则生成阈值（e.g. 同模式 ≥ 3 笔触发建议）、置信度计算、规则存储 schema |
| 5.2 智能回礼 | "综合考虑：历史金额+物价涨幅+关系亲疏+宴会规格" 无具体权重 | 实施前补充算法规范或 prompt 模板 |

### G. Story 粒度审查（Sizing）

总体 Story 数：42，Epic 平均 4.7 Story。

#### ✅ 粒度合理

- E1 8 个 Story（MVP 完整闭环，粒度适中）
- E2-E8 2-6 个 Story / Epic（合理）

#### 🟠 Major：粒度过大的 Story

- **Story 7.1 AI 对话式财务问答** — 单 Story 涵盖：
  1. SSE 流式响应
  2. 结构化数据卡片解析
  3. Action Buttons 渲染
  4. 多轮对话上下文（`analytics.chat_sessions` 表 + migration）
  5. 降级策略

  **建议**：拆分为 7.1a（SSE 基础对话）/ 7.1b（结构化卡片 + Action Buttons）/ 7.1c（上下文持久化 + 历史查看），避免单 Story PR 过大。

#### 🟡 Minor：粒度偏大但可接受

- **Story 3.1 付费订阅**：微信支付 + 支付宝 + Apple IAP + 订阅状态管理（4 个支付通道，实施时建议拆子任务）
- **Story 3.2 家庭账本创建与成员管理**：migration + 创建 + 邀请 + visibility + 成员管理 + 退出 + 解散（7 个 AC 分组，实施时可细化）
- **Story 5.1 人情网络**：3 表 migration + 列表 + 记录 + 详情 + 关系聚合（建议实施时拆子任务）

这些 Story 单元可接受，因为每个内部 AC 都属于同一用户故事的子场景；但实施（`bmad-create-story` 阶段）时可能需要拆分成多个实施周期。

### H. 基础设施支撑 Story 检查

| Story | 作用 | 关联 FR/需求 | 评估 |
|-------|------|--------------|------|
| 0.8 后台任务与定时调度 | 预置 worker + node-cron + `insight-analysis.ts`/`seasonal-alert.ts` 任务占位 | 支撑 FR17（E7 洞察推送）+ FR13（E5 季节预警） | ✅ 提前预置，避免后续 Epic 被基础设施阻塞 |
| 3.4 付费墙触发与功能解锁 | Paywall 遮罩组件 + 订阅状态刷新机制 | 支撑 FR8 的跨 Epic 解锁（E3/E4/E5/E6/E7） + FR16 前 2 次免费门槛 | ✅ 机制级解决方案 |

### I. Traceability（FR → NFR → AC）

- **FR → Story**：24/24 = 100% ✅（见 Step 3）
- **NFR → AC 嵌入**：
  - NFR1（性能）：Story 1.6/2.1（首屏 < 2s）、1.5（AI 分类 8s）、5.3/2.6（OCR 20s）、7.1（首字节 3s）等均量化 ✅
  - NFR2（安全）：Story 0.3（RLS + pgcrypto）、1.3（不上传通知原文） ✅
  - NFR3（PIPL）：Story 1.2（consent_at）、1.8（数据删除权+级联删除所有 schema） ✅
  - NFR4（可用性）：Story 2.3（3s 手动补充）、2.5（Siri 3s/Widget 1s） ✅
  - NFR5（可靠性）：Story 1.5/7.1（降级 + circuit breaker）✅
  - NFR6（可维护性）：Story 0.4（ESLint 禁 any + Vitest co-located） ✅
  - NFR7（资源约束）：Story 0.3（Supabase 精简 ≤ 1.2GB）、0.6（总内存 ≤ 3.5GB）、0.8（worker ≤ 256MB） ✅
- **设计保真度 L1-L6 → AC**：全部用户场景 Story 严格引用 ✅

### J. 违规分级汇总

#### 🔴 Critical Violations：0 🎉

#### 🟠 Major Issues：1

| # | 描述 | Story | 建议 |
|---|------|-------|------|
| M1 | Story 粒度过大 | 7.1 AI 对话式财务问答 | 拆分为 7.1a/7.1b/7.1c 三个子 Story（流式 / 结构化卡片 / 上下文持久化） |

#### 🟡 Minor Concerns：6

| # | 描述 | 位置 | 建议 |
|---|------|------|------|
| m1 | E0 为工程基础设施 Epic，无直接用户价值 | Epic 0 | 作为 greenfield 合理例外，在 Epic 描述中注明"MVP 前置"已足够；无需整改 |
| m2 | 弱前向引用：Story 2.3 提到 Story 2.6 占位入口 | Story 2.3 | 在 AC 中标注"placeholder 入口"，实施时同步确认 |
| m3 | Story 2.5 ↔ 2.6 OCR 实现边界未明示 | Story 2.5/2.6 | 实施前澄清 Service 层统一实现（OCR 服务 + 调用方分离） |
| m4 | `analytics.chat_sessions` / `analytics.insights` 的 migration 编号未明确 | Story 7.1/7.2 | 补充 migration 编号（007/008）与 DDL 规格 |
| m5 | 粒度偏大 Story（3.1 付费/3.2 家庭/5.1 人情网络）可能需实施时拆子任务 | Story 3.1/3.2/5.1 | 建议 `bmad-create-story` 时评估并细化为多次交付 |
| m6 | AI 规则算法细节未明示（3.3 受益人规则 / 5.2 回礼算法） | Story 3.3/5.2 | 实施前补充算法规范（阈值、权重、prompt 模板） |

### K. Best Practices Compliance Checklist

对每个 Epic：

| 检查项 | E0 | E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 |
|--------|----|----|----|----|----|----|----|----|-----|
| Epic 交付用户价值 | 🟡* | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Epic 可独立运作 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Story 粒度合理 | ✅ | ✅ | ✅ | 🟡 | ✅ | 🟡 | ✅ | 🟠 | ✅ |
| 无反向依赖 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 数据库按需创建 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ |
| 清晰 AC（BDD 格式） | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| FR 可追溯 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

*E0 为 greenfield 工程启动 Epic 的合理例外

### Epic Quality Review Summary

- **Epics 总数**：9 | 合规 8 | 合理例外 1（E0）
- **Stories 总数**：42 | Critical 违规 0 | Major 1 | Minor 6
- **FR Coverage**：100%（24/24）
- **NFR 横切嵌入**：NFR1-NFR7 全部嵌入相关 Story AC
- **设计保真度**：L1-L6 六层资产在所有用户场景 Story AC 中强制引用

**最终判断：** Epic/Story 整体质量高，符合 BMAD `create-epics-and-stories` 最佳实践；1 项 Major（Story 7.1 拆分）建议在 `bmad-create-story` 阶段执行；6 项 Minor 均不阻塞 MVP 启动。

## Step 6: Final Assessment

## Summary and Recommendations

### Overall Readiness Status

🟢 **READY**（READY / NEEDS WORK / NOT READY）

了然（Liaoran）项目的 PRD、Architecture、Epics、UX 四方文档完整，对齐良好，具备进入 `bmad-create-story` 和 MVP 实施（Epic 0 + Epic 1）的充分条件。无 Critical 阻塞项。

### Readiness Scoreboard

| 维度 | 分值 | 说明 |
|------|------|------|
| 文档齐备性 | 🟢 完整 | PRD-Bridge + Architecture + Epics + UX（28 页）+ 无障碍标准 全部就绪 |
| PRD 完备性 | 🟢 完整 | 24 FR + 7 NFR + 3 SMART 成功标准 + 量化指标（FR17 阈值/频率、FR18 追踪周期、NFR1 P95/P75）全部齐全 |
| Epic 覆盖率 | 🟢 100% | 24/24 FR 全部追溯到具体 Story |
| UX 对齐 | 🟢 完整 | 8 场景 × 28 页覆盖 FR1-FR19，与 Architecture 技术选型对齐 |
| Architecture 技术决策 | 🟢 完整 | 5 类核心决策 + 8 条强制规则 + 8 条反模式 + 全场景技术选型 + 4 阶段初始化计划 |
| Epic/Story 质量 | 🟡 Good with Improvements | 1 项 Major（Story 7.1 拆分）+ 6 项 Minor（非阻塞） |
| 设计保真度链路 | 🟢 完整 | L1-L6 资产层级 + Story AC 强制引用 + code-review 对照机制 |
| 合规与安全 | 🟢 完整 | PIPL Day-1 架构（数据删除权/不出境/consent_at）+ 全表 RLS + pgcrypto + Sentry |
| 资源约束建模 | 🟢 完整 | 2核4G ECS 内存边界细化到每组件（Postgres 800M/GoTrue 100M/Kong 150M/worker 256M） |

### Critical Issues Requiring Immediate Action

**无 Critical 阻塞项。**

### Recommended Next Steps（按优先级）

**P0（开始 MVP 实施前必做）：**

1. **启动 Epic 0 Story 0.1 实施** — Monorepo 骨架搭建是其他 Epic 的硬前置；建议使用 `bmad-create-story` 生成 Story 0.1 上下文文件并启动实施
2. **确认 Qwen 3.6-Plus 备用 API 可用性** — NFR5 降级策略的前置条件（主模型 GPT-5.3-Codex 失效时无备选会导致 AI 功能全面不可用）
3. **ICP 备案前置** — NFR3 合规要求；Web 服务（apps/api）上线前必须完成，建议在 Epic 0 Story 0.6（生产环境部署）之前启动行政流程

**P1（在启动对应 Epic 前修正）：**

4. **拆分 Story 7.1 AI 对话** — 在 Epic 7 启动前通过 `bmad-create-story` 拆为 7.1a/7.1b/7.1c（流式 / 结构化卡片 / 上下文持久化）
5. **补齐 `analytics.chat_sessions` 和 `analytics.insights` 的 migration** — 在 Story 7.1 和 7.2 创建时补充 migration 编号（建议 007/008）与 DDL 规格
6. **澄清 Story 2.5 ↔ 2.6 OCR 分工** — 在 Epic 2 启动前，明确 `packages/shared/ai/ocr-service.ts` 为统一服务层实现，Story 2.5 负责 iOS 调用链，Story 2.6 负责 UI 触发点
7. **闭合 PRD 开放问题 #2（F4-F13 免费/付费边界）** — 在 Phase 2 Epic（E3-E6）启动前明确每个 Epic 的免费/付费边界（Story 3.4 Paywall 机制已就位，但需产品层给出决策）

**P2（Phase 2/3 启动前，轻量回填）：**

8. **补充 AI 规则算法规范**（Story 3.3 受益人规则 + Story 5.2 回礼建议算法） — 在对应 Story 实施前补齐
9. **回填 Architecture 文档的 4 项 Minor 差异**：
   - `accessibility-standards.md` 横切规范引用
   - 礼金簿批量 OCR API vs 单图 OCR 服务分工
   - `analytics.chat_sessions` / `analytics.insights` 等 Phase 3 schema
   - 后台 worker 运行时声明（Epic Story 0.8 已补位，可回填到架构文档）
10. **竞品 AI 能力调研（PRD 开放问题 #1）** — 不阻塞 MVP，但建议在 MVP 后 3 个月（成功标准验证期）前完成

### Issue Statistics

| 严重度 | 数量 | 来源 |
|--------|------|------|
| 🔴 Critical | 0 | — |
| 🟠 Major | 1 | Story 7.1 粒度 |
| 🟡 Minor | 10 | 4 UX↔Architecture + 6 Epic Quality |
| 🟢 Info | 1 | 无障碍标准引用 |

### Final Note

This assessment identified **12 issues across 3 categories**（Critical 0 / Major 1 / Minor 10 / Info 1）. **无 Critical 阻塞项**；1 Major 项（Story 7.1 拆分）可在对应 Epic 启动前解决；10 Minor 项多数可在 Phase 2/3 启动前轻量回填。项目具备进入 MVP 实施（Epic 0 + Epic 1）的充分条件。

**方法论观察：**
- 本次 BMAD 规划文档显著受益于 WDS（Whiteport Design Studio）前置产物——UX 100% Outlined、6 层设计资产齐备、内容终稿落地，使 Story AC 的"视觉/交互/文案/组件/Token/规格"强制引用可执行
- PRD Bridge（索引型 PRD）模式在需求变更成本与可追溯性间取得平衡；量化指标（FR17/FR18/NFR1）的 P1 补全使 BMAD 下游 AC 可验收
- `partyModeDecisions`（E0 拆分 / E1 瘦身 / E3 合并 / E9 拆分）体现了 Planning 阶段的架构决策记录，为后续 retrospective 提供依据

**可选的下一步：** 本报告的发现可用于改进规划文档，也可选择按当前状态启动实施（建议按上述 P0-P2 优先级分批处置）。
