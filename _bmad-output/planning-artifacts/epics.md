---
stepsCompleted: [1, 2, 3, 4]
lastStep: 4
status: 'complete'
inputDocuments:
  - prd-bridge.md
  - architecture.md
workflowType: 'epics-and-stories'
project_name: '了然 (Liaoran)'
user_name: 'Sue'
date: '2026-04-14'
partyModeDecisions:
  - 拆出 E0 基础设施 Epic (FR20-24)
  - E1 瘦身为 MVP 核心用户体验 (FR1-6)
  - E3 付费订阅合并入 E4 家庭财务协同
  - E9 拆分 — 基础账户+PIPL 前置到 MVP，高级设置留 Phase 3
  - E6/E7 保持不变
---

# 了然 (Liaoran) - Epic Breakdown

## Overview

本文档提供了了然 (Liaoran) 项目的完整 Epic 和 Story 拆解，将 PRD、Architecture 中的需求分解为可实施的开发 Story。

## Requirements Inventory

### Functional Requirements

**MVP — Phase 1 (F1-F3)**

FR1: Android 通知监听自动捕获支付宝/微信/银行推送通知，提取金额/商户/时间，客户端只采集后端全处理，捕获覆盖率目标 >= 80%，含 5 个厂商专属设置引导（小米/华为/OPPO/Vivo/三星）

FR2: 支持支付宝 CSV（GBK 编码）和微信 CSV（UTF-8 编码）手动导入，后端解析/去重/归一化，解析规则支持热更新

FR3: AI 自动分类交易，结果进入 pending_confirmation 状态须用户确认，支持确认/拒绝并手动修正（反馈闭环），前端最少展示 5s"Trust Theater"处理动画

FR4: Dashboard 首页展示月度消费概览（总支出+分类分布）、待确认交易入口、最近交易流水、AI Spotlight 卡片（刷新 >= 每日1次，有用率 >= 70%）、导入进度横幅、上下文感知空状态、FAB 浮动按钮

FR5: 月度报表按月汇总消费并按分类展示，有历史数据时展示同比/环比趋势

FR6: 用户注册与认证，支持微信一键登录（OAuth）和手机号+OTP，注册时强制同意隐私协议记录 consent_at，新用户进引导流程老用户进 Dashboard

FR7: iOS 替代捕获方案（Siri 语音快捷记账 ~3s、Widget 一键记账 ~1s、截屏 OCR），MVP 优先级低于 Android

**Phase 2 (F4-F8)**

FR8: 付费订阅与支付（定价展示、功能对比），Android 支持微信支付+支付宝，iOS 支持 Apple IAP，订阅状态管理（provider/plan/expires_at）

FR9: 家庭共享账本，创建账本邀请家人，各自记录汇总到共享视图，支持"仅自己可见"消费（visibility 字段），共享 Dashboard 展示家庭总支出

FR10: 受益人标注，消费可标记"为谁花的"（自己/配偶/孩子/家庭共用），两阶段 AI 规则引擎（AI 建议→用户确认→持久化规则），按受益人维度统计支出

FR11: 交易浏览与详情，列表支持分类筛选和时间排序，详情展示 AI 识别的品牌/分类/置信度，用户可修正 AI 分类

FR12: 消费趋势折线图、消费习惯雷达图（Skia 自定义）、分享卡片生成 + 微信分享

FR13: 人情账管理，按"人"组织人情网络，随礼历史记录（跨年），智能回礼建议（历史金额+物价涨幅+关系亲疏+宴会规格），丧事场景特殊语言，人情支出季节性预警，支持礼金簿 OCR 导入（5步：拍照→OCR→审核→关联事件→完成，含多页拍摄/置信度/行内编辑）

FR14: 多身份核算，创建/切换财务身份（打工人/老板/自由职业），各身份独立收支核算，副业利润计算器（收入-显性成本-隐性成本=真实利润）

FR15: 手动记账（表单/语音/截图三种方式，目标 3秒内完成），分类管理（查看 AI 分类规则、手动调整）

**Phase 3 (F9-F13)**

FR16: AI 对话管家，自然语言财务问答，流式响应（打字机效果），注入用户财务数据上下文，结构化数据卡片（从 JSON 流渲染图表/表格），可点击数据引用，Action Buttons

FR17: 洞察推送，AI 主动发现消费异常/趋势，推送通知+App 内 Feed，推送节奏自适应，触发阈值（单笔>历史同类均值3倍），频率上限（每日<=3条；连续7天无互动降至每周<=1条），"有用"反馈率 >= 40%，ML 反馈闭环

FR18: 消费优化建议（每次推送>=1条有明确品类和目标金额），消费模拟独立页面，同类对比（匿名化全平台统计），建议推送后30天自动效果报告

FR19: 账户与设置，个人资料管理、订阅状态查看、数据安全与隐私配置、通知偏好设置

**基础设施需求**

FR20: Monorepo 项目初始化，Turborepo + pnpm workspace，Expo + Next.js + shared packages，分阶段初始化验证（4阶段）

FR21: 数据库 Schema 与 Migration，按领域拆分 schema（auth/billing/analytics），RLS 策略配置，种子数据

FR22: CI/CD Pipeline，GitHub Actions PR 检查+自动部署，三层质量门禁，Docker 镜像构建→ACR→ECS

FR23: 生产环境部署，阿里云 ECS Docker Compose，Nginx 反向代理+SSL，Supabase 自托管精简方案（Realtime/Storage 禁用，内存 ~1.1GB）

FR24: 监控与错误追踪，Sentry 双端 SDK（RN+Next.js），结构化日志（pino），健康检查端点 `/api/health`

### NonFunctional Requirements

NFR1: 性能 — API 响应 < 200ms（普通接口，P95，正常负载，APM 监控验证）；AI 分类 < 8s，CSV 解析 < 15s，OCR < 20s（P95，后端处理日志验证）；首屏渲染 < 2s（骨架屏至数据填充，P75，移动端性能监控验证）

NFR2: 安全 — 全表 RLS 行级隔离；JWT 15min access + 7天 refresh；敏感字段 pgcrypto 加密（手机号、微信 unionid）；不上传通知原文到服务端

NFR3: 隐私与合规（PIPL）— 用户数据删除权（级联删除+确认）；数据不出境（阿里云 ECS 国内区域）；注册时强制同意隐私协议记录 consent_at；ICP 备案（Web 服务上线前完成）

NFR4: 可用性 — 注册转化率 >= 75%；微信登录占比 >= 60%；3秒内完成一笔手动补充记账

NFR5: 可靠性 — AI 主模型降级策略（GPT-5.3-Codex → Qwen 3.6-Plus，连续3次失败切换，30分钟后回切）；离线/弱网：Zustand persist + TanStack Query mutation retry；JWT 过期重放处理

NFR6: 可维护性 — TypeScript strict mode 禁止 any；统一命名规范（DB snake_case/API camelCase）；测试 co-located，CI 门禁；CSV 解析规则可热更新

NFR7: 资源约束 — 2核4G ECS 内存边界（Supabase 精简 ~1.1GB + Next.js + Nginx）；MVP 年度基础设施成本 ~4000元；所有开源库 MIT 免费

### Additional Requirements

来自 Architecture 文档的技术实施要求：

