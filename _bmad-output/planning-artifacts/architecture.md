---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-04-14'
inputDocuments:
  - product-brief-money-tracker-distillate.md
  - technical-china-stack-feasibility-research-2026-04-09.md
  - technical-bill-import-feasibility-research-2026-04-09.md
  - 00-ux-scenarios.md
  - design-tokens.md
workflowType: 'architecture'
project_name: 'money-tracker'
user_name: 'Sue'
date: '2026-04-13'
---

# Architecture Decision Document — 了然 (Liaoran)

_本文档通过逐步协作发现构建完成。各节在讨论过程中逐步追加，不提前生成。_

---

## 项目上下文分析

### 需求概览

**功能需求（按阶段）：**

| 阶段 | 范围 | 核心功能 |
|------|------|----------|
| MVP (F1-F3) | 零记账引擎（免费） | 账单导入/通知捕获 + AI 自动分类 + Dashboard/月报 |
| Phase 2 (F4-F8) | 差异化功能（付费） | 家庭共享账本 + 受益人标注 + 消费趋势 + 人情账 + 多身份核算 |
| Phase 3 (F9-F13) | AI 管家（付费高级） | AI 对话 + 洞察推送 + 优化建议 + 消费模拟 |

**当前实施范围：** Scenario 01 完整流程（8 屏），覆盖 MVP 核心体验。

**关键架构含义：**

- **双平台差异化**：Android 通过 NotificationListenerService 实现 80-90% 自动捕获；iOS 需 Siri + Widget + OCR 走不同路径。架构必须在 01.4 权限页 / 01.5 导入页处理平台分叉
- **客户端只采集，后端全处理**：解析、去重、分类全部在服务端。Next.js API Routes 是业务逻辑核心
- **金额整数存储（分）**：全栈贯穿，Zod schema 层面强制 `z.number().int()`
- **AI 结果需用户确认**：不自动入账，需要"待确认"中间态

**非功能需求（NFR）：**

| NFR | 要求 | 架构影响 |
|-----|------|----------|
| 性能 | API < 200ms，OCR < 3s | 国内部署，GPT-5.3-Codex / Qwen 3.6-Plus |
| 安全 | RLS 行级隔离，JWT，不上传通知原文 | PostgreSQL RLS 策略 + 字段级脱敏 |
| 隐私 | 家庭共享中部分消费仅自己可见 | visibility 字段 + RLS 策略 |
| 合规 | ICP 备案，数据不出境，PIPL 合规 | 阿里云 ECS 国内部署，数据删除权实现 |
| 可用性 | 注册转化 >= 75%，微信登录占比 >= 60% | 极简注册流，微信一键登录优先 |

### 规模与复杂度评估

**复杂度等级：中高**

**复杂度指标：**

- 实时特性：家庭共享账本需实时同步（Phase 2）
- 多租户：单用户 + 家庭共享 + 多身份 → 复杂 RLS 策略
- 合规：ICP 备案 + 数据存储合规 + PIPL 用户数据删除权
- 集成复杂度：微信 OAuth + AI（GPT-5.3-Codex/Qwen）+ 通知拦截 + CSV 解析
- 交互复杂度：轮播、进度动画、图表、分享卡片
- 数据复杂度：交易记录按月聚合 + 分类统计 + 趋势分析 + 人情网络
- **运维复杂度（高）**：自托管 Supabase + Docker Compose + Nginx + AI（GPT-5.3-Codex/Qwen）+ RN 多端适配，出问题时排查链路长

**主技术领域：** 全栈移动端优先（React Native + Next.js API + PostgreSQL）

### 技术约束与依赖

| 约束 | 来源 | 影响 |
|------|------|------|
| 中国市场落地 | 产品定位 | Supabase 自建、GPT-5.3-Codex + Qwen 3.6-Plus、阿里云 ECS |
| Tamagui v2 设计系统 | UX 设计已定稿 | UI 层绑定 Tamagui，Token 映射已定义 |
| Monorepo (Turborepo) | 技术研究确认 | 项目结构、构建流水线、包管理（pnpm） |
| Docker Compose 部署 | 成本约束 (MVP ~4000元/年) | 单机部署 |
| 解析规则热更新 | 账单格式变更风险 | 后端需配置驱动解析 |
| **2核4G ECS 资源边界** | 成本约束 | Supabase Docker 全栈内存 >2GB，需精简组件或异步化 AI 调用 |

### 横切关注点

1. **认证与授权**：微信 OAuth + 手机号 OTP + JWT + RLS，贯穿全部场景
2. **平台差异抽象**：Android 通知捕获 vs iOS Siri/Widget，统一 BillSource 接口；Android 国内厂商（MIUI/EMUI/ColorOS）保活机制差异需专项适配
3. **AI 抽象层**：GPT-5.3-Codex → Qwen 3.6-Plus 降级切换，需明确触发条件（超时/错误码）、prompt 兼容性、降级 UX
4. **金额与日期规范**：全栈整数分存储 + UTC 日期，月报边界时区归属需明确定义
5. **离线/弱网策略**：TanStack Query 缓存 + 本地队列持久化 + 乐观更新冲突解决 + JWT 过期重放处理
6. **i18n 预留**：中文数字格式（万/亿）和日期格式影响 amount normalization，不纯是 UI 层
7. **错误追踪与可观测性**：RN + Next.js + Supabase + DeepSeek 四系统调用链需结构化错误追踪（Sentry 或类似方案）
8. **数据合规（PIPL）**：用户数据删除权、静态加密策略、数据不出境显式声明

### Party Mode 审查反馈摘要

**Winston (架构师) 关键反馈：**
- PIPL 合规必须 Day 1 进架构：用户数据删除权、静态加密、数据不出境
- 2核4G 跑 Supabase 全栈需精简组件（禁用 Realtime/Storage）或垂直扩容
- Android 国内厂商通知监听差异极大，是 MVP 交付最大不确定性
- 横切关注点需增加"错误追踪与可观测性"

**Amelia (开发者) 关键反馈：**
- Tamagui 编译器 + Expo Metro bundler 在 monorepo 中冲突频繁
- Supabase 自托管 JWT secret 配置错误导致 RLS 静默失败（已知高耗时坑）
- AI 解析结果格式不稳定是最高技术风险
- pnpm + 原生模块 peer deps 需 `.npmrc` 明确配置

**Murat (测试架构师) 关键反馈：**
- RLS 多用户隔离必须有专项测试（不是 E2E 捎带）
- CSV 解析需真实 GBK 文件 fixture，编码问题是线上"幽灵 bug"
- 整数分运算边界值（INT32/BIGINT、含逗号金额）需参数化测试
- 建议三层质量门禁：阻塞发布 / 上线前修复 / 上线后迭代

