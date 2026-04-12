FROM node:22-alpine AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

WORKDIR /app

COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile

FROM base AS web-builder

# Shared API prefix burned into both frontend and backend builds.
ARG API_PREFIX=/api

COPY apps/web ./apps/web

RUN VITE_API_BASE="$API_PREFIX" pnpm --filter @wetland-shield/web build

FROM base AS server-builder

ARG API_PREFIX=/api

COPY apps/server ./apps/server

RUN API_PREFIX="$API_PREFIX" pnpm --filter @wetland-shield/server build

FROM server-builder AS server-deps

RUN pnpm --filter @wetland-shield/server deploy --prod /out/server

FROM caddy:2.8.4-alpine AS runner

# Example:
# docker build \
#   --build-arg API_PREFIX=/api \
#   --build-arg CADDY_SITE_ADDRESS=example.com \
#   --build-arg CADDY_ENABLE_HTTPS=true \
#   -t wetland-shield:latest .
ARG CADDY_SITE_ADDRESS=:80
ARG CADDY_ENABLE_HTTPS=false
ARG API_PREFIX=/api

RUN apk add --no-cache nodejs

WORKDIR /srv

COPY --from=web-builder /app/apps/web/build /srv/web
COPY --from=server-deps /out/server /srv/server
COPY docker/Caddyfile.template /etc/caddy/Caddyfile.template
COPY docker/start.sh /usr/local/bin/start.sh

RUN chmod +x /usr/local/bin/start.sh && \
    printf '{\n' > /etc/caddy/Caddyfile && \
    if [ "$CADDY_ENABLE_HTTPS" != "true" ]; then \
      printf '  auto_https off\n' >> /etc/caddy/Caddyfile; \
    fi && \
    printf '}\n\n' >> /etc/caddy/Caddyfile && \
    printf '%s {\n' "$CADDY_SITE_ADDRESS" >> /etc/caddy/Caddyfile && \
    printf '  encode zstd gzip\n\n' >> /etc/caddy/Caddyfile && \
    printf '  @api {\n' >> /etc/caddy/Caddyfile && \
    printf '    path %s\n' "$API_PREFIX" >> /etc/caddy/Caddyfile && \
    printf '    path %s/*\n' "$API_PREFIX" >> /etc/caddy/Caddyfile && \
    printf '  }\n\n' >> /etc/caddy/Caddyfile && \
    printf '  route {\n' >> /etc/caddy/Caddyfile && \
    printf '    handle @api {\n' >> /etc/caddy/Caddyfile && \
    printf '      reverse_proxy 127.0.0.1:3000\n' >> /etc/caddy/Caddyfile && \
    printf '    }\n\n' >> /etc/caddy/Caddyfile && \
    printf '    handle {\n' >> /etc/caddy/Caddyfile && \
    printf '      root * /srv/web\n' >> /etc/caddy/Caddyfile && \
    printf '      try_files {path} /index.html\n' >> /etc/caddy/Caddyfile && \
    printf '      file_server\n' >> /etc/caddy/Caddyfile && \
    printf '    }\n' >> /etc/caddy/Caddyfile && \
    printf '  }\n' >> /etc/caddy/Caddyfile && \
    printf '}\n' >> /etc/caddy/Caddyfile && \
    rm /etc/caddy/Caddyfile.template

ENV NODE_ENV=production
ENV PORT=3000
ENV API_PREFIX=$API_PREFIX

EXPOSE 80 443

CMD ["/usr/local/bin/start.sh"]
