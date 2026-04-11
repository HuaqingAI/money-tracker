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
- `C-UX-Scenarios/04-dannys-gift-accounting/04.1a-gift-book-import/04.1a-gift-book-import.md` — 人情簿OCR导入 ⚡ Phase 4 新增
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

### 2026-04-10 — Phase 4: UX Design — Scenario 01 Complete

**Agent:** Freya (UX Design)
**Mode:** Suggest (with Sue review)
**Status:** SCENARIO 01 COMPLETE — 8/8 pages specified

**Pages Specified:**
- `01.1-welcome` — Welcome/Splash
- `01.2-onboarding` — Onboarding 引导页（三幕叙事）
- `01.3-registration` — 注册/登录（微信+手机号并列Tab）
- `01.4-permission` — 权限授权页（厂商适配引导 + iOS预告）
- `01.5-bill-import` — 账单导入（支付宝CSV分步教程）
- `01.6-import-processing` — 导入处理中（信任建立剧场）
- `01.7-dashboard` — Dashboard/首页（Full/Empty/Import Processing三态）
- `01.8-monthly-report` — 月度报表（饼图+分类明细+AI洞察+分享）

**Summary:** 完成大强的零记账初体验全部8个页面的Phase 4规格设计。01.1-01.5由Freya与Sue逐页讨论完成，01.6由独立会话深度设计（20+ steps），01.7和01.8通过并行会话完成后经质量审查确认。关键设计主线：Welcome承诺→Onboarding三幕叙事→零摩擦注册→信任隐私承诺→分步导入教程→信任建立剧场→"打开就是答案"Dashboard→报表分享给小芳。场景从"下载APP"到"跟老婆有据可说"形成完整闭环。

**Quality Review (01.7 & 01.8 parallel sessions):**
- 01.7 Dashboard: 合格，内容充实，Import Banner衔接设计优秀
- 01.8 Monthly Report: 合格，分享流程完整，首月AI洞察策略好
- 跨页面不一致1处（Tab导航定义），已记入Open Questions

**Next:** Scenario 02-08 页面规格设计（按优先级 P1→P2→P3）

---

### 2026-04-11 — Phase 4: UX Design — Scenario 02 & 03 Complete

**Agent:** Freya (UX Design)
**Mode:** Parallel sessions (4 concurrent) + quality review
**Status:** SCENARIOS 02 & 03 COMPLETE — 7/7 pages specified

**Pages Specified:**
- `02.1-subscription` — 订阅/付费（免费领取+礼物化包装+信任承诺三件套）
- `02.2-shared-family-ledger` — 共享家庭账本（创建→邀请→等待三态+隐私卡片）
- `02.3-beneficiary-tagging` — 受益人标注（AI规则引擎+两阶段确认模型）
- `03.1-transaction-list` — 交易列表（双入口心理模型+分类筛选+搜索）
- `03.2-transaction-detail` — 交易详情（单笔显微镜+品牌洞察+分类修正）
- `03.3-trend-chart` — 趋势图表（折线图+环比变化卡片+AI原因标注）
- `03.4-spending-radar` — 消费习惯雷达（6维雷达图+消费人格标签+社交分享）

**Parallel Session Strategy:**
- 02.1 Subscription — 独立会话（付费流程独立性强）
- 02.2 + 02.3 Family Ledger — 合并会话（强关联的共享功能链）
- 03.1 + 03.2 Transaction — 合并会话（列表→详情的钻取关系）
- 03.3 + 03.4 Charts & Radar — 合并会话（独立的数据可视化页）

**Summary:** 完成 P1 优先级剩余的 Scenario 02（大强的家庭共享账本，3页）和 Scenario 03（小丽的消费真相镜子，4页）。4个并行会话同时设计，由主会话进行以01.6为基准的质量审查。所有页面结构完整，包含 User Mental State、ASCII Layout、Navigation Map+边界情况、OBJECT IDs、ZH/EN 双语内容。

