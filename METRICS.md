# METRICS.md — Indicateurs, instrumentation & pilotage

> Définit ce qu'on mesure, pourquoi, et ce que Claude Code doit instrumenter.
> Règle : chaque phase a UNE métrique étoile. Le reste est du diagnostic.

---

## 1. Métrique étoile par phase

| Phase | North Star | Cible |
|---|---|---|
| 0 | **Leads vendeurs qualifiés / mois** (email + intention < 2 ans) | ≥ 15/mois au mois 2 (GATE : 30-50 cumulés) |
| 2 | **Revenu leads / mois** + taux d'acceptation des leads par les agences | 1 000 €/mois ; ≥ 70 % de leads jugés valides |
| 3 | **Mises en relation acheteur↔annonce / mois** | croissance mensuelle > 15 % |
| 3+ | **MRR** | 2-5 k€ à +6 mois de la Phase 3 |

## 2. Funnels à instrumenter (événements analytics)

### Funnel vendeur (Phase 0) — le plus important
`visite page SEO → clic CTA estimation → étape 1 → … → email soumis → résultat vu → intention déclarée`
- Mesurer le taux de complétion par étape (identifier l'étape qui fait fuir).
- Conversions cibles : visite→démarrage ≥ 8 % ; démarrage→email ≥ 40 %.
- Attribution : UTM + referrer stockés sur chaque lead (exigence ACQUISITION.md §6).

### Funnel agence (Phase 2)
`contact commercial → démo → pilote → payant → renouvellement`
- Churn mensuel cible < 4 % ; NPS informel à chaque point de contact.

### Funnel acheteur (Phase 3)
`visite annonce → contact/demande NDA → NDA signé → échange actif`
- Taux annonces avec ≥ 1 contact sous 30 jours (santé du stock) : cible ≥ 50 %.

## 3. Métriques de santé (diagnostic, pas pilotage)

- **SEO** : impressions et clics Search Console par cluster de pages (prix-hotel/*,
  hotel-a-vendre/*, guides), positions sur 20 requêtes cibles suivies.
- **Produit** : temps de complétion de l'estimation, taux d'erreur formulaires,
  Core Web Vitals (LCP < 2,5 s mobile).
- **Qualité des leads** : % emails valides (bounce), % téléphones joignables,
  distribution des intentions (curiosité vs < 1 an).
- **Marketplace (Phase 3)** : délai médian modération < 24 h, ratio annonces
  actives/expirées, % annonces confidentielles.
- **Technique** : uptime, erreurs Sentry, durée des jobs BullMQ.

## 4. Anti-vanity metrics

Ne jamais piloter sur : pages vues brutes, nombre d'inscrits sans action, followers,
nombre d'annonces si elles sont mortes. Une annonce sans contact en 60 jours compte
en négatif, pas en positif.

## 5. Instrumentation — exigences pour Claude Code

- [ ] Analytics privacy-first (Plausible/Matomo) avec événements personnalisés nommés
      `funnel_vendeur.step_N`, `estimation.completed`, `lead.qualified`, etc.
      Convention : `domaine.action` en snake_case, documentée dans le code.
      **Fait en partie** : `estimation.completed` et `lead.qualified` journalisés
      (table interne) ; pas de `funnel_vendeur.step_N` par étape (le formulaire est
      un wizard client sans aller-retour serveur par étape) ni de script Plausible/Matomo
      externe branché — à faire si le suivi du décrochage par étape s'avère nécessaire.
- [x] Table `AnalyticsEvent` interne en complément (source de vérité indépendante du
      script client, insensible aux adblockers) pour les événements critiques du funnel.
- [x] Champs `utmSource/utmMedium/utmCampaign/referrer` sur Estimation et Lead.
- [ ] Dashboard admin (Phase 0.4) affichant : la north star, le funnel vendeur par
      étape, les sources — 1 écran, lisible en 30 secondes.
      **Fait en partie** : north star (total leads), répartition par intention et par
      source affichées ; pas de détail par étape du formulaire (dépend du point ci-dessus).
- [x] Export CSV de tout.
- [x] Aucune donnée personnelle dans les outils d'analytics tiers (IDs uniquement) —
      vacuellement vrai, aucun outil tiers n'est encore branché.

## 6. Rituel de pilotage (humain)

- Hebdo : 15 min — north star, funnel vendeur, nouveaux leads.
- Mensuel : revue complète + mise à jour des cibles dans ce fichier + revue RISKS.md.
- Le GATE de Phase 0 se décide sur les chiffres de ce fichier, pas au ressenti.