- **Starter 方案**：Option C 自定义 Monorepo（无现成 starter），分 4 阶段组装：阶段1 Monorepo 骨架 → 阶段2 Tamagui UI 层集成 → 阶段3 Supabase 数据层集成 → 阶段4 开发工具链。Epic 1 Story 1 从零开始搭建
- **Tamagui 版本**：v2.0.0-rc.0，锁定具体版本号，不用 ^ range；设计 Token 直接映射，token-to-tamagui 映射表为阶段2前置交付物
- **关键配置项**：`.npmrc`（shamefully-hoist=true）、Metro monorepo watchFolders、Tamagui babel plugin、TypeScript project references、Supabase JWT secret 验证（自托管高危配置项）、环境变量分层管理（.env.local/.env.development/.env.production）
- **数据库 Schema 拆分**：auth（用户/认证）/ billing（交易/账单/分类）/ analytics（月报/趋势），Phase 2 新增 family schema
- **交易三态**：billing.transactions.status 字段支持 pending_confirmation / confirmed / rejected，AI 解析结果进入 pending，用户确认后 confirmed
- **认证实现**：自建中间层，Next.js API Route 处理微信 OAuth 回调和手机号 OTP，不使用 GoTrue 自定义 provider
- **AI 服务抽象层**：packages/shared/ai/ai-client.ts 统一接口（classify/ocr/parse），providers/ 下分别实现 GPT-5.3-Codex 和 Qwen 3.6-Plus，fallback.ts 管理降级策略
- **包依赖单向规则**：apps/mobile → packages/ui + packages/shared；apps/api → packages/shared；packages/shared 无 React 依赖；禁止 packages/* 导入 apps/*
- **数据分层 DO/DTO/VO**：DO（Supabase 自动生成 snake_case）→ Mapper（apps/api/lib/mappers/）→ VO（手写 camelCase API 响应），Zod schema 定义 DTO
- **CI/CD**：GitHub Actions；PR 检查（lint+test+build 并行）；main 合并自动构建 Docker → 阿里云 ACR → SSH 触发 ECS 更新；三层质量门禁（阻塞发布/上线前修复/上线后迭代）
- **PIPL Day 1**：用户数据删除权、pgcrypto 静态加密、数据不出境必须在架构层面一开始就实现，不是后补
- **全场景技术选型已锁定**：图表 victory-native-xl（Skia）、分享 react-native-view-shot + react-native-wechat-lib、支付 微信支付/支付宝 + react-native-iap、推送 Expo Push → 个推/极光、语音 @react-native-voice/voice、对话 AI chat/chatStream 扩展接口（SSE）

### UX Design Requirements

UX 设计通过独立 WDS 流程完成，产物已完整交付，Story 实现时遵循以下规范：

- **L1 视觉金标准**：`E-Assets/page-designs/*.html` — 每个页面高保真 HTML，Story AC 必须引用
- **L2 图片资源**：`E-Assets/icons/` · `E-Assets/images/` — SVG 图标、插画、动画关键帧、空状态图
- **L3 内容终稿**：`E-Assets/content/scenario-*-content-final.md` — 文案终稿（按钮文字、提示语、错误信息）
- **L4 组件规范**：`D-Design-System/components/*.md` — 18 个组件详细规格（props/状态/变体）
- **L5 Token 规范**：`D-Design-System/design-tokens.md` — 完整 Tamagui Token，所有样式值从 Token 取用，禁止硬编码
- **L6 交互规格**：`C-UX-Scenarios/XX-*/XX.X-*.md` — 每页完整交互逻辑、状态机、边界条件

**Story 创建约束**：每个 Story AC 必须包含 L1-L6 各层引用，不可省略任何一层。

### FR Coverage Map

| FR | Epic | 说明 |
|----|------|------|
| FR1 | E1 | Android 通知监听捕获 |
| FR2 | E1 | CSV 手动导入 |
| FR3 | E1 | AI 自动分类 |
| FR4 | E1 | Dashboard 首页 |
| FR5 | E1 | 月度报表 |
| FR6 | E1 | 用户注册与认证 |
| FR7 | E2 | iOS 替代捕获方案 |
| FR8 | E3 | 付费订阅与支付 |
| FR9 | E3 | 家庭共享账本 |
| FR10 | E3 | 受益人标注 |
| FR11 | E2 | 交易浏览与详情 |
| FR12 | E4 | 消费趋势与分享 |
| FR13 | E5 | 人情账管理 |
| FR14 | E6 | 多身份核算 |
| FR15 | E2 | 手动记账与分类管理 |
| FR16 | E7 | AI 对话管家 |
| FR17 | E7 | 洞察推送 |
| FR18 | E7 | 消费优化建议 |
| FR19 | E1+E8 | 基础账户+PIPL→E1；高级设置→E8 |
| FR20 | E0 | Monorepo 初始化 |
| FR21 | E0 | 数据库 Schema |
| FR22 | E0 | CI/CD Pipeline |
| FR23 | E0 | 生产环境部署 |
| FR24 | E0 | 监控与错误追踪 |

**FR 全覆盖**: 24/24 | **NFR 横切**: NFR1-7 作为跨 Epic 质量约束，在各 Story AC 中体现

## Epic List

### Epic 0: 工程基础设施
建立可工作的 Monorepo 开发环境、数据库、CI/CD 流水线和生产部署能力，所有后续 Epic 的前置条件。
**FRs covered:** FR20, FR21, FR22, FR23, FR24
**Phase:** MVP 前置
**Dependencies:** 无
**Page designs:** 无（纯基础设施）

### Epic 1: 零输入首次体验
用户从注册、授权通知、导入账单，到看到 AI 自动分类的 Dashboard 和月报的完整首次体验闭环。包含基础账户管理和 PIPL 合规（数据删除权）。
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR19（基础账户+PIPL 部分）
**Phase:** MVP
**Dependencies:** E0
**Page designs:** 01.1-welcome, 01.2-onboarding, 01.3-registration, 01.4-permission, 01.5-bill-import, 01.6-import-processing, 01.7-dashboard, 01.8-monthly-report, 08.0-my-hub（基础）, 08.1-settings（基础）, 08.2-profile（基础）

### Epic 2: 交易管理与手动补录
用户能浏览、搜索、纠正交易分类（AI 反馈闭环），iOS 用户能通过 Siri/Widget/OCR 快捷记账，所有用户能手动补充记录和管理分类规则。
**FRs covered:** FR7, FR11, FR15
**Phase:** Phase 2（FR11 交易纠错为高优先级）
**Dependencies:** E1
**Page designs:** 03.1-transaction-list, 03.2-transaction-detail, 06.1-manual-entry, 06.2-category-management, 06.3-ios-shortcuts

### Epic 3: 家庭财务协同与付费
用户能订阅付费服务、创建家庭共享账本、邀请家人加入、标注消费受益人。"付费→解锁→使用"闭环。
**FRs covered:** FR8, FR9, FR10
**Phase:** Phase 2
**Dependencies:** E1
**Page designs:** 02.1-subscription, 02.2-shared-family-ledger, 02.3-beneficiary-tagging

### Epic 4: 消费趋势与分享
用户能查看多月消费趋势折线图、消费习惯雷达图，生成分享卡片发送微信。
**FRs covered:** FR12
**Phase:** Phase 2
**Dependencies:** E1, E2（需交易数据积累）
**Page designs:** 03.3-trend-chart, 03.4-spending-radar

### Epic 5: 人情往来账
用户能管理人情网络、追踪随礼历史（跨年）、获得智能回礼建议、OCR 导入礼金簿。
**FRs covered:** FR13
**Phase:** Phase 2
**Dependencies:** E1
**Page designs:** 04.1-gift-management, 04.1a-gift-book-import, 04.2-gift-smart-suggestion

### Epic 6: 多身份核算
用户能创建多个财务身份（打工人/老板/自由职业）、各身份独立收支核算、副业利润计算。
**FRs covered:** FR14
**Phase:** Phase 2
**Dependencies:** E1
**Page designs:** 05.1-identity-management, 05.2-identity-pnl

### Epic 7: AI 财务管家
用户能通过自然语言对话查询财务数据、接收 AI 洞察推送、获得消费优化建议和模拟预测。
**FRs covered:** FR16, FR17, FR18
**Phase:** Phase 3
**Dependencies:** E1, E2（需充足交易数据和分类反馈）
**Page designs:** 07.1-ai-chat, 07.2-insights-feed, 07.3-optimization, 07.4-simulation

### Epic 8: 高级账户与个性化设置
用户能管理详细个人资料、查看订阅状态、配置通知偏好、高级隐私设置。
**FRs covered:** FR19（高级部分：通知偏好、详细资料编辑等）
**Phase:** Phase 3
**Dependencies:** E1, E3（订阅状态依赖付费系统）
**Page designs:** 08.0-my-hub（高级）, 08.1-settings（高级）, 08.2-profile（高级）

---

## Epic 0: 工程基础设施

建立可工作的 Monorepo 开发环境、数据库、CI/CD 流水线和生产部署能力。完成后，所有后续 Epic 的开发工作可以在统一的工程体系下进行。

### Story 0.1: Monorepo 骨架搭建

As a 开发者,
I want 一个配置正确的 Turborepo + pnpm monorepo 项目骨架,
So that 所有后续开发工作在统一的项目结构和依赖管理下进行。

**Acceptance Criteria:**

**Given** 一台干净的开发机器
**When** 执行 `pnpm install`
**Then** 所有依赖安装成功，无 peer dependency 错误
**And** `.npmrc` 包含 `shamefully-hoist=true` 和 `strict-peer-dependencies=false`

**Given** monorepo 项目结构已创建
**When** 检查目录结构
**Then** 存在 `apps/mobile`（Expo SDK 54 bare minimum）、`apps/api`（Next.js 15 App Router bare minimum）、`packages/shared`（TypeScript 类型+Zod schemas 占位）、`packages/ui`（Tamagui 组件包占位）
**And** `pnpm-workspace.yaml` 正确定义所有 workspace
**And** `turbo.json` 定义 build/lint/test pipeline

**Given** apps/mobile 已配置
**When** 执行 `pnpm --filter mobile start`
**Then** Expo 开发服务器成功启动，无编译错误
**And** `app.config.ts` 支持动态环境变量读取
**And** `app.config.ts` 配置 `react-native-wechat-lib` plugin，使 Expo build 时自动注入微信 AppID 到 `AndroidManifest.xml` 和 `Info.plist`
**And** `metro.config.js` 配置 `watchFolders` 指向 workspace root

**Given** apps/api 已配置
**When** 执行 `pnpm --filter api dev`
**Then** Next.js 开发服务器成功启动，无编译错误
**And** `/api/health` 返回 `{ success: true }`

**Given** packages/shared 已配置
**When** 在 apps/mobile 或 apps/api 中导入 `@money-tracker/shared`
**Then** 类型正确解析，TypeScript 编译无错误
**And** `tsconfig.base.json` 配置 strict mode，禁止 `any`
**And** TypeScript project references（composite + references）配置正确

**Given** `.env.example` 已创建
**When** 检查环境变量模板
**Then** 包含所有必需的环境变量占位（Supabase URL/Key、JWT Secret、AI API Key 等）
**And** 支持 `.env.local` / `.env.development` / `.env.production` 分层

### Story 0.2: UI 设计系统基础

As a 开发者,
I want Tamagui v2 RC 正确集成到 monorepo 并完成设计 Token 映射,
So that 后续 UI 开发可以直接使用设计系统 Token，保证视觉一致性。

**Acceptance Criteria:**

**Given** Story 0.1 的 monorepo 骨架已就绪
**When** 安装 Tamagui v2.0.0-rc.0（锁定具体版本号，不用 `^` range）
**Then** 安装成功，无版本冲突
**And** `babel.config.js` 包含 Tamagui babel plugin 配置
**And** Metro bundler 与 Tamagui 编译器无冲突

**Given** Tamagui 已安装
**When** 在 `packages/ui/tamagui.config.ts` 中配置主题
**Then** 设计 Token（颜色、间距、字体、圆角）正确映射到 Tamagui token
**And** `packages/ui/token-mapping.md` 产出完整映射表，包含：每个设计 Token 对应的 Tamagui token key、未覆盖的 Token（需自定义扩展）、语义 Token 的 dark mode 预留位
**And** Token 值来源于 `D-Design-System/design-tokens.md`，禁止硬编码

**Given** Tamagui 配置完成
**When** 在 Expo 中渲染基础 Tamagui 组件（Button、Text、TextInput）
**Then** 组件正确渲染，样式匹配设计 Token 定义
**And** 无运行时报错

**Given** packages/ui 已配置
**When** 在 apps/mobile 中导入 `@money-tracker/ui` 的组件
**Then** 跨包组件引用正常工作，TypeScript 类型正确推断
**And** `packages/ui/src/index.ts` 作为统一导出桶文件

### Story 0.3: 数据库 Schema 与认证基础

As a 开发者,
I want 自托管 Supabase 正确运行且核心数据库 Schema 就绪,
So that 后续 Epic 的数据存储、认证和 RLS 安全策略有可靠基础。

**Acceptance Criteria:**

**Given** 一台开发机器
**When** 在 `supabase/` 目录执行 `docker-compose up`
**Then** Supabase 精简版成功启动（PostgreSQL + GoTrue + PostgREST + Kong）
**And** Realtime 和 Storage 组件已禁用
**And** 总内存占用 <= 1.2GB

**Given** Supabase 已启动
**When** 执行 migration 脚本
**Then** `auth` schema 创建成功：users 表（微信 OAuth 字段、手机号字段、consent_at 时间戳）；subscriptions 表（user_id、provider、plan、expires_at、created_at，启用 RLS）
**And** `billing` schema 创建成功：transactions 表（`amount_cents INTEGER`、`status` 三态 pending_confirmation/confirmed/rejected、category_id 外键）；categories 表（系统预设分类）；category_rules 表（keyword、category_id、user_id、hit_count、source，用于 AI 分类反馈和用户自定义规则）；csv_parse_rules 表（platform、version、rule_config JSONB、is_active，用于 CSV 解析规则热更新）
**And** `analytics` schema 创建成功：monthly_summaries 表（user_id、month、total_cents、category_breakdown JSONB）；用于月报和趋势聚合查询
**And** Schema 演化计划已文档化：Phase 2 新增 `family` schema（由 E3 Story 3.2 migration 创建）、`billing.gift_*` 表（由 E5 Story 5.1 创建）、`billing.identities` 表 + transactions.identity_id 字段（由 E6 Story 6.1 创建）
**And** 所有表名 snake_case 复数，列名 snake_case
**And** 所有外键遵循 `{referenced_table_singular}_id` 命名

**Given** Schema 已创建
**When** 检查 RLS 策略
**Then** 所有表已启用 `ROW LEVEL SECURITY`
**And** 至少一条 `user_id = auth.uid()` 基础隔离策略
**And** JWT secret 与 GoTrue `.env` 配置一致（验证 RLS 不静默失败）

**Given** PIPL 合规要求
**When** 检查数据库配置
**Then** `pgcrypto` 扩展已启用
**And** 敏感字段加密策略明确为应用层加密：`auth-service.ts` 在写入前调用 pgcrypto 加密手机号和微信 unionid，读取后解密；加密字段不建 DB 索引，使用 user_id 作为查找键
**And** 种子数据（`seed.sql`）包含测试用户和示例交易数据

**Given** Schema 已创建
**When** 在 apps/api 中初始化 Supabase admin client
**Then** 连接成功，可执行 CRUD 操作
**And** `packages/shared/types/database.ts` 由 Supabase CLI 自动生成 DO 类型（snake_case）

### Story 0.4: 开发工具链与质量门禁

As a 开发者,
I want 统一的代码质量工具和测试框架,
So that 所有代码遵循一致的规范，质量可通过自动化验证。

**Acceptance Criteria:**

**Given** monorepo 骨架已就绪
**When** 执行 `pnpm turbo run lint`
**Then** ESLint 检查所有 `apps/` 和 `packages/` 下的 TypeScript 文件
**And** 规则包含：禁止 `any` 类型、强制函数式组件（禁止 class 组件）、import 排序
**And** `.eslintrc.js` 在 root 级共享配置

**Given** ESLint 已配置
**When** 执行 `pnpm turbo run format`
**Then** Prettier 格式化所有文件
**And** `.prettierrc` 配置在 root 级共享

**Given** 测试框架需求
**When** 在任意包中运行 `pnpm test`
**Then** Vitest 执行该包下所有 `*.test.ts` / `*.test.tsx` 文件
**And** 测试文件与源文件 co-located（同目录）
**And** 至少包含一个示例测试验证框架正常工作

**Given** Turbo pipeline 已配置
**When** 执行 `pnpm turbo run build`
**Then** 所有包按依赖拓扑顺序构建成功
**And** 构建缓存正常工作（二次构建命中缓存）

### Story 0.5: CI/CD Pipeline

As a 开发者,
I want GitHub Actions 自动执行代码检查和部署流水线,
So that 每次提交都经过质量门禁验证，合并到 main 后自动部署。

**Acceptance Criteria:**

**Given** 代码推送到 GitHub PR
**When** GitHub Actions CI 触发
**Then** 并行执行 `pnpm turbo run lint test build`
**And** 任一步骤失败则 PR 标记为不可合并
**And** 工作流文件位于 `.github/workflows/ci.yml`

**Given** PR 合并到 main 分支
**When** deploy workflow 触发
**Then** 构建 Next.js API Docker 镜像
**And** 推送镜像到阿里云 ACR（Container Registry）
**And** 通过 SSH 触发 ECS 服务更新
**And** 工作流文件位于 `.github/workflows/deploy.yml`

**Given** 三层质量门禁策略
**When** 检查 CI 配置
**Then** 第一层（阻塞发布）：lint + 单元测试必须全过
**And** 第二层（上线前修复）：集成测试失败可合并但标记 warning
**And** 第三层（上线后迭代）：性能基准、E2E 测试结果记录但不阻塞

**Given** 移动端构建需求
**When** 检查移动端 CI 配置
**Then** 定义 Expo EAS Build 构建策略（Android APK 签名 + iOS IPA）
**And** 国内网络访问 EAS 的备选方案已说明（如需自建构建可在 ECS 上运行 `eas build --local`）
**And** Android 签名密钥（keystore）通过 GitHub Secrets 管理

### Story 0.6: 生产环境部署

As a 运维工程师,
I want 阿里云 ECS 上的 Docker Compose 生产环境就绪,
So that 应用可以在 2核4G 资源约束下稳定运行并对外提供服务。

**Acceptance Criteria:**

**Given** 阿里云 ECS 2核4G 实例已配置
**When** 执行 `docker-compose -f deploy/docker-compose.prod.yml up`
**Then** Next.js API 服务、Supabase 精简版、Nginx 全部启动成功
**And** 总内存占用 <= 3.5GB（留余量给系统）
**And** Supabase 组件：PostgreSQL ~800MB + GoTrue ~100MB + PostgREST ~50MB + Kong ~150MB

**Given** Nginx 已配置
**When** 外部请求到达服务器
**Then** HTTPS（SSL 证书）正常终止
**And** 请求正确路由到 Next.js API 或 Supabase 对应服务
**And** 配置文件位于 `deploy/nginx/nginx.conf`
**And** 对 `/api/ai/chat` 路径配置 `proxy_buffering off`（SSE 流式响应必需，否则打字机效果失效）

**Given** 环境变量管理
**When** 检查生产环境配置
**Then** 所有敏感信息（JWT secret、AI API key、数据库密码）通过环境变量注入，不在代码中硬编码
**And** `.env.example` 列出所有必需变量
**And** 数据不出境：所有服务运行在阿里云 ECS 国内区域

**Given** 部署脚本已创建
**When** 执行 `deploy/scripts/deploy.sh`
**Then** 拉取最新镜像、停止旧容器、启动新容器、健康检查通过
**And** 支持回滚（保留上一版镜像）

### Story 0.7: 监控与错误追踪

As a 开发者,
I want 应用级监控和错误追踪系统就绪,
So that 线上问题能被快速发现和定位。

**Acceptance Criteria:**

**Given** apps/mobile 已配置
**When** React Native 发生未捕获异常
**Then** Sentry RN SDK 自动上报错误，包含堆栈信息和设备上下文
**And** Source map 正确上传，错误可定位到源码行

**Given** apps/api 已配置
**When** Next.js API Route 发生未捕获异常
**Then** Sentry Next.js SDK 自动上报错误
**And** 包含请求 URL、HTTP 方法、响应状态码

**Given** 日志系统已配置
**When** API 处理请求
**Then** pino 以 JSON 格式记录结构化日志（timestamp、level、message、requestId）
**And** 日志文件轮转配置就绪（按大小/时间）

**Given** 健康检查端点
**When** GET `/api/health`
**Then** 返回 `{ success: true, timestamp: "...", services: { database: "ok", ai: "ok" } }`
**And** 检查数据库连接可用性
**And** 可作为 Docker 健康检查和外部监控探针

### Story 0.8: 后台任务与定时调度基础设施

As a 开发者,
I want 一个可靠的后台定时任务执行机制,
So that 洞察推送、季节预警等需要定期分析的功能有运行环境。

**Acceptance Criteria:**

**Given** Docker Compose 生产环境
**When** 检查后台任务方案
**Then** `deploy/docker-compose.prod.yml` 包含 `worker` 服务（复用 Next.js 镜像，入口为 `apps/api/worker/index.ts`）
**And** worker 进程使用 `node-cron` 或类似库调度定时任务
**And** worker 与 API 服务共享数据库连接，但运行在独立容器中
**And** worker 内存限制 <= 256MB（NFR7 资源约束下的剩余空间）

**Given** 任务调度框架已就绪
**When** 注册一个示例定时任务（如每日凌晨 2:00 执行）
**Then** 任务按 cron 表达式准时触发
**And** 任务执行日志通过 pino 记录（与 API 日志格式一致）
**And** 任务失败时自动重试 1 次，仍失败则记录错误到 Sentry

**Given** 任务注册接口
**When** 在 `apps/api/worker/tasks/` 下添加新任务文件
**Then** 任务文件导出 `{ cron: string, handler: () => Promise<void> }` 接口
**And** worker 启动时自动扫描并注册所有任务
**And** 预置任务占位：`insight-analysis.ts`（E7 洞察推送用）、`seasonal-alert.ts`（E5 人情预警用）

---

## Epic 1: 零输入首次体验

用户从注册、授权通知、导入账单，到看到 AI 自动分类的 Dashboard 和月报的完整首次体验闭环。包含基础账户管理和 PIPL 合规（数据删除权）。

### Story 1.1: 欢迎页与引导页

As a 新用户,
I want 看到产品价值主张和核心功能介绍,
So that 我理解"了然"能帮我解决什么问题，并愿意继续注册。

**Acceptance Criteria:**

**Given** 用户首次打开应用
**When** 加载欢迎页
**Then** 展示品牌 Hero 图和核心价值主张文案
**And** 视觉匹配 `E-Assets/page-designs/01.1-welcome.html`
**And** 图片资源取自 `E-Assets/icons/` 和 `E-Assets/images/heroes/`
**And** 文案取自 `E-Assets/content/scenario-01-content-final.md`
**And** 组件实现遵循 `D-Design-System/components/*.md`
**And** 样式 Token 取自 `D-Design-System/design-tokens.md`
**And** 交互须匹配 `C-UX-Scenarios/01-*/01.1-*/01.1-welcome.md`

**Given** 用户在欢迎页点击"开始"
**When** 进入引导页
**Then** 展示 3-4 张轮播卡片，每张突出一个核心功能
**And** 支持左右滑动切换，底部圆点指示当前位置
**And** 提供"跳过"按钮直接进入注册页
**And** 视觉匹配 `E-Assets/page-designs/01.2-onboarding.html`
**And** 插画取自 `E-Assets/icons/onboarding-illustrations/`
**And** 交互须匹配 `C-UX-Scenarios/01-*/01.2-*/01.2-onboarding.md`

**Given** 用户完成轮播或点击"跳过"
**When** 点击最后一页 CTA 或"跳过"
**Then** 导航到注册页（Story 1.2）
**And** 路由使用 Expo Router `(auth)/welcome.tsx` → `(auth)/onboarding.tsx` → `(auth)/register.tsx`

### Story 1.2: 用户注册与认证

As a 新用户,
I want 通过微信一键登录或手机号 OTP 快速注册,
So that 我可以用最少的操作开始使用应用。

**Acceptance Criteria:**

**Given** 用户在注册页
**When** 点击"微信一键登录"
**Then** 调用微信 OAuth SDK，跳转微信授权
**And** 授权成功后，后端 `POST /api/auth/wechat-callback` 接收 code，获取 access_token + unionid
**And** 自动创建/关联用户账号，签发 JWT（access 15min + refresh 7天）
**And** 新用户进入权限设置页（Story 1.3），老用户进入 Dashboard（Story 1.6）

**Given** 用户选择手机号登录
**When** 输入手机号并点击"获取验证码"
**Then** 后端 `POST /api/auth/otp-send` 通过阿里云 SMS 发送 6 位验证码
**And** 前端显示 60 秒倒计时，期间按钮禁用

**Given** 用户输入 OTP 验证码
**When** 点击"验证"
**Then** 后端 `POST /api/auth/otp-verify` 验证成功后签发 JWT
**And** 验证码过期返回 `{ success: false, error: { code: "AUTH_OTP_EXPIRED" } }`
**And** 验证码错误返回 `{ success: false, error: { code: "AUTH_OTP_INVALID" } }`

**Given** 新用户首次注册
**When** 注册流程中
**Then** 强制展示隐私协议弹窗/勾选框，用户必须同意后才能继续
**And** 后端记录 `consent_at` 时间戳到 auth.users 表
**And** 隐私协议内容可通过链接查看完整文本

**Given** 认证相关 API
**When** 检查实现
**Then** 所有入参使用 `packages/shared/schemas/auth.ts` Zod schema 验证
**And** 响应格式统一 `{ success: boolean, data?: T, error?: { code: string, message: string } }`
**And** JWT refresh 端点 `POST /api/auth/refresh` 可用
**And** Zustand `auth-store` 持久化 JWT 到 AsyncStorage

**Given** 应用冷启动时的认证路由守卫
**When** 用户打开应用
**Then** `apps/mobile/app/_layout.tsx` 检查 AsyncStorage 中的 JWT
**And** 有效 token → 直接导航到 Dashboard（`(main)/dashboard`）
**And** token 过期 → 自动调用 `POST /api/auth/refresh`，成功则进入 Dashboard，失败则导航到注册页
**And** 无 token → 导航到欢迎页（`(auth)/welcome`）
**And** 路由守卫在 Expo Router layout 中实现，使用 `useEffect` + `SplashScreen.preventAutoHideAsync()`

**And** 视觉匹配 `E-Assets/page-designs/01.3-registration.html`
**And** 文案取自 `E-Assets/content/scenario-01-content-final.md`
**And** 交互须匹配 `C-UX-Scenarios/01-*/01.3-*/01.3-registration.md`

### Story 1.3: Android 通知权限与捕获设置

As a Android 用户,
I want 授权应用监听支付通知并获得厂商专属设置引导,
So that 应用能自动捕获我的消费记录，无需手动输入。

**Acceptance Criteria:**

**Given** 新用户完成注册（Story 1.2）
**When** 进入权限设置页
**Then** 清晰解释为什么需要通知权限（价值说明，非技术说明）
**And** 展示"授权"按钮，点击后跳转系统通知监听设置
**And** 视觉匹配 `E-Assets/page-designs/01.4-permission.html`
**And** 交互须匹配 `C-UX-Scenarios/01-*/01.4-*/01.4-permission.md`

**Given** 用户设备为特定 Android 厂商
**When** 检测到 MIUI/EMUI/ColorOS/FuntouchOS/Samsung
**Then** 展示对应厂商的通知监听保活设置步骤图文引导
**And** 引导图取自 `E-Assets/images/tutorial-guides/`（含厂商适配图）
**And** 共 5 个厂商引导，其余厂商展示通用引导

**Given** 用户授权 NotificationListenerService
**When** 收到支付宝/微信/银行推送通知
**Then** 客户端 Native Module（`apps/mobile/modules/notification-listener/`）执行本地正则提取
**And** 提取结果为结构化 JSON：`{ amountCents: number, merchantName: string, transactionTime: string, platform: string }`
**And** 提取 schema 定义在 `packages/shared/schemas/notification-capture.ts`（Zod）
**And** 仅将结构化 JSON 通过 `POST /api/billing/capture` 上传，原始通知文本不离开设备（NFR2 安全要求）
**And** 后端执行去重（相同 amountCents + merchantName + transactionTime 在 5 分钟窗口内视为重复）和归一化
**And** 提取规则通过配置文件驱动（`apps/mobile/config/notification-patterns.json`），支持远程热更新（启动时从 `GET /api/config/notification-rules` 拉取最新版本）

**Given** 捕获覆盖率验证
**When** 测试支付宝/微信/主流银行通知
**Then** 至少覆盖支付宝收款、微信支付、工商银行、招商银行、建设银行的标准推送格式
**And** 提取成功率在标准格式下 >= 90%
**And** Dashboard 展示 AI 覆盖率指标（自动捕获笔数 / 总笔数）供用户和运营监控

**Given** 用户选择跳过通知授权
**When** 点击"稍后设置"
**Then** 允许跳过，进入账单导入页（Story 1.4）
**And** Dashboard 中保留重新授权入口

### Story 1.4: CSV 账单导入

As a 用户,
I want 上传支付宝或微信的 CSV 账单文件,
So that 我的历史消费记录能被快速导入到应用中。

**Acceptance Criteria:**

**Given** 用户在账单导入页
**When** 查看页面
**Then** 展示支持的导入方式（支付宝 CSV、微信 CSV）和导出教程引导
**And** 视觉匹配 `E-Assets/page-designs/01.5-bill-import.html`
**And** 引导图取自 `E-Assets/images/tutorial-guides/`（支付宝导出引导）
**And** 文案取自 `E-Assets/content/scenario-01-content-final.md`
**And** 交互须匹配 `C-UX-Scenarios/01-*/01.5-*/01.5-bill-import.md`

**Given** 用户选择上传支付宝 CSV
**When** 通过文件选择器选中文件
**Then** 文件通过 `POST /api/billing/import-csv` 上传（multipart/form-data）
**And** 后端 `csv-parser` 服务正确处理 GBK 编码
**And** 解析结果归一化为统一交易格式（amount_cents 整数分、UTC 日期）

**Given** 用户选择上传微信 CSV
**When** 文件上传成功
**Then** 后端正确处理 UTF-8 编码
**And** 解析规则从 `billing.csv_parse_rules` 表动态加载（每次 import 请求时查询 is_active=true 的最新规则）
**And** 管理员可通过 `PUT /api/admin/csv-rules` 更新规则，无需重部署（FR2 热更新要求）
**And** 规则包含 platform、column_mapping（JSONB）、encoding、date_format 等配置项

**Given** 用户上传了非法文件
**When** 文件不是 CSV 格式（如 PDF/图片）
**Then** 返回 `{ success: false, error: { code: "IMPORT_INVALID_FORMAT" } }`，前端展示友好提示
**And** 文件大小限制 10MB，超限返回 `{ success: false, error: { code: "IMPORT_FILE_TOO_LARGE" } }`
**And** GBK 编码检测失败时回退 UTF-8 解析，仍失败则返回编码错误提示

**Given** CSV 解析完成
**When** 后端处理结果
**Then** 自动去重（相同金额+商户+时间的交易不重复导入）
**And** 交易记录进入 `billing.transactions` 表，status = `pending_confirmation`
**And** 返回导入摘要：总条数、成功条数、去重条数、失败条数

**Given** 用户未选择导入
**When** 点击"跳过"
**Then** 允许跳过，进入 Dashboard（空状态）

### Story 1.5: AI 自动分类与确认

As a 用户,
I want 导入的交易被 AI 自动分类，并由我确认或修正,
So that 我的消费记录被正确归类，无需手动逐条分类。

**Acceptance Criteria:**

**Given** CSV 导入完成或通知捕获到新交易
**When** 进入导入处理页
**Then** 展示"Trust Theater"处理动画（最少 5 秒），与后端 AI 处理解耦：若 AI 在 5s 内完成，动画播满 5s 后自动跳转到分类确认页；若 AI 超过 5s，动画持续播放直到 AI 完成（最长 30s），超时后展示"部分分类完成"并允许用户进入确认页
**And** 视觉匹配 `E-Assets/page-designs/01.6-import-processing.html`
**And** 动画关键帧取自 `E-Assets/images/animation-keyframes/`
**And** 交互须匹配 `C-UX-Scenarios/01-*/01.6-*/01.6-import-processing.md`

**Given** 后端收到待分类交易（来自 CSV 导入或通知捕获）
**When** 后端服务层 `apps/api/lib/services/classify-service.ts` 内部调用 `packages/shared/ai/ai-client.ts` 的 `classify()` 方法
**Then** AI 抽象层调用 GPT-5.3-Codex 进行分类（餐饮、交通、购物等）
**And** 注意：前端不直接调用 `/api/ai/classify`，分类由后端在交易入库流程中自动触发
**And** 单笔分类超时阈值 8 秒（P95），超时重试 1 次后切换 Qwen 3.6-Plus
**And** circuit breaker 逻辑在 `packages/shared/ai/fallback.ts` 中实现：连续 3 次主模型失败 → 全局切换 Qwen，30 分钟后自动回切
**And** MVP 单实例部署使用进程内存存储 breaker 状态，代码注释标记 `// TODO: multi-instance 需迁移到 Redis`
**And** 分类结果写入 `billing.transactions`，status 保持 `pending_confirmation`

