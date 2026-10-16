# Frontend Academia Smile — build multistage (ADR-0003, arquitectura.md §7.4)
#   deps    → instala dependencias exactas (npm ci)
#   builder → next build (output: standalone) + service worker de Serwist
#   dev     → next dev con hot reload (usar con bind mount en compose.dev)
#   runner  → imagen final mínima, usuario no root
# Contexto de build: frontend/. No depende de rutas externas: src/design/tokens.css
# está versionado (npm run design:sync) y los tests no entran a la imagen.

ARG NODE_IMAGE=node:22.23.3-alpine
# Debe coincidir con la versión de Alpine de NODE_IMAGE (musl/libstdc++ compatibles).
ARG ALPINE_IMAGE=alpine:3.24.2

# ---------- deps ----------
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json .npmrc ./
RUN npm ci && npm cache clean --force

# ---------- builder ----------
FROM ${NODE_IMAGE} AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- dev ----------
FROM ${NODE_IMAGE} AS dev
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=development \
    WATCHPACK_POLLING=true
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

# ---------- runner ----------
# Alpine pelado + solo el binario de Node: sin npm, yarn ni corepack (~70 MB menos).
FROM ${NODE_IMAGE} AS node-bin

FROM ${ALPINE_IMAGE} AS runner
WORKDIR /app
RUN apk add --no-cache libstdc++ tzdata
COPY --from=node-bin /usr/local/bin/node /usr/local/bin/node
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    TZ=America/Bogota
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1
CMD ["node", "server.js"]