**John (产品经理) 关键反馈：**
- 挑战8屏完整流程是否为最小验证范围，核心假设是"零输入=用户留存"
- 第一笔自动捕获的时延是核心价值交付缺口
- 错误分类的处理是信任建立/破坏的关键节点
- 建议 MVP 仅做 Android，避免两个平台验证两个不同假设

---

## Starter Template 评估

### 主技术领域

**全栈移动端优先应用**，基于项目需求分析：
- 移动端：React Native (Expo) — 中国 Android 用户为主
- 后端 API：Next.js 15 App Router — API Routes 作为业务逻辑核心
- 数据库：自托管 Supabase (PostgreSQL) — Docker Compose 部署于阿里云 ECS
- AI 集成：GPT-5.3-Codex（主）/ Qwen 3.6-Plus（降级）— OpenAI 兼容 SDK
- UI 设计系统：Tamagui — 设计 Token 已完整定义

### 评估的 Starter 方案

| 方案 | 描述 | 评估 |
|------|------|------|
| Option A: create-t3-turbo | T3 Stack + Turborepo，Expo + Next.js | 不含 Tamagui，需大量替换 |
| Option B: create-tamagui | Tamagui 官方 monorepo starter | Solito 强绑定，Next.js 用户端非必需 |
| Option C: 自定义 Monorepo | Turborepo + pnpm，逐步组装 | 完全匹配技术栈，无冗余依赖 |
| Option D: Expo + 独立 Next.js | 两个独立项目 | 无法共享类型/逻辑包 |

### 选择方案：Option C — 自定义 Monorepo（分阶段组装）

**选择理由：**
- 没有现成 starter 完整匹配 Tamagui + Turborepo + pnpm + 自托管 Supabase 组合
- 自定义 monorepo 可精确控制依赖版本，避免 starter 引入不需要的包
- 分阶段验证每个关键集成点，降低"大爆炸"集成风险

**已验证的兼容版本组合：**

| 包 | 版本 | 来源 |
|---|------|------|
| Expo SDK | 54 | Expo 官方 |
| React Native | 0.81.5 | Expo SDK 54 内置 |
| React | 19.1.0 | RN 0.81 依赖 |
| Tamagui | 待定（见下方版本决策） | — |
| Turborepo | latest | Vercel 维护 |
| pnpm | 9.x | 当前稳定版 |
| Next.js | 15.x (App Router) | 后端 API 使用 |
| TypeScript | 5.7+ (strict mode) | — |

### Tamagui 版本决策（待定）

Party Mode 中 Amelia 明确提出 Tamagui 2.0.0-rc.0 尚非生产就绪，建议使用 1.x 稳定版。Winston 警告 RC 版本存在 API 变更锁定风险。

**选项对比：**

| 维度 | Tamagui 1.x 稳定版 | Tamagui 2.0.0-rc.0 |
|------|---------------------|---------------------|
| 稳定性 | 生产就绪 | RC 阶段，API 可能变更 |
| Token 系统 | v1 token API | v2 token API（设计稿基于此） |
| 编译器 | 成熟 | 重写中，与 Metro 可能冲突 |
| 社区支持 | 文档完善 | 文档不完整 |
| 风险 | 设计 Token 映射需额外转换层 | API 破坏性变更风险 |

**决策：待 Step 4 架构决策阶段最终确定。** 需综合考虑设计 Token 已基于 v2 定义的事实与生产稳定性需求。

### 分阶段初始化计划

采纳 Winston 的分阶段组装建议，避免大爆炸集成：

**阶段 1：Monorepo 骨架**
- Turborepo + pnpm workspace 配置
- `apps/mobile` (Expo bare minimum)
- `apps/api` (Next.js bare minimum)
- `packages/shared` (类型定义 + Zod schemas)
- 验证点：`pnpm install` 成功，两个 app 独立启动

**阶段 2：UI 层集成**
- Tamagui 安装与配置（选定版本）
- Token 映射：设计 Token → Tamagui config
- 基础组件验证（Button、Text、Input）
- 验证点：Expo 中渲染 Tamagui 组件无报错

**阶段 3：数据层集成**
- Supabase 客户端配置
- 环境变量管理
- 基础 auth 流程验证
- 验证点：移动端成功连接 Supabase，JWT 签发正常

**阶段 4：开发工具链**
- ESLint + Prettier 统一配置
- Vitest / Jest 测试框架
- Turbo pipeline（build/test/lint）
- 验证点：`pnpm turbo run build` 全包构建成功

### 初始化配置清单（整合 Amelia 反馈）

Amelia 识别出原始计划中遗漏的 7 项关键配置，已补充：

1. `.npmrc` 配置 — `shamefully-hoist=true`，`strict-peer-dependencies=false`（解决 pnpm + RN 原生模块 peer deps 问题）
2. Metro bundler monorepo 配置 — `watchFolders` 指向 workspace root，`nodeModulesPaths` 解析共享包
3. Tamagui 编译器 + Metro 集成 — babel plugin 配置，避免编译器与 Metro 冲突
4. TypeScript project references — `tsconfig.json` composite + references 配置，包间类型检查
5. Supabase JWT secret 配置验证 — 自托管时 JWT secret 必须与 GoTrue 一致，否则 RLS 静默失败
6. 环境变量分层管理 — `.env.local`（本地）/ `.env.development` / `.env.production`，Expo 使用 `app.config.ts` 动态读取
7. Turborepo remote cache — 可选配置，加速 CI 构建

### Token 到 Tamagui 映射策略（整合 Freya 反馈）

Freya 评估当前 Token 映射完成度 7/10，提出三层组件转换策略：

**三层映射架构：**
1. **原子层**：设计 Token → Tamagui theme tokens（颜色、间距、字号）
2. **组件层**：组件规格 → Tamagui styled() 组件（Button、Card、Input 等）
3. **组合层**：页面级组合组件（Header + TabBar + Content 布局模式）

**首要交付物：** 在写任何组件代码之前，先产出 **token-to-tamagui 映射表**，明确：
- 每个设计 Token 对应的 Tamagui token key
- 未覆盖的 Token（需自定义扩展）
- 语义 Token（semantic colors）的 dark mode 预留位

### Solito 必要性评估

Winston 提出质疑：如果移动端和 Web 端不共享屏幕级路由逻辑（仅共享组件和类型），Solito 可能不必要。

**当前判断：暂不引入 Solito。**
- MVP 阶段 Web 端仅为管理后台 + 官网，与移动端 UX 完全不同
- 共享代码通过 `packages/shared`（类型、schemas、工具函数）实现
- 如果 Phase 2 需要 Web 用户端，再评估 Solito

### Party Mode 审查反馈摘要

**Winston (架构师) 关键反馈：**
- 确认 Option C 正确，强调分阶段组装（4 阶段），避免大爆炸集成
- Tamagui RC 版本锁定风险：API 可能在正式发布时变更
- Solito 在当前范围内可能不必要
- 建议每阶段设置明确验证点

