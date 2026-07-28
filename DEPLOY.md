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

## 3-quater. Test de la pile sur une machine locale (recommandé avant la VM)

Permet de valider toute la chaîne sans serveur ni domaine. Prérequis : Docker + Docker
Compose. L'override `docker-compose.local.yml` construit l'image au lieu de la tirer de
GHCR, et fait servir Caddy sur `localhost` avec un certificat auto-signé.

```bash
cp .env.example .env && cp .env.docker.example .env.docker
# dans .env.docker : DOMAIN=localhost, APP_IMAGE=hotelmarket:local
# dans .env        : DATABASE_URL=postgresql://hotelmarket:<mdp>@db:5432/hotelmarket?schema=public
#                    NEXT_PUBLIC_SITE_URL=http://localhost:3000, ADMIN_PASSWORD, ADMIN_SESSION_SECRET

C="docker compose --env-file .env.docker -f docker-compose.yml -f docker-compose.local.yml"
$C build app
$C up -d db
$C --profile tools run --rm tools "corepack enable && pnpm install --frozen-lockfile && pnpm prisma migrate deploy"
$C --profile tools run --rm tools "corepack enable && pnpm db:seed"
$C up -d app caddy
curl -s localhost:3000/api/health          # -> {"status":"ok"}
curl -kI https://localhost/                # -> 200 + en-têtes de sécurité
```
Puis dérouler à la main le parcours d'estimation sur <http://localhost:3000>, et l'admin
sur <http://localhost:3000/admin>.

Pour tout arrêter et repartir de zéro : `$C down -v` (⚠️ `-v` supprime les données).

## 3-ter. Chemin retenu : Oracle Cloud Always Free (DECISIONS.md DP15)

Hébergeur choisi pour la Phase 0 : une VM Oracle Cloud « Always Free », gratuite sans
limite de durée. Architecture **arm64** (Ampere A1) — d'où l'image `linux/arm64`
construite par la CI.

### 3-ter.1 Création du compte et de la VM (à faire par l'utilisateur)

1. Compte sur <https://www.oracle.com/cloud/free/> — une carte bancaire est demandée
   pour vérification d'identité, **sans débit** tant qu'on reste sur les ressources
   Always Free et qu'on ne fait pas d'« upgrade » explicite.
2. ⚠️ **La région d'origine (« home region ») ne peut plus être changée ensuite.**
   Choisir une région UE pour le RGPD (MARKET.md §4.2) : Paris ou Marseille en
   priorité ; si la capacité ARM y est saturée, Francfort ou Amsterdam.
