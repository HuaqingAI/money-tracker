# Deferred Work

Items deferred during development or code review. Track here so they surface in future sprints.

## Deferred from: code review of 0-3-database-schema-and-auth-baseline (2026-04-20)

- **wechat_unionid / wechat_openid 无确定性哈希列** — `pgp_sym_encrypt` 每次生成不同密文，无法在加密 bytea 上建唯一约束。MVP 单用户场景不受影响；Phase 2 家庭账本或多身份核算前须引入 `hmac(value, key)` 哈希列作为唯一性锚。
- **seed.sql 硬编码 dev 加密密钥** — 文件已声明 `do-not-use-in-prod`；生产部署时应通过环境变量/不挂载 seed 来规避。未来引入集成测试时改为 `SET LOCAL` 读取 `current_setting('app.encryption_key')`。
- **Supabase admin client singleton 测试环境 env 变更不失效** — `cached` 为模块级变量，测试间切换 `SUPABASE_URL` 无法重建。Story 0.4 引入测试框架后增加 `__resetSupabaseAdmin()` 或等价的测试钩子。
- **Task 5.3 连接验证脚本未实现** — 端到端 CRUD 验证依赖本地 Supabase docker 栈 + 测试 runner，推迟到 Story 0.4 测试框架落地后实现。
- **`database.ts` 手写未 CLI 生成** — 已补充 `pnpm db:types` 生成路径；若未来 schema 再变更，需在本地 slim stack 启动后重新执行该命令刷新类型。