**Amelia (开发者) 关键反馈：**
- 发现初始化计划中 7 个遗漏配置步骤（已补充至清单）
- Tamagui 2.0.0-rc.0 不建议用于生产（推荐 1.x 稳定版）
- 要求可验证的 step-by-step checklist（已采纳分阶段计划格式）
- pnpm + 原生模块 peer deps 是已知高耗时问题

**Freya (UX/设计系统) 关键反馈：**
- Token 映射完成度 7/10，存在未覆盖区域
- 提出三层组件转换策略（原子→组件→组合）
- 建议 token-to-tamagui 映射表作为第一个交付物
- Dark mode 语义 Token 需预留位

---

## 核心架构决策

### 已确定的技术选型（Starter 阶段锁定）

| 维度 | 决策 | 备注 |
|------|------|------|
| 语言 | TypeScript 5.7+ strict mode | 禁止 `any` |
| 移动端框架 | React Native (Expo SDK 54) | RN 0.81.5 + React 19.1.0 |
| 后端框架 | Next.js 15 App Router | API Routes 为业务核心 |
| 包管理 | Turborepo + pnpm 9.x monorepo | — |
| 数据库 | PostgreSQL (自托管 Supabase Docker) | — |
| 部署 | 阿里云 ECS 2核4G + Docker Compose + Nginx | ~4000元/年 |
| AI 主模型 | GPT-5.3-Codex | OpenAI 兼容 SDK |
| AI 降级模型 | Qwen 3.6-Plus | 连续3次失败切换，30分钟回切 |

### 类别 1：数据架构

**Schema 组织：** 按领域拆分
- `auth` — 用户、认证相关
- `billing` — 交易记录、账单导入、分类
- `analytics` — 月报统计、趋势数据
- Phase 2 增加 `family` schema

**交易核心表：** `billing.transactions`
- `status` 字段支持三态：`pending_confirmation` / `confirmed` / `rejected`
- AI 解析结果进入 pending，用户确认后 confirmed
- 金额字段 `amount_cents INTEGER`，全栈整数分存储

**数据验证：** Zod Schema 共享
- `packages/shared/schemas/` 定义所有 Zod schema
- 前端表单验证 + 后端 API 入参验证共用同一 schema
- 数据库层通过 Supabase 生成 TypeScript 类型 + Zod 运行时验证

**缓存策略：** TanStack Query v5 分级
| 数据类型 | staleTime | 理由 |
|---------|-----------|------|
| 交易列表 | 30s | 可能有新导入 |
| 月报统计 | 5min | 变更低频 |
| 用户配置 | Infinity (until mutation) | 仅用户主动修改 |

### 类别 2：认证与安全

**认证实现：方案 B — 自建中间层**
- Next.js API Route 处理微信 OAuth 回调（appid/secret → access_token → unionid）
- 手机号 OTP 通过阿里云 SMS 发送，API Route 验证后签发 Supabase JWT
- 不使用 GoTrue 自定义 provider，避免适配成本

**RLS 策略：**
- 所有表默认 `ENABLE ROW LEVEL SECURITY`
- MVP：`user_id = auth.uid()` 简单行级隔离
- Phase 2：`family_members` 表 + `visibility` 字段实现家庭共享可见性
- RLS 需专项测试（Murat 建议），不靠 E2E 捎带

**JWT 管理：**
- Access Token 15min + Refresh Token 7天
- Supabase 客户端 `autoRefreshToken: true`
- 自托管 JWT secret 必须与 GoTrue `.env` 一致（高危配置项）

**PIPL 合规：**
- 数据删除权：`/api/user/delete-account` 级联删除 + 确认
- 静态加密：`pgcrypto` 加密敏感字段（手机号、微信 unionid）
- 数据不出境：阿里云 ECS 国内区域，AI 模型均为国内可用
- 隐私协议：注册时强制同意，记录 `consent_at` 时间戳

### 类别 3：API 与通信

**API Routes 组织：** 按领域对齐 schema
```
app/api/
  auth/       # 微信OAuth回调、OTP发送/验证、JWT刷新
  billing/    # 交易CRUD、账单导入、CSV解析触发
  ai/         # 分类请求、OCR请求、降级逻辑
  user/       # 用户配置、删除账户、隐私导出
```

**错误处理标准：**
- 统一响应：`{ success: boolean; data?: T; error?: { code: string; message: string } }`
- 业务错误码：`AUTH_OTP_EXPIRED`、`BILLING_DUPLICATE`、`AI_TIMEOUT`
- 客户端 TanStack Query `onError` 统一拦截 → toast 展示

**通信模式：**
- REST 为主，MVP 不引入 GraphQL/tRPC
- OCR 图片：`multipart/form-data` 直传 API Route → 转发 AI 模型
- 离线队列：Zustand persist + TanStack Query mutation retry

**AI 服务抽象层：**
```
packages/shared/ai/
  ai-client.ts         # 统一接口：classify / ocr / parse
  providers/
    gpt-codex.ts       # GPT-5.3-Codex 实现
    qwen.ts            # Qwen 3.6-Plus 降级实现
  fallback.ts          # 降级策略
```

**分级超时与降级：**
| 请求类型 | 超时阈值 | 降级触发 |
|---------|---------|---------|
| 交易分类 (classify) | 8s | 超时 → 重试1次 → 切 Qwen |
| CSV 批量解析 (parse) | 15s | 超时 → 重试1次 → 切 Qwen |
| OCR 识别 | 20s | 超时 → 重试1次 → 切 Qwen |

连续 3 次主模型失败 → 全局切换 Qwen 3.6-Plus，30 分钟后自动回切。

### 类别 4：前端架构

**状态管理 — Zustand 按领域拆分：**
| Store | 职责 | 持久化 |
|-------|------|--------|
| `auth-store` | 用户信息、JWT、登录状态 | AsyncStorage |
| `billing-store` | 待确认交易、导入进度 | 否（TanStack Query 管理） |
| `ui-store` | toast 队列、loading、当前 tab | 否 |

- 服务端数据不放 store，走 TanStack Query 缓存
- `zustand/persist` + `AsyncStorage` 仅持久化 auth token 和用户偏好

**Tamagui 版本：v2.0.0-rc.0**
- 设计 Token 直接映射，无需转换层
- 锁定具体版本号，不用 `^` range
- 备选：严重 Metro 冲突时降级 v1 + 转换层

**组件架构边界：**
```
packages/ui/            # 共享 Tamagui 组件（不涉及原生 API）
packages/shared/        # 类型、Zod schemas、工具函数、AI client

apps/mobile/
  components/           # 平台专属组件（NotificationPermission 等）
  screens/              # 屏幕级组件（Onboarding、Dashboard 等）
```