**Quality Review Results:**
- 所有7个文件核心Section齐全，无结构性缺失
- 02.3 Beneficiary Tagging 最为详尽（1092行），包含独创的 AI Rule Engine 和 Interaction Model Section
- 03.4 Spending Radar 双语覆盖最强（Consumer Label 9条规则、Fun Insight 8种模板全部ZH/EN）
- 审查后修复：03.2 耐心程度描述修正、03.3 趋势标注文案正式化、03.3/03.4 Open Questions 状态升级

**Next:** Scenario 04-08 页面规格设计（P2: 04/05/06, P3: 07/08）

---

### 2026-04-11 — Phase 4: UX Design — Scenario 04-08 Complete (Phase 4 DONE)

**Agent:** Freya (UX Design)
**Mode:** Parallel sessions (6 concurrent) + quality review
**Status:** ALL SCENARIOS COMPLETE — 14/14 pages specified (+ 1 new page: 04.1a)

**Pages Specified:**
- `04.1-gift-management` — 人情账管理（以人为中心的网络模型+快捷金额Chips+多入口记录）
- `04.1a-gift-book-import` — 人情簿OCR导入（5步流程：拍照→识别→审核→事件信息→完成）⚡ 新增页面
- `04.2-gift-smart-suggestion` — 人情智能建议（AI区间建议+推理透明+文化敏感处理）
- `05.1-identity-management` — 多身份管理（身份创建→AI规则确认→剩余交易处理）
- `05.2-identity-pnl` — 身份损益表（Hero数字动画+时间价值+全职可行性预告）
- `06.1-manual-entry` — 手动记账（表单/语音/截图三模式+自定义数字键盘）
- `06.2-category-management` — 分类管理（准确率卡片+规则编辑+追溯修改）
- `06.3-ios-shortcuts-guide` — iOS快捷指令指引（Phase 2 轻量规格，方向性设计）
- `07.1-ai-chat` — AI对话（结构化JSON响应+数据锚点链接+免费计量设计）
- `07.2-insights-feed` — 洞察推送（AI生成调度+模糊Paywall+反馈训练闭环）
- `07.3-optimization-suggestions` — 优化建议（正向省钱框架+采纳追踪+执行进度）
- `07.4-simulation-comparison` — 消费模拟/同类对比（双Tab：滑块模拟+百分位定位）
- `08.1-settings` — 设置（数据安全优先IA+厂商通知管理+深度链接）
- `08.2-profile-account` — 个人资料/账户（6步注销流程+合规内嵌+4态会员卡片）

**Parallel Session Strategy:**
- 04.1 + 04.1a + 04.2 Gift Accounting — 独立会话（自主新增04.1a OCR导入子流程）
- 05.1 + 05.2 Multi-Identity — 合并会话（身份创建与损益表强关联）
- 06.1 + 06.2 + 06.3 Manual & Category — 合并会话（06.3 Phase 2 轻量处理）
- 07.1 + 07.2 AI Chat & Insights — 合并会话（AI Tab 内的两个核心视图）
- 07.3 + 07.4 Optimization & Sim — 合并会话（行动导向的双页面）
- 08.1 + 08.2 Account & Settings — 合并会话（设置与个人资料的父子关系）

**Summary:** 完成全部剩余 P2（Scenario 04/05/06）和 P3（Scenario 07/08）的 Phase 4 规格设计。6个并行会话同时设计14个页面，04.1a 为会话自主新增的 OCR 人情簿导入流程（原计划28页，实际产出29页）。至此 Phase 4 全部 29 个页面规格设计完成，覆盖 8 个场景。

**Quality Review Results:**
- 14个文件核心 Section 齐全（Page Metadata、Overview、Mental State、ASCII Layout、OBJECT IDs、States、Navigation Map、Interactions、Design Decisions）
- 05.1 Identity Management 最为详尽（1,459行），包含完整 AI Rule Engine Schema 和 Rule Persistence 模型
- 04.1a Gift Book Import 为新增页面，976行，5步OCR流程设计完整
- 06.3 iOS Shortcuts Guide 按 Phase 2 轻量规格处理（179行），3个红色 Open Questions 待 Phase 2 前解决
- 部分文件缺独立 Technical Notes section（04.1、04.2、08.1、08.2），技术细节散落在 Notes 字段中
- 07.1 AI Chat 有一个未定义的附件图标（📎），需补充或移除
- 07.3/07.4 各有1处交互缺 OBJECT ID（取消采纳、展开直方图）

