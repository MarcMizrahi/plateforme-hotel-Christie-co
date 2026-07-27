# RISKS.md — Registre des risques & mitigations

> Risques classés par gravité × probabilité. À relire à chaque fin de phase.
> Les mitigations marquées [produit] créent des tâches pour Claude Code ;
> celles marquées [humain] relèvent du porteur de projet.

---

## 🔴 Critiques (peuvent tuer le projet)

### R1 — Liquidité insuffisante (marché trop étroit)
Peu de transactions annuelles sur le mid-market ; une marketplace vide détruit la confiance.
- Mitigation : stratégie data-first (PLAN.md v2) — le produit estimation vit sans stock
  d'annonces. [produit] GATE de Phase 0 avec critères chiffrés avant tout investissement lourd.

### R2 — Sélection adverse des annonces
Les bonnes affaires se vendent hors marché ; le portail public attire les biens difficiles.
- Mitigation : [produit] mode confidentiel/NDA crédible dès l'ouverture de la marketplace ;
  [humain] curation qualitative des premières annonces (refuser vaut mieux qu'afficher du stock mort) ;
  [produit] mise en avant des mandats d'agences vérifiées.

### R3 — Requalification juridique en intermédiaire (loi Hoguet)
Une dérive du modèle (commission au succès, accompagnement de négociation) déclencherait
l'obligation de carte T, avec sanctions pénales.
- Mitigation : [humain] avis d'avocat écrit avant lancement commercial (MARKET.md §7) ;
  [produit] aucun flux de fonds entre acheteur et vendeur ne transite par la plateforme,
  aucun module de négociation ; wording contrôlé (« diffusion », « mise en relation »).

### R4 — Leads de mauvaise qualité → churn des agences
Le revenu n°1 s'effondre si les agences ne convertissent pas les leads.
- Mitigation : [produit] qualification forte (intention, horizon, coordonnées vérifiées,
  double opt-in) ; [humain] rappel téléphonique des leads chauds au début ; [produit]
  feedback loop : l'agence note chaque lead, remboursement des leads invalides.

## 🟠 Sérieux

### R5 — Dépendance SEO / mise à jour Google
- Mitigation : [humain] diversification précoce (presse CHR, LinkedIn, prescripteurs) ;
  [produit] capture email systématique pour constituer un actif propriétaire (la base).

### R6 — Riposte d'un acteur établi (L'Hôtellerie, Bpifrance, Michel Simond)
- Mitigation : vitesse + donnée propriétaire (historique d'estimations, coefficients
  affinés) difficile à répliquer ; [humain] envisager le partenariat plutôt que la
  confrontation (leur audience × notre outil).

### R7 — Fuite de données confidentielles (dossiers, identités de vendeurs)
Impact réputationnel fatal sur un marché où la discrétion est la monnaie.
- Mitigation : [produit] interceptor de confidentialité testé e2e, URLs signées,
  journalisation des accès, chiffrement au repos, pentest avant Phase 3 ; [humain]
  procédure de réponse à incident écrite.

### R8 — Fiabilité de l'estimation contestée
Une valorisation fantaisiste ruine la crédibilité (et peut créer un contentieux).
- Mitigation : [produit] afficher une fourchette large + la méthode + un disclaimer
  clair (« estimation indicative, ne remplace pas une expertise ») ; [humain] faire
  valider les coefficients initiaux par un professionnel de la transaction hôtelière.

## 🟡 À surveiller

### R9 — Scraping du stock d'annonces par les concurrents
- Mitigation : [produit] rate limiting, données de contact jamais exposées, watermark,
  détection de patterns anormaux.

### R10 — Saisonnalité et cycles longs (12-18 mois par transaction)
- Mitigation : [humain] piloter sur leads et MRR, pas sur les ventes conclues ;
  trésorerie dimensionnée pour 18 mois.

### R11 — Faux comptes / annonces frauduleuses
- Mitigation : [produit] vérification SIRET (API INSEE) + carte T pour les pros,
  modération manuelle systématique, CAPTCHA.

### R12 — Dépendance au porteur de projet (bus factor)
- Mitigation : [produit] documentation vivante (ces fichiers), infra reproductible
  en une commande, pas de dépendance à des services exotiques.

---

## Revue des risques
- Fin de chaque phase : relire ce fichier, mettre à jour statuts et nouveaux risques.
- Tout incident réel → post-mortem ajouté en annexe de ce fichier.