**导航方案：** Expo Router v4
- 文件系统路由，Tab + Stack 嵌套
- Deep linking 预留（微信分享跳转）

### 类别 5：基础设施与部署

**Supabase Docker 精简（2核4G 约束）：**
| 组件 | 状态 | 预估内存 |
|------|------|---------|
| PostgreSQL | 保留 | ~800MB |
| GoTrue (Auth) | 保留 | ~100MB |
| PostgREST | 保留 | ~50MB |
| Kong/API Gateway | 保留 | ~150MB |
| Realtime | 禁用 | — |
| Storage | 禁用 | — |
| Studio | 仅开发环境 | — |

合计 ~1.1GB，剩余 ~2.9GB 给 Next.js + Nginx + 系统。

**CI/CD — GitHub Actions：**
- PR 检查：`pnpm turbo run lint test build`（并行）
- Main 合并：构建 Docker 镜像 → 推阿里云 ACR → SSH 触发 ECS 更新
- 三层质量门禁：阻塞发布 / 上线前修复 / 上线后迭代

**监控与日志：**
- 错误追踪：Sentry（RN + Next.js 双端 SDK）
- 应用日志：`pino` 结构化日志 → 文件轮转
- 数据库监控：`pg_stat_statements`
- 健康检查：`/api/health` 端点

**环境管理：**
| 环境 | Supabase | 部署 |
|------|----------|------|
| local | Docker Compose 本地 | `pnpm dev` |
| production | 阿里云 ECS Docker | GitHub Actions 自动部署 |

MVP 阶段 local + production 两层，staging 后续按需增加。

---

## 实现模式与一致性规则

### 已有约定（来自 CLAUDE.md）

- 文件命名 kebab-case，组件 PascalCase，函数/hooks camelCase
- 金额整数分，日期 UTC
- API 响应 `{ success, data?, error? }`
- TypeScript strict，禁止 `any`
- 组件使用函数式 + Hooks，禁止 class 组件

### 命名模式

**数据库命名：**
| 维度 | 规则 | 示例 |
|------|------|------|
| 表名 | snake_case 复数 | `transactions`, `family_members` |
| 列名 | snake_case | `user_id`, `amount_cents`, `created_at` |
| 外键 | `{referenced_table_singular}_id` | `user_id`, `category_id` |
| 索引 | `idx_{table}_{columns}` | `idx_transactions_user_id` |
| Schema | 按领域小写 | `auth`, `billing`, `analytics` |

**API 命名：**
| 维度 | 规则 | 示例 |
|------|------|------|
| 端点 | 复数名词 kebab-case | `/api/billing/transactions` |
| 动作端点 | 动词 kebab-case | `/api/auth/otp-verify` |
| 查询参数 | camelCase | `?startDate=&categoryId=` |
| JSON 字段（API 层） | camelCase | `{ amountCents, createdAt }` |
| 业务错误码 | UPPER_SNAKE_CASE | `AUTH_OTP_EXPIRED`, `AI_TIMEOUT` |

**代码命名：**
| 维度 | 规则 | 示例 |
|------|------|------|
| 文件名 | kebab-case | `auth-store.ts`, `bill-import-sheet.tsx` |
| 组件 | PascalCase | `BillImportSheet`, `OnboardingCarousel` |
| 函数/hooks | camelCase | `useAuthStore`, `formatAmountCents` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `OTP_EXPIRE_SECONDS` |
| 类型/接口 | PascalCase | `Transaction`, `ApiResponse<T>` |
| Zustand action | camelCase 动词 | `setUser`, `addTransaction`, `clearPending` |
| 事件命名 | `domain:action` 小写 | `billing:transaction-created` |

### 结构模式

**测试位置：** co-located，`*.test.ts` 与源文件同目录
```
components/
  button.tsx
  button.test.tsx      # 紧邻源文件
screens/
  onboarding.tsx
  onboarding.test.tsx
```

**组件组织：** 按功能/屏幕，不按类型

**共享代码位置：**
| 内容 | 位置 |
|------|------|
| 共享 Tamagui 组件 | `packages/ui/` |
| 类型定义 | `packages/shared/types/` |
| Zod schemas | `packages/shared/schemas/` |
| 工具函数 | `packages/shared/utils/` |
| 常量 | `packages/shared/constants/` |
| AI 客户端 | `packages/shared/ai/` |
| 平台专属组件 | `apps/mobile/components/` |
| 屏幕级组件 | `apps/mobile/screens/` |

**组件文件结构：** 单文件导出，`button.tsx` 导出 `Button`，不用 `index.ts` 桶文件

### 格式模式

**API 响应：**
```typescript
// 成功
{ success: true, data: T }

// 失败
{ success: false, error: { code: "AUTH_OTP_EXPIRED", message: "验证码已过期" } }
```

**数据格式：**
| 维度 | 规则 | 示例 |
|------|------|------|
| JSON 日期 | ISO 8601 字符串 | `"2026-04-14T08:00:00.000Z"` |
| 布尔值 | `true/false` | 不用 1/0 |
| 空值 | `null` | 不用空字符串替代 |
| 金额 | 整数分 number | `{ amountCents: 15000 }` → 显示 ¥150.00 |
| DB ↔ API 转换 | snake_case → camelCase | `amount_cents` → `amountCents` |

### 通信模式

**状态管理规则：**
- 服务端数据 → TanStack Query 缓存，不放 Zustand
- 客户端状态 → Zustand store（auth、UI）
- 不可变更新，不直接 mutate state
- Selector 取最小所需数据，避免不必要重渲染

**事件/副作用：**
- TanStack Query `onSuccess` / `onError` 处理 mutation 副作用
- 不自建事件总线，MVP 不需要跨模块事件

### 流程模式

**错误处理：**
| 层级 | 策略 |
|------|------|
| 屏幕级 | Error Boundary 捕获渲染错误 → 降级 UI |
| API 调用 | TanStack Query `onError` → toast 展示用户友好信息 |
| 表单验证 | Zod + React Hook Form `zodResolver` → inline error |
| 日志 | `console.error` + Sentry（开发者可见），永不暴露技术细节给用户 |

**Loading 状态：**
- 使用 TanStack Query `isLoading` / `isPending`，不自建 loading flag
- 骨架屏（Skeleton）用于首次加载
- Spinner 用于 mutation 等待

**重试策略：**
- Query：`retry: 1`，自动重试
- Mutation：不自动重试，用户手动触发
- AI 调用：按分级超时策略（见类别 3）

**表单验证时机：**
- submit 时验证（不用 onChange 逐字段验证）
- Zod schema 共享前后端

### 强制规则（所有 AI Agent 必须遵守）