**High-Priority Unresolved Architecture Questions:**
1. 07.1/07.2 是否在同一 AI Tab 下用顶部 Tab 切换，还是通过按钮导航（影响两个规格的入口结构）
2. 08.1 "我的" Tab 是直接等于 Settings 还是一个 Hub 页面（影响 08.x 整体导航架构）
3. 04.1a 手写 OCR 准确率是否达标（产品简报引用91%为印刷体，手写体未验证）

---

## Phase 4 Summary — ALL SCENARIOS COMPLETE

| Priority | Scenario | Pages | Status | Date |
|----------|----------|-------|--------|------|
| P1 | 01: 大强的零记账初体验 | 8 | COMPLETE | 2026-04-10 |
| P1 | 02: 大强的家庭共享账本 | 3 | COMPLETE | 2026-04-11 |
| P1 | 03: 小丽的消费真相镜子 | 4 | COMPLETE | 2026-04-11 |
| P2 | 04: 大强的人情账管理 | 2+1 | COMPLETE | 2026-04-11 |
| P2 | 05: 小美的多身份核算 | 2 | COMPLETE | 2026-04-11 |
| P2 | 06: 手动记账与分类管理 | 3 | COMPLETE | 2026-04-11 |
| P3 | 07: AI管家智能层 | 4 | COMPLETE | 2026-04-11 |
| P3 | 08: 账户与设置管理 | 2+1 | COMPLETE | 2026-04-11 |
| **Total** | **8 scenarios** | **30 pages** | **ALL COMPLETE** | |

---

## Key Decisions

