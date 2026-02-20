# =============================================================================
# Fintutto Container — Multi-stage production build
# Builds all 6 apps as static assets, serves them via Nginx reverse proxy
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Base — install pnpm + dependencies
# ---------------------------------------------------------------------------
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./

# Copy all package.json files for dependency resolution
COPY packages/core/package.json ./packages/core/
COPY packages/ui/package.json ./packages/ui/
COPY packages/pwa/package.json ./packages/pwa/
COPY packages/shared/package.json ./packages/shared/
COPY apps/fintutto/package.json ./apps/fintutto/
COPY apps/vermietify/package.json ./apps/vermietify/
COPY apps/mieter-portal/package.json ./apps/mieter-portal/
COPY apps/hausmeister-pro/package.json ./apps/hausmeister-pro/
COPY apps/zaehler-app/package.json ./apps/zaehler-app/
COPY apps/bescheid-boxer/package.json ./apps/bescheid-boxer/

# Install dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile || pnpm install

# ---------------------------------------------------------------------------
# Stage 2: Build — compile all packages and apps
# ---------------------------------------------------------------------------
FROM base AS builder

# Copy entire source tree
COPY . .

# Build-time env vars (overridable via --build-arg)
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""
ARG VITE_STRIPE_PUBLISHABLE_KEY=""

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

# Build shared packages first, then all apps
RUN pnpm run build:packages || true
RUN pnpm run build:fintutto || true
RUN pnpm run build:vermietify || true
RUN pnpm run build:mieter-portal || true
RUN pnpm run build:hausmeister-pro || true
RUN pnpm run build:zaehler-app || true
RUN pnpm run build:bescheid-boxer || true

# ---------------------------------------------------------------------------
# Stage 3: Production — Nginx serving all apps
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS production

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy built static assets for each app
COPY --from=builder /app/apps/fintutto/dist /usr/share/nginx/html/fintutto
COPY --from=builder /app/apps/vermietify/dist /usr/share/nginx/html/vermietify
COPY --from=builder /app/apps/mieter-portal/dist /usr/share/nginx/html/mieter-portal
COPY --from=builder /app/apps/hausmeister-pro/dist /usr/share/nginx/html/hausmeister-pro
COPY --from=builder /app/apps/zaehler-app/dist /usr/share/nginx/html/zaehler-app
COPY --from=builder /app/apps/bescheid-boxer/dist /usr/share/nginx/html/bescheid-boxer

# Copy a landing page
COPY nginx/index.html /usr/share/nginx/html/index.html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
