// Coefficients nationaux de base par classement — avant modificateur régional/départemental
// (src/data/geo.ts). Ordres de grandeur à partir de MARKET.md §5 (multiple d'EBITDA, €/chambre,
// RevPAR). Hypothèses de travail à réviser dès que des données réelles sont disponibles —
// cf. BUSINESS.md, MARKET.md (données de juillet 2026).

export interface StarCoefficient {
  starRating: number;
  ebitdaMultipleLow: number;
  ebitdaMultipleHigh: number;
  /** en euros, hors modificateur régional */
  pricePerRoomLow: number;
  /** en euros, hors modificateur régional */
  pricePerRoomHigh: number;
}

export const BASE_COEFFICIENTS: StarCoefficient[] = [
  { starRating: 0, ebitdaMultipleLow: 2.5, ebitdaMultipleHigh: 4.0, pricePerRoomLow: 25_000, pricePerRoomHigh: 45_000 },
  { starRating: 1, ebitdaMultipleLow: 3.0, ebitdaMultipleHigh: 4.5, pricePerRoomLow: 35_000, pricePerRoomHigh: 55_000 },
  { starRating: 2, ebitdaMultipleLow: 4.0, ebitdaMultipleHigh: 5.5, pricePerRoomLow: 45_000, pricePerRoomHigh: 70_000 },
  { starRating: 3, ebitdaMultipleLow: 5.0, ebitdaMultipleHigh: 7.0, pricePerRoomLow: 65_000, pricePerRoomHigh: 100_000 },
  { starRating: 4, ebitdaMultipleLow: 6.5, ebitdaMultipleHigh: 8.5, pricePerRoomLow: 90_000, pricePerRoomHigh: 150_000 },
  { starRating: 5, ebitdaMultipleLow: 8.0, ebitdaMultipleHigh: 10.5, pricePerRoomLow: 140_000, pricePerRoomHigh: 250_000 },
];

/** Marge d'EBITDA par défaut appliquée au CA quand l'EBITDA n'est pas renseigné (MARKET.md §5 : 25-35 %). */
export const DEFAULT_EBITDA_MARGIN = 0.3;

/**
 * Facteur appliqué selon le type de transaction : le multiple d'EBITDA et le €/chambre
 * valorisent par défaut l'exploitation murs+fonds ; on discount pour les autres cas.
 * Hypothèse à faire valider par un professionnel de la transaction (RISKS.md R8).
 */
export const TRANSACTION_TYPE_FACTOR: Record<string, number> = {
  MURS_FONDS: 1.0,
  MURS: 0.75,
  FONDS: 0.35,
  GERANCE: 0.25,
};

export function baseCoefficientFor(starRating: number): StarCoefficient {
  const clamped = Math.max(0, Math.min(5, Math.round(starRating)));
  const found = BASE_COEFFICIENTS.find((c) => c.starRating === clamped);
  if (!found) throw new Error(`Aucun coefficient de base pour ${clamped} étoiles`);
  return found;
}
