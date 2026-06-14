FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json client/

RUN pnpm install --frozen-lockfile

COPY client ./client

WORKDIR /app/client

RUN pnpm build


# production stage
FROM nginx:alpine

COPY --from=builder /app/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]