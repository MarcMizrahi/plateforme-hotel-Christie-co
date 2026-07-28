#!/usr/bin/env bash
# deploy.sh — mise à jour de l'application sur le serveur (DEPLOY.md §7).
# À exécuter depuis le répertoire du dépôt cloné sur la VM.
#
#   ./deploy.sh              # déploie APP_IMAGE tel que défini dans .env.docker
#   ./deploy.sh <tag|sha>    # déploie un tag précis (rollback : passer le tag précédent)
#
# Les migrations tournent ICI et pas dans la CI : la base est interne à la VM et n'est
# pas joignable depuis GitHub Actions.

set -euo pipefail
cd "$(dirname "$0")"

COMPOSE="docker compose --env-file .env.docker"

if [ $# -ge 1 ]; then
  IMAGE_BASE="$(sed -n 's/^APP_IMAGE=\(.*\):.*/\1/p' .env.docker)"
  export APP_IMAGE="${IMAGE_BASE}:$1"
  echo "==> Image forcée : ${APP_IMAGE}"
fi

echo "==> Récupération de l'image..."
$COMPOSE pull app

echo "==> Base de données prête ?"
$COMPOSE up -d db

# Les migrations passent par le conteneur `tools` et non par l'image applicative :
# celle-ci ne contient que la sortie standalone de Next, qui ne trace ni le CLI Prisma
# ni `dotenv` — tous deux requis par prisma.config.ts. Vérifié en local (DEPLOY.md).
# La version de Prisma vient du lockfile, donc rien à épingler à la main.
echo "==> Migrations..."
$COMPOSE --profile tools run --rm tools \
  "corepack enable && pnpm install --frozen-lockfile && pnpm prisma migrate deploy"

echo "==> Bascule de l'application..."
$COMPOSE up -d app caddy

echo "==> Vérification santé..."
for i in $(seq 1 30); do
  code="$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/health || true)"
  if [ "$code" = "200" ]; then
    echo "OK — /api/health = 200"
    $COMPOSE ps
    exit 0
  fi
  sleep 5
done

echo "ERREUR: /api/health ne répond pas après 2.5 min. Logs :" >&2
$COMPOSE logs --tail=50 app >&2
exit 1