**Given** AI 分类结果展示给用户
**When** 用户查看分类结果列表
**Then** 每条交易显示：金额、商户、AI 分类建议、置信度
**And** 提供"全部确认"批量操作和逐条操作

**Given** 用户对某条交易
**When** 点击"确认"
**Then** 该交易 status 更新为 `confirmed`

**Given** 用户对某条交易
**When** 点击"拒绝"并手动选择正确分类
**Then** 该交易 status 更新为 `rejected`，重新分类为用户选择的分类
**And** 用户修正数据作为训练反馈存储，优化后续分类

### Story 1.6: Dashboard 首页

As a 用户,
I want 在首页看到我的消费概览和待处理事项,
So that 我能快速了解当月财务状况并处理待确认交易。

**Acceptance Criteria:**

**Given** 用户已登录且有交易数据
**When** 进入 Dashboard
**Then** 展示当月总支出和按分类分布的消费概览
**And** 月报统计通过 `GET /api/analytics/monthly-summary?month=YYYY-MM` 获取（从 `analytics.monthly_summaries` 聚合），staleTime=5min
**And** 最近交易通过 `GET /api/billing/transactions?limit=10` 获取，staleTime=30s
**And** 两个端点独立缓存，避免全量交易加载到客户端
**And** 视觉匹配 `E-Assets/page-designs/01.7-dashboard.html`
**And** 文案取自 `E-Assets/content/scenario-01-content-final.md`
**And** 交互须匹配 `C-UX-Scenarios/01-*/01.7-*/01.7-dashboard.md`

