# Story 0.6: 生产环境部署 (Production Deployment)

Status: review

## Story

As a 运维工程师,
I want 阿里云 ECS 上的 Docker Compose 生产环境就绪,
So that 应用可以在 2核4G 资源约束下稳定运行并对外提供服务。

## Acceptance Criteria

### AC1: Docker Compose 生产编排

**Given** 阿里云 ECS 2核4G 实例已配置
**When** 执行 `docker compose -f deploy/docker-compose.prod.yml up`
**Then** Next.js API 服务、Supabase 精简版、Nginx 全部启动成功
**And** 总内存占用目标 <= 3.5GB（为系统保留余量）
**And** Supabase 组件仅包含 PostgreSQL、GoTrue、PostgREST、Kong

### AC2: Nginx HTTPS 反向代理

**Given** Nginx 已配置
**When** 外部请求到达服务器
**Then** HTTPS（SSL 证书）正常终止
**And** 请求正确路由到 Next.js API 或 Supabase 对应服务
**And** `/api/ai/chat` 配置 `proxy_buffering off`

### AC3: 环境变量与安全注入

**Given** 生产环境配置
**When** 检查部署模板
**Then** 所有敏感信息通过环境变量注入，不在仓库中硬编码
**And** `.env.example` 列出 Story 0.6 所需变量
**And** 证书目录通过挂载目录注入到 Nginx

### AC4: 部署脚本与回滚

**Given** 部署脚本已创建
**When** 执行 `deploy/scripts/deploy.sh`
**Then** 脚本会校验环境、拉取或构建镜像、启动服务并等待健康检查通过
**And** 健康检查失败时可自动回滚到上一版 API 镜像
**And** 支持通过 `DEPLOY_ENV_FILE` 或默认 `deploy/.env.prod` 加载部署变量

## Tasks / Subtasks

- [x] Task 1: 新增生产镜像与忽略规则 (AC: #1)
  - [x] 1.1 新建 `apps/api/Dockerfile`
  - [x] 1.2 新建根目录 `.dockerignore`

- [x] Task 2: 新增生产编排 (AC: #1, #3)
  - [x] 2.1 新建 `deploy/docker-compose.prod.yml`
  - [x] 2.2 复用 Supabase 精简栈，只保留 db/auth/rest/kong
  - [x] 2.3 接入 Story 0.7 的 `/api/health` 作为 API 健康检查
  - [x] 2.4 为关键服务添加内存预算约束

- [x] Task 3: 新增 Nginx 生产代理 (AC: #2)
  - [x] 3.1 新建 `deploy/nginx/nginx.conf`
  - [x] 3.2 配置 HTTP → HTTPS 重定向
  - [x] 3.3 为 `/api/ai/chat` 关闭 `proxy_buffering`
  - [x] 3.4 代理 `/auth/v1/`、`/rest/v1/` 到 Kong

- [x] Task 4: 新增部署脚本 (AC: #4)
  - [x] 4.1 新建 `deploy/scripts/deploy.sh`
  - [x] 4.2 加入 compose config 校验、健康检查等待、自动回滚
  - [x] 4.3 支持 `DEPLOY_DRY_RUN=1` 进行演练

- [x] Task 5: 更新文档与配置模板 (AC: #3)
  - [x] 5.1 更新 `.env.example`，补充生产部署变量
  - [x] 5.2 更新 `_bmad-output/implementation-artifacts/sprint-status.yaml`
  - [x] 5.3 新建 `deploy/.env.prod.example`，提供 ECS 生产部署 env 文件模板

## Dev Notes

### 架构约束

- 技术栈：Next.js 15 App Router（apps/api）+ 自托管 Supabase 精简栈 + Nginx
- 资源目标：2核4G ECS，Compose 总体目标 <= 3.5GB
- Secrets 仅通过环境变量和宿主机挂载注入
- `deploy/scripts/deploy.sh` 为 Linux Bash 脚本；默认加载 `deploy/.env.prod`，可通过 `DEPLOY_ENV_FILE` 覆盖

### 关键实现说明

- API 容器复用 monorepo 根上下文进行 `pnpm install`，并在镜像内构建 `packages/shared` 与 `apps/api`
- 生产 Compose 中的 `SUPABASE_URL` 指向内部 `kong:8000`，保证 `/api/health` 的数据库检查走内网
- Nginx 使用固定证书挂载路径 `/etc/nginx/certs/fullchain.pem` 与 `/etc/nginx/certs/privkey.pem`
- 自动回滚基于当前运行中的 API 镜像标签；若没有上一版镜像，会提示人工介入

### 与 Story 0.7 的衔接

- Story 0.7 中 deferred 的 Docker healthcheck 集成已在本 Story 中完成
- `/api/health` 继续作为 Docker healthcheck 与外部探针统一入口

### Verification Notes

- ✅ `docker compose -f deploy/docker-compose.prod.yml config` 可成功展开；未提供环境变量时会出现预期 warning
- ✅ `bash -n deploy/scripts/deploy.sh` 通过
- ✅ `DEPLOY_DRY_RUN=1` + `deploy/.env.prod` 本地 dry-run 通过
- ✅ `docker build -f apps/api/Dockerfile -t money-tracker-api:verify .` 通过（合并 `origin/main` 后已重跑）
- ✅ 合并 `origin/main` 后 `pnpm lint` 通过，主分支已解决此前 `packages/shared/index.ts` 与 `apps/mobile/app/_layout.tsx` 的 import/export sort 问题
- ✅ `pnpm test` 通过
- ✅ `pnpm --filter api build` 通过
- ⚠️ 合并 `origin/main` 后 `pnpm build` 仍失败于本地移动端构建环境缺失 Hermes 可执行文件，不是本 Story 新增部署文件直接报错

## References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 0.6]
- [Source: _bmad-output/planning-artifacts/architecture.md#类别 5：基础设施与部署]
- [Source: _bmad-output/implementation-artifacts/0-7-monitoring-and-error-tracking.md]

## Dev Agent Record

### Agent Model Used

GPT-5.4

### Completion Notes List

- 创建生产部署 Story 文件、API Dockerfile、根 `.dockerignore`
- 创建 `deploy/docker-compose.prod.yml`，整合 API + Supabase slim + Nginx
- 创建 `deploy/nginx/nginx.conf`，满足 HTTPS 终止和 `/api/ai/chat` SSE 需求
- 创建 `deploy/scripts/deploy.sh`，支持环境校验、健康检查、自动回滚、dry-run
- 更新 `.env.example` 补充部署变量与运行约定
- 增强 `deploy/scripts/deploy.sh` 支持 `DEPLOY_ENV_FILE` / `deploy/.env.prod`，解决 Windows/PowerShell → bash 环境变量透传不稳定问题
- 已完成结构级验证：Compose 配置展开、deploy 脚本语法检查、deploy dry-run、API Docker 镜像构建、API 单独构建、全仓测试
- 合并 `origin/main` 后重新验证：`pnpm lint` 已通过；剩余本地阻塞为移动端 Hermes 可执行文件缺失导致 root `pnpm build` 失败

### File List

**New:**
- `apps/api/Dockerfile`
- `.dockerignore`
- `deploy/docker-compose.prod.yml`
- `deploy/nginx/nginx.conf`
- `deploy/scripts/deploy.sh`
- `deploy/.env.prod.example`
- `_bmad-output/implementation-artifacts/0-6-production-deployment.md`

**Modified:**
- `.env.example`
- `.gitignore`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
