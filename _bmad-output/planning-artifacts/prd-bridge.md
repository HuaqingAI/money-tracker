---
title: "PRD Bridge — 了然 (Liaoran)"
type: prd-bridge
source:
  - product-brief-money-tracker-distillate.md
  - 00-ux-scenarios.md
  - architecture.md
created: "2026-04-14"
purpose: "桥接 WDS 产物与 BMAD Epic/Story 工作流，提供 BMAD 可识别的编号 FR/NFR 格式"
status: active
---

# PRD Bridge — 了然 (Liaoran)

> 本文档是索引文档，不是副本。功能描述简明扼要，详细规格指向 WDS 源产物。
> 需求变更规范见文末"变更日志"章节。

## 产品概要

- **产品名称**：了然 (Liaoran)
- **定位**：AI 驱动的零记账智能财务管家
- **核心承诺**：通过 AI 自动捕获和智能管理，消灭"手动记账"
- **目标用户**：已婚家庭、城市白领、副业人群、人情往来用户
- **商业模式**：B2C Freemium（F1-F3 免费获客，F4-F13 付费变现）
- **详细产品简报**：`product-brief-money-tracker-distillate.md`

## 成功标准

> 来源：`B-Trigger-Map/01-Business-Goals.md`。以下为 BMAD 下游工作流快速参考；权威版本及详细推导见 Trigger Map。

| 目标 | 指标 | 时间线 |
|-----|------|-------|
| 验证零记账体验（核心引擎） | AI 捕获率 Android >= 80%, iOS >= 60%；手动输入 <= 3次/周；分类准确率 >= 85% | MVP 后 3 个月 |
| 获得并留住用户（增长） | 注册用户 >= 1000；30 日留存 >= 40%；应用评分 >= 4.5 | 上线后 6 个月 |
| 经济自持（可持续） | 付费转化率 >= 5%；月收入 >= 月运营成本；差异化功能使用率 >= 30% | 上线后 12 个月 |

## 实施范围

| 阶段 | 功能范围 | Scenario 覆盖 | 状态 |
|------|---------|--------------|------|
| MVP (Phase 1) | F1-F3 + 注册登录 | Scenario 01 (8 页) | 当前 |
| Phase 2 | F4-F8 | Scenario 02-06 (15 页，含 04.1a) | 未来 |
| Phase 3 | F9-F13 | Scenario 07-08 (7 页，含 07.4) | 未来 |

---

## Functional Requirements

### MVP — Phase 1 (F1-F3)

#### FR1: 账单自动捕获 — Android 通知监听
- Android 通过 NotificationListenerService 捕获支付宝/微信/银行推送通知
- 提取金额、商户名称、交易时间
- 客户端只采集原始数据，所有解析/去重/分类在后端处理
- 捕获覆盖率目标 >= 80%
- 含 5 个厂商专属设置引导（小米/华为/OPPO/Vivo/三星）
- **UX 规格**：`C-UX-Scenarios/01-*/01.4-*`（权限授权页）
- **高保真设计**：`E-Assets/page-designs/01.4-permission.html`
- **架构参考**：architecture.md → 类别 3 API / 横切关注点 #2 平台差异

#### FR2: 账单手动导入 — CSV 文件
- 支持支付宝 CSV（GBK 编码）和微信 CSV（UTF-8 编码）
- 上传后由后端解析、去重、归一化
- 解析规则需支持热更新（支付格式变更时无需客户端发版）
- **UX 规格**：`C-UX-Scenarios/01-*/01.5-*`（账单导入页）
- **高保真设计**：`E-Assets/page-designs/01.5-bill-import.html`
- **架构参考**：architecture.md → 类别 3 API → CSV 解析

#### FR3: AI 自动分类
- AI 模型对导入交易自动分类（餐饮、交通、购物等）
- 分类结果进入 `pending_confirmation` 状态，需用户确认
- 用户可确认（confirmed）或拒绝并手动修正（rejected → 重新分类）
- 用户修正会作为训练反馈优化后续分类
- "Trust Theater" 模式：前端最少展示 5s 处理动画，与后端解耦
- **UX 规格**：`C-UX-Scenarios/01-*/01.6-*`（导入处理页）
- **高保真设计**：`E-Assets/page-designs/01.6-import-processing.html`
- **架构参考**：architecture.md → 类别 3 AI 服务抽象层

