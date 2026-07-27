# PLAN.md — Feuille de route du projet HotelMarket (v2 — stratégie « data first »)

> ⚠️ v2 : cette version remplace la roadmap initiale. Changement stratégique majeur :
> le produit d'entrée n'est plus la marketplace d'annonces mais **l'estimation + la donnée**
> (modèle « MeilleursAgents de l'hôtellerie »), afin de valider la demande et de capter les
> vendeurs AVANT de construire la marketplace complète. Justification : MARKET.md §6 et
> risques de liquidité / sélection adverse.
>
> Utilisation par Claude Code : traiter les phases dans l'ordre, cocher `[x]` chaque tâche
> terminée. Tâches bloquantes marquées 🔴. **Ne JAMAIS franchir le GATE de la Phase 0
> sans instruction explicite de l'utilisateur.**

---

## PHASE 0 — MVP de validation marché (2-3 semaines de dev)

Objectif : un site minimal mais crédible qui mesure la demande réelle côté vendeurs.
Stack volontairement réduite : **Next.js seul (App Router) + SQLite ou Postgres simple +
déploiement immédiat**. PAS de monorepo, PAS de NestJS, PAS de Meilisearch à ce stade.

### 0.1 Socle minimal
- [x] 🔴 Projet Next.js 14+ TypeScript strict + Tailwind, repo git, déployable en 1 commande
- [x] 🔴 Base de données minimale (Prisma + Postgres) : tables Estimation, EmailLead, CoefficientValo
- [x] Textes en `locales/fr.json` dès le départ (conforme CLAUDE.md)
- [ ] Analytics respectueux (Plausible ou Matomo self-hosted) + événements de conversion —
      fait en partie : événements de conversion critiques journalisés en base
      (`AnalyticsEvent`), pas de script Plausible/Matomo externe branché ni de suivi
      par étape du formulaire (détail dans METRICS.md §5)

### 0.2 Moteur d'estimation (le produit)
- [x] 🔴 Formulaire multi-étapes : localisation → type (murs/fonds/les deux) → chambres,
      classement → CA, EBITDA (optionnels) → email obligatoire pour voir le résultat
- [x] 🔴 Calcul de fourchette : croisement multiple d'EBITDA (table de coefficients par
      région × classement, seedée avec les ordres de grandeur de MARKET.md §5) et €/chambre
- [x] Page de résultat soignée : fourchette, méthode expliquée, facteurs d'ajustement
- [x] Envoi du rapport par email (email riche HTML ; fallback journalisé si SMTP absent)
- [x] Question de qualification en fin de parcours : « Envisagez-vous de vendre ? »
      (oui < 1 an / 1-2 ans / simple curiosité) — c'est LA donnée qui valide le projet

### 0.3 Acquisition SEO (le carburant)
- [x] 🔴 ~115 pages statiques générées : /prix-hotel/[region] (13) et /prix-hotel/[departement] (~96)
      avec contenu réel : fourchettes de valorisation locales, chiffres du marché, CTA estimation
- [x] 🔴 3 guides de fond (Markdown/MDX) : « Combien vaut mon hôtel », « Vendre son hôtel :
      les étapes », « Multiple d'EBITDA en hôtellerie » — maillage vers l'estimation
