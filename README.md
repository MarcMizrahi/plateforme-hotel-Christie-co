# HotelMarket

Marketplace d'annonces de biens hôteliers (murs, fonds de commerce, murs + fonds,
location-gérance), spécialisée hôtellerie, type SeLoger.

> Nom de code projet — voir `BRAND.md` §2 (décision de nom non tranchée, `DECISIONS.md` D1).

## Documentation du projet

Toute la documentation vit à la racine du dépôt. **Commencer par `INDEX.md`**, qui explique
le rôle de chaque fichier et l'ordre de résolution des conflits :

`INDEX.md` · `CLAUDE.md` · `PLAN.md` · `MARKET.md` · `BUSINESS.md` · `ACQUISITION.md` ·
`BRAND.md` · `RISKS.md` · `METRICS.md` · `OPS.md` · `DECISIONS.md`

Le projet est actuellement en **Phase 0** (`PLAN.md`) : un MVP de validation marché
(estimation en ligne + acquisition SEO), volontairement en stack allégée (pas de monorepo,
pas de NestJS — cf. `DECISIONS.md` DP4). L'industrialisation vers l'architecture cible de
`CLAUDE.md` n'intervient qu'après le GATE de fin de Phase 0.

## Prérequis

- Node.js 22+
- pnpm 10+
- PostgreSQL 16 (local ou distant)

## Installation

```bash
pnpm install
cp .env.example .env   # renseigner DATABASE_URL, ADMIN_PASSWORD, etc.
pnpm prisma migrate dev
pnpm db:seed            # seed la table de coefficients de valorisation (13 régions × 6 classements)
pnpm dev
```

Le site est alors disponible sur http://localhost:3000.

## Commandes

| Commande | Effet |
|---|---|
| `pnpm dev` | Serveur de développement |
| `pnpm build` | Build de production |
| `pnpm lint` | ESLint |
| `pnpm test` | Tests unitaires (Vitest) |
| `pnpm db:seed` | Seed des coefficients de valorisation |
| `pnpm prisma migrate dev` | Applique les migrations Prisma |
| `pnpm prisma studio` | Explorateur de base de données |

## Espace admin

`/admin` — protégé par le mot de passe `ADMIN_PASSWORD` (variable d'environnement, aucun
compte utilisateur en Phase 0). Affiche les leads vendeurs captés, le funnel de qualification
et permet un export CSV (`/admin/export`).

## État (Phase 0)

- Moteur d'estimation multi-étapes (`/estimation`) avec calcul de fourchette (multiple
  d'EBITDA × prix au €/chambre) et capture de lead qualifié (RGPD).
- ~109 pages SEO programmatiques `/prix-hotel/[region|departement]`.
- 3 guides de fond (`/guides`).
- Tableau de bord admin + export CSV.

Voir `PLAN.md` pour le détail des tâches et le GATE de décision Go/No-go.
