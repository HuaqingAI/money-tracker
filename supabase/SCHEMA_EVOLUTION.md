# Schema 演化计划

本文档记录 `money-tracker` 数据库 schema 的当前状态与未来演化路径。MVP 之后的
schema 变更必须通过新的 migration 文件追加，**禁止修改已应用到生产的历史 migration**。

## 当前状态（Story 0.3 — MVP 基线）

| Schema | 表 | 说明 |
|--------|----|------|
| `auth`     | `user_profiles`, `subscriptions` | GoTrue 内置 `auth.users` + 本项目自定义扩展 |
| `billing`  | `transactions`, `categories`, `category_rules`, `csv_parse_rules` | 交易核心、分类、AI 分类规则、CSV 热更新规则 |
| `analytics`| `monthly_summaries` | 月度预聚合数据 |

## Phase 2 演化路径

| 阶段 | Epic / Story | 新增 schema / 表 | 说明 |
|------|--------------|-----------------|------|
| Phase 2 | E3 Story 3.2（家庭账本） | 新建 `family` schema；`family.ledgers`, `family.members`, `family.memberships` | 家庭共享账本需多用户可见性控制 |
| Phase 2 | E3 Story 3.2 | `billing.transactions.ledger_id`, `billing.transactions.visibility` | 共享账本可见性字段；新增 RLS 策略跨表联查 |
| Phase 2 | E5 Story 5.1（人情账） | `billing.gift_events`, `billing.gift_records`, `billing.gift_relationships` | 人情往来网络 |
| Phase 2 | E6 Story 6.1（多身份核算） | `billing.identities`, `billing.transactions.identity_id` | 身份切换与独立核算 |

## Phase 3 演化路径

| 阶段 | Epic / Story | 新增 schema / 表 | 说明 |
|------|--------------|-----------------|------|
| Phase 3 | E7（AI 管家） | `analytics.insights`, `analytics.conversations` | 对话历史与洞察推送 |
| Phase 3 | E7 Story 7.4 | `analytics.simulations` | 消费模拟结果持久化 |

## Migration 规则

1. 文件命名：`{三位序号}_{snake_case_description}.sql`（如 `007_add_family_schema.sql`）
2. 所有新表必须 `ENABLE ROW LEVEL SECURITY` 并至少一条策略
3. RLS 策略统一使用 `(select auth.uid())` 包裹（查询计划缓存优化）
4. 所有含 `user_id` 字段的表必须为 `user_id` 建索引
5. 敏感字段（含 PII）类型为 `bytea`，应用层用 `pgp_sym_encrypt` 加密
6. 破坏性变更（drop/rename 列）需提供双写迁移路径，避免停机

## 加密密钥轮换

`ENCRYPTION_KEY` 轮换时必须同时重新加密历史行：

```sql
-- 伪代码：使用新旧双密钥解密再加密
update auth.user_profiles
   set phone_number = pgp_sym_encrypt(
         pgp_sym_decrypt(phone_number, :old_key),
         :new_key, 'cipher-algo=aes256')
 where phone_number is not null;
```

执行前须备份数据库。