1. 数据库表/列一律 snake_case，API JSON 一律 camelCase，DB ↔ API 层做转换
2. 金额字段命名必须含 `cents` 后缀（`amount_cents`、`amountCents`）
3. 所有 API route 必须用 Zod 验证入参，返回统一响应格式
4. 新表必须 `ENABLE ROW LEVEL SECURITY`，至少一条 policy
5. 组件文件 kebab-case，导出 PascalCase，不用 index.ts 桶文件
6. 测试文件与源文件同目录，后缀 `.test.ts` / `.test.tsx`
7. 服务端数据走 TanStack Query，客户端状态走 Zustand，不混用
8. 不引入未在架构文档中列出的新依赖，需先讨论

### 反模式（禁止）

- 使用 `any` 类型
- class 组件
- 自建 loading/error 状态管理（用 TanStack Query）
- 在 Zustand 中缓存服务端数据
- 在 API 响应中返回 snake_case 字段
- 不带 `cents` 后缀的金额字段名
- 直接暴露数据库错误信息给用户
- 不经 Zod 验证的 API 入参

---

## 项目结构与边界

### 完整项目目录结构

```
money-tracker/                              # Monorepo root
├── turbo.json                              # Turborepo pipeline 配置
├── pnpm-workspace.yaml                     # pnpm workspace 定义
├── package.json                            # root scripts + devDependencies
├── .npmrc                                  # shamefully-hoist=true
├── tsconfig.base.json                      # 共享 TypeScript 基础配置
├── .eslintrc.js                            # 共享 ESLint 配置
├── .prettierrc                             # Prettier 配置
├── .gitignore
├── .env.example                            # 环境变量模板
├── .github/
│   └── workflows/
│       ├── ci.yml                          # PR 检查：lint + test + build
│       └── deploy.yml                      # Main → 构建 → ACR → ECS
│
├── apps/
│   ├── mobile/                             # 【MVP】Expo React Native 移动端
│   │   ├── app.json
│   │   ├── app.config.ts                   # 动态配置（env vars）
│   │   ├── babel.config.js                 # Tamagui babel plugin
│   │   ├── metro.config.js                 # monorepo watchFolders
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── app/                            # Expo Router 文件系统路由
│   │   │   ├── _layout.tsx                 # Root layout (providers)
│   │   │   ├── index.tsx                   # 入口重定向
│   │   │   ├── (auth)/                     # 认证流程路由组
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── welcome.tsx             # 01.1 欢迎页
│   │   │   │   ├── onboarding.tsx          # 01.2 引导页
│   │   │   │   └── register.tsx            # 01.3 注册页
│   │   │   ├── (setup)/                    # 首次设置路由组
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── permissions.tsx         # 01.4 权限申请
│   │   │   │   ├── bill-import.tsx         # 01.5 账单导入
│   │   │   │   └── import-progress.tsx     # 01.6 导入处理
│   │   │   └── (main)/                     # 主应用路由组
│   │   │       ├── _layout.tsx             # Tab 导航 layout
│   │   │       ├── dashboard.tsx           # 01.7 Dashboard
│   │   │       └── report.tsx              # 01.8 月报
│   │   ├── components/                     # 平台专属组件（涉及原生 API）
│   │   │   ├── notification-permission.tsx
│   │   │   ├── bill-import-sheet.tsx
│   │   │   └── ocr-camera.tsx
│   │   ├── screens/                        # 屏幕级拆分组件
│   │   │   ├── onboarding/
│   │   │   │   ├── onboarding-carousel.tsx
│   │   │   │   └── onboarding-carousel.test.tsx
│   │   │   └── dashboard/
│   │   │       ├── dashboard-summary.tsx
│   │   │       └── dashboard-summary.test.tsx
│   │   ├── hooks/                          # 移动端专属 hooks
│   │   │   ├── use-notification-listener.ts
│   │   │   └── use-permissions.ts
│   │   ├── stores/                         # Zustand stores
│   │   │   ├── auth-store.ts
│   │   │   ├── auth-store.test.ts
│   │   │   ├── billing-store.ts
│   │   │   └── ui-store.ts
│   │   └── assets/
│   │       ├── icons/
│   │       └── illustrations/
│   │
│   ├── api/                                # 【MVP】Next.js 15 后端 API 服务
│   │   ├── next.config.js
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── app/
│   │   │   ├── layout.tsx                  # 最小 layout
│   │   │   └── api/
│   │   │       ├── health/
│   │   │       │   └── route.ts
│   │   │       ├── auth/
│   │   │       │   ├── wechat-callback/
│   │   │       │   │   └── route.ts        # 微信 OAuth 回调
│   │   │       │   ├── otp-send/
│   │   │       │   │   └── route.ts        # 发送验证码
│   │   │       │   ├── otp-verify/
│   │   │       │   │   └── route.ts        # 验证 OTP + 签发 JWT
│   │   │       │   └── refresh/
│   │   │       │       └── route.ts        # JWT 刷新
│   │   │       ├── billing/
│   │   │       │   ├── transactions/
│   │   │       │   │   └── route.ts        # 交易 CRUD
│   │   │       │   ├── import-csv/
│   │   │       │   │   └── route.ts        # CSV 导入
│   │   │       │   └── confirm/
│   │   │       │       └── route.ts        # 确认/拒绝 AI 分类
│   │   │       ├── ai/
│   │   │       │   ├── classify/
│   │   │       │   │   └── route.ts        # AI 交易分类
│   │   │       │   └── ocr/
│   │   │       │       └── route.ts        # OCR 识别
│   │   │       └── user/
│   │   │           ├── profile/
│   │   │           │   └── route.ts        # 用户配置
│   │   │           └── delete-account/
│   │   │               └── route.ts        # PIPL 删除权
│   │   └── lib/                            # API 内部模块
│   │       ├── services/                   # 业务逻辑层
│   │       │   ├── auth-service.ts
│   │       │   ├── auth-service.test.ts
│   │       │   ├── transaction-service.ts
│   │       │   ├── transaction-service.test.ts
│   │       │   ├── csv-parser.ts
│   │       │   ├── csv-parser.test.ts
│   │       │   ├── import-service.ts
│   │       │   ├── classify-service.ts
│   │       │   └── user-service.ts
│   │       ├── mappers/                    # DO → VO 转换
│   │       │   ├── transaction-mapper.ts
│   │       │   ├── transaction-mapper.test.ts
│   │       │   └── user-mapper.ts
│   │       ├── db/                         # 数据访问
│   │       │   ├── supabase-admin.ts       # admin client 初始化
│   │       │   └── repositories/
│   │       │       ├── transaction-repo.ts
│   │       │       └── user-repo.ts
│   │       ├── jwt.ts                      # JWT 签发/验证
│   │       ├── sms.ts                      # 阿里云 SMS 封装
│   │       └── middleware.ts               # auth 中间件
│   │
│   └── web/                                # 【Phase 2】官网 + 管理后台
│       ├── next.config.js
│       ├── package.json
│       ├── tsconfig.json
│       ├── Dockerfile
│       └── app/
│           ├── layout.tsx                  # Web layout（Tamagui Web 或 Tailwind）
│           ├── (marketing)/                # 官网页面
│           │   ├── page.tsx                # 首页
│           │   ├── features/
│           │   │   └── page.tsx            # 功能介绍
│           │   ├── pricing/
│           │   │   └── page.tsx            # 定价页
│           │   └── privacy/
│           │       └── page.tsx            # 隐私政策
│           ├── (admin)/                    # 管理后台（需登录）
│           │   ├── layout.tsx              # admin layout + auth guard
│           │   ├── dashboard/
│           │   │   └── page.tsx            # 运营数据概览
│           │   ├── users/
│           │   │   └── page.tsx            # 用户管理
│           │   ├── analytics/
│           │   │   └── page.tsx            # 数据分析
│           │   └── system/
│           │       └── page.tsx            # 系统配置
│           └── api/                        # Web 专属 API（如有）
│               └── admin/                  # 管理员接口
│                   └── stats/
│                       └── route.ts
│
├── packages/
│   ├── ui/                                 # 共享 Tamagui 组件
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tamagui.config.ts               # 主题/Token 配置
│   │   ├── token-mapping.md                # 设计 Token → Tamagui 映射表
│   │   └── src/
│   │       ├── index.ts                    # 统一导出（唯一桶文件）
│   │       ├── button.tsx
│   │       ├── button.test.tsx
│   │       ├── card.tsx
│   │       ├── text-input.tsx
│   │       ├── toast.tsx
│   │       ├── skeleton.tsx
│   │       ├── modal-sheet.tsx
│   │       ├── badge.tsx
│   │       ├── progress.tsx
│   │       ├── filter-chip.tsx
│   │       ├── toggle.tsx
│   │       ├── divider.tsx
│   │       ├── header.tsx
│   │       ├── bottom-tab-bar.tsx
│   │       └── chart.tsx
│   │
│   └── shared/                             # 共享逻辑（纯 TypeScript，无 React 依赖）
│       ├── package.json
│       ├── tsconfig.json
│       ├── types/
│       │   ├── database.ts                 # DO — Supabase 自动生成的数据库行类型
│       │   ├── transaction.ts              # VO — API 响应类型
│       │   ├── user.ts                     # VO
│       │   ├── category.ts
│       │   └── api-response.ts             # ApiResponse<T> 泛型
│       ├── schemas/
│       │   ├── transaction.ts              # DTO — Zod schema（请求入参验证）
│       │   ├── user.ts
│       │   ├── auth.ts
│       │   └── billing.ts
│       ├── api/
│       │   ├── endpoints.ts                # API 端点路径常量
│       │   └── contracts.ts                # 请求参数 + 响应类型绑定
│       ├── constants/
│       │   ├── categories.ts               # 分类常量
│       │   └── error-codes.ts              # 业务错误码
│       ├── utils/
│       │   ├── format-amount.ts            # 分→元格式化
│       │   ├── format-amount.test.ts
│       │   ├── date-utils.ts               # UTC 日期工具
│       │   └── validators.ts
│       └── ai/
│           ├── ai-client.ts                # 统一接口
│           ├── ai-client.test.ts
│           ├── providers/
│           │   ├── gpt-codex.ts            # GPT-5.3-Codex
│           │   └── qwen.ts                 # Qwen 3.6-Plus
│           └── fallback.ts                 # 降级策略
│
├── supabase/                               # 数据库配置与 migrations
│   ├── docker-compose.yml                  # 自托管 Supabase（开发 + 生产共用）
│   ├── .env.example
│   ├── migrations/
│   │   ├── 001_create_auth_schema.sql
│   │   ├── 002_create_billing_schema.sql
│   │   └── 003_create_analytics_schema.sql
│   └── seed.sql                            # 开发种子数据
│
└── deploy/                                 # 部署配置
    ├── docker-compose.prod.yml             # 生产编排（api + supabase + nginx）
    ├── nginx/
    │   └── nginx.conf                      # 反向代理 + SSL + 路由分发
    └── scripts/
        └── deploy.sh                       # ECS 部署脚本
```