**Given** 存在 pending_confirmation 交易
**When** Dashboard 加载
**Then** 展示待确认交易数量徽章，点击进入确认列表
**And** 最近交易流水（最新 10 条）可滚动浏览

**Given** AI Spotlight 卡片
**When** Dashboard 加载
**Then** 展示 AI 洞察摘要（有新数据时每日至少刷新 1 次）
**And** 卡片可展开查看详情

**Given** 正在进行 CSV 导入或通知捕获
**When** Dashboard 加载
**Then** 顶部展示导入进度横幅（进度百分比、预计剩余时间）
**And** 展示 AI 覆盖率指示器（自动捕获 vs 手动记录比例）

**Given** 新注册用户无任何数据
**When** 进入 Dashboard
**Then** 展示上下文感知空状态引导（引导用户授权通知或导入 CSV）
**And** 空状态插画取自 `E-Assets/images/empty-states/`

**Given** Dashboard 底部
**When** 查看 FAB 浮动操作按钮
**Then** 点击展开快捷操作菜单（手动记账、CSV 导入）
**And** Phase 2 扩展位（家庭快照卡片、身份快照卡片）预留占位但不展示

**Given** 首次加载 Dashboard
**When** 数据尚未返回
**Then** 展示骨架屏（Skeleton），而非空白或 loading spinner

