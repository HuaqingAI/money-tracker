# Design Log: Money Tracker

> WDS 设计流程的进度追踪和关键决策记录

**Project:** Money Tracker
**Started:** 2026-04-08
**Method:** Whiteport Design Studio (WDS)

---

## Progress

### 2026-04-08 — Phase 1: Product Brief Complete

**Agent:** Saga (Product Discovery)
**Status:** APPROVED by Sue

**Artifacts Created:**
- `planning-artifacts/product-brief-money-tracker.md` — Product Brief
- `planning-artifacts/product-brief-money-tracker-distillate.md` — Brief Distillate
- `dialog/00-context.md` through `dialog/12-synthesis.md` — Discovery dialog records
- `dialog/progress-tracker.md` — Dialog progress
- `dialog/decisions.md` — Discovery decisions

**Summary:** 通过12轮对话完成产品简报。确立了零记账的AI财务管家定位，三层架构（零记账引擎 → 多维理解 → AI管家），B2C Freemium商业模式，React Native + Next.js + Supabase技术栈。

---

### 2026-04-09 — Phase 2: Trigger Map Complete

**Agent:** Saga (Trigger Mapping)
**Mode:** Suggest
**Status:** COMPLETE

**Artifacts Created:**
- `B-Trigger-Map/00-trigger-map.md` — Trigger Map 总览与可视化
- `B-Trigger-Map/01-Business-Goals.md` — 商业目标（3层级9指标）
- `B-Trigger-Map/02-Danny.md` — Primary 角色：大强 Danny
- `B-Trigger-Map/03-Lily.md` — Secondary 角色：小丽 Lily
- `B-Trigger-Map/04-Mei.md` — Tertiary 角色：小美 Mei
- `B-Trigger-Map/05-Key-Insights.md` — 战略洞察与设计原则

**Summary:** 通过 Suggest 模式完成触发地图。确立3个商业目标层级（ENGINE/GROWTH/SUSTAINABILITY），3个用户角色及其正负驱动力评分。核心洞察：零输入是产品身份而非功能、真相镜子而非法官、共享事实消解冲突、人情账为蓝海。

---

### 2026-04-09 — Phase 3: UX Scenarios Complete

**Agent:** Saga (Scenario Outline)
**Scenarios:** 8 scenarios covering 28 pages
**Quality:** Good (5 Excellent, 3 Good)