| Date | Decision | Phase | By |
|------|----------|-------|----|
| 2026-04-09 | 新增"手动记账"页面（表单/语音/截图三模式），覆盖AI未捕获的特殊情况 | Phase 3: Scenarios | Sue |
| 2026-04-09 | iOS快捷指令配置指引列为Phase 2（非MVP） | Phase 3: Scenarios | Sue |
| 2026-04-09 | 跨角色场景（06/07/08）使用大强作为代表用户，命名保留功能描述以提升直观性 | Phase 3: Scenarios | Saga + Sue |
| 2026-04-09 | 注册/登录必须支持微信登录作为主要方式（国内主流），手机号为备选 | Phase 4: UX Design | Sue |
| 2026-04-10 | Welcome页去掉"已有账号？登录"链接，保持单一CTA零决策。重装用户在Onboarding中通过手机号/微信自动识别 | Phase 4: UX Design | Sue |
| 2026-04-10 | Onboarding三幕叙事：零输入（打消恐惧）→ 自动分类（建立信任）→ AI财务管家（建立期待），与Welcome保持承上启下而非重复 | Phase 4: UX Design | Freya + Sue |
| 2026-04-10 | Slide 3 从"智能报表"升级为"AI财务管家"定位，体现产品核心差异化 | Phase 4: UX Design | Sue |
| 2026-04-10 | Welcome和Onboarding保持独立页面——Welcome兼做轻量splash/资源加载，Onboarding可条件展示 | Phase 4: UX Design | Sue |
| 2026-04-10 | 注册页微信和手机号并列Tab展示（微信默认选中），而非微信为主手机号折叠 | Phase 4: UX Design | Sue |
| 2026-04-10 | "注册即登录"合一策略：后端自动识别新老用户，新用户创建账号→权限页，老用户直接→Dashboard | Phase 4: UX Design | Sue |
| 2026-04-10 | 协议采用Checkbox+弹窗兜底：未勾选时点击登录弹出"同意并继续"弹窗，一键同意后自动勾选并继续 | Phase 4: UX Design | Sue |
| 2026-04-10 | 权限页跳过->Dashboard空状态（而非CSV导入），让用户自主选择时机 | Phase 4: UX Design | Sue |
| 2026-04-10 | 权限页需提供厂商适配的设置引导（截图+步骤），覆盖小米/华为/OPPO/Vivo/三星 | Phase 4: UX Design | Sue |
| 2026-04-10 | iOS MVP不支持通知读取，展示"快捷指令方案即将上线"预告，引导CSV导入 | Phase 4: UX Design | Sue |
| 2026-04-10 | 账单导入MVP仅支持支付宝，微信支付为第二优先，银行账单后续 | Phase 4: UX Design | Sue |
| 2026-04-10 | 账单导入教程采用分步截图形式（4步），配高亮标注 | Phase 4: UX Design | Sue |
| 2026-04-10 | 所有用户均可跳过账单导入（含iOS/未授权），避免堵死"先看看、手动录几单"的用户 | Phase 4: UX Design | Sue |
| 2026-04-10 | 导入处理页为"信任建立剧场"——动效张扬有视觉冲击，动画循环直到后端完成（无硬性上限） | Phase 4: UX Design | Freya + Sue |
| 2026-04-10 | 返回键处理：非完成状态弹窗确认（后端继续处理），完成状态直接跳转 Dashboard | Phase 4: UX Design | Sue |
| 2026-04-10 | Stalled 判定基于连接存活而非分类速度：连接在=只是慢（30s提示），连接断=真Stalled（重连3次后Error） | Phase 4: UX Design | Freya + Sue |
| 2026-04-10 | 完成庆祝展示"本次导入"分类概览（不同于Dashboard的全量数据维度） | Phase 4: UX Design | Sue |
| 2026-04-10 | Dashboard"打开就是答案"：Full State展示月度总支出+Top5分类+AI覆盖率，Empty State用三级引导卡片（通知>导入>手动） | Phase 4: UX Design | Freya |
| 2026-04-10 | Dashboard空状态区分三种入口路径（跳过权限/跳过导入/有权限无数据），引导文案和卡片显示条件不同 | Phase 4: UX Design | Freya |
| 2026-04-10 | Dashboard保留Import Processing Banner：01.6中途退出后在首页展示轻量进度条，处理完成自动刷新数据 | Phase 4: UX Design | Freya |
| 2026-04-10 | Dashboard Full State保留二次导入入口卡片（"补充更多账单数据"），视觉权重低于Report CTA | Phase 4: UX Design | Freya |
| 2026-04-10 | Phase 2多账本策略：Dashboard用切换器（下拉）而非汇总，避免跨账本重复计算和语义混乱 | Phase 4: UX Design | Freya |
| 2026-04-10 | 月度报表为场景终点页（page 8/8），核心是"零记账承诺的最终兑现"+ 分享给小芳 | Phase 4: UX Design | Freya |
| 2026-04-10 | 报表分享卡片精简三要素：月份+总金额+Top3分类+品牌水印+二维码，面向非APP用户（小芳）设计 | Phase 4: UX Design | Freya |
| 2026-04-10 | 分享成功情感反馈"已分享，有据可说"呼应D1+驱动力，2.5s自动消失 | Phase 4: UX Design | Freya |
| 2026-04-10 | 首月AI洞察使用分类内分析（外卖vs堂食等）而非空洞的"数据积累中"，无需历史对比 | Phase 4: UX Design | Freya |
| 2026-04-10 | 固定支出（房贷等）单独标签标注，不与可控消费混合计算环比 | Phase 4: UX Design | Freya |
| 2026-04-10 | 报表饼图用环形（Donut）而非实心，中心可展示选中分类金额，分类卡片可展开Top3交易 | Phase 4: UX Design | Freya |
| 2026-04-11 | 订阅页采用"礼物化"免费领取包装而非传统Paywall，降低付费恐惧、提升领取率 | Phase 4: UX Design | Freya |
| 2026-04-11 | 订阅页不展示价格（免费期内），AI管家功能列表默认折叠，避免信息过载 | Phase 4: UX Design | Freya |
| 2026-04-11 | 家庭共享账本采用"同一份事实"情感定位而非"记账工具"，呼应冲突消解设计原则 | Phase 4: UX Design | Freya |
| 2026-04-11 | 共享邀请以微信为主渠道，增加面对面二维码作为备选 | Phase 4: UX Design | Freya |
| 2026-04-11 | 受益人标注采用两阶段模型：Phase 1 AI规则批量确认 + Phase 2 漏网手动补标 | Phase 4: UX Design | Freya |
| 2026-04-11 | 受益人标签固定四类（为自己/为配偶/为孩子/为家庭），MVP不支持自定义 | Phase 4: UX Design | Freya |
| 2026-04-11 | 交易列表不用红色表示支出（避免审判感），统一用中性色，呼应"真相镜子而非法官" | Phase 4: UX Design | Freya |
| 2026-04-11 | 交易列表双入口心理模型：从Dashboard分类卡片进入 vs 从底部Tab日常翻看，分别建模 | Phase 4: UX Design | Freya |
| 2026-04-11 | 趋势图表用橙+青双色而非红+绿，避免色觉障碍和涨跌心理暗示 | Phase 4: UX Design | Freya |
| 2026-04-11 | 消费雷达6维度（餐饮/购物/交通/居住/娱乐/健康）+ 消费人格标签作为社交货币 | Phase 4: UX Design | Freya |
| 2026-04-11 | 雷达分享卡片默认不展示金额（隐私保护），分享渠道增加朋友圈和小红书（vs 01.8仅微信好友） | Phase 4: UX Design | Freya |
| 2026-04-11 | 人情账以"人"为中心组织（网络模型），而非以交易流水为中心 | Phase 4: UX Design | Freya |
| 2026-04-11 | 人情金额用中性色显示净额，不用红绿——人情是社交投资不是损益 | Phase 4: UX Design | Freya |
| 2026-04-11 | 新增 04.1a 人情簿 OCR 导入页面（多页连拍+置信度分层+批量事件归属）| Phase 4: UX Design | Freya |
| 2026-04-11 | AI人情建议以区间展示（¥600-800）而非单一数字，保留用户决策权 | Phase 4: UX Design | Freya |
| 2026-04-11 | 丧事场景文化敏感处理：用"参考"替代"建议"，避免"规格""常见"等措辞 | Phase 4: UX Design | Freya |
| 2026-04-11 | 身份管理采用 AI 规则确认模式（共享 02.3 范式），规则持久化后自动应用未来交易 | Phase 4: UX Design | Freya |
| 2026-04-11 | 身份损益表 Hero 数字 40pt 动画揭晓（全 APP 最大数字），回应 M1- 恐惧 | Phase 4: UX Design | Freya |
| 2026-04-11 | 副业时间价值估算：AI 从交易时间戳推断工时，用户可手动调整，与主业时薪对比 | Phase 4: UX Design | Freya |
| 2026-04-11 | 全职可行性预告：连续3个月副业收入>主业时解锁，作为留存机制 | Phase 4: UX Design | Freya |
| 2026-04-11 | 手动记账用"记一笔"框架（非"手动记账"），降低心理负担 | Phase 4: UX Design | Freya |
| 2026-04-11 | 手动记账内嵌自定义数字键盘，避免系统键盘弹起导致布局跳动 | Phase 4: UX Design | Freya |
| 2026-04-11 | 语音记账采用"按住说话"而非环境监听，回应隐私控制需求 | Phase 4: UX Design | Freya |
| 2026-04-11 | 分类准确率正向展示（"96.2%"）而非负向（"18条错误"），呼应真相镜子原则 | Phase 4: UX Design | Freya |
| 2026-04-11 | 分类规则追溯修改：默认勾选"同时修改历史记录"，显示影响条数 | Phase 4: UX Design | Freya |
| 2026-04-11 | AI Chat 返回结构化 JSON（data_card + action_buttons + followup），非纯文本 | Phase 4: UX Design | Freya |
| 2026-04-11 | AI 回答中每个具体数字都是可点击的数据锚点，链接到交易列表——信任基石 | Phase 4: UX Design | Freya |
| 2026-04-11 | 免费用户 AI 对话计量：3次免费，第1次无提示，第2次轻提示，第3次 Paywall | Phase 4: UX Design | Freya |
| 2026-04-11 | 洞察推送模糊 Paywall：高斯模糊8pt显示真实内容轮廓，制造好奇缺口 | Phase 4: UX Design | Freya |
| 2026-04-11 | 洞察调度策略：每天1-2条，20:00-21:00推送，7天去重窗口 | Phase 4: UX Design | Freya |
| 2026-04-11 | "不感兴趣"反馈不删除卡片（降低透明度0.6），避免误操作数据丢失 | Phase 4: UX Design | Freya |
| 2026-04-11 | 优化建议用"省钱潜力"正向框架，"暂不考虑"低愧疚感措辞替代"忽略" | Phase 4: UX Design | Freya |
| 2026-04-11 | 优化建议最低¥50/月门槛，防止琐碎建议稀释质量 | Phase 4: UX Design | Freya |
| 2026-04-11 | 省钱金额用绿色（偏离03.x中性色原则），因语境是"激励储蓄"非"展示事实" | Phase 4: UX Design | Freya |
| 2026-04-11 | 消费模拟滑块带触觉反馈——"每一格都是真金白银" | Phase 4: UX Design | Freya |
| 2026-04-11 | 同类对比用百分位（"超过62%"）而非排名，延续"事实陈述"而非竞争框架 | Phase 4: UX Design | Freya |
| 2026-04-11 | 设置页数据安全放第一位（IA优先级=信任优先级），回应 D5- | Phase 4: UX Design | Freya |
| 2026-04-11 | 安全详情用行内折叠而非跳转新页面，降低"快速安心"的摩擦 | Phase 4: UX Design | Freya |
| 2026-04-11 | 注销流程6步多重确认（含合规要求：个人信息保护法，15工作日，3层嵌套验证≤4层） | Phase 4: UX Design | Freya |
| 2026-04-11 | 会员卡片4视觉态（Free/Trial/Active/Expired），视觉层级编码升级动机 | Phase 4: UX Design | Freya |
| 2026-04-11 | AI Tab 内部采用顶部 Tab 切换（对话 \| 洞察），而非独立页面+按钮跳转。理由：同一AI管家的两种模式，Tab切换认知成本更低 | Phase 4: UX Design | Sue |
| 2026-04-11 | "我的" Tab 采用 Hub 页面（08.0），而非直接等于 Settings（08.1）。Hub 提供 Profile Card + Feature Grid + Menu List，Settings 降级为菜单入口 | Phase 4: UX Design | Sue |
| 2026-04-11 | 新增 08.0 My Hub 页面，解决 P2 功能（人情账/多身份/分类管理）缺乏统一入口的问题 | Phase 4: UX Design | Freya + Sue |
| 2026-04-11 | Profile Card 从 08.1 Settings 提升到 08.0 Hub，头像 64pt（vs Settings 48pt），强调"个人空间"感 | Phase 4: UX Design | Freya |
| 2026-04-11 | Hub 的 Feature Grid 对免费用户显示付费功能（带锁标），点击跳转订阅页，提升升级动机 | Phase 4: UX Design | Freya |
| 2026-04-11 | 04.1a OCR 准确率：MVP 接受印刷体/清晰手写 >= 80%，后续迭代提升。Phase 5 前做 Spike 验证 | Phase 4: UX Design | Sue |

