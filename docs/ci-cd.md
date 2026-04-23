# CI/CD Pipeline

## Overview

Story 0.5 introduces two GitHub Actions workflows:

- `.github/workflows/ci.yml`: runs on pull requests to `main` and blocks merge when lint, unit tests, or build fails.
- `.github/workflows/deploy.yml`: runs on pushes to `main` or manual dispatch, builds the `apps/api` Docker image, pushes it to Alibaba Cloud ACR, and rolls out the `api` service on ECS over SSH.
- `.github/workflows/mobile-build.yml`: a manual strategy workflow that validates the mobile signing secret contract, prepares the Android keystore from GitHub Secrets, and documents how future mobile automation should use EAS.

The mobile app is intentionally limited to `eas.json` build profile configuration in this story. Automated Expo release workflows are deferred until production mobile release requirements are defined.

## Quality gate policy

### Layer 1 — blocking release

The PR workflow must pass all of the following before merge:

- `pnpm lint`
- `pnpm test`
- `pnpm build`

These commands are executed sequentially in GitHub Actions for fail-fast behavior, but each root script still routes through Turbo and covers every workspace in the monorepo.

### Layer 2 — pre-release fix

Integration checks are advisory for now. They should be added before release and may warn without blocking PR merge until the suite becomes stable.

### Layer 3 — post-release iteration

Performance baselines and E2E observations should be recorded continuously, but they do not block delivery in the current phase.

## API image strategy

- Build context is the repository root so workspace packages remain available.
- Dockerfile lives at `apps/api/Dockerfile`.
- Images are tagged with the immutable Git commit SHA.
- ECS should consume `IMAGE_REPOSITORY` and `IMAGE_TAG` in its compose configuration so rollback can target a previous SHA.

## GitHub Actions secrets

Store deploy secrets in the `production` environment, not in pull-request workflows.

### Required deploy secrets

- `ACR_REGISTRY`: ACR registry host, for example `registry.cn-hangzhou.aliyuncs.com`
- `ACR_NAMESPACE`: registry namespace or repository prefix
- `ACR_USERNAME`
- `ACR_PASSWORD`
- `ECS_HOST`
- `ECS_USER`
- `ECS_SSH_PRIVATE_KEY`
- `ECS_KNOWN_HOSTS`
- `ECS_DEPLOY_PATH`: remote directory containing `docker-compose.yml`

### Optional CI placeholders

The PR workflow uses non-secret placeholder values only when build tooling expects env names to exist:

- `NEXT_PUBLIC_API_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Do not inject production Supabase keys, service-role keys, SSH credentials, ACR passwords, or Sentry auth tokens into PR builds.

## ECS rollout contract

The workflow assumes the ECS server contains a compose project with an `api` service. The deployment command is effectively:

```bash
printf '%s' "$ACR_PASSWORD" | docker login "$ACR_REGISTRY" --username "$ACR_USERNAME" --password-stdin
docker compose pull api
docker compose up -d api
```

The compose file should reference the pushed image using environment expansion similar to:

```yaml
services:
  api:
    image: ${IMAGE_REPOSITORY}:${IMAGE_TAG}
```

## Expo EAS strategy

This story defines build profiles only:

- `preview`: internal Android APK for preview installs
- `production`: store-style Android AAB / standard iOS release profile
- `production-local`: local fallback profile for constrained domestic network environments

Recommended GitHub Secrets for future mobile automation:

- `EXPO_TOKEN`
- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

The repository now includes `.github/workflows/mobile-build.yml` as the concrete mobile CI strategy contract. It does not auto-release mobile artifacts yet; instead it proves the GitHub Secrets interface, decodes the keystore into a temporary file on the runner, and keeps the release flow manual until native release automation is approved.

If hosted EAS access is unreliable from the deployment environment, use:

```bash
eas build --platform android --profile production-local --local
```

on a trusted self-managed runner or ECS build machine.

## Rollback

To roll back, redeploy a previous successful image SHA:

1. Set `IMAGE_TAG` to the previous known-good commit SHA on ECS.
2. Run `docker compose pull api`.
3. Run `docker compose up -d api`.

## References

- Turborepo GitHub Actions guide
- Expo EAS CI guide
- Alibaba Cloud ACR login and credential documentation