### Story 1.7: 月度报表

As a 用户,
I want 查看按月汇总的消费报表,
So that 我能了解每月的消费结构和变化趋势。

**Acceptance Criteria:**

**Given** 用户有当月确认的交易数据
**When** 进入月度报表页
**Then** 展示当月消费总额和按分类的支出分布（饼图/柱状图）
**And** 每个分类显示金额（元，从 amount_cents 除以 100）和占比百分比
**And** 视觉匹配 `E-Assets/page-designs/01.8-monthly-report.html`
**And** 文案取自 `E-Assets/content/scenario-01-content-final.md`
**And** 交互须匹配 `C-UX-Scenarios/01-*/01.8-*/01.8-monthly-report.md`

**Given** 用户有多个月的历史数据
**When** 查看报表
**Then** 展示同比（去年同月）和环比（上月）趋势对比
**And** 趋势数据通过 `GET /api/analytics/monthly-summary?month=YYYY-MM` 聚合查询（复用 Dashboard 月报端点）
**And** 同比/环比对比通过 `GET /api/analytics/trend?months=12` 获取多月数据

**Given** 用户切换月份
**When** 选择不同月份
**Then** 报表数据更新为对应月份
**And** 月份边界按 UTC 时间计算，展示时转换为用户时区

**Given** 当月无交易数据
**When** 进入报表
**Then** 展示空状态（"本月暂无消费记录"+ 引导操作）
**And** 空状态插画取自 `E-Assets/images/empty-states/`

### Story 1.8: 基础账户管理与 PIPL 合规

As a 用户,
I want 管理我的基本个人信息并控制我的数据隐私,
So that 我对自己的账户和数据有掌控感，符合个人信息保护要求。

**Acceptance Criteria:**

**Given** 用户已登录
**When** 进入"我的"页面
**Then** 展示用户头像、昵称、手机号（脱敏显示）
**And** 提供基础设置入口：个人资料编辑、退出登录
**And** 视觉匹配 `E-Assets/page-designs/08.0-my-hub.html`（基础部分）
**And** 交互须匹配 `C-UX-Scenarios/08-*/`（基础部分）

**Given** 用户点击"编辑资料"
**When** 进入资料编辑页
**Then** 可修改昵称、头像
**And** 修改通过 `PUT /api/user/profile` 保存，Zod 验证入参
**And** 视觉匹配 `E-Assets/page-designs/08.2-profile.html`（基础部分）

**Given** PIPL 合规要求
**When** 用户点击"删除账户"
**Then** 展示二次确认弹窗，明确说明数据将被永久删除
**And** 确认后调用 `DELETE /api/user/delete-account`
**And** 后端执行级联删除，覆盖所有 schema：`auth.users` + `auth.subscriptions`（用户数据）、`billing.transactions` + `billing.category_rules`（交易和分类规则）、`analytics.monthly_summaries`（统计数据）、以及 Phase 2 后可能存在的 `family.family_members`、`billing.gift_*`、`billing.identities` 等关联数据
**And** 删除完成后强制退出登录，清除本地存储

**Given** 用户查看设置页
**When** 进入基础设置
**Then** 展示：隐私协议查看、数据删除入口、当前登录方式、应用版本
**And** 视觉匹配 `E-Assets/page-designs/08.1-settings.html`（基础部分）

**Given** 用户点击"退出登录"
**When** 确认退出
**Then** 清除 Zustand auth-store 中的 JWT 和用户信息
**And** 清除 AsyncStorage 持久化数据
**And** 导航到欢迎页

---

## Epic 2: 交易管理与手动补录

用户能浏览、搜索、纠正交易分类（AI 反馈闭环），iOS 用户能通过 Siri/Widget/OCR 快捷记账，所有用户能手动补充记录和管理分类规则。

### Story 2.1: 交易列表与筛选

As a 用户,
I want 浏览所有交易记录并按分类和时间筛选,
So that 我能快速找到特定交易并了解消费全貌。

**Acceptance Criteria:**

**Given** 用户有已确认的交易数据
**When** 进入交易列表页
**Then** 展示所有交易（按时间倒序），每条显示日期、商户、金额（元）、分类图标
**And** 视觉匹配 `E-Assets/page-designs/03.1-transaction-list.html`
**And** 文案取自 `E-Assets/content/scenario-03-content-final.md`
**And** 组件实现遵循 `D-Design-System/components/*.md`
**And** 样式 Token 取自 `D-Design-System/design-tokens.md`
**And** 交互须匹配 `C-UX-Scenarios/03-*/`

**Given** 用户想按分类筛选
**When** 选择一个或多个分类标签
**Then** 列表仅展示选中分类的交易
**And** 筛选标签可多选，点击已选标签取消筛选

**Given** 用户想按时间范围筛选
**When** 选择时间范围（本周/本月/自定义）
**Then** 列表仅展示时间范围内的交易
**And** 日期边界按 UTC 计算，展示转用户时区

**Given** 交易列表为空
**When** 无匹配结果
**Then** 展示空状态提示和引导操作
**And** 空状态插画取自 `E-Assets/images/empty-states/`

**Given** 交易列表加载
**When** 数据请求中
**Then** 展示骨架屏，首屏渲染 < 2s（NFR1）
**And** 通过 `GET /api/billing/transactions?cursor=lastId&limit=20` 获取数据（cursor-based 分页），TanStack Query 缓存 staleTime=30s
**And** 分页响应格式：`{ success: true, data: { items: Transaction[], nextCursor: string | null } }`
**And** 统一分页契约定义在 `packages/shared/api/pagination.ts`

### Story 2.2: 交易详情与分类修正

As a 用户,
I want 查看交易详情并修正 AI 分类错误,
So that 我的消费记录分类准确，并帮助 AI 在未来做出更好的分类。

**Acceptance Criteria:**

**Given** 用户在交易列表中
**When** 点击某条交易
**Then** 进入交易详情页，展示：金额、商户名称、交易时间、AI 分类、置信度百分比、原始数据来源（通知/CSV/手动）
**And** 视觉匹配 `E-Assets/page-designs/03.2-transaction-detail.html`
**And** 交互须匹配 `C-UX-Scenarios/03-*/`

**Given** 用户认为 AI 分类不正确
**When** 点击"修正分类"
**Then** 展示分类选择器（所有可用分类 + 分类图标）
**And** 分类图标取自 `E-Assets/icons/category-icons/`

**Given** 用户选择了新分类
**When** 确认修正
**Then** 调用 `PUT /api/billing/transactions/{id}` 更新分类
**And** 修正记录作为训练反馈存储（用于优化 AI 分类模型）
**And** 列表页实时反映分类变更（TanStack Query invalidation）

**Given** 交易详情页
**When** 查看 AI 分类信息
**Then** 高置信度（>= 85%）显示绿色标识
**And** 低置信度（< 70%）显示黄色标识并提示"建议核实"

### Story 2.3: 手动快速记账

As a 用户,
I want 通过表单快速手动记录一笔消费,
So that 无法被自动捕获的消费（如现金支付）也能被记录，目标 3 秒内完成。

**Acceptance Criteria:**

**Given** 用户点击 FAB 或手动记账入口
**When** 进入手动记账页
**Then** 展示极简表单：金额（必填，数字键盘）、分类（必填，快速选择）、备注（选填）、日期（默认今天）
**And** 视觉匹配 `E-Assets/page-designs/06.1-manual-entry.html`
**And** 文案取自 `E-Assets/content/scenario-06-content-final.md`
**And** 交互须匹配 `C-UX-Scenarios/06-*/`

**Given** 用户输入金额和分类
**When** 点击"保存"
**Then** 调用 `POST /api/billing/transactions` 创建交易（amount_cents 整数分，status = confirmed）
**And** 保存成功后自动返回上一页，展示 toast 确认
**And** 从打开表单到保存完成 <= 3 秒（NFR4 可用性要求）

**Given** 表单验证
**When** 金额为空或非数字
**Then** 展示 inline 错误提示
**And** 使用 `packages/shared/schemas/billing.ts` Zod schema 验证

**Given** 手动记账页
**When** 查看辅助输入入口
**Then** 展示语音记账按钮和截屏 OCR 按钮（占位入口，具体功能在 Story 2.6 实现）

### Story 2.4: 分类规则管理

As a 用户,
I want 查看和调整 AI 的自动分类规则,
So that 我可以纠正系统性的分类错误，提高未来分类准确率。

**Acceptance Criteria:**

