# DEPLOY.md — Déploiement en production (Phase 0)

> Lecteur : Claude Code. Ce fichier est une procédure exécutable, pas de la théorie.
> Objectif : mettre le site Phase 0 en ligne, vérifié, sauvegardé, réversible.
> Exécuter les sections dans l'ordre. Chaque section se termine par un CHECK :
> ne pas continuer tant que le CHECK n'est pas vert.

---

## 0. Règles absolues pour Claude Code pendant un déploiement

1. ⛔ Ne jamais afficher, logger ou committer une valeur de secret (.env, clés, mots
   de passe). Si un secret doit être créé : générer avec `openssl rand`, l'écrire
   directement dans le fichier cible, dire à l'utilisateur OÙ il est, jamais SA VALEUR.
2. ⛔ Ne jamais exécuter de commande destructive (drop, rm de volume, reset DB) en
   production sans confirmation explicite de l'utilisateur dans la conversation.
3. ⛔ Les informations que tu ne peux pas connaître, demande-les AVANT de commencer :
   domaine public, hébergeur choisi, accès SSH (l'utilisateur exécute lui-même les
   commandes SSH si tu n'as pas d'accès), credentials SMTP prod, DSN Sentry.
4. Toute étape qui échoue 2 fois → STOP, diagnostic, rapport à l'utilisateur.
   Ne pas improviser de contournement qui modifie l'architecture.
5. Après tout déploiement réussi : taguer le commit (`git tag deploy-YYYYMMDD-HHMM`).

---

## 1. Pré-vol (à exécuter en local, avant tout)

```bash
pnpm lint && pnpm build && pnpm test        # tout doit passer
git status                                   # working tree propre, tout committé
```

Vérifications dans le code (grep) :
- [ ] Aucun secret en dur : `grep -rEn "(sk_live|whsec_|password.*=.*['\"][^'\"]{8,})" --include="*.ts" --include="*.tsx" src/ apps/ 2>/dev/null` → doit être vide
- [ ] `NEXT_PUBLIC_SITE_URL` utilisé partout (aucun `localhost` en dur dans les metadata, sitemap, emails)
- [ ] Le nom de marque vient de `NEXT_PUBLIC_SITE_NAME` (décision D1 — cf. DECISIONS.md)
- [ ] robots.txt et sitemap.xml générés dynamiquement à partir de l'URL publique
- [ ] Page /mentions-legales accessible (même minimale avec TODO juriste)

**CHECK 1** : build + tests verts, greps propres. Sinon corriger avant de continuer.

## 2. Informations requises (demander à l'utilisateur, une seule fois)

| Info | Exemple | Usage |
|---|---|---|
| Domaine public | `monsite.fr` | Caddy, .env, DNS |
| Hébergeur + type | VPS Scaleway / Postgres managé ? | choix du chemin §3 |
| Accès | SSH direct ou l'utilisateur exécute | mode d'exécution |
| SMTP prod | Brevo : host/port/user | .env prod |
| Sentry DSN (optionnel) | `https://...` | observabilité |
| Analytics | domaine Plausible ou Matomo | .env prod |

DNS à faire pointer par l'utilisateur (le lui rappeler) :
`A @ -> IP_DU_SERVEUR` et `A www -> IP_DU_SERVEUR` (ou CNAME), TTL 300 pendant le déploiement.

**CHECK 2** : toutes les infos obtenues, DNS propagé (`dig +short monsite.fr` renvoie l'IP).

## 3. Provisionnement serveur (VPS Ubuntu — chemin par défaut, cf. D7)

Si l'utilisateur a choisi une plateforme managée (Vercel/Scalingo…), sauter en §3-bis.

Sur le serveur (via SSH) :
```bash
# 3.1 Sécurisation de base — utilisateur non-root + firewall
adduser deploy && usermod -aG sudo,docker deploy   # (docker après install)
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
# Désactiver le login root SSH + auth par mot de passe (clés uniquement) :
#   /etc/ssh/sshd_config : PermitRootLogin no, PasswordAuthentication no
systemctl restart ssh

# 3.2 Récupération du code + setup
su - deploy
git clone <URL_DU_REPO> app && cd app
./setup.sh prod          # installe docker, crée .env, lance db+caddy, build
```

Puis compléter le `.env` serveur avec les valeurs prod (SMTP, Sentry, analytics,
`NEXT_PUBLIC_SITE_URL=https://monsite.fr`, `NODE_ENV=production`).

Cas Postgres managé : remplacer `DATABASE_URL` par l'URL managée (`?sslmode=require`),
puis `docker compose stop db` (le conteneur local devient inutile).

**CHECK 3** : `docker compose ps` → services `Up (healthy)` ; `curl -I https://monsite.fr`
depuis l'extérieur → certificat valide (Caddy l'obtient automatiquement une fois le DNS ok).