- [x] Metadata dynamiques, JSON-LD, sitemap.xml, robots.txt, Lighthouse mobile ≥ 90
      (vérifié : performance 99-100, accessibilité 100, SEO 100 sur l'accueil et une page région)
- [x] Page d'accueil : proposition de valeur « Estimez votre hôtel gratuitement » + baromètre teaser

### 0.4 Mesure
- [x] Tableau de bord admin minimal (protégé par mot de passe) : leads captés, source,
      réponse à la question de qualification, funnel de conversion
- [x] Export CSV des leads

### 🚦 GATE — Critères de décision (mesure sur ~2 mois après mise en ligne)
| Signal | Go | No-go |
|---|---|---|
| Emails de propriétaires captés | ≥ 30-50 | < 10 |
| Dont intention de vente < 2 ans | ≥ 30 % | quasi nulle |
| Trafic SEO organique | tendance croissante | plat après 2 mois |

- **GO** → poursuivre en Phase 1 (industrialisation) puis Phase 2-3.
- **NO-GO** → pivoter ou arrêter : coût total limité à ~3 semaines de dev.
- Entre les deux → prolonger la mesure, tester des canaux payants ciblés (presse CHR).

⛔ Claude Code : ne pas entamer la Phase 1 sans validation explicite de l'utilisateur.
**Le code de la Phase 0 est fonctionnel et déployé en local (voir README.md) ; le site n'a
pas encore été mis en ligne publiquement et aucune mesure réelle n'a donc encore été faite.
Le GATE n'est ni atteint ni franchi — il reste à mesurer.**

---

## PHASE 1 — Industrialisation du socle (si GO)

Migration vers l'architecture cible de CLAUDE.md, en conservant tout ce qui tourne.

- [ ] 🔴 Monorepo pnpm + Turborepo, docker-compose (postgres+postgis, redis, minio, mailpit),
      configs partagées — structure CLAUDE.md §3
- [ ] 🔴 Migration du site Phase 0 dans `apps/web` sans régression SEO (mêmes URLs, redirections 301 si besoin)
- [ ] 🔴 API NestJS `apps/api` : modules auth (JWT + rôles) et estimations (reprise du moteur)
- [ ] Schéma Prisma complet (toutes les entités CLAUDE.md §4) + migrations + seed
- [ ] CI GitHub Actions : lint + build + tests
- [ ] Tests e2e : auth, moteur d'estimation

---

## PHASE 2 — Monétisation données & leads (le premier revenu)

Vendre aux agences spécialisées ce qu'elles ne trouvent nulle part : des vendeurs qualifiés.

- [ ] 🔴 Espace agence : inscription avec vérification SIRET + carte T (champ + upload,
      validation manuelle admin — cf. MARKET.md §4)
- [ ] 🔴 Marketplace de leads vendeurs : les leads d'estimation qualifiés (intention < 2 ans,
      consentement explicite RGPD à être recontacté) sont proposés aux agences par territoire
- [ ] Tarification simple : abonnement par département/région ou paiement au lead (Stripe)
- [ ] Baromètre public des prix : page /barometre par région (€/chambre, multiples) alimentée
      par la table de coefficients + données saisies — actif SEO et crédibilité
- [ ] Emails automatiques de nurturing des vendeurs (BullMQ) : conseils transmission, rappels
- [ ] RGPD strict sur les leads : consentement tracé, durée de rétention, opt-out simple

---

## PHASE 3 — Marketplace d'annonces (l'extension naturelle)

Une fois le flux de vendeurs et le réseau d'agences établis, ouvrir la place de marché.
Reprendre ici l'essentiel de l'ancienne roadmap :

- [ ] 🔴 Module listings complet : CRUD, statuts, modération, quota vendeur, slug SEO
      (règles métier CLAUDE.md §5)
- [ ] 🔴 Interceptor de confidentialité + parcours NDA (tests e2e prioritaires :
      anonyme / buyer sans NDA / buyer signé / propriétaire / admin)
- [ ] 🔴 Recherche : Meilisearch + filtres métier + géo PostGIS
- [ ] Module médias : upload MinIO, resize sharp, watermark, URLs signées
- [ ] Front : /annonces (liste + carte Leaflet + filtres, SSR) et /annonces/[slug] (JSON-LD)
- [ ] Dépôt d'annonce multi-étapes avec brouillons
- [ ] Admin modération + emails de publication/rejet
- [ ] Obligation d'affichage des honoraires TTC et répartition sur les annonces pro (MARKET.md §4)

---

## PHASE 4 — Parcours acheteurs & rétention

