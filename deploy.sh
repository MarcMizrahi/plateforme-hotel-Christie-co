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

# Le CLI Prisma n'est pas embarqué dans la sortie standalone (cf. Dockerfile) : on le
# récupère à la volée, en épinglant la version du projet pour rester déterministe.
PRISMA_VERSION="$(sed -n 's/.*"prisma": *"\^\{0,1\}\([0-9][0-9.]*\)".*/\1/p' package.json | head -1)"
if [ -z "$PRISMA_VERSION" ]; then
  echo "ERREUR: version de prisma introuvable dans package.json" >&2
  exit 1
fi

echo "==> Récupération de l'image..."
$COMPOSE pull app

echo "==> Base de données prête ?"
$COMPOSE up -d db

echo "==> Migrations (prisma@${PRISMA_VERSION})..."
$COMPOSE run --rm app npx --yes "prisma@${PRISMA_VERSION}" migrate deploy

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
