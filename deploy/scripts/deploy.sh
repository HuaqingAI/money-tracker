#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
WORKTREE_ROOT="$(cd -- "${DEPLOY_ROOT}/.." && pwd)"
COMPOSE_FILE="${DEPLOY_ROOT}/docker-compose.prod.yml"
STATE_FILE="${DEPLOY_ROOT}/.last-deploy.env"
ENV_FILE="${DEPLOY_ENV_FILE:-${DEPLOY_ROOT}/.env.prod}"

DRY_RUN="${DEPLOY_DRY_RUN:-0}"
PROJECT_NAME="${DEPLOY_COMPOSE_PROJECT_NAME:-money-tracker-prod}"
HEALTHCHECK_URL="${DEPLOY_HEALTHCHECK_URL:-https://127.0.0.1/api/health}"
HEALTHCHECK_INTERVAL="${DEPLOY_HEALTHCHECK_INTERVAL_SECONDS:-5}"
HEALTHCHECK_TIMEOUT="${DEPLOY_HEALTHCHECK_TIMEOUT_SECONDS:-120}"
PREVIOUS_API_IMAGE=""

required_vars=(
  POSTGRES_PASSWORD
  AUTHENTICATOR_PASSWORD
  JWT_SECRET
  ENCRYPTION_KEY
  API_EXTERNAL_URL
  SITE_URL
  DEPLOY_CERTS_DIR
  NEXT_PUBLIC_API_URL
  SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  SUPABASE_JWT_SECRET
  AI_PRIMARY_API_KEY
)

load_env_file() {
  if [[ ! -f "${ENV_FILE}" ]]; then
    return 0
  fi

  set -a
  # shellcheck disable=SC1090
  source <(tr -d '\r' < "${ENV_FILE}")
  set +a
  log "已加载部署环境文件: ${ENV_FILE}"
}

refresh_runtime_config() {
  DRY_RUN="${DEPLOY_DRY_RUN:-0}"
  PROJECT_NAME="${DEPLOY_COMPOSE_PROJECT_NAME:-money-tracker-prod}"
  HEALTHCHECK_URL="${DEPLOY_HEALTHCHECK_URL:-https://127.0.0.1/api/health}"
  HEALTHCHECK_INTERVAL="${DEPLOY_HEALTHCHECK_INTERVAL_SECONDS:-5}"
  HEALTHCHECK_TIMEOUT="${DEPLOY_HEALTHCHECK_TIMEOUT_SECONDS:-120}"
}

run() {
  if [[ "${DRY_RUN}" == "1" ]]; then
    printf '[dry-run] %s\n' "$*"
    return 0
  fi

  "$@"
}

compose() {
  run docker compose --project-name "${PROJECT_NAME}" -f "${COMPOSE_FILE}" "$@"
}

log() {
  printf '[deploy] %s\n' "$*"
}

fail() {
  printf '[deploy][error] %s\n' "$*" >&2
  exit 1
}

validate_prerequisites() {
  command -v docker >/dev/null 2>&1 || fail 'docker 未安装'
  docker compose version >/dev/null 2>&1 || fail 'docker compose 不可用'
  command -v curl >/dev/null 2>&1 || fail 'curl 未安装'
}

validate_environment() {
  for var_name in "${required_vars[@]}"; do
    if [[ -z "${!var_name:-}" ]]; then
      fail "缺少必需环境变量: ${var_name}"
    fi
  done

  if [[ "${DRY_RUN}" == "1" ]]; then
    log "dry-run 跳过证书文件存在性检查: ${DEPLOY_CERTS_DIR}"
    return 0
  fi

  [[ -d "${DEPLOY_CERTS_DIR}" ]] || fail "证书目录不存在: ${DEPLOY_CERTS_DIR}"
  [[ -f "${DEPLOY_CERTS_DIR}/fullchain.pem" ]] || fail '缺少 fullchain.pem'
  [[ -f "${DEPLOY_CERTS_DIR}/privkey.pem" ]] || fail '缺少 privkey.pem'
}

capture_previous_state() {
  if ! docker compose --project-name "${PROJECT_NAME}" -f "${COMPOSE_FILE}" ps -q api >/dev/null 2>&1; then
    return 0
  fi

  local api_container
  api_container="$(docker compose --project-name "${PROJECT_NAME}" -f "${COMPOSE_FILE}" ps -q api 2>/dev/null || true)"

  if [[ -n "${api_container}" ]]; then
    PREVIOUS_API_IMAGE="$(docker inspect --format '{{.Config.Image}}' "${api_container}" 2>/dev/null || true)"
    if [[ -n "${PREVIOUS_API_IMAGE}" ]]; then
      printf 'PREVIOUS_API_IMAGE=%s\n' "${PREVIOUS_API_IMAGE}" > "${STATE_FILE}"
    fi
  fi
}

load_previous_state() {
  if [[ -z "${PREVIOUS_API_IMAGE}" && -f "${STATE_FILE}" ]]; then
    # shellcheck disable=SC1090
    source "${STATE_FILE}"
    PREVIOUS_API_IMAGE="${PREVIOUS_API_IMAGE:-}"
  fi
}

pull_or_build_api() {
  if [[ -n "${API_IMAGE:-}" ]]; then
    log "拉取 API 镜像 ${API_IMAGE}"
    compose pull api
    return 0
  fi

  log '未提供 API_IMAGE，改为本地构建 apps/api 镜像'
  compose build api
}

wait_for_healthcheck() {
  local elapsed=0

  while (( elapsed < HEALTHCHECK_TIMEOUT )); do
    if [[ "${DRY_RUN}" == "1" ]]; then
      log "dry-run 跳过健康检查: ${HEALTHCHECK_URL}"
      return 0
    fi

    if curl --silent --show-error --fail --insecure "${HEALTHCHECK_URL}" >/dev/null; then
      log '健康检查通过'
      return 0
    fi

    sleep "${HEALTHCHECK_INTERVAL}"
    elapsed=$((elapsed + HEALTHCHECK_INTERVAL))
    log "等待健康检查通过 (${elapsed}s/${HEALTHCHECK_TIMEOUT}s)"
  done

  return 1
}

rollback() {
  load_previous_state

  if [[ -z "${PREVIOUS_API_IMAGE}" ]]; then
    fail '部署失败，且未找到可回滚的上一版 API 镜像'
  fi

  log "开始回滚到上一版 API 镜像: ${PREVIOUS_API_IMAGE}"
  export API_IMAGE="${PREVIOUS_API_IMAGE}"
  compose up -d --no-deps api nginx

  if wait_for_healthcheck; then
    log '回滚成功'
    return 0
  fi

  fail '回滚后健康检查仍失败，请人工介入'
}

main() {
  cd "${WORKTREE_ROOT}"

  load_env_file
  refresh_runtime_config
  validate_prerequisites
  validate_environment
  capture_previous_state

  log '校验 compose 配置'
  compose config >/dev/null

  pull_or_build_api

  log '启动或更新生产服务'
  compose up -d --remove-orphans

  if wait_for_healthcheck; then
    log '部署完成'
    return 0
  fi

  log '健康检查失败，开始自动回滚'
  rollback
}

main "$@"
