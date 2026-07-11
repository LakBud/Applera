FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.8.0 --activate

# workspace metadata first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/client/package.json apps/client/package.json
COPY packages/schemas/package.json packages/schemas/package.json

RUN pnpm install --frozen-lockfile

# now copy full source
COPY . .

# build client and its workspace dependencies via turbo
RUN pnpm build:client


# production stage
FROM nginx:alpine

COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

# SPA routing: fall back to index.html for client-side routes
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

# allow nginx user to write cache/run files
RUN chown -R nginx:nginx /var/cache/nginx /var/run /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

EXPOSE 80

USER nginx
CMD ["nginx", "-g", "daemon off;"]