**Artifacts Created:**
- `C-UX-Scenarios/00-ux-scenarios.md` — Scenario index with coverage matrix
- `C-UX-Scenarios/01-dannys-zero-input-first-experience/01-dannys-zero-input-first-experience.md` — 大强的零记账初体验
- `C-UX-Scenarios/01-dannys-zero-input-first-experience/01.1-welcome/01.1-welcome.md` — Welcome/Splash
- `C-UX-Scenarios/01-dannys-zero-input-first-experience/01.2-onboarding/01.2-onboarding.md` — Onboarding引导页
- `C-UX-Scenarios/01-dannys-zero-input-first-experience/01.3-registration/01.3-registration.md` — 注册/登录
- `C-UX-Scenarios/01-dannys-zero-input-first-experience/01.4-permission/01.4-permission.md` — 权限授权页
- `C-UX-Scenarios/01-dannys-zero-input-first-experience/01.5-bill-import/01.5-bill-import.md` — 账单导入
- `C-UX-Scenarios/01-dannys-zero-input-first-experience/01.6-import-processing/01.6-import-processing.md` — 导入处理中
- `C-UX-Scenarios/01-dannys-zero-input-first-experience/01.7-dashboard/01.7-dashboard.md` — Dashboard/首页
- `C-UX-Scenarios/01-dannys-zero-input-first-experience/01.8-monthly-report/01.8-monthly-report.md` — 月度报表
- `C-UX-Scenarios/02-dannys-family-shared-ledger/02-dannys-family-shared-ledger.md` — 大强的家庭共享账本
- `C-UX-Scenarios/02-dannys-family-shared-ledger/02.1-subscription/02.1-subscription.md` — 订阅/付费
- `C-UX-Scenarios/02-dannys-family-shared-ledger/02.2-shared-family-ledger/02.2-shared-family-ledger.md` — 共享家庭账本
- `C-UX-Scenarios/02-dannys-family-shared-ledger/02.3-beneficiary-tagging/02.3-beneficiary-tagging.md` — 受益人标注
- `C-UX-Scenarios/03-lilys-spending-mirror/03-lilys-spending-mirror.md` — 小丽的消费真相镜子
- `C-UX-Scenarios/03-lilys-spending-mirror/03.1-transaction-list/03.1-transaction-list.md` — 交易列表
- `C-UX-Scenarios/03-lilys-spending-mirror/03.2-transaction-detail/03.2-transaction-detail.md` — 交易详情
- `C-UX-Scenarios/03-lilys-spending-mirror/03.3-trend-chart/03.3-trend-chart.md` — 趋势图表
- `C-UX-Scenarios/03-lilys-spending-mirror/03.4-spending-radar/03.4-spending-radar.md` — 消费习惯雷达
- `C-UX-Scenarios/04-dannys-gift-accounting/04-dannys-gift-accounting.md` — 大强的人情账管理
- `C-UX-Scenarios/04-dannys-gift-accounting/04.1-gift-management/04.1-gift-management.md` — 人情账管理
- `C-UX-Scenarios/04-dannys-gift-accounting/04.2-gift-smart-suggestion/04.2-gift-smart-suggestion.md` — 人情智能建议
- `C-UX-Scenarios/05-meis-multi-identity-accounting/05-meis-multi-identity-accounting.md` — 小美的多身份核算
- `C-UX-Scenarios/05-meis-multi-identity-accounting/05.1-identity-management/05.1-identity-management.md` — 多身份管理
- `C-UX-Scenarios/05-meis-multi-identity-accounting/05.2-identity-pnl/05.2-identity-pnl.md` — 身份损益表
- `C-UX-Scenarios/06-manual-input-and-category-management/06-manual-input-and-category-management.md` — 手动记账与分类补充
- `C-UX-Scenarios/06-manual-input-and-category-management/06.1-manual-entry/06.1-manual-entry.md` — 手动记账
- `C-UX-Scenarios/06-manual-input-and-category-management/06.2-category-management/06.2-category-management.md` — 分类管理
- `C-UX-Scenarios/06-manual-input-and-category-management/06.3-ios-shortcuts-guide/06.3-ios-shortcuts-guide.md` — iOS快捷指令配置指引
- `C-UX-Scenarios/07-ai-butler-intelligence/07-ai-butler-intelligence.md` — AI管家智能层
- `C-UX-Scenarios/07-ai-butler-intelligence/07.1-ai-chat/07.1-ai-chat.md` — AI对话
- `C-UX-Scenarios/07-ai-butler-intelligence/07.2-insights-feed/07.2-insights-feed.md` — 洞察推送
- `C-UX-Scenarios/07-ai-butler-intelligence/07.3-optimization-suggestions/07.3-optimization-suggestions.md` — 优化建议
- `C-UX-Scenarios/07-ai-butler-intelligence/07.4-simulation-comparison/07.4-simulation-comparison.md` — 消费模拟/同类对比
- `C-UX-Scenarios/08-account-and-settings/08-account-and-settings.md` — 账户与设置管理
- `C-UX-Scenarios/08-account-and-settings/08.1-settings/08.1-settings.md` — 设置
- `C-UX-Scenarios/08-account-and-settings/08.2-profile-account/08.2-profile-account.md` — 个人资料/账户

**Summary:** 通过 Suggest 模式完成8个UX场景大纲（3个P1 + 3个P2 + 2个P3），覆盖全部28个页面/视图，100%无遗漏无重复。场景以大强（Primary）为主要设计目标，小丽和小美分别有独立场景。手动记账页面由Sue补充加入，iOS快捷指令配置指引列为Phase 2非MVP。

**Next:** Phase 4 — UX Design

---

## Key Decisions

| Date | Decision | Phase | By |
|------|----------|-------|----|
| 2026-04-09 | 新增"手动记账"页面（表单/语音/截图三模式），覆盖AI未捕获的特殊情况 | Phase 3: Scenarios | Sue |
| 2026-04-09 | iOS快捷指令配置指引列为Phase 2（非MVP） | Phase 3: Scenarios | Sue |
| 2026-04-09 | 跨角色场景（06/07/08）使用大强作为代表用户，命名保留功能描述以提升直观性 | Phase 3: Scenarios | Saga + Sue |
| 2026-04-09 | 注册/登录必须支持微信登录作为主要方式（国内主流），手机号为备选 | Phase 4: UX Design | Sue |
| 2026-04-10 | Welcome页去掉"已有账号？登录"链接，保持单一CTA零决策。重装用户在Onboarding中通过手机号/微信自动识别 | Phase 4: UX Design | Sue |

---

## Current Phase

**Phase 4: UX Design** — IN PROGRESS

## Current

| Task | Scenario | Started |
|------|----------|---------|
| 页面规格设计 [S] Suggest 模式 | 01: 大强的零记账初体验 | 2026-04-09 |

## Design Loop Status

| Scenario | Page | Page Name | Status | Date |
|----------|------|-----------|--------|------|
| 01-dannys-zero-input-first-experience | 01.1 | Welcome | **specified** | 2026-04-10 |

## Backlog

- [x] Phase 4: UX Design — 详细页面规格、线框图、组件定义 (IN PROGRESS)
- [ ] Phase 5: Agentic Development — AI辅助开发
- [ ] Phase 6: Asset Generation — 视觉资产生成