#### FR4: Dashboard 首页
- 月度消费概览：总支出、按分类分布
- 待确认交易列表入口
- 最近交易流水
- AI Spotlight 卡片（洞察摘要）：刷新频率 >= 每日 1 次（有新数据时）；用户反馈"有用"率 >= 70%
- 导入进度横幅（CSV/通知捕获状态）
- AI 覆盖率指示器
- 家庭快照卡片 / 身份快照卡片（Phase 2 扩展位）
- 上下文感知空状态（新用户引导 vs 无数据 vs 无待确认）
- FAB 浮动操作按钮
- **UX 规格**：`C-UX-Scenarios/01-*/01.7-*`（Dashboard 页）
- **高保真设计**：`E-Assets/page-designs/01.7-dashboard.html`
- **架构参考**：architecture.md → 类别 1 缓存策略

#### FR5: 月度报表
- 按月汇总消费，按分类展示
- 同比/环比趋势（有历史数据时）
- **UX 规格**：`C-UX-Scenarios/01-*/01.8-*`（月度报表页）
- **高保真设计**：`E-Assets/page-designs/01.8-monthly-report.html`

#### FR6: 用户注册与认证
- 微信一键登录（OAuth）
- 手机号 + OTP 验证码登录
- 注册时强制同意隐私协议，记录同意时间戳
- 新用户进入引导流程，老用户直接进入 Dashboard
- **UX 规格**：`C-UX-Scenarios/01-*/01.1-*` ~ `01.3-*`（欢迎/引导/注册页）
- **高保真设计**：`E-Assets/page-designs/01.1-welcome.html` · `01.2-onboarding.html` · `01.3-registration.html`
- **架构参考**：architecture.md → 类别 2 认证与安全

#### FR7: iOS 替代捕获方案
- iOS 无法拦截通知，提供替代方案：
  - Siri 语音快捷记账（~3s）
  - Widget 一键记账（~1s）
  - 截屏 OCR 识别
- MVP 阶段 iOS 优先级低于 Android
- **UX 规格**：`C-UX-Scenarios/06-*/`（手动记账 + iOS 快捷指令）
- **高保真设计**：`E-Assets/page-designs/06.3-ios-shortcuts.html`
- **架构参考**：architecture.md → 横切关注点 #2 平台差异

### Phase 2 (F4-F8)

#### FR8: 付费订阅与支付
- 定价展示、功能对比
- Android：微信支付 + 支付宝
- iOS：Apple IAP
- 订阅状态管理（provider、plan、expires_at）
- **UX 规格**：`C-UX-Scenarios/02-*/`（Scenario 02）
- **高保真设计**：`E-Assets/page-designs/02.1-subscription.html`
- **架构参考**：architecture.md → 全场景技术选型 → 支付与订阅

#### FR9: 家庭共享账本
- 创建家庭账本，邀请家人加入
- 各自记录自动汇总到共享视图
- 部分消费可设为"仅自己可见"（visibility 字段）
- 共享 Dashboard 展示家庭总支出
- **UX 规格**：`C-UX-Scenarios/02-*/`（共享家庭账本 + 受益人标注）
- **高保真设计**：`E-Assets/page-designs/02.2-shared-family-ledger.html`
- **架构参考**：architecture.md → 类别 2 RLS Phase 2 扩展

#### FR10: 受益人标注
- 消费标记"为谁花的"（自己/配偶/孩子/家庭共用）
- 两阶段 AI 规则引擎：AI 建议规则 → 用户确认 → 持久化规则自动应用未来交易
- 按受益人维度统计支出
- **UX 规格**：`C-UX-Scenarios/02-*/`（受益人标注页）
- **高保真设计**：`E-Assets/page-designs/02.3-beneficiary-tagging.html`

#### FR11: 交易浏览与详情
- 交易列表：按分类筛选、按时间排序
- 交易详情：AI 识别的品牌、分类、置信度展示
- 用户可修正 AI 分类（反馈闭环）
- **UX 规格**：`C-UX-Scenarios/03-*/`（交易列表 + 交易详情页）
- **高保真设计**：`E-Assets/page-designs/03.1-transaction-list.html` · `03.2-transaction-detail.html`

#### FR12: 消费趋势与分享
- 多月消费趋势折线图
- 消费习惯雷达图
- 分享卡片生成 + 微信分享
- **UX 规格**：`C-UX-Scenarios/03-*/`（趋势图表 + 消费习惯雷达页）
- **高保真设计**：`E-Assets/page-designs/03.3-trend-chart.html` · `03.4-spending-radar.html`
- **架构参考**：architecture.md → 全场景技术选型 → 图表 / 分享

