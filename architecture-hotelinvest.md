# Architecture — Plateforme d'annonces de biens hôteliers
*(Concept type « SeLoger » appliqué à l'hôtellerie : hôtels, résidences de tourisme, murs et fonds de commerce)*

---

## 1. Vision du produit

Une marketplace mettant en relation :
- **Vendeurs / cédants** : propriétaires d'hôtels, groupes hôteliers, agences spécialisées en transactions CHR, mandataires.
- **Acheteurs / repreneurs** : investisseurs, exploitants, foncières, fonds, particuliers.

Types de biens gérés :
- Murs seuls (immobilier)
- Fonds de commerce seul
- Murs + fonds
- Résidences de tourisme, auberges, campings, chambres d'hôtes (extension possible)

---

## 2. Arborescence du site (Site Map)

```
Accueil
├── Recherche / Résultats (liste + carte)
│   └── Fiche annonce détaillée
├── Vendre / Déposer une annonce
├── Estimation en ligne (valorisation d'un hôtel)
├── Espace Pro (agences / mandataires)
│   ├── Tableau de bord
│   ├── Gestion des annonces
│   ├── Statistiques (vues, contacts, leads)
│   └── Abonnement & facturation
├── Espace Acheteur
│   ├── Favoris & recherches sauvegardées
│   ├── Alertes email
│   └── Messagerie
├── Contenu éditorial
│   ├── Guides (acheter/vendre un hôtel, financement, réglementation ERP...)
│   ├── Actualités du marché hôtelier
│   └── Baromètre des prix (€/chambre, multiples d'EBITDA par région)
├── Annuaire des professionnels (agences, avocats, experts-comptables CHR)
└── Pages légales (CGU, RGPD, mentions, cookies)
```

---

## 3. Modules fonctionnels

### 3.1 Recherche & découverte
- Recherche par localisation (ville, département, région, rayon, dessin de zone sur carte)
- Filtres métier spécifiques hôtellerie :
  - Type de transaction : murs / fonds / murs+fonds / location-gérance
  - Nombre de chambres, classement (1★ à 5★), enseigne / indépendant
  - Chiffre d'affaires, EBITDA, taux d'occupation, RevPAR
  - Prix, licence IV, restaurant, parking, travaux à prévoir
- Double affichage liste + carte interactive (clusters)
- Tri : pertinence, prix, CA, date de publication
- Recherches sauvegardées + alertes email/push

### 3.2 Fiche annonce
- Galerie photos / vidéo / visite virtuelle
- Données financières (CA N-3 à N, EBITDA, loyer si murs séparés) — masquables jusqu'à signature NDA
- **Mode confidentiel** : localisation approximative + teaser, accès au dossier complet après NDA électronique (spécificité clé du marché hôtelier)
- Documents joints (bilan simplifié, plans) en accès contrôlé
- Formulaire de contact + prise de rendez-vous
- Annonces similaires

### 3.3 Dépôt & gestion d'annonces
- Formulaire multi-étapes avec validation
- Upload photos (redimensionnement, watermark automatique)
- Modération avant publication (manuelle + automatique)
- Options de mise en avant payantes (remontée, « à la une »)

### 3.4 Comptes & rôles
| Rôle | Capacités |
|---|---|
| Visiteur | Recherche, consultation des teasers |
| Acheteur inscrit | Favoris, alertes, contact, signature NDA |
| Vendeur particulier | Dépôt limité d'annonces |
| Professionnel (agence/mandataire) | Multi-annonces, stats, import de flux XML, abonnement |
| Admin | Modération, gestion utilisateurs, CMS, facturation |

### 3.5 Messagerie & leads
- Messagerie interne acheteur ↔ annonceur
- Qualification des leads (budget, financement, délai)
- Notifications email + push
- Export CRM pour les pros (API / webhook)

### 3.6 Estimation en ligne
- Formulaire : localisation, nb chambres, classement, CA, EBITDA
- Moteur de valorisation (multiples par région et catégorie, €/chambre)
- Génération d'un rapport PDF → capture de leads vendeurs

### 3.7 Monétisation
- Abonnements pro (paliers selon nb d'annonces)
- Options de visibilité (boost, premium)
- Leads qualifiés vendus aux pros
- Publicité / partenariats (banques, assureurs CHR)

---

## 4. Architecture technique

### 4.1 Vue d'ensemble

```
[Clients]
  Web (Next.js SSR/SSG)  |  Mobile (React Native ou PWA)
        │
        ▼
[API Gateway / BFF]  ← Auth (JWT + OAuth2)
        │
        ├── Service Annonces (CRUD, modération, workflow NDA)
        ├── Service Recherche (Elasticsearch / Meilisearch + géo)
        ├── Service Utilisateurs & Auth
        ├── Service Messagerie & Notifications
        ├── Service Estimation (moteur de valorisation)
        ├── Service Paiement & Abonnements (Stripe)
        └── Service Médias (upload, resize, CDN)
        │
        ▼
[Données]
  PostgreSQL (+ PostGIS)  |  Elasticsearch  |  Redis (cache, sessions)
  S3 / stockage objets (photos, documents NDA)
```

### 4.2 Stack recommandée

| Couche | Choix | Justification |
|---|---|---|
| Frontend web | **Next.js (React) + TypeScript** | SEO critique pour un portail d'annonces (SSR), performances |
| Style | Tailwind CSS | Rapidité de développement |
| Cartographie | Mapbox GL ou Leaflet + OpenStreetMap | Clusters, dessin de zones |
| Backend | **Node.js (NestJS)** ou Django | Structuré, écosystème riche ; monolithe modulaire au départ |
| Base de données | **PostgreSQL + PostGIS** | Requêtes géographiques, robustesse relationnelle |
| Recherche | **Elasticsearch** (ou Meilisearch au MVP) | Facettes, géo-recherche, tolérance aux fautes |
| Cache / files | Redis + BullMQ | Sessions, alertes email asynchrones |
| Stockage médias | S3-compatible + CDN (CloudFront/Cloudflare) | Photos lourdes, documents confidentiels (URLs signées) |
| Paiement | Stripe (Billing pour abonnements) | Abonnements pro + options one-shot |
| Emails | Brevo / SendGrid | Alertes, transactionnel |
| Signature NDA | Yousign / DocuSign (API) | Conformité eIDAS, marché français |
| Auth | JWT + refresh tokens, OAuth Google/LinkedIn | LinkedIn pertinent pour cible B2B |
| Infra | Docker + hébergement France/UE (Scaleway, OVH) ou AWS eu-west | RGPD, latence |
| Monitoring | Sentry + Grafana/Prometheus | Suivi erreurs et performances |

> **Conseil MVP** : démarrer en monolithe modulaire (NestJS ou Django) avec PostgreSQL + Meilisearch, puis extraire des services quand la charge le justifie. Éviter les microservices dès le départ.

### 4.3 SEO (vital pour ce type de site)
- Rendu serveur (SSR) + pages statiques pour les landing géographiques (« hôtel à vendre Lyon », « murs d'hôtel Bretagne »)
- URLs propres : `/annonces/hotel-a-vendre/lyon-69/hotel-3-etoiles-45-chambres-12345`
- Sitemap dynamique, données structurées Schema.org (`Product` / `Offer` / `LodgingBusiness`)
- Maillage interne par région/département/ville

---

## 5. Modèle de données (entités principales)

```
User (id, email, role, téléphone, société, vérifié, créé_le)
Agency (id, nom, siret, logo, abonnement_id)
Listing (id, titre, type_transaction [murs|fonds|murs_fonds|gérance],
         statut [brouillon|en_modération|publiée|sous_offre|vendue],
         confidentiel bool, prix, honoraires,
         localisation (point PostGIS), adresse_masquée,
         nb_chambres, classement_étoiles, enseigne,
         surface, licence_IV bool, restaurant bool,
         owner_id → User/Agency, publié_le)
ListingFinancials (listing_id, année, ca, ebitda, taux_occupation, revpar)
Media (id, listing_id, type [photo|vidéo|doc], url, ordre, watermark)
NDA (id, listing_id, buyer_id, statut [envoyé|signé|refusé], signé_le, doc_url)
Favorite (user_id, listing_id)
SavedSearch (id, user_id, critères jsonb, fréquence_alerte)
Lead / Message (id, listing_id, from_user, to_user, contenu, lu, créé_le)
Subscription (id, agency_id, plan, stripe_id, statut, échéance)
Estimation (id, email, critères jsonb, valeur_basse, valeur_haute, pdf_url)
```

---

## 6. API — Endpoints principaux (REST)

```
POST   /auth/register | /auth/login | /auth/refresh
GET    /listings?lat&lng&radius&rooms_min&price_max&transaction_type...
GET    /listings/:id
POST   /listings                    (pro/vendeur)
PATCH  /listings/:id
POST   /listings/:id/nda            (demande d'accès dossier confidentiel)
POST   /listings/:id/contact        (lead)
GET    /me/favorites | POST /me/favorites/:listingId
POST   /me/saved-searches
GET    /pro/dashboard/stats
POST   /estimations
POST   /billing/checkout | webhooks Stripe
```

---

## 7. Sécurité & conformité

- **RGPD** : hébergement UE, consentement cookies, registre des traitements, droit à l'effacement, DPO si volumétrie
- Données financières des annonces confidentielles : chiffrées au repos, accessibles uniquement après NDA signé, URLs signées à expiration
- Rate limiting, protection anti-scraping (les concurrents aspirent les annonces), CAPTCHA sur formulaires
- Vérification des annonceurs pro (SIRET, carte T le cas échéant)
- Loi Hoguet à considérer selon le rôle de la plateforme (simple diffuseur vs intermédiaire)

---

## 8. Roadmap suggérée

**Phase 1 — MVP (2-3 mois)**
Recherche + carte, fiches annonces, dépôt d'annonce avec modération, comptes acheteur/vendeur, contact par formulaire, SEO de base.

**Phase 2 — Monétisation (2 mois)**
Espace pro, abonnements Stripe, statistiques, options de mise en avant, alertes email.

**Phase 3 — Différenciation (3 mois)**
Mode confidentiel + NDA électronique, estimation en ligne, import de flux XML des agences, baromètre des prix, application mobile / PWA.

---

## 9. Équipe type pour le lancement

- 1 dev fullstack (Next.js + NestJS) — ou 2 pour accélérer
- 1 designer UI/UX (ponctuel)
- 1 profil métier/commercial pour sourcer les premières annonces (le contenu est le nerf de la guerre d'une marketplace)

---

> **Note (juillet 2026)** : ce document est la version v1, historique, de l'architecture.
> Il a été remplacé par `CLAUDE.md` (spécifications techniques faisant foi) et par la
> stratégie « data-first » de `PLAN.md` v2 (l'estimation précède la marketplace, cf.
> `DECISIONS.md` DP1). Le conserver ici à titre de référence ; en cas de contradiction,
> `CLAUDE.md` et `PLAN.md` font foi (voir `INDEX.md`).
