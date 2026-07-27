# CLAUDE.md — Instructions projet « HotelMarket »

> Marketplace d'annonces de biens hôteliers (type SeLoger, spécialisé hôtellerie).
> Ce fichier est la source de vérité du projet. Lis-le entièrement avant toute modification de code.

---

## 1. Contexte & objectif

Construire une plateforme web mettant en relation vendeurs et acheteurs de biens hôteliers en France :
- **Types de biens** : murs seuls, fonds de commerce seul, murs + fonds, location-gérance
- **Cibles** : investisseurs, exploitants, agences spécialisées CHR, propriétaires indépendants
- **Langue de l'interface** : français uniquement (i18n prévu plus tard, ne pas coder en dur mais utiliser des fichiers de traduction fr.json dès le départ)

Différenciateurs métier par rapport à un portail immobilier classique :
1. **Mode confidentiel** : annonce publiée en teaser (localisation approximative, données financières masquées) ; accès au dossier complet uniquement après signature d'un NDA.
2. **Données financières hôtelières** : CA, EBITDA, taux d'occupation, RevPAR, nombre de chambres, classement en étoiles, licence IV.

---

## 2. Stack technique imposée

| Couche | Technologie |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js 14+ (App Router) + TypeScript strict + Tailwind CSS |
| Backend | NestJS + TypeScript strict (monolithe modulaire, PAS de microservices) |
| ORM | Prisma |
| Base de données | PostgreSQL 16 + extension PostGIS |
| Recherche | Meilisearch (MVP) — prévoir une interface abstraite pour migrer vers Elasticsearch plus tard |
| Cache / files d'attente | Redis + BullMQ (alertes email asynchrones) |
| Stockage fichiers | S3-compatible (utiliser MinIO en local via Docker) |
| Cartographie | Leaflet + OpenStreetMap (clusters avec leaflet.markercluster) |
| Auth | JWT access + refresh tokens, bcrypt, guards NestJS par rôle |
| Paiement | Stripe (Billing pour abonnements pro) — Phase 2, prévoir le module vide |
| Emails | Nodemailer + templates MJML ; en dev, utiliser Mailpit via Docker |
| Tests | Vitest (front), Jest + Supertest (back e2e) |
| Lint/format | ESLint + Prettier, config partagée dans le monorepo |

## 3. Structure du monorepo

```
hotelmarket/
├── CLAUDE.md
├── docker-compose.yml          # postgres+postgis, redis, meilisearch, minio, mailpit
├── package.json / pnpm-workspace.yaml / turbo.json
├── apps/
│   ├── web/                    # Next.js (App Router)
│   │   └── src/
│   │       ├── app/            # routes
│   │       ├── components/     # ui/ (génériques) et features/ (métier)
│   │       ├── lib/            # client API, helpers
│   │       └── locales/fr.json
│   └── api/                    # NestJS
│       └── src/
│           ├── modules/
│           │   ├── auth/
│           │   ├── users/
│           │   ├── listings/
│           │   ├── search/
│           │   ├── media/
│           │   ├── nda/
│           │   ├── leads/      # messagerie + contacts
│           │   ├── favorites/
│           │   ├── saved-searches/
│           │   ├── estimations/
│           │   └── billing/    # vide en Phase 1
│           └── prisma/schema.prisma
└── packages/
    ├── shared/                 # types TS partagés, DTOs zod, constantes métier
    └── config/                 # eslint, tsconfig, prettier partagés
```

---

## 4. Modèle de données (Prisma — à implémenter fidèlement)

Entités et champs clés (adapter la syntaxe Prisma, utiliser des enums) :

