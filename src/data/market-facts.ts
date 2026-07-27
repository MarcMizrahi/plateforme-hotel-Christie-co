// Faits de marché cités sur les pages SEO — cf. MARKET.md §1 (données de juillet 2026,
// à revérifier avant toute décision business majeure). Le texte générique s'applique
// quand aucune donnée spécifique à la région n'est disponible.

export const NATIONAL_FACTS = {
  transactionVolume: "2,5 à 2,7 milliards €",
  transmissionShare: "environ 18 %",
  hotelCount: "environ 16 600",
  averageRevpar: "85 €",
  holdingPeriod: "7 à 10 ans",
};

export const REGION_FACTS: Record<string, string> = {
  "ile-de-france":
    "L'Île-de-France a concentré à elle seule environ 1,9 milliard € de transactions hôtelières en 2025 " +
    "(≈ 75 hôtels), avec un RevPAR moyen de 115 € en Grand Paris et jusqu'à 180 € à Paris intramuros. " +
    "Les gros actifs y sont largement captés par les cabinets institutionnels : notre marché naturel y est " +
    "le mid-market en petite et grande couronne, plus rarement Paris intramuros.",
  "provence-alpes-cote-dazur":
    "La Côte d'Azur et l'arrière-pays combinent tourisme international et forte saisonnalité : les " +
    "établissements indépendants bien situés s'y valorisent au-dessus de la moyenne nationale.",
  "auvergne-rhone-alpes":
    "Entre massifs alpins et métropole lyonnaise, la région conjugue hôtellerie de montagne à forte valeur " +
    "et marché urbain dynamique autour de Lyon.",
  corse:
    "Marché insulaire restreint en volume mais avec une forte prime touristique saisonnière, à interpréter " +
    "avec prudence tant les transactions y sont peu nombreuses.",
};

export function regionFact(regionSlug: string): string {
  return (
    REGION_FACTS[regionSlug] ??
    `Comme sur le reste du territoire, la transmission y est un phénomène de fond : ${NATIONAL_FACTS.transmissionShare} ` +
      `des établissements seraient à reprendre dans les 5 ans (départs en retraite d'exploitants indépendants, ` +
      `transmissions familiales).`
  );
}
