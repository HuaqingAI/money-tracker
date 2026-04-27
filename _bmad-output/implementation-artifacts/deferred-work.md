# Deferred Work

Items deferred during development or code review. Track here so they surface in future sprints.

## Deferred from: code review of 0-3-database-schema-and-auth-baseline (2026-04-20)

- **wechat_unionid / wechat_openid 无确定性哈希列** — `pgp_sym_encrypt` 每次生成不同密文，无法在加密 bytea 上建唯一约束。MVP 单用户场景不受影响；Phase 2 家庭账本或多身份核算前须引入 `hmac(value, key)` 哈希列作为唯一性锚。
- **seed.sql 硬编码 dev 加密密钥** — 文件已声明 `do-not-use-in-prod`；生产部署时应通过环境变量/不挂载 seed 来规避。未来引入集成测试时改为 `SET LOCAL` 读取 `current_setting('app.encryption_key')`。
- **Supabase admin client singleton 测试环境 env 变更不失效** — `cached` 为模块级变量，测试间切换 `SUPABASE_URL` 无法重建。Story 0.4 引入测试框架后增加 `__resetSupabaseAdmin()` 或等价的测试钩子。
- **Task 5.3 连接验证脚本未实现** — 端到端 CRUD 验证依赖本地 Supabase docker 栈 + 测试 runner，推迟到 Story 0.4 测试框架落地后实现。
- **`database.ts` 手写未 CLI 生成** — 已补充 `pnpm db:types` 生成路径；若未来 schema 再变更，需在本地 slim stack 启动后重新执行该命令刷新类型。

## Deferred from: code review of story-0-4-dev-toolchain-and-quality-gates (2026-04-21)

- Expo mobile build on Windows fails during `expo export` because `react-native/sdks/hermesc/win64-bin/hermesc.exe` is missing (`ENOENT`). Treat as infrastructure/environment follow-up for Expo SDK 54 + React Native 0.81 + pnpm on Win64 rather than a code defect in Story 0.4.

## Deferred from: post-review of story-1-8-basic-account-and-pipl-compliance (2026-04-26)

- **认证来源统一需要上层架构决策** - Story 1.2 已实现应用自签 JWT，Story 1.8 初版仍按 Supabase Auth token 假设 profile API。当前已兼容 app JWT + Supabase fallback，但后续 story 应在 architecture/auth 章节明确“移动端业务 API 使用哪种 token、服务端如何验签、何时落 Supabase Auth”。
- **头像长期持久化仍需 Supabase Storage 能力** - 当前资料页使用系统图片选择器，并允许 `file://` / `content://` URI 作为 MVP 本机会话展示与保存输入；跨设备、重装后恢复、CDN 访问应在后续 story 实现上传、访问控制、删除账户时清理 Storage object。
- **高保真原型字段必须进入 story AC/数据模型审查** - Story 1.8 的 AC2 只写昵称/头像，但原型还有性别/生日，导致初版 review 未要求落库。后续 story review 前应增加“原型字段逐项映射到 AC、schema、API payload、UI 状态”的检查项。
- **真机验收路径需要纳入移动端 Definition of Done** - 本次资料保存失败包含 Expo 真机访问 `localhost` 的环境问题。移动端 story 的 DoD 应包含至少一次真机或等效网络路径验证，覆盖登录后业务 API 保存类操作。

## Deferred from: code review of story-1-7-monthly-report (2026-04-27)

- **月报实时口径是否纳入待确认账单** - 虽然未确认分类，但它仍是真实消费；如果不展示在报表里，用户会以为报表丢失了这部分消费。后续需要单独设计 pending 账单在月报中的呈现形式与对比口径。