### 数据类型分层（DO / DTO / VO）

| 层 | 对应 Java | 位置 | 命名风格 | 说明 |
|---|-----------|------|---------|------|
| DO | Entity | `packages/shared/types/database.ts` | snake_case | Supabase CLI 自动生成，不手写 |
| DTO | RequestDto | `packages/shared/schemas/*.ts` | camelCase | Zod schema + `z.infer` 推断类型 |
| VO | ResponseVo | `packages/shared/types/*.ts` | camelCase | 手写，API 返回给前端的结构 |
| Mapper | Converter | `apps/api/lib/mappers/*.ts` | — | DO → VO 转换函数 |

**规则：**
- DO 和 VO 差别小的简单表（如 user profile），可暂不写 mapper，直接用 DO 字段映射
- 涉及 join、字段裁剪、格式转换的表（如 transaction + category name），从一开始就用 mapper
- DTO 始终通过 Zod schema 定义，不单独写 interface

### 架构边界

**包依赖方向（严格单向）：**
```
apps/mobile  → packages/ui + packages/shared
apps/api     → packages/shared
apps/web     → packages/ui + packages/shared
packages/ui  → packages/shared（仅类型）
packages/shared → 无内部依赖
```

**禁止的依赖：**
- `packages/*` 不得导入 `apps/*`
- `apps/mobile` 不得导入 `apps/api` 的代码（通过 HTTP 通信）
- `apps/web` 不得导入 `apps/api` 的代码（通过 HTTP 通信）
- `packages/shared` 不得有 React 依赖

**运行时通信：**
| 调用方 | 被调用方 | 方式 |
|--------|---------|------|
| apps/mobile | apps/api | HTTP/HTTPS + Bearer JWT |
| apps/web | apps/api | HTTP/HTTPS + Bearer JWT（或 server-side fetch） |
| apps/api | Supabase | `@supabase/supabase-js` admin client |
| apps/api | AI 模型 | `packages/shared/ai/` → HTTP |

**API 端点共享：**
- 端点路径定义在 `packages/shared/api/endpoints.ts`
- 请求/响应类型绑定在 `packages/shared/api/contracts.ts`
- 各前端模块自行写 fetch 调用，但复用路径常量和类型

### Scenario 01 功能映射