---

## Current Phase

**Phase 4: UX Design** — COMPLETE ✓

All 8 scenarios, 30 pages specified (29 + 08.0 Hub).

## Design Loop Status

| Scenario | Page | Page Name | Status | Date |
|----------|------|-----------|--------|------|
| 01-dannys-zero-input-first-experience | 01.1 | Welcome | **specified** | 2026-04-10 |
| 01-dannys-zero-input-first-experience | 01.2 | Onboarding | **specified** | 2026-04-10 |
| 01-dannys-zero-input-first-experience | 01.3 | Registration / Login | **specified** | 2026-04-10 |
| 01-dannys-zero-input-first-experience | 01.4 | Permission | **specified** | 2026-04-10 |
| 01-dannys-zero-input-first-experience | 01.5 | Bill Import | **specified** | 2026-04-10 |
| 01-dannys-zero-input-first-experience | 01.6 | Import Processing | **specified** | 2026-04-10 |
| 01-dannys-zero-input-first-experience | 01.7 | Dashboard | **specified** | 2026-04-10 |
| 01-dannys-zero-input-first-experience | 01.8 | Monthly Report | **specified** | 2026-04-10 |
| 02-dannys-family-shared-ledger | 02.1 | Subscription | **specified** | 2026-04-11 |
| 02-dannys-family-shared-ledger | 02.2 | Shared Family Ledger | **specified** | 2026-04-11 |
| 02-dannys-family-shared-ledger | 02.3 | Beneficiary Tagging | **specified** | 2026-04-11 |
| 03-lilys-spending-mirror | 03.1 | Transaction List | **specified** | 2026-04-11 |
| 03-lilys-spending-mirror | 03.2 | Transaction Detail | **specified** | 2026-04-11 |
| 03-lilys-spending-mirror | 03.3 | Trend Chart | **specified** | 2026-04-11 |
| 03-lilys-spending-mirror | 03.4 | Spending Radar | **specified** | 2026-04-11 |
| 04-dannys-gift-accounting | 04.1 | Gift Management | **specified** | 2026-04-11 |
| 04-dannys-gift-accounting | 04.1a | Gift Book Import (NEW) | **specified** | 2026-04-11 |
| 04-dannys-gift-accounting | 04.2 | Gift Smart Suggestion | **specified** | 2026-04-11 |
| 05-meis-multi-identity-accounting | 05.1 | Identity Management | **specified** | 2026-04-11 |
| 05-meis-multi-identity-accounting | 05.2 | Identity P&L | **specified** | 2026-04-11 |
| 06-manual-input-and-category-management | 06.1 | Manual Entry | **specified** | 2026-04-11 |
| 06-manual-input-and-category-management | 06.2 | Category Management | **specified** | 2026-04-11 |
| 06-manual-input-and-category-management | 06.3 | iOS Shortcuts Guide | **phase2-lite** | 2026-04-11 |
| 07-ai-butler-intelligence | 07.1 | AI Chat | **specified** | 2026-04-11 |
| 07-ai-butler-intelligence | 07.2 | Insights Feed | **specified** | 2026-04-11 |
| 07-ai-butler-intelligence | 07.3 | Optimization Suggestions | **specified** | 2026-04-11 |
| 07-ai-butler-intelligence | 07.4 | Simulation Comparison | **specified** | 2026-04-11 |
| 08-account-and-settings | 08.0 | My Hub (NEW) | **specified** | 2026-04-11 |
| 08-account-and-settings | 08.1 | Settings | **specified** (updated) | 2026-04-11 |
| 08-account-and-settings | 08.2 | Profile / Account | **specified** | 2026-04-11 |

