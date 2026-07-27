#!/usr/bin/env bash
# setup.sh — DEPLOY.md §3.2. Usage : ./setup.sh prod
#
# Installe Docker si absent, prépare .env / .env.docker à partir des .example
# (sans jamais écraser des fichiers existants), démarre la base, construit
# l'application. Ne lance PAS les migrations ni le service app tant que les
# fichiers .env n'ont pas été complétés à la main (secrets prod).

set -euo pipefail

MODE="${1:-prod}"
echo "==> setup.sh (mode: ${MODE})"

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Installation de Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$(whoami)"
  echo "==> Docker installé. Reconnectez-vous (ou 'newgrp docker') pour que le groupe s'applique."
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERREUR: le plugin 'docker compose' (v2) est requis." >&2
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "==> .env créé depuis .env.example — À COMPLÉTER : DATABASE_URL (host 'db'),"
  echo "    NEXT_PUBLIC_SITE_URL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET, SMTP_*, etc."
fi

if [ ! -f .env.docker ]; then
  cp .env.docker.example .env.docker
  echo "==> .env.docker créé depuis .env.docker.example — À COMPLÉTER : POSTGRES_PASSWORD, DOMAIN, APP_IMAGE."
fi

echo "==> Démarrage de la base de données..."
docker compose --env-file .env.docker up -d db

cat <<'EOF'

==> setup.sh terminé.

L'image applicative est construite par la CI et publiée sur GHCR : rien n'est compilé
ici. Repo privé → `docker login ghcr.io` une fois (PAT avec le scope read:packages).

Étapes restantes (manuelles, volontairement pas automatiques) :
  1. Vérifier/compléter .env et .env.docker (secrets prod, APP_IMAGE).
  2. Récupérer l'image :
       docker compose --env-file .env.docker pull app
  3. Lancer les migrations :
       docker compose --env-file .env.docker run --rm app npx --yes prisma@7.9.1 migrate deploy
  4. Seeder les coefficients de valorisation (one-shot, première installation).
     Le seed est un script TypeScript (tsx) absent de l'image de production : le
     lancer depuis une machine disposant du dépôt, DATABASE_URL pointant sur la
     base de prod :
       DATABASE_URL="postgresql://..." pnpm db:seed
  5. Démarrer l'application :
       docker compose --env-file .env.docker up -d app caddy
  6. CHECK 4 de DEPLOY.md : curl -s localhost:3000/api/health
EOF
