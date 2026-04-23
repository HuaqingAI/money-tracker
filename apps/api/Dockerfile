FROM node:20-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable

COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/ui/package.json ./packages/ui/package.json

RUN pnpm install --frozen-lockfile --prod=false

COPY . .

RUN pnpm exec tsc --build packages/shared
RUN cd apps/api && ../../node_modules/.bin/next build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["sh", "-c", "cd apps/api && exec ../../node_modules/.bin/next start"]
