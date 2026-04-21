# Story 0.3: 数据库 Schema 与认证基础

Status: review

## Story

As a 开发者,
I want 自托管 Supabase 正确运行且核心数据库 Schema 就绪,
So that 后续 Epic 的数据存储、认证和 RLS 安全策略有可靠基础。

## 前置依赖

**Story 0.1（Monorepo 骨架）和 Story 0.2（UI 设计系统）已完成（review 状态）。** 本 Story 基于已就绪的基础结构实施：
- `apps/api/` Next.js 15 + `@money-tracker/shared` workspace 依赖已配置
- `packages/shared/types/` 目录存在（当前仅含 `api-response.ts`）
- 本 Story 新增：`supabase/` 目录、`apps/api/lib/db/supabase-admin.ts`、`packages/shared/types/database.ts`
- 需向 `apps/api/package.json` 添加 `@supabase/supabase-js` 依赖

## Acceptance Criteria

### AC1: Supabase Docker Compose 精简版启动

**Given** 一台开发机器
**When** 在 `supabase/` 目录执行 `docker-compose up`
**Then** Supabase 精简版成功启动（PostgreSQL + GoTrue + PostgREST + Kong）
**And** Realtime 和 Storage 组件已禁用（从 docker-compose.yml 中移除对应 service 块）
**And** 总内存占用 <= 1.2GB

### AC2: 三域 Schema Migration

**Given** Supabase 已启动
**When** 执行 migration 脚本
**Then** `auth` schema 创建成功：
- `users` 表：id (UUID PK), wechat_unionid (bytea, 应用层加密), wechat_openid (bytea), phone_number (bytea, 应用层加密), nickname (text), avatar_url (text), consent_at (timestamptz NOT NULL), created_at (timestamptz), updated_at (timestamptz)
- `subscriptions` 表：id (UUID PK), user_id (UUID FK → auth.users), provider (text), plan (text), expires_at (timestamptz), created_at (timestamptz)，启用 RLS

**And** `billing` schema 创建成功：
- `transactions` 表：id (UUID PK), user_id (UUID FK), amount_cents (INTEGER NOT NULL), status (text CHECK: 'pending_confirmation'/'confirmed'/'rejected'), category_id (UUID FK → billing.categories), source (text), merchant (text), description (text), transaction_at (timestamptz), created_at (timestamptz), updated_at (timestamptz)
- `categories` 表：id (UUID PK), name (text NOT NULL), icon (text), sort_order (integer), is_system (boolean DEFAULT true), user_id (UUID, NULL for system categories), created_at (timestamptz)
- `category_rules` 表：id (UUID PK), keyword (text NOT NULL), category_id (UUID FK), user_id (UUID FK), hit_count (integer DEFAULT 0), source (text CHECK: 'ai'/'user'), created_at (timestamptz)
- `csv_parse_rules` 表：id (UUID PK), platform (text NOT NULL), version (text), rule_config (JSONB NOT NULL), is_active (boolean DEFAULT true), created_at (timestamptz), updated_at (timestamptz)

**And** `analytics` schema 创建成功：
- `monthly_summaries` 表：id (UUID PK), user_id (UUID FK), month (date NOT NULL), total_cents (integer), category_breakdown (JSONB), created_at (timestamptz), updated_at (timestamptz)
- UNIQUE constraint on (user_id, month)

**And** 所有表名 snake_case 复数，列名 snake_case
**And** 所有外键遵循 `{referenced_table_singular}_id` 命名
**And** 所有 UUID PK 使用 `gen_random_uuid()` 默认值
**And** 所有表包含 `created_at DEFAULT now()` 时间戳

### AC3: RLS 策略

**Given** Schema 已创建
**When** 检查 RLS 策略
**Then** 所有表已启用 `ROW LEVEL SECURITY`
**And** 每张含 user_id 的表至少有一条 `(select auth.uid()) = user_id` 基础隔离策略（SELECT/INSERT/UPDATE/DELETE）
**And** `billing.categories` 的 is_system=true 行对所有 authenticated 用户可读
**And** `billing.csv_parse_rules` 对 service_role 可读写（管理员热更新）
**And** JWT secret 与 GoTrue `.env` 配置一致（验证 RLS 不静默失败）
**And** RLS 策略使用 `(select auth.uid())` 而非 `auth.uid()` 以启用查询计划缓存

### AC4: PIPL 合规与加密

