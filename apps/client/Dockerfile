FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# IMPORTANT: include full workspace (recommended)
COPY . .

WORKDIR /app/apps/client


RUN pnpm build


# production stage
FROM nginx:alpine

COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]