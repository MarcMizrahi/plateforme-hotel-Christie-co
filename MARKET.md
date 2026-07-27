# MARKET.md — Étude de marché, concurrence & réglementation

> Contexte marché du projet HotelMarket. Complète CLAUDE.md (technique) et PLAN.md (roadmap).
> Utilité pour Claude Code : ce fichier justifie certaines règles métier (positionnement diffuseur,
> mentions obligatoires des annonces, vérification carte T) et alimente le contenu éditorial et SEO.
> Données collectées en juillet 2026 — à revérifier avant toute décision business majeure.

---

## 1. Taille et dynamique du marché

- Volume de transactions hôtelières en France : ~2,5 à 2,7 milliards € par an (estimations Christie & Co et cabinets d'études pour 2024), soit environ +25 % au-dessus de la moyenne des dix dernières années.
- Île-de-France seule : ~1,9 milliard € transactés en 2025 (≈ 75 hôtels, ~6 000 chambres), en forte croissance du nombre de transactions de taille intermédiaire (source : Cushman & Wakefield).
- Parc hôtelier français : ~16 600 hôtels (en contraction vs ~17 700 en 2019).
- **Gisement clé : environ 18 % des établissements seraient à reprendre dans les 5 ans** (transmission, départs en retraite d'exploitants indépendants).
- Investisseurs privés et family offices dominent le volume ; rendements prime parisiens ~4,75-5,25 %.
- Durée moyenne de détention d'un actif hôtelier : 7 à 10 ans.

**Lecture stratégique** : les gros actifs (trophy, 4-5★) sont captés par les cabinets institutionnels.
La cible naturelle de la plateforme est le **mid-market et les hôtels indépendants en transmission**
(1★ à 4★, province et villes moyennes), segment volumineux et mal servi par le digital.

---

## 2. Concurrents directs — portails d'annonces

| Acteur | Positionnement | Forces | Faiblesses exploitables |
|---|---|---|---|
| **Les Annonces du Commerce** | Portail cession de commerces, section hôtels (~2 400 annonces) | Volume, contenus conseils | Généraliste CHR, pas de filtres financiers hôteliers, UX datée |
| **L'Hôtellerie Restauration** | Média de référence CHR avec rubrique fonds de commerce | Audience métier massive, crédibilité | L'annonce est un produit secondaire du média, expérience de recherche limitée |
| **Bpifrance — Bourse de la Transmission** | Agrégateur public d'annonces de cession via partenaires agréés, alertes email | Caution institutionnelle, gratuit | Simple agrégateur renvoyant vers les partenaires, pas de fiche riche ni de parcours |
| **ParuVendu / Leboncoin** | Généralistes avec catégorie vente d'hôtels | Trafic énorme | Zéro spécialisation : pas de données financières, pas de confidentialité |
| **hotels-a-vendre.com** (+ campings-a-vendre) | Petit portail spécialisé régional (Sud, réseau d'agents) | Ancienneté SEO sur la requête | Site vieillissant, couverture partielle |
| **hotelannonces.com** | Portail spécialisé + annuaire des agences | Spécialisation | Faible notoriété |

**Constat** : aucun acteur ne combine aujourd'hui (1) une vraie expérience de recherche type SeLoger
(carte + filtres métier), (2) les données financières hôtelières structurées (CA, EBITDA, RevPAR),
et (3) un parcours de confidentialité avec NDA. C'est l'espace de différenciation du projet.

---

## 3. Concurrents indirects — et futurs clients pros

Les cabinets et agences spécialisés réalisent l'essentiel des transactions. Ils sont concurrents
sur la relation vendeur, mais **clients cibles de l'espace pro** (diffusion de leurs mandats) :

- **Michel Simond** : réseau national de cession de commerces, très actif en hôtellerie (murs et fonds).
- **Huchet-Demorge** : spécialiste historique des fonds de commerce hôteliers parisiens, étendu au national.
- **Cabinets institutionnels** (gros actifs, portefeuilles) : Christie & Co, JLL Hotels & Hospitality, Cushman & Wakefield, BNP Paribas Real Estate — publient aussi les études de référence du marché.
- Réseaux de mandataires généralistes avec pôles commerces (Capifrance, etc.).
- Tissu d'agences régionales spécialisées CHR (littoral, montagne, grandes métropoles).

**Stratégie d'amorçage recommandée** : signer 5-10 agences spécialisées régionales pour la diffusion
de leurs mandats (gratuité initiale), en parallèle de la capture de vendeurs directs via l'estimation en ligne.

---

## 4. Cadre réglementaire et régulateurs

### 4.1 Loi Hoguet (loi n° 70-9 du 2 janvier 1970) — LE point structurant
- S'applique à toute personne exerçant de façon habituelle et rémunérée une **intermédiation**
  sur des immeubles ou des **fonds de commerce** : agents immobiliers, mandataires, chasseurs, marchands de listes.
- Exigences pour les intermédiaires : **carte professionnelle T** ("transaction sur immeubles et fonds
  de commerce") délivrée par la CCI (validité 3 ans depuis la loi ALUR), garantie financière si maniement
  de fonds, assurance RC professionnelle, mandat écrit obligatoire.
- Sanctions : exercice sans carte = jusqu'à 1 an d'emprisonnement et 15 000 € d'amende ; transaction
  sans mandat valide annulable avec perte de la rémunération.

**Décision de positionnement (à respecter dans tout le produit)** :
> La plateforme est un **support de diffusion d'annonces et de mise en relation** (modèle SeLoger),
> PAS un intermédiaire. Elle ne négocie pas, ne rédige pas de mandats, ne perçoit ni honoraires de
> transaction ni fonds pour le compte de tiers. Revenus = abonnements, options de visibilité, leads.
> Toute évolution vers l'intermédiation (commission au succès, accompagnement de la négociation)
> déclencherait l'obligation de carte T — décision à valider avec un avocat avant d'y toucher.

Conséquences produit concrètes :
- Vérifier la **carte T et le SIRET** des annonceurs professionnels à l'inscription (fichier national tenu par CCI France).
- Afficher sur chaque annonce pro les **honoraires TTC et leur répartition** vendeur/acquéreur (obligation de transparence).
- Le NDA de la plateforme organise l'accès à l'information, pas la négociation.

### 4.2 Autres régulateurs et obligations
| Régulateur / texte | Périmètre pour la plateforme |
|---|---|
| **DGCCRF** | Loyauté des annonces, pratiques commerciales trompeuses, transparence des prix et honoraires |
| **CNIL / RGPD** | Données personnelles (comptes, leads), données financières sensibles des dossiers, consentement cookies, hébergement UE |
| **CCI France** | Délivrance et fichier national des cartes T (à utiliser pour la vérification des pros) |
| **Tracfin / LCB-FT** | Obligations anti-blanchiment pesant sur les professionnels de l'immobilier ; la plateforme diffuseur n'y est a priori pas soumise, mais à confirmer juridiquement si le modèle évolue |
| **Atout France** | Classement officiel des hôtels (1★-5★) — référentiel à utiliser pour le champ `starRating` |
| **LCEN / DSA** | Statut d'hébergeur de contenus tiers : procédure de signalement et retrait des annonces illicites à prévoir |

### 4.3 Réglementations métier utiles au contenu éditorial (guides SEO)
- Licence IV (débit de boissons) attachée au fonds — argument de valeur d'une annonce.
- Normes ERP (établissement recevant du public), accessibilité, sécurité incendie — coûts de mise
  en conformité à intégrer dans les guides acheteurs.
- Performance énergétique (décret tertiaire) — pression croissante sur les murs hôteliers.

---

## 5. Références de valorisation (pour le moteur d'estimation)

Ordres de grandeur à affiner avec les données réelles (table de coefficients admin, cf. PLAN.md §4.1) :
- Rendement brut des actifs prime : ~5 à 8 % selon emplacement et positionnement.
- Rendements prime Paris : ~4,75-5,25 % (2025).
- CA typique hôtellerie indépendante : ~25 000-45 000 € par chambre et par an ; EBITDA ~25-35 % du CA.
- Méthodes usuelles : multiple d'EBITDA (varie par région/classement), €/chambre, % du CA pour le fonds.
- RevPAR moyen France ~85 € ; Grand Paris ~115 € ; Paris intramuros ~180 €.

---

## 6. Implications produit (résumé actionnable)

1. **Différenciation** = filtres financiers hôteliers + carte + mode confidentiel NDA : aucun concurrent ne les combine.
2. **Cible prioritaire** = hôtels indépendants 1-4★ en transmission, hors Paris intramuros (chasse gardée des cabinets).
3. **Positionnement juridique diffuseur** verrouillé : pas de commission au succès sans avis juridique.
4. **Vérification des pros** (carte T + SIRET) = argument de confiance ET obligation de sérieux.
5. **SEO** : les concurrents sont faibles en expérience de recherche — les landing géographiques
   ("hôtel à vendre + région/département") sont le levier d'acquisition n°1.
6. **Amorçage bilatéral** : agences régionales pour le stock d'annonces + estimation en ligne pour
   capter les vendeurs directs.

---

## 7. À faire vérifier par un juriste avant le lancement (TODO bloquants business)

- [ ] Confirmation écrite du statut de diffuseur (hors champ loi Hoguet) au regard du modèle de revenus exact
- [ ] Conformité DSA/LCEN du dispositif de modération et de signalement
- [ ] CGU et contrat d'abonnement pro
- [ ] Qualification LCB-FT de la plateforme
- [ ] Validité juridique du NDA électronique simplifié de la Phase 1
