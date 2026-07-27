# INDEX.md — Guide de la documentation projet

> Point d'entrée. À lire en premier par Claude Code et par toute personne rejoignant le projet.

---

## Les fichiers et leur autorité

| Fichier | Rôle | Fait foi sur |
|---|---|---|
| **CLAUDE.md** | Spécifications techniques : stack, structure, modèle de données, règles métier, conventions | La technique |
| **PLAN.md** (v2) | Roadmap par phases avec cases à cocher, GATE de validation | L'ordre d'exécution |
| **MARKET.md** | Marché, concurrents, réglementation (loi Hoguet, DGCCRF, CNIL…) | Le positionnement business & juridique |
| **BUSINESS.md** | Modèle de revenus, pricing, coûts, jalons financiers | L'économie du projet |
| **ACQUISITION.md** | Go-to-market : SEO, prescripteurs, vente aux agences | La croissance |
| **BRAND.md** | Positionnement de marque, ton, identité visuelle, principes UX | Le design & la voix |
| **RISKS.md** | Registre des risques et mitigations [produit]/[humain] | La prudence |
| **METRICS.md** | North star par phase, funnels, instrumentation, rituels | La mesure |
| **OPS.md** | Modération, qualification des leads, support, incidents | Le quotidien |
| **DECISIONS.md** | Décisions ouvertes (ne pas trancher) + journal des décisions prises | L'arbitrage |
| architecture-hotelinvest.md | Document d'architecture initial (v1, historique) | Obsolète où il contredit CLAUDE.md/PLAN.md v2 |

## Ordre de résolution des conflits

1. Instruction explicite de l'utilisateur (puis mise à jour de DECISIONS.md §B)
2. DECISIONS.md (journal des décisions prises)
3. CLAUDE.md pour la technique · PLAN.md pour l'ordre · MARKET.md pour le juridique/business
4. Les autres fichiers dans leur domaine respectif

## Démarrage d'une session Claude Code

1. Lire INDEX.md (ce fichier), puis CLAUDE.md, puis la phase courante de PLAN.md.
2. Vérifier dans DECISIONS.md §A qu'aucune tâche prévue ne dépend d'une décision ouverte.
3. Travailler les tâches 🔴 de la phase courante ; cocher, committer, tester.
4. En fin de session : mettre à jour les cases de PLAN.md et, si besoin, DECISIONS.md §B.

## Invariants absolus (rappel transverse)

- ⛔ Ne jamais franchir le GATE de la Phase 0 sans décision humaine explicite.
- ⛔ Aucune fonctionnalité d'intermédiation (négociation, maniement de fonds,
  commission au succès) — cf. DP2.
- ⛔ Aucune donnée confidentielle (adresse exacte, financiers détaillés, identité)
  exposée sans NDA signé — appliqué côté serveur.
- ⛔ Décisions ouvertes de DECISIONS.md §A : abstraire, ne pas trancher.
- Nom de marque paramétrable partout (D1 non tranchée).

## État du projet à ce jour

- Documentation : complète (11 fichiers).
- Code : Phase 0 (MVP de validation marché) implémentée — voir PLAN.md et README.md.
- Décisions bloquantes avant mise en ligne : D1 (nom), D2 (statut juridique).