**Given** 分类规则数据基础
**When** Story 开始实现
**Then** 确认 `billing.category_rules` 表已在 E0 Story 0.3 migration 中创建（含 keyword、category_id、user_id、hit_count、source 字段）
**And** `billing.categories` 表含系统预设分类（餐饮、交通、购物、娱乐、居住、医疗、教育、其他）

**Given** 用户进入分类管理页
**When** 页面加载
**Then** 展示所有分类列表，每个分类显示：图标、名称、该分类下交易数量
**And** 视觉匹配 `E-Assets/page-designs/06.2-category-management.html`
**And** 交互须匹配 `C-UX-Scenarios/06-*/`

**Given** 用户点击某个分类
**When** 查看分类详情
**Then** 展示 AI 已学习的分类规则（如"包含'星巴克'的交易归入餐饮"）
**And** 显示该规则的命中率和修正次数

**Given** 用户想调整分类规则
**When** 编辑规则
**Then** 可添加/删除关键词映射
**And** 修改后的规则立即应用于未来新交易
**And** 已确认的历史交易不受影响

### Story 2.5: iOS 替代捕获方案

As a iOS 用户,
I want 通过 Siri 语音、Widget 或截屏 OCR 快速记账,
So that 即使 iOS 无法自动捕获通知，我也能极速记录消费。

**Acceptance Criteria:**

**Given** iOS 用户已登录
**When** 使用 Siri 说"记一笔 xx 元 xx"
**Then** Siri Shortcut 解析语音指令，提取金额和商户
**And** 自动创建交易记录，用户仅需语音确认
**And** 全程 <= 3 秒（NFR4）

**Given** iOS 用户在主屏幕
**When** 使用 Widget 一键记账
**Then** 点击 Widget 展开快速输入面板
**And** 输入金额+分类后一键保存
**And** 全程 <= 1 秒（目标值）

**Given** iOS 用户截取支付截图
**When** 通过应用的截屏 OCR 功能识别
**Then** 调用 `POST /api/ai/ocr` 识别截图中的金额、商户、时间
**And** OCR 超时阈值 20 秒（P95），超时重试 1 次后切换 Qwen
**And** 识别结果预填到记账表单，用户确认后保存

**And** 视觉匹配 `E-Assets/page-designs/06.3-ios-shortcuts.html`
**And** 交互须匹配 `C-UX-Scenarios/06-*/`

### Story 2.6: 语音记账与截屏 OCR

As a 用户,
I want 通过语音或截屏快速记录一笔消费,
So that 我在不方便打字时也能极速记账。

**Acceptance Criteria:**

**Given** 用户在手动记账页点击语音记账按钮
**When** 授予麦克风权限后
**Then** 使用 `@react-native-voice/voice` 进行语音识别
**And** 首次使用时请求麦克风权限，被拒绝时展示引导说明
**And** 语音识别结果自动填入表单字段（金额、商户），用户确认后保存
**And** 语音识别 + 表单提交全程 <= 3 秒（NFR4）

**Given** 用户点击截屏 OCR 按钮
**When** 选择一张支付截图
**Then** 调用 `POST /api/ai/ocr` 识别截图中的金额、商户、时间
**And** OCR 超时阈值 20 秒（P95），超时重试 1 次后切换 Qwen 3.6-Plus
**And** 识别结果预填到记账表单，用户确认后保存

**And** 视觉匹配 `E-Assets/page-designs/06.1-manual-entry.html`（语音/OCR 区域）
**And** 交互须匹配 `C-UX-Scenarios/06-*/`

---

## Epic 3: 家庭财务协同与付费

用户能订阅付费服务、创建家庭共享账本、邀请家人加入、标注消费受益人。"付费→解锁→使用"闭环。

### Story 3.1: 付费订阅与定价展示

As a 免费用户,
I want 查看付费功能对比和订阅方案,
So that 我能了解付费价值并决定是否升级。

**Acceptance Criteria:**

**Given** 用户查看订阅页面
**When** 页面加载
**Then** 展示免费版 vs 付费版功能对比表
**And** 展示月度/年度订阅价格（年度有折扣标识）
**And** 视觉匹配 `E-Assets/page-designs/02.1-subscription.html`
**And** 文案取自 `E-Assets/content/scenario-02-content-final.md`
**And** 组件实现遵循 `D-Design-System/components/*.md`
**And** 样式 Token 取自 `D-Design-System/design-tokens.md`
**And** 交互须匹配 `C-UX-Scenarios/02-*/`

**Given** 用户选择订阅方案
**When** 点击"立即订阅"
**Then** Android 用户弹出微信支付/支付宝选择
**And** iOS 用户触发 Apple IAP 购买流程（react-native-iap）

**Given** Android 支付宝支付
**When** 用户选择支付宝
**Then** 集成支付宝 Android SDK（`@alipay/react-native-alipay` 或等效库），发起支付
**And** 支付回调到达后端 `POST /api/billing/payment-callback`

**Given** iOS Apple IAP 支付
**When** 用户在 iOS 上点击订阅
**Then** 通过 `react-native-iap` 发起购买
**And** 客户端获取 App Store 收据后发送至后端
**And** 后端调用 Apple Receipt Validation API 验证收据真实性后再更新订阅状态
**And** 提供 `POST /api/billing/apple-server-notification` 端点处理 Apple 服务端通知（续期/取消/退款）

**Given** 支付成功（任何渠道）
**When** 支付验证通过
**Then** 确认 `auth.subscriptions` 表已在 E0 Story 0.3 migration 中创建
**And** 更新 subscriptions 记录（provider、plan、expires_at）
**And** 前端刷新订阅状态，解锁付费功能
**And** 展示订阅成功确认

**Given** 支付失败或取消
**When** 支付未完成
**Then** 展示友好的错误提示，提供重试入口
**And** 不更改用户订阅状态

### Story 3.2: 家庭账本创建与成员管理

As a 付费用户,
I want 创建家庭共享账本并邀请家人加入,
So that 全家人的消费能汇总查看，协同管理家庭财务。

**Acceptance Criteria:**

**Given** 家庭功能数据基础
**When** Story 开始实现
**Then** 创建 migration `004_create_family_schema.sql`：新建 `family` schema；创建 `family.families` 表（id、name、creator_id、created_at）；创建 `family.family_members` 表（family_id、user_id、role ENUM admin/member、joined_at）
**And** 配置 RLS 策略：家庭成员只能查看自己所属家庭；`billing.transactions` 的 family 视图 RLS 为 `user_id IN (SELECT user_id FROM family.family_members WHERE family_id = ?) AND visibility = 'shared'`
**And** `billing.transactions` 新增 `visibility` 字段（默认 'shared'，可设为 'private'）

**Given** 付费用户进入家庭功能
**When** 点击"创建家庭账本"
**Then** 输入家庭名称，系统创建家庭实体
**And** 创建者自动成为管理员
**And** 视觉匹配 `E-Assets/page-designs/02.2-shared-family-ledger.html`
**And** 交互须匹配 `C-UX-Scenarios/02-*/`

**Given** 家庭管理员
**When** 点击"邀请成员"
**Then** 生成邀请链接或邀请码
**And** 被邀请人通过链接/码加入家庭
**And** 加入后自动共享该成员的消费记录到家庭视图

**Given** 家庭成员有隐私消费
**When** 标记某笔交易为"仅自己可见"
**Then** 该交易 `visibility` 字段设为 `private`
**And** RLS 策略确保其他家庭成员无法查询到该交易
**And** 家庭汇总数据中不包含 private 交易的金额

**Given** 家庭共享 Dashboard
**When** 进入家庭视图
**Then** 展示家庭总支出、各成员贡献占比
**And** 仅显示 visibility = shared 的交易

**Given** 家庭成员想退出账本
**When** 点击"退出家庭"
**Then** 二次确认弹窗说明：退出后该成员的历史交易从共享视图中移除，但成员个人数据保留
**And** 退出后 `family.family_members` 中该记录删除，共享视图自动刷新

**Given** 管理员移除成员
**When** 管理员在成员管理中点击"移除"
**Then** 被移除成员收到通知，其数据处理与主动退出相同
**And** 管理员可解散家庭账本（需确认），解散后所有成员恢复独立状态

### Story 3.3: 受益人标注与 AI 规则引擎

As a 家庭用户,
I want 标注每笔消费"为谁花的"并让 AI 学习我的标注习惯,
So that 系统能自动标注未来交易的受益人，帮我精确了解家庭成员各自的消费。

**Acceptance Criteria:**

**Given** 用户查看交易详情
**When** 点击"受益人标注"
**Then** 可选择：自己 / 配偶 / 孩子 / 家庭共用
**And** 标注结果保存到交易记录
**And** 视觉匹配 `E-Assets/page-designs/02.3-beneficiary-tagging.html`
**And** 交互须匹配 `C-UX-Scenarios/02-*/`

**Given** AI 规则引擎第一阶段
**When** 用户标注了多笔交易后
**Then** AI 分析标注模式，生成规则建议（如"'玩具'类交易 → 孩子"）
**And** 将建议展示给用户确认

**Given** AI 规则引擎第二阶段
**When** 用户确认了 AI 建议的规则
**Then** 规则持久化存储
**And** 未来匹配该规则的新交易自动标注受益人
**And** 自动标注结果标记为"AI 建议"，用户可覆盖修改

**Given** 受益人维度统计
**When** 查看家庭统计
**Then** 按受益人维度展示支出分布
**And** 可按月份/分类交叉查看

### Story 3.4: 付费墙触发与功能解锁

As a 免费用户,
I want 在触碰付费功能时看到清晰的升级引导,
So that 我理解付费价值并能顺畅完成升级，而不是看到空白或错误页面。

**Acceptance Criteria:**

**Given** 免费用户尝试访问付费功能（E3 家庭账本、E4 趋势图、E5 人情账、E6 多身份、E7 AI 管家）
**When** 检测到用户 `auth.subscriptions` 无有效订阅
**Then** 展示 Paywall 遮罩（高斯模糊预览 + 升级按钮），而非空白或错误页
**And** Paywall 组件为 `packages/ui/src/paywall-overlay.tsx`，可复用于所有付费功能入口
**And** 点击"升级"按钮导航到 Story 3.1 的订阅页

**Given** 用户在 AI 对话中触发付费功能
**When** 免费用户第 3 次对话提问时（FR16 付费门槛）
**Then** 展示专属 Paywall（非通用遮罩），说明 AI 管家是付费功能
**And** 允许前 2 次免费体验，第 3 次开始拦截