#### FR13: 人情账管理
- 按"人"组织的人情网络（非线性流水）
- 随礼历史记录（跨年）
- 智能回礼建议（历史金额 + 物价涨幅 + 关系亲疏 + 宴会规格）
- 丧事场景特殊语言处理（措辞敏感度）
- 人情支出季节性预警
- **礼金簿 OCR 导入**（04.1a）：拍照→OCR→审核→关联事件→完成，5 步流程，支持多页拍摄、置信度评分、行内编辑
- **UX 规格**：`C-UX-Scenarios/04-*/`（Scenario 04）
- **高保真设计**：`E-Assets/page-designs/04.1-gift-management.html` · `04.1a-gift-book-import.html` · `04.2-gift-smart-suggestion.html`

#### FR14: 多身份核算
- 创建/切换财务身份（打工人/老板/自由职业等）
- 各身份独立收支核算
- 副业利润计算器（收入 - 显性成本 - 隐性成本 = 真实利润）
- **UX 规格**：`C-UX-Scenarios/05-*/`（Scenario 05）
- **高保真设计**：`E-Assets/page-designs/05.1-identity-management.html` · `05.2-identity-pnl.html`
- **架构参考**：architecture.md → 全场景技术选型 → 语音输入

#### FR15: 手动记账与分类管理
- 表单/语音/截图三种快速补充方式
- 分类管理：查看 AI 分类规则、手动调整
- 目标：3 秒内完成一笔补充记录
- **UX 规格**：`C-UX-Scenarios/06-*/`（Scenario 06）
- **高保真设计**：`E-Assets/page-designs/06.1-manual-entry.html` · `06.2-category-management.html`

### Phase 3 (F9-F13)

#### FR16: AI 对话管家
- 自然语言财务问答（"上月咖啡花了多少？"）
- 流式响应（打字机效果）
- 注入用户财务数据作为上下文
- 结构化数据卡片（从 JSON 流渲染图表/表格）
- 可点击数据引用（跳转至交易详情）
- Action Buttons（AI 建议操作按钮，从流中解析渲染）
- **UX 规格**：`C-UX-Scenarios/07-*/`（AI 对话页）
- **高保真设计**：`E-Assets/page-designs/07.1-ai-chat.html`
- **架构参考**：architecture.md → 全场景技术选型 → 对话式 AI

#### FR17: 洞察推送
- AI 主动发现消费异常和趋势
- 推送通知 + App 内 Feed
- 推送节奏自适应（系统学习用户偏好）
- 异常触发阈值：单笔消费 > 历史同类均值 3 倍时触发推送
- 推送频率上限：每日 <= 3 条；连续 7 天无互动自动降频至每周 <= 1 条
- 质量指标：推送"有用"反馈率 >= 40%（由 ML 反馈闭环数据测量）
- ML 反馈闭环："有用/不相关"按钮训练洞察权重
- **UX 规格**：`C-UX-Scenarios/07-*/`（洞察推送页）
- **高保真设计**：`E-Assets/page-designs/07.2-insights-feed.html`
- **架构参考**：architecture.md → 全场景技术选型 → 推送通知

#### FR18: 消费优化建议
- 可执行的省钱建议（基于历史数据分析）：每次推送 >= 1 条有明确消费品类和目标金额的建议
- 消费模拟（"如果每天少一杯咖啡，一年省 X 元"）— 独立页面
- 同类对比（同年龄段/城市级别匿名化全平台用户统计）
- 自动执行追踪：建议推送后 30 天内系统生成效果报告（实际消费对比，无需手动打卡）
- **UX 规格**：`C-UX-Scenarios/07-*/`（优化建议 + 消费模拟页）
- **高保真设计**：`E-Assets/page-designs/07.3-optimization.html` · `07.4-simulation.html`

#### FR19: 账户与设置
- 个人资料管理
- 订阅状态查看
- 数据安全与隐私配置
- 通知偏好设置
- **UX 规格**：`C-UX-Scenarios/08-*/`（Scenario 08）
- **高保真设计**：`E-Assets/page-designs/08.0-my-hub.html` · `08.1-settings.html` · `08.2-profile.html`

### 基础设施需求（无对应 UX 场景）

#### FR20: Monorepo 项目初始化
- Turborepo + pnpm workspace 搭建
- Expo + Next.js + shared packages 配置
- 分阶段初始化验证
- **架构参考**：architecture.md → 分阶段初始化计划

#### FR21: 数据库 Schema 与 Migration
- 按领域拆分 schema（auth/billing/analytics）
- RLS 策略配置
- 种子数据
- **架构参考**：architecture.md → 类别 1 数据架构

#### FR22: CI/CD Pipeline
- GitHub Actions PR 检查 + 自动部署
- 三层质量门禁
- Docker 镜像构建 → ACR → ECS
- **架构参考**：architecture.md → 类别 5 CI/CD

