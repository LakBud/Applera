FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# IMPORTANT: copy full monorepo 
COPY . .

WORKDIR /app/apps/server

RUN pnpm build

EXPOSE 5005

CMD ["pnpm", "start"]