```
User        : id, email (unique), passwordHash, role (BUYER|SELLER|AGENCY|ADMIN),
              firstName, lastName, phone, companyName?, siret?, isVerified, createdAt
Agency      : id, name, siret, logoUrl?, users[] (relation), subscription?
Listing     : id, slug (unique, SEO), title, description,
              transactionType (MURS|FONDS|MURS_FONDS|GERANCE),
              status (DRAFT|PENDING_REVIEW|PUBLISHED|UNDER_OFFER|SOLD|ARCHIVED),
              isConfidential (bool),
              price (int, centimes), feesIncluded (bool),
              — localisation —
              city, department, region, postalCode,
              lat/lng exacts (privés) + latApprox/lngApprox (publics si confidentiel),
              — métier hôtelier —
              roomCount, starRating (0-5), brandName?, isIndependent,
              surfaceM2?, hasLicence4, hasRestaurant, hasParking, worksNeeded,
              ownerId → User, agencyId? → Agency,
              publishedAt?, viewCount, createdAt, updatedAt
ListingFinancials : id, listingId, year, revenue, ebitda?, occupancyRate?, revpar?
Media       : id, listingId, type (PHOTO|VIDEO|DOCUMENT), url, order, isConfidential
NdaRequest  : id, listingId, buyerId, status (PENDING|SIGNED|REJECTED), signedAt?, documentUrl?
Favorite    : userId + listingId (clé composite)
SavedSearch : id, userId, name, criteria (Json), alertFrequency (NONE|DAILY|WEEKLY)
Lead        : id, listingId, fromUserId, message, phone?, budget?, hasFinancing?, createdAt
Message     : id, leadId, senderId, content, readAt?, createdAt
Estimation  : id, email, criteria (Json), valueLow, valueHigh, pdfUrl?, createdAt
```

Règles :
- Prix et montants financiers en **centimes (Int)**, jamais en Float.
- Index géospatial PostGIS sur la localisation ; requêtes par rayon via SQL brut Prisma (`$queryRaw`).
- Slug généré automatiquement : `hotel-{starRating}-etoiles-{roomCount}-chambres-{city}-{shortId}`.

---

## 5. Règles métier critiques

1. **Confidentialité** : si `isConfidential = true`, l'API publique ne doit JAMAIS renvoyer : adresse exacte, lat/lng exacts, données financières détaillées, médias marqués confidentiels, nom de l'établissement. Renvoyer uniquement latApprox/lngApprox (arrondis à ~2 km) et une fourchette de prix. Le dossier complet n'est accessible qu'aux utilisateurs dont le NdaRequest est SIGNED pour cette annonce. Faire respecter cela au niveau d'un serializer/interceptor central, pas dans chaque contrôleur.
2. **Modération** : toute annonce créée passe en PENDING_REVIEW ; seul un ADMIN peut la passer en PUBLISHED.
3. **Rôles** : un BUYER ne peut pas créer d'annonce ; un SELLER est limité à 2 annonces actives ; une AGENCY est illimitée (quota géré plus tard par l'abonnement).
4. **Recherche** : synchroniser Meilisearch à chaque création/modification/suppression d'annonce publiée (hook ou event). Index : uniquement les champs publics.
5. **Anti-scraping** : rate limiting global (ThrottlerModule) + masquage email/téléphone (jamais renvoyés dans les listings, uniquement via le module leads).

---

## 6. Endpoints API (préfixe /api/v1)

```
POST   /auth/register, /auth/login, /auth/refresh, /auth/logout
GET    /listings                # filtres: transactionType, city, department, lat/lng/radius,
                                # priceMin/Max, roomsMin/Max, stars, hasLicence4, hasRestaurant,
                                # revenueMin, sort, page/limit
GET    /listings/:slug
POST   /listings                (SELLER|AGENCY)
PATCH  /listings/:id            (propriétaire ou ADMIN)
DELETE /listings/:id
POST   /listings/:id/media      (upload multipart → S3)
POST   /listings/:id/nda        (BUYER : demande d'accès)
PATCH  /nda/:id                 (propriétaire : accepter → SIGNED / refuser)
POST   /listings/:id/leads      (contact)
GET    /me, PATCH /me
GET/POST/DELETE /me/favorites
GET/POST/DELETE /me/saved-searches
GET    /me/leads, GET /me/leads/:id/messages, POST /me/leads/:id/messages
POST   /estimations             (public, capture email)
GET    /admin/listings?status=PENDING_REVIEW, PATCH /admin/listings/:id/status
```

Toutes les entrées validées avec Zod (DTOs dans `packages/shared`, réutilisés front et back).

---

## 7. Pages frontend (App Router)