3. Créer une instance de calcul :
   - Image : **Ubuntu 24.04** (variante aarch64)
   - Shape : **VM.Standard.A1.Flex**, `2 OCPU` / `12 Go` (le maximum Always Free depuis
     juin 2026 — au-delà, l'instance devient payante)
   - Volume de démarrage : 50 Go suffit largement
   - Ajouter sa **clé SSH publique** (garder la clé privée précieusement)
4. ⚠️ Erreur fréquente « Out of host capacity » : la capacité ARM gratuite est souvent
   épuisée. Réessayer plus tard, changer de domaine de disponibilité, ou de région.
5. Ouvrir les ports **80** et **443** — deux endroits, l'oubli du second est le piège
   classique d'Oracle :
   - Dans la console : VCN → Security List de la sous-réseau public → règles entrantes
     `0.0.0.0/0` TCP 80 et 443
   - Sur la VM elle-même, les images Ubuntu d'Oracle embarquent des règles iptables
     restrictives :
     ```bash
     sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
     sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
     sudo netfilter-persistent save
     ```

Informations à me transmettre ensuite : **IP publique** et **accès SSH**.

### 3-ter.2 Mise en service (sur la VM)

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker "$USER" && newgrp docker

git clone https://github.com/MarcMizrahi/plateforme-hotel-Christie-co.git app && cd app
cp .env.example .env && cp .env.docker.example .env.docker
```

Compléter ensuite les deux fichiers (⚠️ jamais de secret dans le dépôt) :
- `.env.docker` : `POSTGRES_PASSWORD` (générer : `openssl rand -hex 24`), `DOMAIN`,
  `APP_IMAGE`
- `.env` : `DATABASE_URL` pointant sur le service `db`
  (`postgresql://hotelmarket:<mdp>@db:5432/hotelmarket?schema=public`),
  `NEXT_PUBLIC_SITE_URL=https://<domaine>`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`
  (`openssl rand -hex 32`), `SMTP_*`

Puis :
```bash
./deploy.sh                              # pull + migrations + démarrage + health check
```

**Première installation uniquement — seeder les coefficients.** Sans cette étape, le
moteur d'estimation renvoie « Coefficients de valorisation indisponibles » : c'est le
produit qui ne marche pas, donc CHECK 5 échoue. Le seed passe par le service `tools`
(cf. docker-compose.yml), qui dispose des dépendances de développement :
```bash
docker compose --env-file .env.docker --profile tools run --rm tools \
  "corepack enable && pnpm db:seed"
```
Vérification : `docker compose --env-file .env.docker exec db psql -U hotelmarket -d hotelmarket -c 'select count(*) from "CoefficientValo";'` → doit renvoyer 78.

⚠️ `corepack enable` est nécessaire à **chaque** invocation de `tools` : son shim `pnpm`
n'est pas dans le volume `node_modules` persistant, contrairement aux dépendances.

**CHECK 3-ter** : `docker compose --env-file .env.docker ps` → services `Up` ;
`curl -I https://<domaine>` depuis l'extérieur → certificat Caddy valide.

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
cd ~/app && git pull       # met à jour compose/Caddyfile/migrations, pas l'image
./deploy.sh                # pull + migrations + bascule + health check
git tag deploy-$(date +%Y%m%d-%H%M) && git push --tags
```
`deploy.sh` épingle automatiquement la version du CLI Prisma en la lisant dans
`package.json` — rien à maintenir à la main. Pour déployer un tag précis (ou revenir
en arrière) : `./deploy.sh <tag-ou-sha>`.

Vérif post-update minimale : /api/health + un parcours d'estimation.

Repo privé : `docker login ghcr.io` une seule fois sur le serveur, avec un PAT
portant le scope `read:packages` — seul secret à créer côté serveur.

Pourquoi les migrations tournent sur le serveur et non dans la CI : la base Postgres est
un conteneur interne à la VM, non exposé sur Internet (et c'est bien ainsi) — GitHub
Actions ne peut donc pas l'atteindre.

Pourquoi elles passent par le service `tools` et non par l'image applicative : jouer le
CLI Prisma depuis l'image publiée a été tenté puis abandonné après échec reproduit en
local (`Cannot find module 'prisma/config'`). La sortie standalone de Next ne trace que
ce que le code applicatif importe — ni le CLI Prisma ni `dotenv`, tous deux requis par
`prisma.config.ts`. Le service `tools` monte le dépôt et installe les dépendances dans
un volume nommé, réutilisé d'un déploiement à l'autre.

Si un jour la base devient managée et joignable publiquement, l'alternative est de
rendre le job de migration à la CI et d'alléger `deploy.sh` d'autant.

Repo public : l'image GHCR est publique, aucun `docker login` n'est nécessaire sur le
serveur. Si le dépôt repassait en privé, il faudrait un PAT `read:packages`.

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

## Note de session (cible Oracle Always Free, VM pas encore provisionnée)

CHECK 1 est vert (build/lint/test + greps propres). Le nom de marque est paramétré via
`NEXT_PUBLIC_BRAND_NAME` (et non `NEXT_PUBLIC_SITE_NAME` cité plus haut : différence de
nom sans impact, D1 toujours ouverte).

CHECK 2+ restent bloqués : la VM Oracle n'existe pas encore (création côté utilisateur,
§3-ter.1). Le workflow `.github/workflows/main.yml` ne cible plus Azure — hébergement
tranché en faveur d'Oracle Always Free (DECISIONS.md DP15), les jobs `migrate` et
`deploy` Azure ont été retirés :
- ils exigeaient des ressources payantes (App Service conteneur = B1 minimum) ;
- le job `migrate` supposait une base joignable depuis GitHub Actions, ce qui n'est pas
  le cas avec un Postgres interne à la VM.

L'image est désormais construite en **linux/arm64** (Ampere A1) sur les runners
`ubuntu-24.04-arm`, gratuits et illimités sur ce dépôt public. Corollaire : elle ne
tourne pas sur une machine amd64 — pour un déploiement x86, ajouter `linux/amd64` aux
`platforms` du job `image`.

Déjà en place dans le dépôt :
- `next.config.ts` : `output: "standalone"`.
- `src/app/api/health/route.ts` : healthcheck DB (CHECK 4/6 et monitoring).
- `Dockerfile`, `docker-compose.yml`, `Caddyfile`, `.dockerignore`, `setup.sh`,
  `.env.docker.example`.
- `docker-compose.yml` : le service `app` consomme l'image publiée (`${APP_IMAGE}`),
  il ne construit plus rien sur le serveur.
- `deploy.sh` : pull, migrations, bascule et health check en une commande (§7).

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

### Validation locale de la pile complète (faite, 17/17)

La pile a été montée et testée en local sur un clone neuf du dépôt (`git archive`, sans
`node_modules`, pour reproduire ce que verra la VM). Résultats :

| Élément | Résultat |
|---|---|
| Build de l'image (Dockerfile multi-stage, sortie standalone) | OK — 186 Mo |
| `docker compose up db` + healthcheck | OK |
| Migrations Prisma via le service `tools` | OK |
| Seed des 78 coefficients + vérification en base | OK |
| `deploy.sh` de bout en bout (pull → migrations → bascule → health) | OK |
| Caddy : HTTPS, HSTS, X-Content-Type-Options, X-Frame-Options, redirection 80→443 | OK |
| Parcours d'estimation complet → page résultat avec fourchette | OK |
| Admin : redirection sans session, connexion, lead visible avec sa source UTM | OK |
| Export CSV téléchargé, contenant le lead et l'UTM | OK |
| robots.txt, sitemap.xml (avec les pages `prix-hotel`) | OK |
| Erreurs console navigateur | aucune |

**Deux défauts réels trouvés et corrigés à cette occasion** — ils auraient tous deux fait
échouer le déploiement sur la VM :
1. `prisma migrate deploy` depuis l'image publiée échouait
   (`Cannot find module 'prisma/config'`) : la sortie standalone ne trace ni le CLI
   Prisma ni `dotenv`. → service `tools` introduit dans docker-compose.yml ; les `COPY`
   de `prisma/` et `prisma.config.ts` ont été retirés de l'image, devenus inutiles.
2. La commande de seed documentée utilisait `docker run --env-file`, qui **ne retire pas
   les guillemets** des valeurs (contrairement à `env_file` de compose) : `DATABASE_URL`
   arrivait invalide (`P1013`). → passe aussi par `tools`.

**Reste non vérifié** : l'architecture **arm64** (l'environnement de test est amd64) et
donc le build sur runner `ubuntu-24.04-arm`, ainsi que l'obtention d'un certificat
Let's Encrypt sur un vrai domaine (le test local utilise le certificat auto-signé que
Caddy génère pour `localhost`).
