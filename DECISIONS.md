# DECISIONS.md — Décisions à trancher & journal

> Deux sections : (A) les décisions OUVERTES qui requièrent l'utilisateur — Claude Code
> ne doit jamais les trancher seul, mais peut travailler autour ; (B) le journal des
> décisions PRISES, avec date et justification, pour ne jamais re-débattre sans faits nouveaux.

---

## A. Décisions ouvertes (bloquantes signalées 🔴)

### D1 🔴 — Nom de la marque et domaine
Statut : ouvert. « HotelMarket » = nom de code uniquement (BRAND.md §2).
À faire : brainstorm, vérif INPI + domaines, décision avant la mise en ligne Phase 0.
En attendant : nom paramétrable en config partout dans le code.

### D2 🔴 — Statut juridique du porteur et de l'activité
Micro-entreprise, SASU ? Impacte facturation Stripe, CGV, assurance RC pro.
À faire : décision + immatriculation avant le premier euro encaissé (Phase 2).

### D3 🔴 — Consentement et exclusivité des leads
Un lead vendeur est-il vendu à UNE agence (exclusif, plus cher) ou jusqu'à 3 ?
Impacte le pricing (BUSINESS.md §2), le consentement RGPD à recueillir, et le produit.
Recommandation par défaut si rien n'est décidé d'ici la Phase 2 : exclusif au début
(qualité perçue maximale), ouverture au multi plus tard.

### D4 — Périmètre géographique du lancement
France entière d'emblée (SEO programmatique le permet) ou 2-3 régions pilotes pour
concentrer la prospection d'agences ? Recommandation : SEO national, prospection
commerciale régionale (littoral + une métropole).

### D5 — Rappel téléphonique des leads : interne ou pas du tout ?
Le rappel humain (OPS.md §3) améliore fortement la qualité mais coûte du temps.
Alternative : vendre les leads « bruts » moins cher. À trancher en Phase 2 selon
la disponibilité réelle du porteur.

### D6 — Extension du périmètre des biens
Campings, chambres d'hôtes, résidences de tourisme : marchés adjacents avec les mêmes
vendeurs-cédants. Par défaut : hors périmètre jusqu'à validation du cœur hôtelier
(PLAN.md Phase 7). Ne rouvrir qu'avec des données.

### D7 — Hébergeur de production
Scaleway / OVH / autre UE. Critères : Postgres managé abordable, S3-compatible,
localisation France. À trancher en Phase 6, sans impact avant.

---

## B. Journal des décisions prises

> Format : `Dx — [date] Décision. Justification. Réversibilité.`

- **DP1 — [2026-07] Stratégie data-first** : l'estimation et la donnée sont le produit
  d'entrée, la marketplace vient en Phase 3. Justification : risque de liquidité et
  sélection adverse (RISKS.md R1-R2), monétisation leads plus rapide. Réversible si
  le GATE révèle une demande différente. → PLAN.md v2.
- **DP2 — [2026-07] Positionnement diffuseur, pas intermédiaire** : aucune commission
  au succès, aucun maniement de fonds, pas de module de négociation. Justification :
  loi Hoguet (MARKET.md §4). Réversible uniquement avec carte T + refonte juridique.
- **DP3 — [2026-07] Monolithe modulaire NestJS + Next.js, montants en centimes,
  français via fr.json** : cf. CLAUDE.md. Standard, réversible à coût croissant.
- **DP4 — [2026-07] Phase 0 en stack allégée** (Next.js seul + Prisma/Postgres, sans
  monorepo ni NestJS) : vitesse de validation avant industrialisation. Migration
  prévue en Phase 1 sans casse SEO.
- **DP5 — [2026-07] Cible mid-market hors Paris intramuros au lancement** :
  justification MARKET.md §1-2. Réversible quand la marque existera.
- **DP6 — [2026-07] Pas de publicité payante avant épuisement du levier SEO** :
  CAC insoutenable sur ce volume de marché (ACQUISITION.md §5).
- **DP7 — [2026-07] Implémentation Phase 0 sur Next.js 16** (satisfait l'exigence
  CLAUDE.md « 14+ »). Justification : version disponible au moment du build, écosystème
  Tailwind v4 / Prisma 7 à jour. Différences de rupture (params/searchParams
  asynchrones, `proxy.ts` remplace `middleware.ts`, client Prisma généré en TS avec
  adaptateur `@prisma/adapter-pg`) documentées dans `AGENTS.md` et `CLAUDE.md` (note
  de session). Réversible : rétrograder vers 14/15 referait perdre ces acquis mais
  resterait mécanique.
