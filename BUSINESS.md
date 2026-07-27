# BUSINESS.md — Modèle économique & finances

> Complète MARKET.md (marché) et PLAN.md (roadmap). Hypothèses de travail à confronter
> aux données réelles dès la Phase 0. Tout chiffre ici est une hypothèse, pas une promesse.

---

## 1. Sources de revenus, dans l'ordre d'activation

| # | Revenu | Phase | Client | Logique |
|---|---|---|---|---|
| 1 | **Leads vendeurs qualifiés** | 2 | Agences spécialisées | Le produit le plus rare du marché : un propriétaire qui envisage de vendre, identifié 12-24 mois avant la mise en vente |
| 2 | **Abonnements de diffusion** | 3 | Agences & mandataires | Diffusion des mandats sur la marketplace (modèle SeLoger) |
| 3 | Options de visibilité | 7 | Annonceurs | Boost, à la une — uniquement quand l'audience acheteurs existe |
| 4 | Partenariats / affiliation | 7 | Banques, assureurs, experts CHR | Mise en relation financement & conseil des repreneurs |

Interdit par positionnement juridique (MARKET.md §4) : commission au succès sur les transactions.

## 2. Hypothèses de pricing (à tester, ne pas coder en dur)

- **Lead vendeur qualifié** : 150-400 € l'unité selon exclusivité et qualification
  (référence : un mandat hôtelier rapporte à l'agence des honoraires de plusieurs
  dizaines de milliers d'euros — le lead peut être vendu cher s'il est bon).
  Variante : abonnement territorial 300-800 €/mois par département avec quota de leads.
- **Abonnement diffusion** (Phase 3) : 3 paliers indicatifs — Starter ~99 €/mois
  (5 annonces), Pro ~249 €/mois (20 annonces + stats), Réseau ~590 €/mois (illimité + API/flux).
- Vendeur particulier : 1 annonce gratuite en Phase 3 (amorçage du stock), payant ensuite.

Règles produit : tous les prix en centimes en base, grille tarifaire modifiable par
l'admin sans déploiement, période d'essai gratuite paramétrable.

## 3. Structure de coûts (ordres de grandeur mensuels au lancement)

- Infra (VPS UE, DB, stockage, emails, Sentry) : 100-300 €
- Outils (analytics, CAPTCHA, domaine) : < 50 €
- Juridique (setup CGU, statut diffuseur, RGPD) : 3-6 k€ one-shot puis ponctuel
- Contenu SEO si externalisé : 500-1 500 €
- Le vrai coût : le temps commercial pour signer les agences et animer les vendeurs.

## 4. Économie unitaire cible

- CAC vendeur via SEO ≈ coût du contenu / leads — objectif < 30 € par lead qualifié.
- Revenu par lead vendu ≥ 150 € → marge brute confortable si le SEO délivre.
- LTV agence (abonnement 12 mois moyen × palier) : à mesurer, churn cible < 4 %/mois.

## 5. Jalons financiers de bon sens

1. Fin Phase 0 : 0 € de revenu — on achète de l'information (le GATE).
2. Phase 2, mois 3 : premières ventes de leads — objectif symbolique 1 000 €/mois
   avec 3-5 agences actives.
3. Phase 3, mois 6-9 : 10-15 agences abonnées → 2-5 k€ MRR, seuil de viabilité
   d'un projet solo/duo.
4. Les cycles de transaction durant 12-18 mois, ne pas indexer le moral sur les
   ventes conclues : piloter sur les leads et le MRR.

## 6. Ce qui tuerait le modèle (à surveiller)

- Leads de mauvaise qualité → les agences ne renouvellent pas : la qualification
  (intention, coordonnées vérifiées, rappel téléphonique éventuel) est le cœur du produit.
- Dépendance à Google : diversifier tôt (presse CHR, LinkedIn, partenariats CCI).
- Un acteur établi (L'Hôtellerie, Bpifrance) qui copie : la défense est la donnée
  propriétaire accumulée (coefficients de valorisation réels, historique des estimations).
