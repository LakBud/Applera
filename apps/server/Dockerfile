FROM node:24-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.8.0 --activate

# workspace metadata for install layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/package.json
COPY packages/schemas/package.json packages/schemas/package.json

# install all workspace dependencies
RUN pnpm install --frozen-lockfile

# copy full repo (source files)
COPY . .

# build server + its workspace dependencies via turbo
RUN pnpm build:server

WORKDIR /app/apps/server

EXPOSE 5005

USER node

CMD ["pnpm", "start:server:prod"]