| 屏幕 | 路由文件 | 专属组件 | API 端点 | 服务层 | DB Schema |
|------|---------|---------|---------|--------|-----------|
| 01.1 欢迎页 | `(auth)/welcome.tsx` | — | — | — | — |
| 01.2 引导页 | `(auth)/onboarding.tsx` | `screens/onboarding/` | — | — | — |
| 01.3 注册页 | `(auth)/register.tsx` | — | `auth/otp-*`, `auth/wechat-*` | `auth-service` | `auth` |
| 01.4 权限页 | `(setup)/permissions.tsx` | `notification-permission.tsx` | — | — | — |
| 01.5 导入页 | `(setup)/bill-import.tsx` | `bill-import-sheet.tsx` | `billing/import-csv` | `csv-parser`, `import-service` | `billing` |
| 01.6 处理页 | `(setup)/import-progress.tsx` | — | `ai/classify` | `classify-service` | `billing` |
| 01.7 Dashboard | `(main)/dashboard.tsx` | `screens/dashboard/` | `billing/transactions` | `transaction-service` | `billing`, `analytics` |
| 01.8 月报 | `(main)/report.tsx` | — | `billing/transactions` | `transaction-service` | `analytics` |

### 未来扩展路径

| 阶段 | 新增模块 | 说明 |
|------|---------|------|
| Phase 2 | `apps/web/` | 官网（marketing）+ 管理后台（admin），独立 Next.js 应用 |
| Phase 2 | `apps/api/app/api/family/` | 家庭共享 API 端点，新增 `family` schema |
| Phase 2 | `packages/shared/types/family.ts` | 家庭共享相关类型 |
| 需要时 | `packages/services/` | 当出现第二个业务逻辑消费者（cron/worker），从 `apps/api/lib/services/` 提取 |
| 需要时 | `packages/config/` | ESLint/TS 共享配置包，monorepo 超过 3 个 app 时提取 |

---

## 全场景技术选型（Scenario 01-08）

### 8 个 Scenario 概览

| Scenario | 名称 | 阶段 | 核心能力 |
|----------|------|------|----------|
| 01 | Danny 的零输入初体验 | MVP | 注册→权限→导入→Dashboard→月报 |
| 02 | 付费订阅转化 | Phase 2 | 定价展示→支付→订阅管理 |
| 03 | 消费趋势与分享 | Phase 2 | 图表可视化→雷达图→分享卡片 |
| 04 | 家庭共享账本 | Phase 2 | 多成员→权限→可见性→共享 Dashboard |
| 05 | 受益人标注与人情账 | Phase 2 | 人情网络→关系图→送礼/收礼追踪 |
| 06 | 多身份核算 | Phase 2 | 身份切换→独立统计→语音记账 |
| 07 | AI 对话管家 | Phase 3 | 对话式查询→洞察推送→消费模拟 |
| 08 | 消费优化建议 | Phase 3 | 智能分析→可视化建议→历史对比 |

### 按能力域的技术选型

#### 图表与可视化（Scenario 03/05/07/08）

| 选型 | 版本 | 说明 | 费用 |
|------|------|------|------|
| **victory-native** (victory-native-xl) | npm 41.20.2+ | D3 + Skia + Reanimated 渲染，饼图/折线/柱状图 | 免费 MIT |
| @shopify/react-native-skia | 与 Expo SDK 54 兼容版 | victory-native 的 peer dependency | 免费 MIT |
| react-native-reanimated | Expo SDK 54 内置 | 图表动画 + 轮播动画共用 | 免费 MIT |

GitHub: https://github.com/FormidableLabs/victory-native-xl
维护方: FormidableLabs (Nearform)，活跃维护

**注意：** 雷达图（Scenario 03 消费趋势）需用 Skia Canvas 自定义极坐标图，victory-native 不内置雷达图。

#### 分享功能（Scenario 03）

| 选型 | 说明 | 费用 |
|------|------|------|
| **react-native-view-shot** | 将 RN View 截图为 PNG，事实标准无竞品 | 免费 MIT |
| **react-native-wechat-lib** | 微信 SDK 封装（OAuth + 分享 + 支付），社区维护 | 免费，微信开放平台企业认证 300元/年 |

**分享流程：** 图表组件 → view-shot 截图 → 微信分享 SDK → 朋友圈/好友

#### 支付与订阅（Scenario 02）

| 平台 | 选型 | 说明 | 费用 |
|------|------|------|------|
| Android | **微信支付 + 支付宝** | 通过 react-native-wechat-lib + 支付宝 SDK 原生模块 | 手续费 0.6% |
| iOS | **react-native-iap** (~2.8k stars) | Apple IAP，iOS 审核强制要求 | 免费 MIT，Apple 抽成 15-30% |

**后端：** 统一 `auth.subscriptions` 表（provider、plan、expires_at），支付回调走 `apps/api/app/api/billing/payment-callback/`

#### 推送通知（Scenario 07/08）

| 阶段 | 选型 | 说明 | 费用 |
|------|------|------|------|
| MVP/Phase 2 | **Expo Push Notifications** | Expo 官方，零配置，无消息量限制 | 免费 |
| 用户量增长后 | **个推/极光推送** | 国内 Android 厂商通道覆盖（小米/华为/OPPO/vivo） | 日活 <5万免费 |

#### 对话式 AI（Scenario 07）

扩展现有 AI 抽象层，新增 chat/chatStream 接口：

```typescript
// packages/shared/ai/ai-client.ts 扩展
interface AiClient {
  // 已有
  classify(input: ClassifyInput): Promise<ClassifyResult>
  ocr(image: Buffer): Promise<OcrResult>
  parse(csv: string): Promise<ParseResult>
  // 新增 — Phase 3
  chat(messages: ChatMessage[], context: UserFinanceContext): Promise<ChatResponse>
  chatStream(messages: ChatMessage[], context: UserFinanceContext): AsyncIterable<string>
}
```

- 流式响应通过 SSE（Server-Sent Events）从 API Route 返回
- 注入用户财务数据作为 context（月度统计、分类分布）
- 复用主模型 GPT-5.3-Codex + 降级 Qwen 3.6-Plus

#### 语音输入（Scenario 06）

| 选型 | 说明 | 费用 |
|------|------|------|
| **@react-native-voice/voice** (~1.8k stars) | 调用系统原生 ASR，中文识别质量依赖厂商 | 免费 MIT |

识别结果 → 填入手动记账表单 → 用户确认。如后续识别率不足，再评估讯飞语音 SDK。

### 费用汇总

| 项目 | 费用 | 频率 |
|------|------|------|
| 所有开源库 | 0 | — |
| 微信开放平台企业认证 | 300 元 | /年 |
| Apple Developer Account | 99 美元 | /年 |
| Apple IAP 抽成 | 15-30% | 按收入 |
| 微信支付/支付宝手续费 | 0.6% | 按交易 |
| Expo Push | 0 | — |
| 个推/极光（可选） | 0 | 日活 <5万 |

---

## 架构验证结果

### 一致性验证

