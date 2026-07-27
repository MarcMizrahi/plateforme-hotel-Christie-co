# OPS.md — Opérations, modération & support

> Décrit le fonctionnement quotidien de la plateforme : ce que l'humain fait, ce que
> le produit automatise, et les procédures. Pour Claude Code : les sections [produit]
> génèrent des exigences d'outillage interne (admin, notifications, exports).

---

## 1. Charge opérationnelle par phase (estimation honnête)

| Phase | Temps humain/jour | Tâches dominantes |
|---|---|---|
| 0 | ~30 min | Suivi des leads, réponses emails, publication contenu |
| 2 | 1-2 h | Qualification téléphonique des leads chauds, relation agences |
| 3 | 2-4 h | + Modération des annonces, vérification des pros, support |

Si la charge dépasse ces ordres de grandeur, c'est un signal d'automatisation
manquante ou de friction produit — pas une fatalité.

## 2. Modération des annonces (Phase 3)

### SLA et règles
- Délai de modération : < 24 h ouvrées (affiché publiquement, mesuré dans METRICS.md).
- Toute annonce est relue par un humain avant publication. Pas d'auto-publication.

### Checklist de modération [produit : intégrer dans l'écran admin]
1. Annonceur vérifié (SIRET valide via API INSEE ; carte T à jour pour les pros).
2. Photos réelles de l'établissement (pas de stock, pas de photos volées — recherche
   inversée en cas de doute), watermark appliqué.
3. Cohérence financière : CA/chambre dans une plage plausible (alerte auto si
   CA > 80 k€/chambre ou < 8 k€/chambre), prix vs multiples du marché.
4. Pas d'établissement identifiable dans une annonce marquée confidentielle
   (nom, façade reconnaissable, adresse dans le texte libre).
5. Mentions obligatoires présentes : honoraires TTC et répartition (annonces pro).
6. Rédaction conforme BRAND.md (pas de superlatifs promo trompeurs).

### Motifs de rejet standardisés [produit : liste déroulante + email auto]
`SIRET invalide` · `Photos non conformes` · `Données financières incohérentes` ·
`Confidentialité compromise` · `Mentions légales manquantes` · `Doublon` · `Autre (texte libre)`

## 3. Qualification des leads vendeurs (Phase 2 — cœur du revenu)

Pipeline d'un lead : `estimation complétée → scoring auto → [si chaud] rappel humain
sous 48 h → fiche qualifiée → proposé aux agences du territoire → feedback agence`

- Scoring auto [produit] : intention déclarée (poids fort), complétude des données
  financières, taille de l'établissement, email pro vs perso, téléphone renseigné.
- Rappel humain : script court — confirmer l'horizon de vente, le consentement à être
  mis en relation, une info de contexte. 10 min max. Jamais de pression.
- Feedback agence [produit] : chaque lead noté (valide / injoignable / hors cible) ;
  lead invalide = remboursé/recrédité automatiquement. Ce feedback nourrit le scoring.

## 4. Support utilisateurs

- Canal unique au début : email (support@…) + formulaire. Pas de chat en direct
  avant d'avoir le volume qui le justifie.
- SLA réponse : 24 h ouvrées. Modèles de réponses pour les 10 questions récurrentes
  (mot de passe, modification d'annonce, fonctionnement NDA, désabonnement,
  suppression de compte RGPD…).
- [produit] La suppression de compte et l'export RGPD doivent être self-service
  (zéro ticket) dès la Phase 5.

## 5. Procédures d'incident

### Fuite de confidentialité (le pire scénario — cf. RISKS.md R7)
1. Couper l'accès concerné (feature flag / dépublication immédiate).
2. Évaluer le périmètre via les logs d'accès aux dossiers confidentiels.
3. Informer le(s) vendeur(s) concerné(s) sous 24 h, honnêtement.
4. Notification CNIL sous 72 h si données personnelles concernées.
5. Post-mortem écrit en annexe de RISKS.md.

### Indisponibilité du site
- Healthchecks + alerte (UptimeRobot ou équivalent) → runbook : vérifier conteneurs,
  logs Sentry, restaurer la dernière sauvegarde si corruption. RTO cible : 4 h.

### Contenu illicite signalé (LCEN/DSA)
- [produit] Bouton « signaler » sur chaque annonce → file admin dédiée.
- Retrait ou blocage sous 24 h si manifestement illicite, traçabilité de la décision.

## 6. Rituels

- **Quotidien (15 min)** : file de modération, leads chauds à rappeler, alertes Sentry.
- **Hebdo (1 h)** : métriques (METRICS.md §6), publication contenu, relances agences.
- **Mensuel (2 h)** : revue RISKS.md, sauvegardes testées, factures/abonnements,
  mise à jour des coefficients de valorisation si nouvelles données.

## 7. Outillage interne minimal [produit]

L'admin de la plateforme doit couvrir, sans outil externe : modération avec checklist,
gestion des leads et de leur statut, gestion des agences et crédits, consultation des
logs d'accès confidentiels, édition des coefficients de valorisation, bannissement.
Tout le reste (CRM commercial, compta) reste hors produit — tableur assumé.