**Given** 用户完成支付后
**When** 从 Paywall 触发的订阅流程完成
**Then** 自动返回触发 Paywall 的原页面
**And** 付费功能立即解锁，无需重启应用
**And** 使用 TanStack Query invalidation 刷新订阅状态

**And** 视觉匹配 `E-Assets/page-designs/02.1-subscription.html`（Paywall 变体）
**And** 组件实现遵循 `D-Design-System/components/*.md`
**And** 样式 Token 取自 `D-Design-System/design-tokens.md`

---

## Epic 4: 消费趋势与分享

用户能查看多月消费趋势折线图、消费习惯雷达图，生成分享卡片发送微信。

### Story 4.1: 多月消费趋势图表

As a 用户,
I want 查看多个月的消费趋势变化,
So that 我能发现消费模式和异常波动。

**Acceptance Criteria:**

**Given** 用户有 2 个月以上的交易数据
**When** 进入趋势图表页
**Then** 展示多月消费总额折线图（victory-native-xl + Skia 渲染）
**And** 可按分类切换查看单分类趋势
**And** 图表支持左右滑动查看更多月份
**And** 视觉匹配 `E-Assets/page-designs/03.3-trend-chart.html`
**And** 文案取自 `E-Assets/content/scenario-03-content-final.md`
**And** 组件实现遵循 `D-Design-System/components/*.md`
**And** 样式 Token 取自 `D-Design-System/design-tokens.md`
**And** 交互须匹配 `C-UX-Scenarios/03-*/`

**Given** 图表数据点
**When** 用户点击某个月份数据点
**Then** 展示该月消费明细弹窗（总额、Top 3 分类）

**Given** 数据不足
**When** 仅有 1 个月数据
**Then** 展示提示"再积累 1 个月数据即可查看趋势"
**And** 空状态插画取自 `E-Assets/images/empty-states/`

### Story 4.2: 消费习惯雷达图

As a 用户,
I want 通过雷达图直观了解我的消费结构,
So that 我能一眼看出哪些方面消费偏高。

**Acceptance Criteria:**

**Given** 用户有当月交易数据
**When** 进入消费雷达页
**Then** 展示消费习惯雷达图（Skia Canvas 自定义极坐标图）
**And** 雷达维度为主要消费分类（餐饮/交通/购物/娱乐/居住等）
**And** 可选择不同月份对比查看（叠加显示）
**And** 视觉匹配 `E-Assets/page-designs/03.4-spending-radar.html`
**And** 交互须匹配 `C-UX-Scenarios/03-*/`

**Given** 雷达图维度
**When** 用户点击某个维度
**Then** 展示该分类的详细消费明细

### Story 4.3: 分享卡片生成与微信分享

As a 用户,
I want 将我的消费趋势或雷达图生成分享卡片发到微信,
So that 我能与朋友分享有趣的消费洞察。

**Acceptance Criteria:**

**Given** 用户在趋势图或雷达图页面
**When** 点击"分享"按钮
**Then** 使用 react-native-view-shot 将图表区域截图为 PNG
**And** 叠加品牌水印和分享卡片模板
**And** 分享卡片模板取自 `E-Assets/images/share-cards/`

**Given** 分享卡片生成完成
**When** 用户选择"发送到微信"
**Then** 调用 react-native-wechat-lib 分享 SDK
**And** 支持分享到微信好友和朋友圈
**And** 分享成功后展示确认动画
**And** 动画关键帧取自 `E-Assets/images/animation-keyframes/`

---

## Epic 5: 人情往来账

用户能管理人情网络、追踪随礼历史（跨年）、获得智能回礼建议、OCR 导入礼金簿。

### Story 5.1: 人情网络与随礼记录

As a 用户,
I want 按"人"组织我的人情往来，记录每次随礼和收礼,
So that 我能清楚了解每段关系的人情收支平衡。

**Acceptance Criteria:**

**Given** 人情账数据基础
**When** Story 开始实现
**Then** 创建 migration `005_create_gift_tables.sql`：在 `billing` schema 下创建 `gift_contacts` 表（id、user_id、name、relationship、created_at）；`gift_events` 表（id、user_id、title、event_type ENUM wedding/birthday/funeral/满月/other、event_date）；`gift_records` 表（id、contact_id、event_id、amount_cents、direction ENUM sent/received、note、created_at）
**And** 所有表启用 RLS，策略为 `user_id = auth.uid()`

**Given** 用户进入人情账功能
**When** 页面加载
**Then** 展示人情网络列表（按人组织，非线性流水）
**And** 每个人显示：姓名、关系、累计送出/收到金额、最近往来时间
**And** 视觉匹配 `E-Assets/page-designs/04.1-gift-management.html`
**And** 文案取自 `E-Assets/content/scenario-04-content-final.md`
**And** 组件实现遵循 `D-Design-System/components/*.md`
**And** 样式 Token 取自 `D-Design-System/design-tokens.md`
**And** 交互须匹配 `C-UX-Scenarios/04-*/`

**Given** 用户添加人情记录
**When** 点击"记一笔"
**Then** 填写：对象（人名，可选已有联系人）、金额、事件类型（婚礼/生日/丧事/满月等）、日期、方向（送/收）
**And** 丧事场景使用敏感措辞（NFR：丧事语言特殊处理）

**Given** 用户查看某人的往来详情
**When** 点击某个联系人
**Then** 展示该人的所有历史往来记录（跨年）
**And** 显示收支平衡状态

**Given** 人情列表为空
**When** 无任何记录
**Then** 展示空状态引导
**And** 空状态插画取自 `E-Assets/images/empty-states/`

### Story 5.2: 智能回礼建议与季节预警

As a 用户,
I want AI 根据历史数据推荐合适的回礼金额，并提醒即将到来的人情高峰,
So that 我不会在人情场合失礼或遗漏，也能合理控制人情支出。

**Acceptance Criteria:**

**Given** 某联系人有即将到来的事件（如已知婚礼日期）
**When** 查看该联系人
**Then** AI 展示回礼金额建议，综合考虑：历史金额、物价涨幅、关系亲疏、宴会规格
**And** 建议以范围形式展示（如"建议 ¥600-800"）
**And** 视觉匹配 `E-Assets/page-designs/04.2-gift-smart-suggestion.html`
**And** 交互须匹配 `C-UX-Scenarios/04-*/`

**Given** 人情支出季节性分析
**When** 系统检测到即将进入人情高峰期（如春节前、国庆前）
**Then** 推送预警通知，估算预计支出总额
**And** 基于历史同期数据预测

### Story 5.3: 礼金簿 OCR 导入

As a 用户,
I want 拍照导入纸质礼金簿，自动识别姓名和金额,
So that 我能快速将历史人情数据电子化，无需逐条手动输入。

**Acceptance Criteria:**

**Given** 用户选择"拍照导入礼金簿"
**When** 进入 OCR 导入流程
**Then** 展示 5 步流程：拍照→OCR→审核→关联事件→完成
**And** 视觉匹配 `E-Assets/page-designs/04.1a-gift-book-import.html`
**And** 交互须匹配 `C-UX-Scenarios/04-*/`

**Given** 用户拍摄礼金簿页面
**When** 拍照完成
**Then** 支持多页连续拍摄
**And** 调用 `POST /api/ai/ocr` 识别每页的姓名+金额

**Given** OCR 识别完成
**When** 展示识别结果
**Then** 每行显示：姓名、金额、置信度评分
**And** 低置信度行高亮标记
**And** 支持行内编辑修正

**Given** OCR 识别失败（图片模糊/光线不足）
**When** 识别结果为空或全部低置信度
**Then** 展示友好提示："识别效果不佳，建议重新拍摄或手动录入"
**And** 提供"手动录入"跳转入口

### Story 5.4: 礼金簿事件关联与数据入库

As a 用户,
I want 将 OCR 识别结果关联到具体的人情事件并批量保存,
So that 识别出的数据能正确归入人情网络，完成电子化闭环。

**Acceptance Criteria:**

**Given** Story 5.3 OCR 审核完成
**When** 点击"关联事件"
**Then** 展示事件选择器：可选择已有事件或创建新事件（如"2025 年小明婚礼"）
**And** 新建事件需填写：标题、事件类型、日期

**Given** 用户选择/创建事件后
**When** 点击"完成导入"
**Then** 所有审核通过的 OCR 记录批量写入 `billing.gift_records` 和 `billing.gift_contacts`
**And** 已存在的联系人自动匹配（按姓名模糊匹配），新联系人自动创建
**And** 展示导入摘要：成功 X 条、新建联系人 Y 人、关联事件名称

**Given** 多页拍摄场景
**When** 同一人出现在多页中
**Then** 去重合并（按姓名匹配），金额累加或分条展示（由用户选择）

**And** 视觉匹配 `E-Assets/page-designs/04.1a-gift-book-import.html`（步骤 4-5）
**And** 交互须匹配 `C-UX-Scenarios/04-*/`

---

## Epic 6: 多身份核算

用户能创建多个财务身份（打工人/老板/自由职业）、各身份独立收支核算、副业利润计算。

### Story 6.1: 财务身份创建与切换

As a 有多重收入来源的用户,
I want 创建不同的财务身份并在它们之间快速切换,
So that 我的个人消费、副业收支、自由职业收入能独立核算互不干扰。

**Acceptance Criteria:**

**Given** 多身份数据基础
**When** Story 开始实现
**Then** 创建 migration `006_create_identity_tables.sql`：在 `billing` schema 下创建 `identities` 表（id、user_id、name、type ENUM employee/boss/freelance/other、is_default BOOLEAN、created_at）
**And** `ALTER TABLE billing.transactions ADD COLUMN identity_id UUID REFERENCES billing.identities(id) DEFAULT NULL`（NULL 表示个人默认身份）
**And** 更新 RLS 策略：交易查询在有 identity_id 时额外过滤当前活跃身份
**And** 现有交易的 identity_id 保持 NULL（向后兼容）

**Given** 用户进入多身份管理
**When** 页面加载
**Then** 展示已有身份列表（默认有"个人"身份）
**And** 视觉匹配 `E-Assets/page-designs/05.1-identity-management.html`
**And** 文案取自 `E-Assets/content/scenario-05-content-final.md`
**And** 组件实现遵循 `D-Design-System/components/*.md`
**And** 样式 Token 取自 `D-Design-System/design-tokens.md`
**And** 交互须匹配 `C-UX-Scenarios/05-*/`

**Given** 用户点击"创建新身份"
**When** 填写身份信息
**Then** 输入身份名称（如"淘宝店"）和类型（打工人/老板/自由职业/其他）
**And** 创建成功后该身份有独立的交易空间