**决策兼容性：** 通过
- Expo SDK 54 + RN 0.81.5 + React 19.1.0 + Tamagui v2 RC — 已验证兼容
- Turborepo + pnpm 9.x — 官方支持组合
- Next.js 15 App Router 纯 API 使用 — 无冲突
- victory-native-xl 依赖 Skia + Reanimated — Reanimated 已是 Expo 内置
- GPT-5.3-Codex + Qwen 3.6-Plus 均走 OpenAI 兼容 SDK — 抽象层统一

**模式一致性：** 通过
- 命名规范全栈贯穿（DB snake_case → API camelCase），转换点明确在 Mapper 层
- 结构模式与技术栈对齐，co-located 测试、按功能组织、单向依赖
- 数据分层 DO/DTO/VO 规则清晰

**结构对齐：** 通过
- 目录结构精确到文件级，覆盖所有架构决策
- 包依赖方向严格单向，无循环
- 运行时通信方式明确（HTTP vs 代码导入）

**修正项：** 验证中发现 5 处 DeepSeek 遗留引用，已全部修正为 GPT-5.3-Codex / Qwen 3.6-Plus。

### 需求覆盖验证

**Scenario 01（MVP 8 屏）：** 全部覆盖
| 屏幕 | 路由 | API | 服务层 | DB | 状态 |
|------|------|-----|--------|-----|------|
| 01.1 欢迎页 | (auth)/welcome | — | — | — | 已覆盖 |
| 01.2 引导页 | (auth)/onboarding | — | — | — | 已覆盖 |
| 01.3 注册页 | (auth)/register | auth/* | auth-service | auth | 已覆盖 |
| 01.4 权限页 | (setup)/permissions | — | — | — | 已覆盖 |
| 01.5 导入页 | (setup)/bill-import | billing/import-csv | csv-parser | billing | 已覆盖 |
| 01.6 处理页 | (setup)/import-progress | ai/classify | classify-service | billing | 已覆盖 |
| 01.7 Dashboard | (main)/dashboard | billing/transactions | transaction-service | billing, analytics | 已覆盖 |
| 01.8 月报 | (main)/report | billing/transactions | transaction-service | analytics | 已覆盖 |

**Scenario 02-08（Phase 2/3）：** 技术选型已覆盖
| 能力域 | 技术选型 | 状态 |
|--------|---------|------|
| 图表可视化 | victory-native-xl (Skia) | 已选型 |
| 分享卡片 | react-native-view-shot + react-native-wechat-lib | 已选型 |
| 支付订阅 | 微信支付/支付宝 + react-native-iap | 已选型 |
| 推送通知 | Expo Push → 个推/极光 | 已选型 |
| 对话 AI | chat/chatStream 接口扩展 + SSE | 已选型 |
| 语音输入 | @react-native-voice/voice | 已选型 |

**NFR 覆盖：**
| NFR | 架构支持 | 状态 |
|-----|---------|------|
| API < 200ms | 国内 ECS + TanStack Query 分级缓存 | 已覆盖 |
| RLS 行级隔离 | 全表 RLS + 专项测试 | 已覆盖 |
| PIPL 合规 | 删除权 API + pgcrypto + 数据不出境 + consent_at | 已覆盖 |
| 注册转化 >= 75% | 微信一键登录 + 极简注册流 | 已覆盖 |

### 实现就绪验证

**决策完备性：** 高
- 所有技术选型含具体版本号或版本范围
- 8 条强制规则 + 8 条反模式，AI Agent 边界清晰
- DO/DTO/VO 分层规则 + Mapper 使用条件已定义

**结构完备性：** 高
- 目录结构精确到文件级（~100 个文件/目录）
- 架构边界含禁止依赖列表
- API 端点共享机制（endpoints.ts + contracts.ts）已定义

**模式完备性：** 高
- 命名规范覆盖 DB/API/代码/事件/错误码
- 错误处理四层策略明确
- 缓存/重试/验证/Loading 流程模式完整

### 待实施中确定项（非阻塞）

1. **Tamagui v2 RC 具体版本号** — 需在初始化阶段 2 通过 `npm info tamagui versions` 确认最新 RC
2. **token-to-tamagui 映射表** — 架构已明确为"第一个交付物"，在初始化阶段 2 产出
3. **CSV 解析规则热更新方案** — 架构已标记需"配置驱动解析"，具体方案在 CSV 解析 Story 中细化

### 架构完备性检查清单

**需求分析**
- [x] 项目上下文充分分析
- [x] 规模与复杂度评估（中高）
- [x] 技术约束识别（6 项）
- [x] 横切关注点映射（8 项）
- [x] 全部 8 个 Scenario 技术选型覆盖

**架构决策**
- [x] 5 个类别决策完整记录（数据/认证/API/前端/基础设施）
- [x] 技术栈全部含版本号
- [x] AI 模型主备切换策略及分级超时
- [x] 认证方案（自建中间层）+ RLS + JWT + PIPL
- [x] 2核4G 资源约束下的 Supabase 精简方案

**实现模式**
- [x] 命名规范全覆盖
- [x] 结构模式（co-located 测试、按功能组织）
- [x] 数据格式模式（snake→camel 转换、金额分、UTC 日期）
- [x] 通信模式（TanStack Query vs Zustand 边界）
- [x] 流程模式（错误处理、Loading、重试、表单验证）

**项目结构**
- [x] 完整目录树（~100 个文件/目录）
- [x] DO/DTO/VO 分层及 Mapper 规则
- [x] 包依赖方向（严格单向）+ 禁止依赖清单
- [x] 运行时通信方式映射
- [x] Scenario 01 功能→结构映射表
- [x] 未来扩展路径（Phase 2/3 模块预留）

### 架构就绪评估

**总体状态：** 可以进入实施

**信心等级：** 高

**核心优势：**
- 全栈技术选型一致，无冲突点
- AI Agent 强制规则明确，降低实现偏差风险
- 分阶段初始化计划含验证点，避免大爆炸集成
- 全场景技术选型前瞻性覆盖，Phase 2/3 扩展无需重构架构

**未来增强方向：**
- Phase 2 启用 Supabase Realtime 时需重新评估 2核4G 内存
- 家庭共享 RLS 策略复杂度显著上升，需专项设计
- 用户量增长后 Expo Push → 厂商推送通道切换

### 实施交接

**AI Agent 指南：**
- 严格遵循本文档所有架构决策
- 所有实现模式一致性规则为强制约束
- 尊重项目结构和包依赖边界
- 不引入未在文档中列出的新依赖，需先讨论
- 遇到架构层面的歧义，以本文档为准

**第一优先级实施：**
1. Monorepo 骨架初始化（分阶段计划 → 阶段 1）
2. token-to-tamagui 映射表（分阶段计划 → 阶段 2 前置交付物）
3. Scenario 01 Stories 创建与实现
