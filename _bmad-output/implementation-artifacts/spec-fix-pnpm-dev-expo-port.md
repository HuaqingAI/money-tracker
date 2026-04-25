---
title: '修复 pnpm dev 中 Expo 端口占用失败'
type: 'bugfix'
created: '2026-04-24'
status: 'done'
route: 'one-shot'
---

# 修复 pnpm dev 中 Expo 端口占用失败

## Intent

**Problem:** `pnpm dev` 通过 Turborepo 非交互启动 `expo start` 时，如果默认 Metro 端口 `8081` 已被占用，Expo 会请求确认改用新端口并因无法输入而失败；直接运行 `start` 在非交互场景下也有同类风险。

**Approach:** 将 mobile 的 `start` 与 `dev` 命令统一切换到 Node 启动包装脚本，先从 `EXPO_DEV_PORT`、`RCT_METRO_PORT` 或 `8081` 开始探测系统级可用端口，再显式以 `expo start --port <port>` 启动，避免 Expo 的交互式端口确认。

## Suggested Review Order

**启动路径**

- mobile `start` 与 `dev` 脚本统一改为端口自检包装器。
  [`apps/mobile/package.json:7`](../../apps/mobile/package.json#L7)

- 包装器探测默认/环境变量端口，遇占用自动递增，并把最终端口传给 Expo 与 `RCT_METRO_PORT`。
  [`apps/mobile/scripts/start-expo-dev.mjs:4`](../../apps/mobile/scripts/start-expo-dev.mjs#L4)

- 端口检测使用系统级 listen 探测，覆盖 `0.0.0.0` / IPv6 已占用但 `127.0.0.1` 误判可用的场景。
  [`apps/mobile/scripts/start-expo-dev.mjs:20`](../../apps/mobile/scripts/start-expo-dev.mjs#L20)

**Lint 支持**

- ESLint 将 `scripts/*.mjs` 作为 Node 脚本处理，避免新脚本因 Node 全局变量误报。
  [`eslint.config.mjs:50`](../../eslint.config.mjs#L50)