```
/                                        Accueil : hero + recherche rapide + dernières annonces
/annonces                                Résultats : liste + carte côte à côte, filtres, pagination
/annonces/[slug]                         Fiche détaillée (+ bandeau NDA si confidentielle)
/vendre                                  Landing vendeur + formulaire multi-étapes de dépôt
/estimation                              Formulaire d'estimation
/connexion, /inscription
/mon-compte/(favoris|alertes|messages|annonces)
/admin/moderation                        (rôle ADMIN)
```

Exigences front :
- SSR pour /annonces et /annonces/[slug] (SEO critique). Metadata dynamiques + JSON-LD Schema.org.
- Design sobre et professionnel B2B : bleu nuit + doré discret, typographie lisible, pas de gadgets.
- Mobile-first, la carte devient un onglet basculable sur mobile.
- Composants réutilisables : ListingCard, FiltersPanel, MapView, PriceRange, StarRating, FinancialsTable, NdaBanner.

---

## 8. Ordre de construction (respecter cet ordre)

1. **Setup** : monorepo pnpm/turbo, docker-compose (postgres+postgis, redis, meilisearch, minio, mailpit), configs partagées, `.env.example` documenté.
2. **Schéma Prisma complet + migrations + seed** (seed : 1 admin, 2 agences, 3 vendeurs, 5 acheteurs, ~30 annonces réalistes réparties en France dont 8 confidentielles, avec financiers et photos placeholder).
3. **Module auth** (register/login/refresh, guards par rôle) + tests e2e.
4. **Module listings** (CRUD + règles métier + serializer confidentialité) + tests e2e sur la confidentialité (prioritaire).
5. **Module search** (sync Meilisearch + endpoint GET /listings avec filtres et géo).
6. **Module media** (upload MinIO, resize avec sharp, watermark).
7. **Front : accueil + page résultats (liste + carte + filtres)**.
8. **Front : fiche annonce + JSON-LD + parcours NDA**.
9. **Modules favorites, saved-searches, leads/messages + pages compte**.
10. **Front : dépôt d'annonce multi-étapes + admin modération**.
11. **Module estimations + page estimation.**
12. **Alertes email (BullMQ cron quotidien sur saved-searches).**

Après chaque étape : vérifier que `pnpm build`, `pnpm lint` et les tests passent avant de continuer.

---

## 9. Conventions & exigences qualité

- TypeScript strict partout, aucun `any` non justifié.
- Commits conventionnels (`feat:`, `fix:`, `chore:`...), un commit par étape logique.
- Pas de secrets en dur : tout via variables d'environnement, `.env.example` toujours à jour.
- Textes UI en français via `locales/fr.json`, jamais en dur dans les composants.
- Tests obligatoires sur : auth, règles de confidentialité NDA, quotas d'annonces, filtres de recherche.
- Accessibilité : labels sur tous les champs, navigation clavier sur les filtres et la carte.
- README.md à la racine : prérequis, `docker compose up`, commandes de dev, comptes de seed.

## 10. Hors périmètre (ne PAS implémenter maintenant)

- Paiement Stripe réel (créer uniquement le module billing vide avec TODO)
- Application mobile native
- i18n multi-langues (structure fr.json suffit)
- Signature électronique NDA via prestataire externe (en Phase 1 : simple acceptation horodatée en base, prévoir l'interface pour brancher Yousign plus tard)
- Import de flux XML des agences

---

## Note de session (Phase 0)

Le code actuel (voir README.md) implémente la Phase 0 de PLAN.md, en **stack allégée**
(Next.js seul, sans monorepo ni NestJS — DECISIONS.md DP4) : ce fichier CLAUDE.md décrit
l'architecture **cible** de la Phase 1 et au-delà, pas l'état actuel du dépôt. Toujours lire
PLAN.md pour savoir quelle phase est en cours avant d'appliquer une règle de ce fichier au pied
de la lettre (ex. `apps/web`, NestJS, Meilisearch n'existent pas encore).

Ce fichier a été fusionné avec `AGENTS.md` : Next.js 16 comporte des changements de rupture par
rapport aux versions antérieures (params/searchParams asynchrones, `proxy.ts` remplace
`middleware.ts`, générateur Prisma Client TS avec adaptateurs de pilote…) — consulter
`node_modules/next/dist/docs/` et `AGENTS.md` avant toute modification structurante du code Next.js.
