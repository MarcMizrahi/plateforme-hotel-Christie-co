# BRAND.md — Marque, positionnement & principes UX

> Cadre de marque et d'expérience. Guide les choix de design de Claude Code au-delà
> des tokens techniques de CLAUDE.md §7.

---

## 1. Positionnement

**Une phrase** : la référence de la valorisation et de la transmission hôtelière en France.

- On ne se présente PAS comme « le SeLoger des hôtels » publiquement (réflexe interne
  utile, promesse externe risquée tant que le stock d'annonces est faible).
- Promesse Phase 0-2 : « Sachez ce que vaut votre hôtel. » — data, gratuit, confidentiel.
- Promesse Phase 3+ : « Le marché de la transmission hôtelière, enfin lisible. »

## 2. Nom (décision utilisateur requise — TODO 🔴)

« HotelMarket » est un nom de code projet, probablement pas déposable ni distinctif.
Pistes à explorer : évoquer la valorisation/transmission plutôt que la vente
(ex. axes sémantiques : valeur, murs, clés, chambre, cession). Vérifications avant choix :
INPI (marque classe 35/36), domaine .fr/.com disponibles, pas d'homonyme CHR.
⚠️ Claude Code : coder avec un nom paramétrable (variable d'env / config), jamais en dur.

## 3. Personnalité de marque

- **Expert sans jargon** : on explique l'EBITDA à un hôtelier de 60 ans qui vend
  l'œuvre de sa vie, sans le prendre de haut.
- **Discret** : la confidentialité est une valeur de marque, pas juste une feature.
  Ton sobre, jamais de sensationnalisme (« pépite », « affaire en or » = interdits).
- **Chiffré** : chaque affirmation s'appuie sur une donnée. C'est le différenciateur.
- Registre : vouvoiement, phrases courtes, zéro emoji dans le produit.

## 4. Identité visuelle (cadre pour le design system)

- Palette : bleu nuit profond (confiance, nuit hôtelière) + doré discret (hospitalité
  premium) + gris chauds. Éviter le rouge/orange promo des portails d'annonces.
- Typographie : une serif élégante pour les titres (crédibilité éditoriale),
  une sans-serif très lisible pour l'interface et les chiffres (tabular numerals
  pour les tableaux financiers).
- Imagerie : photos d'architecture et de détails hôteliers (façades, clés, réceptions),
  jamais de photos de banque d'images avec figurants souriants.
- Les chiffres sont les héros visuels : le baromètre et les fourchettes d'estimation
  doivent être les éléments les plus soignés du site.

## 5. Principes UX

1. **La confiance avant la conversion** : afficher la méthode de calcul, les sources,
   la politique de confidentialité à chaque point de friction.
2. **Respect du vendeur** : l'email n'est demandé qu'au moment où l'on donne de la
   valeur en échange (le résultat d'estimation). Aucune relance agressive.
3. **Mobile-first réel** : les hôteliers consultent depuis la réception, le soir.
4. **Un formulaire = une question par écran** sur mobile (multi-étapes), jamais
   de mur de champs.
5. **Accessibilité** : cible générationnelle 50-65 ans → corps de texte ≥ 16px,
   contrastes AA, cibles tactiles généreuses.

## 6. Ce que la marque ne fait jamais

- Publier ou laisser deviner qu'un établissement précis est à vendre sans accord explicite.
- Vendre les données d'estimation à des tiers hors du cadre consenti (leads).
- Sur-promettre une valorisation pour flatter (l'estimation honnête est le produit).
