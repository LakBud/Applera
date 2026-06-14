FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable

# Copy workspace manifests first (better caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json server/

# Install dependencies (workspace-aware)
RUN pnpm install --frozen-lockfile

# Copy server source
COPY server ./server

WORKDIR /app/server

RUN pnpm build

EXPOSE 5005

CMD ["pnpm", "start"]