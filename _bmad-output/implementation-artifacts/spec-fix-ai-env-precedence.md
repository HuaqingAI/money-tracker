---
title: 'Fix AI env precedence'
type: 'bugfix'
created: '2026-05-11'
status: 'done'
baseline_commit: '5b69d4c2ebc56f642d250104e41a87fbb7600a3e'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/1-5-ai-classification-and-confirmation.md'
---

<frozen-after-approval reason="human-owned intent - do not modify unless human renegotiates">

## Intent

**Problem:** 本地 `.env.local` 已配置 `AI_PRIMARY_API_KEY` 和 `AI_PRIMARY_BASE_URL`，但 AI 分类仍可能返回 401。原因是分类服务优先读取通用 `OPENAI_*` 环境变量，且根 env 加载脚本不会覆盖已有进程环境，导致机器上的旧全局 OpenAI 配置遮蔽项目专用配置。

**Approach:** 后端 AI 分类默认客户端必须优先使用项目标准变量 `AI_PRIMARY_*` / `AI_FALLBACK_*`，仅在项目变量缺失时才回退到兼容别名 `OPENAI_*` / `QWEN_*`。增加单元测试覆盖优先级，避免后续回归。

## Boundaries & Constraints

**Always:** 保持现有 API 响应格式、分类服务接口和 fallback 行为不变；生产环境缺少主 key 时仍返回分类服务不可用；本地无 key 时仍使用 development stub。

**Ask First:** 如果需要改变 `.env.local` 文件内容、真实密钥、AI provider 协议或数据库结构，先停止并询问用户。

**Never:** 不打印或提交任何密钥；不移除兼容变量支持；不绕过 AI fallback/circuit breaker。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Project env wins | 同时存在 `AI_PRIMARY_API_KEY=project-key` 与 `OPENAI_API_KEY=global-key` | 分类客户端使用 `project-key` 和 `AI_PRIMARY_BASE_URL` | N/A |
| Compatibility fallback | 仅存在 `OPENAI_API_KEY` / `OPENAI_BASE_URL` | 分类客户端继续可用，使用兼容变量 | N/A |
| No local key in dev | 非 production 且没有主 key | 使用 `development-stub` fallback | 不抛 503 |
| No key in production | production 且没有主 key | 创建默认客户端失败 | 返回现有 `CLASSIFICATION_FAILED` / 503 路径 |

</frozen-after-approval>

## Code Map

- `apps/api/lib/services/classify-service.ts` -- 创建默认 AI 客户端，读取主/备用 provider 的 API key、base URL 和 model。
- `apps/api/lib/services/classify-service.test.ts` -- 分类服务单元测试，适合补充默认客户端环境变量优先级回归覆盖。
- `scripts/run-with-root-env.mjs` -- 后端 dev 脚本加载根 `.env.local`，当前行为是只填充缺失环境变量。
- `.env.example` -- 项目约定的 AI 环境变量名，已使用 `AI_PRIMARY_*` / `AI_FALLBACK_*`。

## Tasks & Acceptance

**Execution:**
- [x] `apps/api/lib/services/classify-service.ts` -- 调整默认 AI 客户端配置读取顺序，让项目专用变量优先，兼容别名兜底。
- [x] `apps/api/lib/services/classify-service.ts` -- 暴露最小测试 seam，允许测试在不访问真实网络的情况下检查默认客户端使用的 provider 配置。
- [x] `apps/api/lib/services/classify-service.test.ts` -- 添加优先级、兼容 fallback 和缺 key 开发模式测试。

**Acceptance Criteria:**
- Given 根 `.env.local` 配置了 `AI_PRIMARY_API_KEY` 且系统环境存在不同的 `OPENAI_API_KEY`, when 创建默认 AI 分类客户端, then 使用 `AI_PRIMARY_API_KEY`。
- Given 只配置兼容变量 `OPENAI_API_KEY`, when 创建默认 AI 分类客户端, then 仍能使用 OpenAI-compatible provider。
- Given 非生产环境没有任何主 API key, when 创建默认 AI 分类客户端, then 使用 development stub 而不是抛错。

## Spec Change Log

## Verification

**Commands:**
- `pnpm --filter api test -- lib/services/classify-service.test.ts` -- expected: 分类服务测试通过。
- `pnpm --filter api lint` -- expected: ESLint 无错误。

## Suggested Review Order

**配置解析**

- 项目变量优先
  [`classify-service.ts:273`](../../apps/api/lib/services/classify-service.ts#L273)

- 默认客户端接线
  [`classify-service.ts:398`](../../apps/api/lib/services/classify-service.ts#L398)

**回归测试**

- 遮蔽场景覆盖
  [`classify-service.test.ts:105`](../../apps/api/lib/services/classify-service.test.ts#L105)

- 兼容变量覆盖
  [`classify-service.test.ts:126`](../../apps/api/lib/services/classify-service.test.ts#L126)