- **DP8 — [2026-07] Auth admin Phase 0 = mot de passe unique + cookie signé HMAC**,
  pas de table `User`. Justification : aucun compte multi-rôle n'existe encore en
  Phase 0 (CLAUDE.md §4 est un schéma cible de Phase 1+) ; un seul opérateur au
  lancement (OPS.md §1 : ~30 min/jour). Réversible : migrera vers le modèle
  User/JWT de CLAUDE.md en Phase 1.
- **DP9 — [2026-07] Coefficients de valorisation seedés par région (13) × classement
  (6) = 78 lignes**, avec un ajustement départemental multiplicatif calculé en code
  (`src/data/geo.ts`) plutôt que 96 × 6 lignes en base. Justification : couvre la
  nuance demandée par MARKET.md §5 (ex. Paris vs Île-de-France) sans multiplier les
  lignes à maintenir manuellement par l'admin. Réversible : migration triviale vers
  une granularité par département si les données réelles le justifient.
- **DP10 — [2026-07] Guides de fond rédigés en fichiers `.mdx` statiques** (un
  dossier de route par guide), pas de CMS. Justification : 3 guides fixes en Phase 0,
  pas de besoin d'édition par un non-développeur pour l'instant. Réversible : un CMS
  headless pourra remplacer ces fichiers sans changer les URLs.
- **DP11 — [2026-07] Vitest retenu comme unique test runner de la Phase 0**
  (conforme CLAUDE.md §2 « Vitest (front) »). Playwright a été utilisé ponctuellement
  en session pour la vérification manuelle (captures d'écran, audit Lighthouse) puis
  retiré des dépendances du projet pour ne pas alourdir le stack sans besoin e2e
  navigateur explicite. Réversible : à réintroduire en Phase 1 si des tests e2e
  navigateur (parcours NDA, etc.) sont priorisés.

- **DP12 — [2026-07] Les pages SEO `/prix-hotel/*` lisent les coefficients statiques
  du dépôt, pas la table `CoefficientValo`.** Justification : ces pages sont
  intégralement prérendues au build, donc leur contenu est figé jusqu'au déploiement
  suivant — la lecture en base n'apportait aucune fraîcheur mais imposait un Postgres
  joignable au moment du build, ce qui faisait échouer la CI et le build de l'image
  Docker. Le seed dérive la table de ces mêmes constantes : valeurs identiques
  (vérifié). Le moteur d'estimation continue de lire la table à l'exécution, donc la
  vocation « éditable par l'admin » (OPS.md §7) est préservée là où elle a du sens.
  Réversible : rebasculer ces pages en rendu dynamique/ISR si l'on veut un jour que
  les modifications admin s'y reflètent sans redéploiement.
- **DP13 — [2026-07] `prisma generate` en `postinstall`** plutôt qu'une étape explicite
  dans chaque pipeline. Justification : le client généré est gitignoré ; un seul point
  couvre CI, build d'image et installation locale, et supprime une classe d'erreurs
  « module not found » à chaque nouvel environnement. Réversible sans conséquence.
- **DP14 — [2026-07] L'image applicative est construite par la CI et publiée sur GHCR ;
  le serveur ne compile rien** (`docker-compose.yml` : `image: ${APP_IMAGE}`).
  Décision de l'utilisateur, prise en session. Conséquence : mises à jour par `pull`
  (DEPLOY.md §7), rollback en repointant `APP_IMAGE` sur un tag antérieur, et
  authentification `docker login ghcr.io` requise sur le serveur si le dépôt est privé.

---

## Règles pour Claude Code

1. Ne jamais implémenter un choix listé en section A — utiliser la valeur par défaut
   indiquée ou une abstraction (config, feature flag) qui laisse la décision ouverte.
2. Toute décision technique significative prise en cours de développement → l'ajouter
   en section B avec justification (règle déjà présente dans PLAN.md).
3. Si une instruction de l'utilisateur contredit une décision de la section B :
   le signaler poliment avec la référence, puis appliquer la volonté de l'utilisateur
   et mettre à jour le journal.
