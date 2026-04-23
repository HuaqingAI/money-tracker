# Story 0.5: CI/CD Pipeline

Status: in-progress

## Story

As a 开发者,
I want GitHub Actions 自动执行代码检查和部署流水线,
so that 每次提交都经过质量门禁验证，合并到 main 后自动部署。

## Acceptance Criteria

### AC1: PR CI workflow

**Given** 代码推送到 GitHub PR  
**When** GitHub Actions CI 触发  
**Then** 并行或串行执行 `pnpm lint`、`pnpm test`、`pnpm build` 组成的质量门禁  
**And** 任一步骤失败则 PR 标记为不可合并  
**And** 工作流文件位于 `.github/workflows/ci.yml`

### AC2: Main deploy workflow

**Given** PR 合并到 `main`  
**When** deploy workflow 触发  
**Then** 构建 Next.js API Docker 镜像  
**And** 推送镜像到阿里云 ACR  
**And** 通过 SSH 触发 ECS 服务更新  
**And** 工作流文件位于 `.github/workflows/deploy.yml`

### AC3: Three-tier quality gates

**Given** 三层质量门禁策略  
**When** 检查 CI 配置和文档  
**Then** 第一层（阻塞发布）为 lint + unit tests + build  
**And** 第二层（上线前修复）为集成测试告警但不阻塞  
**And** 第三层（上线后迭代）为性能/E2E 记录但不阻塞

### AC4: Mobile build strategy

**Given** 移动端构建需求  
**When** 检查移动端 CI 配置  
**Then** 定义 Expo EAS Build 构建策略（Android APK/AAB、iOS 发布档）  
**And** 国内网络访问 EAS 的备选方案已说明  
**And** Android 签名密钥通过 GitHub Secrets 管理

## Tasks / Subtasks

- [x] Task 1: 创建 PR CI workflow (AC: #1)
  - [x] 1.1 新增 `.github/workflows/ci.yml`
  - [x] 1.2 配置 Node 20 + pnpm 9 + lockfile 安装
  - [x] 1.3 运行 `pnpm lint`
  - [x] 1.4 运行 `pnpm test`
  - [x] 1.5 运行 `pnpm build`
  - [x] 1.6 明确 PR workflow 不使用生产 secrets

- [x] Task 2: 创建 main deploy workflow (AC: #2)
  - [x] 2.1 新增 `apps/api/Dockerfile`
  - [x] 2.2 新增 `.github/workflows/deploy.yml`
  - [x] 2.3 配置阿里云 ACR 登录与推送
  - [x] 2.4 配置基于 SSH + docker compose 的 ECS 更新
  - [x] 2.5 使用 SHA 镜像标签替代可变 latest

- [x] Task 3: 文档化质量门禁与部署契约 (AC: #3)
  - [x] 3.1 新增 `docs/ci-cd.md`
  - [x] 3.2 记录三层质量门禁策略
  - [x] 3.3 记录 Secrets、回滚、ECS compose 契约

- [x] Task 4: 定义移动端构建策略 (AC: #4)
  - [x] 4.1 新增 `eas.json`
  - [x] 4.2 定义 preview / production / production-local profiles
  - [x] 4.3 文档化 Android keystore GitHub Secrets 方案
  - [x] 4.4 文档化国内网络下的 local fallback
  - [x] 4.5 新增 `.github/workflows/mobile-build.yml` 固化移动端签名 Secrets 契约

## Dev Notes

### Architecture decisions

- API Docker 构建必须从仓库根目录启动，否则 `@money-tracker/shared` / `@money-tracker/ui` workspace 包不可见。
- Next.js API 开启 `output: 'standalone'`，减少运行镜像体积并简化启动命令。
- monorepo 下同时设置 `outputFileTracingRoot`，避免 standalone 追踪遗漏 workspace 依赖。
- 部署只覆盖 API 服务；移动端在本 Story 中只完成 EAS profile 与 Secrets 约定，不做自动发版。
- PR workflow 保持无敏感信息，避免 fork PR 泄露 secrets。
- ECS rollout 使用 deploy concurrency、防止并发发布乱序；远端 registry 登录改为 `--password-stdin`。

### Required secrets

- `ACR_REGISTRY`
- `ACR_NAMESPACE`
- `ACR_USERNAME`
- `ACR_PASSWORD`
- `ECS_HOST`
- `ECS_USER`
- `ECS_SSH_PRIVATE_KEY`
- `ECS_KNOWN_HOSTS`
- `ECS_DEPLOY_PATH`
- future mobile: `EXPO_TOKEN`, `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 0.5]
- [Source: Oracle review session `ses_250607865ffeFFtaUQJmC54T2p`]
- [Source: Turborepo GitHub Actions guide]
- [Source: Expo CI/EAS guide]
- [Source: Alibaba Cloud ACR credential docs]

## Dev Agent Record

### Agent Model Used

Sisyphus (gpt-5.4)

### Completion Notes List

- Added PR CI workflow with Node 20, pnpm 9, pnpm cache, and Turbo cache.
- Added deploy workflow for API image build/push and ECS rollout with SSH host verification preserved.
- Added API Dockerfile and enabled Next standalone output.
- Added EAS profile config and deployment/secrets documentation.
- Added `mobile-build.yml` to make the Android signing GitHub Secrets contract executable without auto-releasing mobile binaries.
- Added `outputFileTracingRoot` and an empty `apps/api/public/.gitkeep` to align the API Docker/standalone path with monorepo reality.

### Review Findings

- [x] [Review][Patch] Add monorepo standalone tracing root in `apps/api/next.config.js` so Next standalone output can include workspace-traced files.
- [x] [Review][Patch] Avoid Docker build failure when `apps/api/public` is absent by checking in `apps/api/public/.gitkeep`.
- [x] [Review][Patch] Harden `deploy.yml` with `concurrency`, `set -euo pipefail`, `docker login --password-stdin`, and optional health check.
- [x] [Review][Patch] Make Android signing via GitHub Secrets concrete with `.github/workflows/mobile-build.yml`.
- [ ] [Review][Defer] Windows local API standalone build still fails on `next build` symlink creation (`EPERM`) while copying `.next/standalone`; target CI runner is `ubuntu-latest`, so this remains an environment-specific blocker for local Windows validation only.
- [ ] [Review][Defer] Windows local mobile build still fails on Expo Hermes binary lookup (`hermesc.exe ENOENT`), consistent with the previously documented Story 0.4 environment issue.

### File List

- `apps/api/next.config.js`
- `apps/api/Dockerfile`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `.github/workflows/mobile-build.yml`
- `eas.json`
- `docs/ci-cd.md`
- `_bmad-output/implementation-artifacts/0-5-ci-cd-pipeline.md`