**Given** PIPL 合规要求
**When** 检查数据库配置
**Then** `pgcrypto` 扩展已启用
**And** 敏感字段（phone_number, wechat_unionid, wechat_openid）类型为 `bytea`
**And** 加密策略文档化：应用层使用 `pgp_sym_encrypt`/`pgp_sym_decrypt` + AES-256 加密，加密密钥通过环境变量管理，不存储在数据库中
**And** 加密字段不建 DB 索引，使用 user_id 作为查找键
**And** 种子数据（`seed.sql`）包含测试用户（含加密字段示例）和示例交易数据

### AC5: Supabase Admin Client 与类型生成

**Given** Schema 已创建
**When** 在 apps/api 中初始化 Supabase admin client
**Then** 连接成功，可执行 CRUD 操作
**And** `packages/shared/types/database.ts` 由 `npx supabase gen types typescript --local` 自动生成 DO 类型（snake_case）
**And** admin client 使用 `SUPABASE_SERVICE_ROLE_KEY`，配置 `autoRefreshToken: false, persistSession: false`

### AC6: Schema 演化文档

**Given** Schema 已创建
**When** 检查文档
**Then** Schema 演化计划已文档化在 `supabase/SCHEMA_EVOLUTION.md`：
- Phase 2: `family` schema（E3 Story 3.2 创建）
- Phase 2: `billing.gift_*` 表（E5 Story 5.1 创建）
- Phase 2: `billing.identities` 表 + transactions.identity_id（E6 Story 6.1 创建）

## Tasks / Subtasks