## 3-bis. Chemin alternatif plateforme managée
Si Vercel/équivalent : connecter le repo, définir toutes les variables du .env dans
l'interface (jamais dans le code), pointer le domaine, Postgres managé obligatoire.
Reprendre ensuite directement en §5.

## 4. Lancement de l'application (VPS)

L'app Next.js tourne en conteneur pour la reproductibilité. Si absent, créer :

`Dockerfile` (multi-stage) :
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm prisma generate && pnpm build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```
(Prérequis : `output: "standalone"` dans next.config. L'ajouter si absent.)

Ajouter au docker-compose.yml :
```yaml
  app:
    build: .
    restart: unless-stopped
    env_file: .env
    ports: ["127.0.0.1:3000:3000"]
    depends_on:
      db:
        condition: service_healthy
```

Déployer :
```bash
docker compose --env-file .env.docker build app
docker compose --env-file .env.docker run --rm app npx prisma migrate deploy
docker compose --env-file .env.docker up -d app
```

**CHECK 4** : `curl -s localhost:3000/api/health` → 200 (créer la route health si absente :
elle vérifie la connexion DB et renvoie `{status:"ok"}`).

Première installation uniquement — seeder les coefficients de valorisation, sans quoi
le moteur d'estimation ne renverra rien. Le seed est un script TypeScript (tsx), absent
de l'image de production : le lancer depuis une machine ayant le dépôt, avec
`DATABASE_URL` pointant sur la base de prod : `pnpm db:seed`.

## 5. Vérification fonctionnelle post-déploiement (obligatoire)

Depuis l'extérieur, sur https://monsite.fr :
- [ ] Accueil se charge, page /prix-hotel/[une-region] se charge
- [ ] Parcours d'estimation COMPLET : formulaire → email → résultat affiché
- [ ] L'email de rapport arrive réellement (boîte réelle, pas spam — sinon vérifier SPF/DKIM)
- [ ] Le lead apparaît dans le dashboard admin (avec source/UTM)
- [ ] robots.txt, sitemap.xml servis avec le bon domaine
- [ ] Pages 404 et erreur 500 personnalisées
- [ ] `curl -I` : HSTS, X-Content-Type-Options, X-Frame-Options présents
- [ ] Lighthouse mobile ≥ 90 sur l'accueil et une page SEO
- [ ] Événements analytics visibles (tester en navigation privée)

**CHECK 5** : tous cochés. Un seul échec sur le parcours d'estimation = déploiement
considéré comme raté (c'est le produit).

## 6. Sauvegardes & surveillance (fait partie du déploiement, pas « plus tard »)

```bash
# Backup quotidien Postgres (crontab de l'utilisateur deploy, 03h00)
mkdir -p ~/backups
crontab -l 2>/dev/null; echo '0 3 * * * docker compose -f ~/app/docker-compose.yml --env-file ~/app/.env.docker exec -T db pg_dump -U hotelmarket hotelmarket | gzip > ~/backups/db-$(date +\%F).sql.gz && find ~/backups -mtime +14 -delete' | crontab -
```
- [ ] Exécuter un backup manuel immédiatement, puis **tester la restauration** sur une
      base temporaire (`createdb test_restore && gunzip -c ... | psql`). Un backup non
      testé n'existe pas.
- [ ] Uptime : demander à l'utilisateur de créer un moniteur gratuit (UptimeRobot)
      sur https://monsite.fr/api/health — 5 min d'intervalle.
- [ ] Sentry : déclencher une erreur de test et vérifier sa réception.
- [ ] Copier le backup hors du serveur (localement ou bucket) au moins 1×/semaine
      — rappeler ce point à l'utilisateur.

**CHECK 6** : restauration testée avec succès, moniteur actif.

## 7. Mises à jour ultérieures (procédure standard)

L'image n'est plus construite sur le serveur : la CI la publie sur GHCR, le serveur `pull`.

```bash
cd ~/app
docker compose --env-file .env.docker pull app
docker compose --env-file .env.docker run --rm app npx --yes prisma@7.9.1 migrate deploy
docker compose --env-file .env.docker up -d app     # coupure ~2-5 s, acceptable Phase 0
git tag deploy-$(date +%Y%m%d-%H%M) && git push --tags
```
Vérif post-update minimale : /api/health + un parcours d'estimation.

Repo privé : `docker login ghcr.io` une seule fois sur le serveur, avec un PAT
portant le scope `read:packages` — seul secret à créer côté serveur.

Deux points sur la ligne de migration :
- Le CLI Prisma est récupéré par `npx --yes prisma@<version>` (réseau requis) et non
  embarqué dans l'image : la sortie standalone de Next ne trace que ce que le code
  applicatif importe, et le CLI n'en fait pas partie. La version est épinglée
  volontairement — **la garder alignée avec `devDependencies.prisma` du dépôt**.
  L'image embarque en revanche `prisma/` et `prisma.config.ts`, nécessaires au CLI.
- Alternative sans réseau ni épinglage manuel : laisser la CI jouer les migrations
  (le job `migrate` de `.github/workflows/main.yml` le fait déjà avec le secret
  `DATABASE_URL`) et retirer cette ligne. À privilégier si la base est joignable
  depuis GitHub Actions ; à garder ici si la base n'est accessible que du serveur.

## 8. Rollback

- Code : repasser `APP_IMAGE` sur le tag précédent dans `.env.docker` (les images sont
  taguées par sha et par `deploy-*`), puis `pull` + `up -d` (étapes §7).
- Base : les migrations Prisma ne se rollbackent pas automatiquement → en cas de
  migration défaillante, restaurer le dernier backup (§6) APRÈS confirmation
  explicite de l'utilisateur (règle 0.2), puis redéployer le tag précédent.
- Toujours consigner l'incident : post-mortem en annexe de RISKS.md (cf. OPS.md §5).

---

## Récapitulatif de sortie (à produire par Claude Code en fin de déploiement)

Rendre compte à l'utilisateur avec : URL en ligne, tag git déployé, résultat des
CHECK 1-6, emplacement des backups, TODO restants côté humain (DNS www, moniteur,
copie hors-site des backups, contenu des mentions légales).

---

## Note de session (CI Azure/GHCR en place, hébergement pas encore provisionné)

CHECK 1 est vert (build/lint/test + greps propres). Le nom de marque est paramétré via
`NEXT_PUBLIC_BRAND_NAME` (et non `NEXT_PUBLIC_SITE_NAME` cité plus haut : différence de
nom sans impact, D1 toujours ouverte).

CHECK 2+ restent bloqués : ni serveur ni base de production à ce jour. Le workflow
`.github/workflows/main.yml` cible Azure Web App + GHCR ; il suppose des ressources et
des secrets qui doivent exister avant de pouvoir aboutir :
`AZURE_WEBAPP_PUBLISH_PROFILE`, `DATABASE_URL` (secrets) et `AZURE_WEBAPP_NAME` (variable).

Déjà en place dans le dépôt :
- `next.config.ts` : `output: "standalone"`.
- `src/app/api/health/route.ts` : healthcheck DB (CHECK 4/6 et monitoring).
- `Dockerfile`, `docker-compose.yml`, `Caddyfile`, `.dockerignore`, `setup.sh`,
  `.env.docker.example`.
- `docker-compose.yml` : le service `app` consomme l'image publiée (`${APP_IMAGE}`),
  il ne construit plus rien sur le serveur.

**Corrections rendues nécessaires par la CI** (le build échouait avant, de deux façons) :
1. `prisma generate` n'était joué nulle part en CI et le client généré est gitignoré →
   ajouté en `postinstall` du `package.json`, ce qui couvre CI, Docker et install locale.
2. Les pages `/prix-hotel/[slug]`, entièrement prérendues, lisaient la table
   `CoefficientValo` : le build exigeait donc un Postgres joignable — impossible en CI
   et au build d'image. Elles lisent désormais les constantes statiques du dépôt
   (`src/data/coefficients.ts` × modificateurs géographiques), d'où le seed tire déjà
   ces mêmes valeurs. Aucun changement de valeur affichée, et la dépendance était de
   toute façon illusoire : des pages figées au build ne reflétaient pas les éventuelles
   modifications ultérieures en base. Le moteur d'estimation, lui, continue de lire la
   table à l'exécution (éditable par l'admin — OPS.md §7). Verrouillé par des tests
   (`src/lib/valuation.test.ts`) qui comparent les deux sources.

**Non vérifié — à retester au premier déploiement réel** : le Docker daemon n'est pas
disponible dans l'environnement de session (pas de Docker-in-Docker), donc ni le build
d'image ni la ligne `npx --yes prisma@... migrate deploy` du §7 n'ont pu être exécutés.
Le build applicatif lui-même a en revanche été validé sans base joignable, ce qui était
le point de rupture principal.