**Given** 用户有多个身份
**When** 点击身份切换器
**Then** 快速切换当前活跃身份
**And** 切换后 Dashboard、交易列表等数据自动切换到对应身份
**And** 全局导航栏显示当前身份标识

### Story 6.2: 身份独立收支与副业利润计算

As a 副业用户,
I want 在副业身份下独立记录收入和支出并计算真实利润,
So that 我清楚知道副业到底赚不赚钱。

**Acceptance Criteria:**

**Given** 用户切换到副业身份
**When** 查看该身份的收支概览
**Then** 展示该身份下的独立收入和支出统计
**And** 不包含其他身份的数据
**And** 视觉匹配 `E-Assets/page-designs/05.2-identity-pnl.html`
**And** 交互须匹配 `C-UX-Scenarios/05-*/`

**Given** 副业利润计算器
**When** 用户查看利润页面
**Then** 展示：总收入 - 显性成本（进货、平台费等）- 隐性成本（时间投入折算、设备折旧等）= 真实利润
**And** 每项可手动录入或从交易记录自动汇总
**And** 按月/季度/年度展示利润趋势

**Given** 隐性成本录入
**When** 用户添加隐性成本项
**Then** 支持自定义成本类型和金额
**And** 系统自动纳入利润计算

---

## Epic 7: AI 财务管家

用户能通过自然语言对话查询财务数据、接收 AI 洞察推送、获得消费优化建议和模拟预测。

### Story 7.1: AI 对话式财务问答

As a 用户,
I want 用自然语言向 AI 提问财务问题并获得即时回答,
So that 我无需手动翻阅数据就能快速了解消费情况。

**Acceptance Criteria:**

**Given** 用户进入 AI 对话页面
**When** 页面加载
**Then** 展示对话界面，底部输入框，历史对话记录
**And** 视觉匹配 `E-Assets/page-designs/07.1-ai-chat.html`
**And** 文案取自 `E-Assets/content/scenario-07-content-final.md`
**And** 组件实现遵循 `D-Design-System/components/*.md`
**And** 样式 Token 取自 `D-Design-System/design-tokens.md`
**And** 交互须匹配 `C-UX-Scenarios/07-*/`

**Given** 用户输入问题（如"上月咖啡花了多少？"）
**When** 发送消息
**Then** 调用 `POST /api/ai/chat`（流式 SSE 响应）
**And** AI 回答以打字机效果逐字展示
**And** 后端注入用户财务数据（月度统计、分类分布）作为 context

**Given** AI 返回结构化数据
**When** 回答包含数据（金额、图表）
**Then** 从 JSON 流中解析并渲染结构化数据卡片（表格、迷你图表）
**And** 数据卡片中的金额可点击跳转到对应交易详情
**And** Action Buttons（如"查看详细趋势""设置预算"）从流中解析并渲染为可点击按钮

**Given** 多轮对话上下文管理
**When** 用户连续提问
**Then** 后端维护对话上下文窗口（最近 10 轮对话），超出窗口的历史对话自动裁剪
**And** 对话历史存储在 `analytics.chat_sessions` 表（user_id、messages JSONB、created_at、updated_at）
**And** 用户关闭 App 后重新打开，可查看最近 30 天的对话记录
**And** 用户删除账号时（Story 1.8），对话记录作为个人数据级联删除（PIPL 合规）

**Given** SSE 流式响应实现
**When** 前端接收 AI 回答
**Then** 客户端使用 `fetch` + `ReadableStream` 接收 SSE（非 EventSource，因需 POST）
**And** 自定义 hook `apps/mobile/hooks/use-ai-chat-stream.ts` 封装流式解析
**And** JSON 数据卡片通过流中特殊标记 `[DATA_CARD]...[/DATA_CARD]` 分隔解析

**Given** AI 服务异常
**When** 主模型超时或失败
**Then** 自动降级到 Qwen 3.6-Plus（复用 `packages/shared/ai/fallback.ts` 降级策略）
**And** 用户看到"思考中..."而非错误信息
**And** AI 对话首字节延迟 P95 < 3s（NFR1 性能扩展指标）

### Story 7.2: 洞察推送与 Feed

As a 用户,
I want AI 主动发现我的消费异常并推送提醒,
So that 我不需要主动查看就能及时了解重要的财务变化。

**Acceptance Criteria:**

**Given** AI 后台分析用户交易数据
**When** E0 Story 0.8 的 worker 定时任务 `insight-analysis.ts` 触发（建议每日凌晨 2:00 执行）
**Then** 遍历活跃用户的近期交易，检测异常（单笔消费 > 历史同类均值 3 倍）
**And** 生成洞察并推送通知（Expo Push Notifications → 个推/极光）
**And** 同时添加到 App 内 Feed（`analytics.insights` 表）

**Given** 用户进入洞察 Feed
**When** 页面加载
**Then** 展示按时间排序的洞察列表
**And** 每条洞察显示：标题、摘要、时间、操作按钮
**And** 视觉匹配 `E-Assets/page-designs/07.2-insights-feed.html`
**And** 交互须匹配 `C-UX-Scenarios/07-*/`

**Given** 推送频率控制
**When** 系统生成推送
**Then** 每日推送上限 <= 3 条
**And** 连续 7 天用户无互动，自动降频至每周 <= 1 条
**And** 推送节奏自适应（系统学习用户偏好）

**Given** 用户反馈洞察质量
**When** 点击"有用"或"不相关"
**Then** 反馈存储到 ML 反馈闭环
**And** 用于调整洞察权重和推送策略
**And** "有用"反馈率目标 >= 40%

**Given** 洞察 Feed 为空
**When** 无洞察数据
**Then** 展示空状态引导
**And** 空状态插画取自 `E-Assets/images/empty-states/`

### Story 7.3: 消费优化建议

As a 用户,
I want 获得基于我历史数据的可执行省钱建议,
So that 我能有目标地优化消费习惯。

**Acceptance Criteria:**

**Given** 用户有足够的历史数据
**When** AI 分析消费模式
**Then** 生成可执行建议，每条包含：明确的消费品类、目标金额、预计节省金额
**And** 例如："减少外卖支出至 ¥800/月（当前 ¥1200），预计每月节省 ¥400"
**And** 视觉匹配 `E-Assets/page-designs/07.3-optimization.html`
**And** 交互须匹配 `C-UX-Scenarios/07-*/`

**Given** 建议推送 30 天后
**When** 系统自动生成效果报告
**Then** 对比建议前后的实际消费数据
**And** 无需用户手动打卡，全自动追踪
**And** 展示"已实现节省 ¥xxx"或"消费持平"

**Given** 同类对比功能
**When** 用户查看对比数据
**Then** 展示同年龄段/同城市级别的匿名化全平台用户消费中位数
**And** 标注用户在各分类的消费位置（高于/低于/持平）

### Story 7.4: 消费模拟

As a 用户,
I want 模拟调整消费习惯后的长期财务影响,
So that 我能直观感受小改变带来的大差异。

**Acceptance Criteria:**

**Given** 用户进入消费模拟页面（独立页面）
**When** 页面加载
**Then** 展示可调节的消费场景滑块
**And** 例如："每天少一杯咖啡"→ 显示一年节省金额
**And** 视觉匹配 `E-Assets/page-designs/07.4-simulation.html`
**And** 交互须匹配 `C-UX-Scenarios/07-*/`

**Given** 用户调整模拟参数
**When** 拖动滑块或输入数值
**Then** 实时计算并展示：月度节省、年度节省、3 年累计节省
**And** 以图表形式可视化长期积累效应

**Given** 模拟结果
**When** 用户满意某个模拟方案
**Then** 可一键转化为"优化目标"
**And** 系统自动追踪该目标的执行情况

---

## Epic 8: 高级账户与个性化设置

用户能管理详细个人资料、查看订阅状态、配置通知偏好、高级隐私设置。

### Story 8.1: 通知偏好设置

As a 用户,
I want 自定义收到哪些推送通知以及推送频率,
So that 我不会被不需要的通知打扰，又不会错过重要提醒。

**Acceptance Criteria:**

**Given** 用户进入通知偏好设置
**When** 页面加载
**Then** 展示通知类型开关列表：交易提醒、洞察推送、人情预警、优化建议、系统通知
**And** 每种类型可独立开启/关闭
**And** 视觉匹配 `E-Assets/page-designs/08.1-settings.html`（高级部分）
**And** 交互须匹配 `C-UX-Scenarios/08-*/`

**Given** 用户调整通知频率
**When** 修改推送频率设置
**Then** 选项：实时 / 每日汇总 / 每周汇总 / 仅重要通知
**And** 设置保存到 `PUT /api/user/profile`，Zod 验证入参

### Story 8.2: 订阅状态管理

As a 付费用户,
I want 查看我的订阅状态并管理续费,
So that 我清楚知道订阅何时到期以及如何管理。

**Acceptance Criteria:**

**Given** 付费用户进入订阅管理
**When** 页面加载
**Then** 展示当前订阅方案、到期日期、支付方式、自动续费状态
**And** 视觉匹配 `E-Assets/page-designs/08.0-my-hub.html`（高级部分）
**And** 交互须匹配 `C-UX-Scenarios/08-*/`

**Given** 用户想管理订阅
**When** 点击相关操作
**Then** Android 用户可切换方案或取消自动续费
**And** iOS 用户引导至 App Store 订阅管理

**Given** 免费用户
**When** 查看订阅状态
**Then** 展示当前为免费版，提供升级入口（跳转 E3 订阅页）

### Story 8.3: 高级隐私与数据管理

As a 注重隐私的用户,
I want 精细控制我的数据隐私设置和授权管理,
So that 我对个人数据有完全掌控感。

**Acceptance Criteria:**

**Given** 用户进入高级隐私设置
**When** 页面加载
**Then** 展示：数据授权管理（已授权的第三方列表）、通知监听权限状态、数据导出请求入口
**And** 视觉匹配 `E-Assets/page-designs/08.2-profile.html`（高级部分）
**And** 交互须匹配 `C-UX-Scenarios/08-*/`

**Given** 用户想导出个人数据
**When** 点击"导出我的数据"
**Then** 系统生成包含所有个人数据的 JSON/CSV 文件
**And** 通过安全链接下载（链接 24 小时有效）

**Given** 用户想撤销通知权限
**When** 点击"关闭通知监听"
**Then** 引导用户到系统设置关闭 NotificationListenerService
**And** 提示关闭后将无法自动捕获消费记录
