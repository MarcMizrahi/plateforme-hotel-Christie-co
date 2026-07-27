# Image de production — DEPLOY.md §4. Construite par la CI, publiée sur GHCR.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# Le postinstall du projet lance `prisma generate` : le schéma doit être présent.
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm exec prisma generate && pnpm build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# Migrations depuis l'image publiée (DEPLOY.md §7). La sortie standalone ne trace que
# ce que le code applicatif importe : le CLI Prisma n'en fait pas partie, on embarque
# donc seulement de quoi le faire tourner via `npx --yes prisma@<version>`.
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./
EXPOSE 3000
CMD ["node", "server.js"]
