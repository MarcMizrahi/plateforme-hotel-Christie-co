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
  echo "==> .env.docker créé depuis .env.docker.example — À COMPLÉTER : POSTGRES_PASSWORD, DOMAIN."
fi

echo "==> Démarrage de la base de données..."
docker compose --env-file .env.docker up -d db

echo "==> Build de l'image applicative (stage run)..."
docker compose --env-file .env.docker build app

cat <<'EOF'

==> setup.sh terminé.

Étapes restantes (manuelles, volontairement pas automatiques) :
  1. Vérifier/compléter .env et .env.docker (secrets prod).
  2. Lancer les migrations :
       docker compose --env-file .env.docker --profile tools run --rm migrate
  3. Seeder les coefficients de valorisation (réutilise l'image du stage build,
     qui a tsx et les devDependencies — l'image app finale ne les a pas) :
       docker compose --env-file .env.docker --profile tools run --rm migrate npx tsx prisma/seed.ts
  4. Démarrer l'application :
       docker compose --env-file .env.docker up -d app caddy
  5. CHECK 4 de DEPLOY.md : curl -s localhost:3000/api/health
EOF