#### FR23: 生产环境部署
- 阿里云 ECS Docker Compose 部署
- Nginx 反向代理 + SSL
- Supabase 自托管精简方案
- **架构参考**：architecture.md → 类别 5 基础设施

#### FR24: 监控与错误追踪
- Sentry 双端 SDK（RN + Next.js）
- 结构化日志 + 健康检查端点
- **架构参考**：architecture.md → 类别 5 监控与日志

---

## Non-Functional Requirements

#### NFR1: 性能
- API 响应 < 200ms（普通接口，P95，正常负载，由 APM 监控验证）
- AI 分类 < 8s，CSV 解析 < 15s，OCR < 20s（P95，由后端处理日志验证）
- 首屏渲染 < 2s（骨架屏至数据填充，P75，由移动端性能监控验证）

#### NFR2: 安全
- 全表 RLS 行级隔离
- JWT 15min access + 7 天 refresh
- 敏感字段 pgcrypto 加密（手机号、微信 unionid）
- 不上传通知原文到服务端

#### NFR3: 隐私与合规（PIPL）
- 用户数据删除权（级联删除 + 确认）
- 数据不出境（阿里云 ECS 国内区域）
- 注册时强制同意隐私协议，记录 consent_at
- ICP 备案（Web 服务上线前完成）

#### NFR4: 可用性
- 注册转化率 >= 75%
- 微信登录占比 >= 60%
- 3 秒内完成一笔手动补充记账

#### NFR5: 可靠性
- AI 主模型降级策略：GPT-5.3-Codex → Qwen 3.6-Plus
- 离线/弱网：Zustand persist + TanStack Query mutation retry
- JWT 过期重放处理

#### NFR6: 可维护性
- TypeScript strict mode，禁止 any
- 统一命名规范（见 architecture.md → 实现模式）
- 测试 co-located，CI 门禁
- CSV 解析规则可热更新

#### NFR7: 资源约束
- 2核4G ECS 内存边界（Supabase 精简 ~1.1GB + Next.js + Nginx）
- MVP 年度基础设施成本 ~4000 元
- 所有开源库 MIT 免费

---

## 设计保真度规范

> 本章节约束下游 Epic/Story 创建及实现过程中的视觉保真要求。

### 设计资产层级

| 层级 | 资产路径 | 用途 | Story 中的引用方式 |
|------|---------|------|-------------------|
| L1 视觉金标准 | `E-Assets/page-designs/*.html` | 每个页面的高保真视觉参考 | AC 中写明"视觉须匹配 `E-Assets/page-designs/XX.X-*.html`" |
| L2 图片资源 | `E-Assets/icons/` · `images/` | 实际使用的 SVG 图标、插画、动画关键帧、空状态图、分享卡片等 | 实现时从此目录取用，**替换** L1 HTML 中的占位图 |
| L3 内容终稿 | `E-Assets/content/scenario-*-content-final.md` | 每个场景的文案终稿（按钮文字、提示语、错误信息） | 实现时以此为准，不自行编写文案 |
| L4 组件规范 | `D-Design-System/components/*.md` | 18 个组件的详细 props、状态、变体定义 | 组件实现须严格遵循规范，不自造组件 |
| L5 Token 规范 | `D-Design-System/design-tokens.md` | Tamagui Token（颜色、间距、字体、圆角等） | 所有样式值从 Token 取用，禁止硬编码 |
| L6 交互规格 | `C-UX-Scenarios/XX-*/XX.X-*.md` | 每页完整交互逻辑、状态机、边界条件 | AC 中写明交互须匹配对应 UX 规格 |

### 资产关系说明

- **L1（page-designs HTML）是视觉参考，不是实现代码**。HTML 中可能使用占位图或内联样式
- **L2（icons/images SVG）是实际资源**。实现时必须从此目录引入，替换 L1 中的占位元素
- L1 + L2 + L3 共同构成"视觉完整性"，缺一不可

### 下游工作流约束

**create-epic 时**：
- 每个 Epic 描述中须列出其覆盖的 page-designs 文件清单
- 引用本 PRD 中 FR 的 `高保真设计` 字段

**create-story 时**：
- Story 验收标准（AC）中须包含：
  - "视觉匹配：`E-Assets/page-designs/XX.X-*.html`"
  - "图片资源取自：`E-Assets/icons/` 或 `E-Assets/images/` 对应子目录"
  - "文案取自：`E-Assets/content/scenario-XX-content-final.md`"
  - "组件实现遵循：`D-Design-System/components/*.md`"
  - "样式 Token 取自：`D-Design-System/design-tokens.md`"
- 不可省略任何一层引用