**Scenario 01 Complete** -- 大强的零记账初体验全部 8 个页面规格设计完成 (2026-04-10)
**Scenario 02 Complete** -- 大强的家庭共享账本全部 3 个页面规格设计完成 (2026-04-11)
**Scenario 03 Complete** -- 小丽的消费真相镜子全部 4 个页面规格设计完成 (2026-04-11)
**Scenario 04 Complete** -- 大强的人情账管理全部 2+1 个页面规格设计完成 (2026-04-11)
**Scenario 05 Complete** -- 小美的多身份核算全部 2 个页面规格设计完成 (2026-04-11)
**Scenario 06 Complete** -- 手动记账与分类管理全部 3 个页面规格设计完成 (2026-04-11)
**Scenario 07 Complete** -- AI管家智能层全部 4 个页面规格设计完成 (2026-04-11)
**Scenario 08 Complete** -- 账户与设置管理全部 2 个页面规格设计完成 (2026-04-11)

### Cross-Page Review Notes (01.7 & 01.8)

| # | Note | Severity | Status |
|---|------|----------|--------|
| 1 | 01.8 提到"从底部 Tab 导航'报表'进入"，但 01.7 Bottom Tab Bar 定义为四栏（首页/交易/AI/我的），无"报表"Tab。需确认报表的常规访问路径 | Low | 🟡 Open |
| 2 | 01.7 和 01.8 均缺少独立 Data Validation Section（01.6 有），但作为展示页可接受 | Info | ✅ Accepted |
| 3 | 01.7 缺状态机图（01.6 有），但 Dashboard 状态为条件分支而非线性流程，表格描述合理 | Info | ✅ Accepted |

