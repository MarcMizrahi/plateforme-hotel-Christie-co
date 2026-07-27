# Image de production — DEPLOY.md §4.
#
# Le stage final `run` n'embarque QUE la sortie standalone de Next.js (pas les
# devDependencies, pas le CLI Prisma). Les migrations (`prisma migrate deploy`)
# doivent donc être exécutées contre le stage `build` (qui a tout), pas contre
# l'image finale — cf. docker-compose.yml, service `migrate` (target: build).

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm exec prisma generate && pnpm build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