**code-review 时**：
- reviewer 须对照 L1 截图验证视觉一致性
- 检查 SVG 资源是否从 L2 正确引入（非自绘或网络下载）
- 检查文案是否与 L3 一致

### E-Assets 图片资源索引

| 资源目录 | 内容 | 关联 FR |
|---------|------|---------|
| `icons/app-icon/` | 应用图标 | 全局 |
| `icons/category-icons/` | 8 个消费分类图标 | FR3, FR11, FR15 |
| `icons/onboarding-illustrations/` | 引导页插画（含 v2 变体） | FR6 |
| `images/animation-keyframes/` | 9 个动画关键帧 SVG | FR3（AI 动画）、FR6（注册成功）、FR12（分享成功） |
| `images/empty-states/` | 9 个空状态插画 | FR4, FR5, FR11, FR12, FR13, FR14, FR17, FR18 |
| `images/heroes/` | 4 个页面主视觉 | FR1（权限页）、FR6（欢迎页）、FR8（订阅页）、FR16（AI 头像） |
| `images/share-cards/` | 4 个分享卡片模板 | FR5, FR12, FR17, FR18 |
| `images/tutorial-guides/` | 8 个教程引导图（含厂商适配） | FR1（厂商设置引导）、FR2（支付宝导出引导） |

---

## UX 规格参考

本 PRD 不重复 UX 规格内容，详见 WDS 产物：

| 产物 | 路径 | 说明 |
|------|------|------|
| 场景总览 | `C-UX-Scenarios/00-ux-scenarios.md` | 8 个场景、28 页映射 |
| 场景详细规格 | `C-UX-Scenarios/01-*/ ~ 08-*/` | 每页交互、状态、组件定义 |
| 设计系统 | `D-Design-System/design-tokens.md` | 完整 Tamagui Token 定义 |
| 组件规格 | `D-Design-System/components/` | 18 个组件详细规格 |
| 组件库配置 | `D-Design-System/component-library-config.md` | 组件库整体配置 |
| 高保真页面 | `E-Assets/page-designs/` | 30 个页面高保真 HTML |
| 图片资源 | `E-Assets/icons/` · `E-Assets/images/` | SVG 图标、插画、动画、空状态 |
| 内容终稿 | `E-Assets/content/` | 8 个场景文案终稿 |
| HTML 原型 | `B-Prototypes/` | 逻辑与交互参考（非实现代码） |

---

## 架构参考

详见 `architecture.md`，已涵盖：
- 5 类核心架构决策（数据/认证/API/前端/基础设施）
- 实现模式与强制规则（8 条强制 + 8 条反模式）
- 完整项目结构（~100 文件/目录）
- 全场景技术选型（图表/分享/支付/推送/AI/语音）
- 分阶段初始化计划

---

## 开放问题

1. **竞品 AI 能力调研未完成**：需验证"AI 零记账"差异化是否真实存在
2. **F4-F13 免费/付费边界**：产品简报已确定原则（高成本 + 最有特色），需在 Phase 2 Story 中细化
3. **iOS 零记账体验的用户接受度**：Android 80-90% 自动捕获 vs iOS "极速记账"，需差异化期望管理

---

## 变更日志

> 需求变更时按以下格式追加，不删除原文。
> 细节调整（不影响 FR 编号）直接改对应 Story 验收标准即可，不用更新此文档。

| 日期 | 类型 | FR 编号 | 变更内容 | 原因 |
|------|------|--------|---------|------|
| 2026-04-14 | 创建 | — | 初始版本，基于 WDS 产品简报 + UX 场景生成 | BMAD 架构工作流衔接 |
| 2026-04-14 | 增强 | 全部 FR | 每个 FR 增加高保真设计指针；新增"设计保真度规范"章节（6 层资产层级 + 下游工作流约束）；补充深度 UX 扫描发现的隐藏功能（Dashboard AI Spotlight、受益人 AI 规则引擎、礼金簿 OCR 导入、AI 对话结构化卡片、洞察 ML 反馈、优化自动追踪等）；E-Assets 图片资源索引 | 保证 Epic/Story 创建时设计保真度可追溯 |
| 2026-04-14 | 增强 | FR4、FR17、FR18、NFR1 | 新增"成功标准"章节（引自 Trigger Map 三条 SMART 目标）；FR4 AI Spotlight 补充刷新频率和用户反馈率指标；FR17 补充异常触发阈值、推送频率上限、质量指标；FR18 补充建议可执行性定义、同类对比数据来源说明、追踪周期；NFR1 性能指标补充百分位条件和测量方法 | PRD 验证 P1 修复：补全 BMAD 下游 Story 验收标准所需的可测量指标 |