- [ ] Comptes acheteurs : favoris, recherches sauvegardées, alertes email quotidiennes (cron BullMQ)
- [ ] Messagerie leads acheteur ↔ annonceur, indicateurs non-lus
- [ ] Tableau de bord vendeur/agence : annonces, vues, leads, gestion des NDA
- [ ] Pages compte complètes

---

## PHASE 5 — Sécurité, conformité, qualité (en continu, verrou avant prod)

- [ ] 🔴 Audit anti-fuite : aucune route ne doit exposer email/téléphone/données confidentielles
- [ ] Helmet, CORS strict, rate limiting, CAPTCHA (inscription, estimation, contact)
- [ ] Journalisation des accès aux dossiers confidentiels
- [ ] Bandeau cookies, pages légales (avec TODO juriste explicites), export/suppression de compte
- [ ] 🔴 TODO juridiques bloquants de MARKET.md §7 adressés (statut diffuseur, DSA, CGU, LCB-FT, NDA)
- [ ] Suite de tests verte + audit accessibilité (axe) sur les pages principales

---

## PHASE 6 — Production

- [ ] 🔴 Dockerfiles multi-stage, docker compose de prod avec Caddy/Traefik (HTTPS auto)
- [ ] Hébergement UE, sauvegardes quotidiennes testées (restauration vérifiée)
- [ ] Sentry front + back, healthchecks, logs structurés (pino)
- [ ] SMTP transactionnel réel (Brevo/SendGrid) avec SPF/DKIM
- [ ] Checklist lancement : Lighthouse, parcours complets en prod, pages 404/500

---

## PHASE 7 — Backlog (ne pas développer sans demande explicite)

- Options de mise en avant des annonces, statistiques avancées agences
- Signature NDA via Yousign, import de flux XML des agences
- Annuaire des professionnels CHR, PWA/notifications push, i18n anglais
- Extension campings / chambres d'hôtes / résidences de tourisme

---

## Règles de progression pour Claude Code

1. Ordre strict des phases ; dans une phase, tâches 🔴 d'abord.
2. ⛔ Le GATE de fin de Phase 0 requiert une décision humaine explicite — ne jamais le franchir seul.
3. Après chaque tâche : cocher ici, commit dédié, `pnpm lint && pnpm build && pnpm test`.
4. Choix non couvert par ce fichier ou CLAUDE.md → option la plus simple + documentation
   dans une section « Décisions » en fin de fichier.
5. Conflit entre fichiers : CLAUDE.md fait foi pour la technique, PLAN.md pour l'ordre,
   MARKET.md pour le positionnement business et juridique.

## Décisions (implémentation Phase 0)

- Next.js 16 utilisé (satisfait l'exigence « 14+ ») ; breaking changes vs versions antérieures
  documentées dans `AGENTS.md` (params/searchParams asynchrones, `proxy.ts` remplace
  `middleware.ts`, générateur Prisma Client TS avec adaptateurs de pilote `@prisma/adapter-pg`).
- Table `CoefficientValo` seedée par **région** × classement (78 lignes), avec un ajustement
  **départemental** multiplicatif calculé en code (`src/data/geo.ts`) pour quelques marchés
  atypiques (Paris, littoral, montagne) — évite d'avoir à seeder 96 × 6 lignes tout en gardant
  la nuance requise par MARKET.md §5.
- Authentification admin Phase 0 : mot de passe unique (`ADMIN_PASSWORD`) + cookie de session
  signé HMAC, pas de table `User` (celle-ci arrive en Phase 1). Cf. CLAUDE.md note de session.
- Tests : Vitest choisi conformément à CLAUDE.md §2 (front). Playwright utilisé ponctuellement
  en session pour la vérification manuelle du parcours (captures d'écran, Lighthouse) puis retiré
  des dépendances — à réintroduire en Phase 1 si des tests e2e navigateur sont souhaités.
- Guides rédigés en `.mdx` (fichiers statiques par route, pas de CMS) via `@next/mdx`.
