FROM node:24-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# workspace metadata
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# copy full repo
COPY . .

# install dependencies in monorepo
RUN pnpm --filter server... build

# build server + dependencies
RUN pnpm build --filter=server...

WORKDIR /app/apps/server

EXPOSE 5005

USER node

CMD ["pnpm", "start"]