### Cross-Page Review Notes (02.x & 03.x)

| # | Note | Severity | Status |
|---|------|----------|--------|
| 1 | 03.3 "从 Dashboard 进入趋势图"的入口位置在 01.7 中未定义，属于跨规格依赖缺口 | Medium | 🔴 Open |
| 2 | 02.2/02.3 User Mental State 多了"关键信号"行（01.3/01.4 也有），其他文件没有。建议标准化决策 | Low | 🟡 Open |
| 3 | 03.4 分享卡片默认隐藏金额，但未提供用户控制开关，已记入 Open Questions | Low | 🟡 Open |

### Cross-Page Review Notes (04.x-08.x)

| # | Note | Severity | Status |
|---|------|----------|--------|
| 1 | 07.1/07.2 采用顶部 Tab 切换（对话 \| 洞察），已更新两个规格的 Header Section | High | ✅ Resolved |
| 2 | "我的" Tab 采用 Hub 页面（08.0 新增），08.1 Profile Card 移至 Hub，已更新 | High | ✅ Resolved |
| 3 | 04.1a OCR 准确率：MVP 接受 >= 80%，Phase 5 前做 Spike 验证 | High | 🟡 Spike Needed |
| 4 | 04.1/04.2/08.1/08.2 缺独立 Technical Notes section，技术细节散落在 Notes 字段中 | Medium | 🟡 Open |
| 5 | 07.1 附件图标（📎）出现在 ASCII 但无 OBJECT ID 和行为定义 | Medium | 🟡 Open |
| 6 | 07.3 取消采纳交互在 Navigation Map 提及但无 OBJECT ID | Medium | 🟡 Open |
| 7 | 07.4 展开分类直方图在 Interactions 提及但无 OBJECT ID | Medium | 🟡 Open |
| 8 | 05.2 Income Item Tap 缺 OBJECT ID（唯一缺失的交互元素 ID） | Low | 🟡 Open |
| 9 | 05.2 "查看全部" 导航到 03.1 需要 identity + cost category 筛选参数，03.1 侧未定义 | Medium | 🟡 Open |
| 10 | 06.1 DatePicker 90天限制在 edge cases 和 component spec 之间不一致 | Low | 🟡 Open |
| 11 | 07.2 分享卡片"包含金额"opt-in 无 UI 控件定义 | Low | 🟡 Open |
| 12 | 07.2 与 01.8 AI 洞察内容可能重叠，边界未定义 | Medium | 🟡 Open |
| 13 | 08.2 注销流程为概要级别，合规实施前需独立详细规格 | Medium | 🟡 Open |
| 14 | 08.2 付费会员管理页（Active 状态 CTA 目标）未设计 | Medium | 🔴 Open |

## Backlog

- [x] Phase 4: UX Design — 详细页面规格、线框图、组件定义 (COMPLETE)
- [ ] Phase 5: Agentic Development — AI辅助开发
- [ ] Phase 6: Asset Generation — 视觉资产生成