- [ ] Task 1: Supabase Docker Compose 配置 (AC: #1)
  - [ ] 1.1 创建 `supabase/` 目录结构
  - [ ] 1.2 基于官方 Supabase docker 模板创建 `docker-compose.yml`，保留 PostgreSQL + GoTrue + PostgREST + Kong
  - [ ] 1.3 移除 Realtime、Storage、imgproxy、Edge Runtime service 块及相关 depends_on
  - [ ] 1.4 创建 `.env.example` 包含所有必需环境变量（POSTGRES_PASSWORD, JWT_SECRET, ANON_KEY, SERVICE_ROLE_KEY 等）
  - [ ] 1.5 验证精简版启动成功，内存 <= 1.2GB

- [ ] Task 2: 数据库 Migration 脚本 (AC: #2)
  - [ ] 2.1 创建 `supabase/migrations/001_enable_extensions.sql` — 启用 pgcrypto, uuid-ossp
  - [ ] 2.2 创建 `supabase/migrations/002_create_auth_schema.sql` — auth.users + auth.subscriptions
  - [ ] 2.3 创建 `supabase/migrations/003_create_billing_schema.sql` — billing.transactions + billing.categories + billing.category_rules + billing.csv_parse_rules
  - [ ] 2.4 创建 `supabase/migrations/004_create_analytics_schema.sql` — analytics.monthly_summaries
  - [ ] 2.5 创建索引：idx_transactions_user_id, idx_transactions_category_id, idx_transactions_status, idx_category_rules_user_id, idx_monthly_summaries_user_id_month

- [ ] Task 3: RLS 策略配置 (AC: #3)
  - [ ] 3.1 创建 `supabase/migrations/005_enable_rls.sql` — 所有表启用 RLS
  - [ ] 3.2 创建 `supabase/migrations/006_create_rls_policies.sql` — 所有含 user_id 表的 CRUD 策略
  - [ ] 3.3 categories 表：系统分类（is_system=true）对 authenticated 可读；用户自定义分类按 user_id 隔离
  - [ ] 3.4 csv_parse_rules 表：service_role 可读写策略
  - [ ] 3.5 验证 JWT secret 配置一致性

- [ ] Task 4: 种子数据与加密验证 (AC: #4)
  - [ ] 4.1 创建 `supabase/seed.sql` — 测试用户（含 pgp_sym_encrypt 加密的手机号和微信 unionid）
  - [ ] 4.2 插入系统预设分类（餐饮、交通、购物、住房、娱乐、医疗、教育、生活服务、转账、其他）
  - [ ] 4.3 插入示例交易数据（覆盖三种 status）
  - [ ] 4.4 验证 pgp_sym_decrypt 能正确解密种子数据

- [ ] Task 5: Supabase Admin Client (AC: #5)
  - [ ] 5.1 创建 `apps/api/lib/db/supabase-admin.ts` — admin client 初始化（最小化实现）
  - [ ] 5.2 运行 `pnpm db:types`（内部使用 `supabase gen types typescript --db-url ...`）生成 `packages/shared/types/database.ts`
  - [ ] 5.3 创建连接验证脚本或测试确认 CRUD 操作正常

- [ ] Task 6: 文档与演化计划 (AC: #6)
  - [ ] 6.1 创建 `supabase/SCHEMA_EVOLUTION.md` 文档化未来 Schema 变更计划
  - [ ] 6.2 在 `.env.example` 中注释说明每个环境变量的用途和安全要求

### Review Findings

- [x] [Review][Patch] Seed 执行早于 Migration — docker-compose 路径排序缺陷 [supabase/docker-compose.yml:27]
- [x] [Review][Patch] PostgREST `authenticator` 角色未创建且共用 POSTGRES_PASSWORD [supabase/docker-compose.yml:63]
- [x] [Review][Patch] PGRST_DB_SCHEMAS 缺 billing/analytics，多出不存在的 storage/graphql_public [supabase/docker-compose.yml:62]
- [x] [Review][Patch] `auth.subscriptions` 缺 INSERT/UPDATE/DELETE 策略 [supabase/migrations/006_create_rls_policies.sql:27]
- [x] [Review][Patch] `category_rules(user_id, keyword)` 无唯一约束 [supabase/migrations/003_create_billing_schema.sql:44]
- [x] [Review][Patch] `csv_parse_rules(platform, version)` 无唯一约束 [supabase/migrations/003_create_billing_schema.sql:58]
- [x] [Review][Patch] Kong `depends_on` 未等待 auth/rest healthy [supabase/docker-compose.yml:70]
- [x] [Review][Patch] `amount_cents INTEGER` 32-bit 溢出风险 → BIGINT [supabase/migrations/003_create_billing_schema.sql:26]
- [x] [Review][Patch] `total_cents INTEGER` 同样溢出 → BIGINT [supabase/migrations/004_create_analytics_schema.sql:6]
- [x] [Review][Patch] Kong 全局加载 `key-auth,acl` 但未使用 [supabase/docker-compose.yml:77]
- [x] [Review][Patch] `transactions.category_id` FK 无 ON DELETE SET NULL [supabase/migrations/003_create_billing_schema.sql:27]
- [x] [Review][Patch] `updated_at` 无 BEFORE UPDATE 触发器 [supabase/migrations/001-004]
- [x] [Review][Patch] `category_rules` INSERT 策略未校验 category_id 归属 [supabase/migrations/006_create_rls_policies.sql:80]
- [x] [Review][Patch] `csv_parse_rules` 缺写入策略 [supabase/migrations/006_create_rls_policies.sql:91]
- [x] [Review][Patch] `analytics.monthly_summaries` 缺写入策略 [supabase/migrations/006_create_rls_policies.sql:100]
- [x] [Review][Patch] `detectSessionInUrl` 未显式设为 false [apps/api/lib/db/supabase-admin.ts:32]
- [x] [Review][Patch] GoTrue 启用注册但无 SMTP → 本地设 GOTRUE_MAILER_AUTOCONFIRM=true [supabase/docker-compose.yml:47]
- [x] [Review][Defer] wechat_unionid/openid 无确定性哈希列 — MVP 未要求去重，Phase 2 家庭账本前再评估
- [x] [Review][Defer] seed.sql 硬编码 dev 加密密钥 [supabase/seed.sql:32] — 已附警示注释，仅本地 dev
- [x] [Review][Defer] Singleton 测试环境 env 变更不失效 [apps/api/lib/db/supabase-admin.ts:17] — 等 Story 0.4 测试框架引入后再处理
- [x] [Review][Defer] Task 5.3 连接验证脚本缺失 — 推迟到 Story 0.4 测试框架
- [x] [Review][Defer] `database.ts` 手写非 CLI 生成 — 文件头已声明为 baseline，本地 stack 启动后替换

## Dev Notes

### 架构约束

- **数据库命名**：表名 snake_case 复数，列名 snake_case，外键 `{referenced_table_singular}_id`，索引 `idx_{table}_{columns}`
- **Schema 按领域**：`auth`（用户/认证）、`billing`（交易/账单/分类）、`analytics`（月报/趋势）
- **金额存储**：`amount_cents INTEGER`，全栈整数分存储，字段名必须含 `cents` 后缀
- **交易三态**：`pending_confirmation` / `confirmed` / `rejected`
- **TypeScript strict mode**：禁止 `any`
- **数据分层**：DO（Supabase 自动生成 snake_case） → Mapper → VO（camelCase）

### Supabase 自托管关键配置

- **JWT Secret 一致性**：GoTrue 的 `GOTRUE_JWT_SECRET` 必须与 PostgREST 的 `PGRST_JWT_SECRET` 以及 `.env` 中的 `JWT_SECRET` 完全一致。不一致会导致 RLS 静默失败（已知高耗时坑）
- **ANON_KEY 和 SERVICE_ROLE_KEY**：是使用 JWT_SECRET 签名的预签 JWT，role claim 分别为 `anon` 和 `service_role`。可用 https://supabase.com/docs/guides/self-hosting#api-keys 的工具生成
- **2核4G 内存约束**：精简后 Supabase 约 1.1GB（PostgreSQL ~800MB + GoTrue ~100MB + PostgREST ~50MB + Kong ~150MB），剩余给 Next.js + Nginx + 系统

### RLS 性能优化

- 策略中使用 `(select auth.uid())` 包裹，而非直接调用 `auth.uid()`，启用查询计划缓存（性能提升 94-99%）
- 为所有 RLS 策略引用的列建索引（user_id 等）
- 策略指定 `TO authenticated` / `TO anon`，避免不必要的策略评估

### 加密实现细节

- 敏感字段类型为 `bytea`（存储加密后的二进制数据）
- 使用 `pgp_sym_encrypt(plaintext, key, 'cipher-algo=aes256')` 加密
- 使用 `pgp_sym_decrypt(ciphertext, key)` 解密
- 加密密钥通过 `ENCRYPTION_KEY` 环境变量传入应用层（`auth-service.ts`），不存于数据库
- 加密字段不建索引，通过 user_id（明文 UUID）关联查询

### Admin Client 配置

```typescript
// apps/api/lib/db/supabase-admin.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@money-tracker/shared/types/database'

export const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
```

### 系统预设分类清单

| 名称 | icon | sort_order |
|------|------|-----------|
| 餐饮 | utensils | 1 |
| 交通 | car | 2 |
| 购物 | shopping-bag | 3 |
| 住房 | home | 4 |
| 娱乐 | gamepad | 5 |
| 医疗 | heart-pulse | 6 |
| 教育 | book-open | 7 |
| 生活服务 | wrench | 8 |
| 转账 | arrow-left-right | 9 |
| 其他 | more-horizontal | 10 |

### Project Structure Notes

本 Story 创建/修改的文件与架构文档对齐：

```
supabase/
  docker-compose.yml          # 精简版（移除 Realtime/Storage）
  .env.example                # 环境变量模板
  migrations/
    001_enable_extensions.sql
    002_create_auth_schema.sql
    003_create_billing_schema.sql
    004_create_analytics_schema.sql
    005_enable_rls.sql
    006_create_rls_policies.sql
  seed.sql                    # 开发种子数据
  SCHEMA_EVOLUTION.md         # 演化计划文档

apps/api/lib/db/
  supabase-admin.ts           # admin client（最小化）

packages/shared/types/
  database.ts                 # Supabase CLI 自动生成
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#类别1-数据架构] — Schema 组织、交易三态、数据验证
- [Source: _bmad-output/planning-artifacts/architecture.md#类别2-认证与安全] — RLS 策略、JWT 管理、PIPL 合规
- [Source: _bmad-output/planning-artifacts/architecture.md#类别5-基础设施与部署] — Supabase Docker 精简方案、内存约束
- [Source: _bmad-output/planning-artifacts/architecture.md#实现模式与一致性规则] — 命名规范、强制规则
- [Source: _bmad-output/planning-artifacts/epics.md#Story0.3] — 原始 AC 定义

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- Story 0.1（Monorepo 骨架）和 0.2（UI 设计系统）尚未实施，apps/api 和 packages/shared 目录不存在。本 Story 需要创建最小化的目录结构以满足 AC5
- Supabase 2026 版本已支持 ES256 非对称 JWT，但为简化 MVP 实施，保持 HS256 对称密钥方案
- auth schema 中的 users 表需注意与 Supabase GoTrue 内置 auth.users 表的关系 -- 建议使用 public schema 的 profiles 表扩展，或在自定义 auth schema 中创建独立于 GoTrue 内置表的用户扩展表
- csv_parse_rules 的 rule_config JSONB 结构待 CSV 导入 Story（E1）细化
- 系统预设分类清单基于中国消费者常见场景，可在后续迭代调整

### File List

- supabase/docker-compose.yml
- supabase/.env.example
- supabase/migrations/001_enable_extensions.sql
- supabase/migrations/002_create_auth_schema.sql
- supabase/migrations/003_create_billing_schema.sql
- supabase/migrations/004_create_analytics_schema.sql
- supabase/migrations/005_enable_rls.sql
- supabase/migrations/006_create_rls_policies.sql
- supabase/seed.sql
- supabase/SCHEMA_EVOLUTION.md
- apps/api/lib/db/supabase-admin.ts
- packages/shared/types/database.ts
