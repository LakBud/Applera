FROM node:24-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# IMPORTANT: copy full monorepo
COPY . .

# install all workspace dependencies
RUN pnpm install --frozen-lockfile

# build server and its workspace dependencies (e.g. @repo/schemas) in order
RUN pnpm --filter server... build

WORKDIR /app/apps/server

EXPOSE 5005

USER node
CMD ["pnpm", "start"]