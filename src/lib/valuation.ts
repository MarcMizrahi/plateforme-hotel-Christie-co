import { DEPARTMENTS_BY_SLUG, REGIONS_BY_SLUG, effectiveModifier, regionOfDepartment } from "@/data/geo";
import { BASE_COEFFICIENTS, DEFAULT_EBITDA_MARGIN, TRANSACTION_TYPE_FACTOR } from "@/data/coefficients";
import type { CoefficientValo } from "@/generated/prisma/client";

export type TransactionTypeValue = "MURS" | "FONDS" | "MURS_FONDS" | "GERANCE";

export interface ValuationInput {
  transactionType: TransactionTypeValue;
  regionSlug: string;
  departmentSlug: string;
  roomCount: number;
  starRating: number;
  revenueCents?: number | null;
  ebitdaCents?: number | null;
}

export interface ValuationResult {
  valueLowCents: number;
  valueHighCents: number;
  methodNotes: string;
  impliedEbitdaCents: number | null;
}

function round100(cents: number): number {
  return Math.round(cents / 100) * 100;
}

/**
 * Calcule une fourchette de valorisation en croisant deux méthodes usuelles
 * (multiple d'EBITDA, €/chambre) — cf. MARKET.md §5. Le coefficient régional
 * vient de la base (CoefficientValo, seedée région × classement) ; le département
 * peut affiner via son propre modificateur (src/data/geo.ts) quand il diffère
 * sensiblement de la moyenne régionale (ex. Paris vs Île-de-France).
 */
export function computeValuation(
  input: ValuationInput,
  coefficient: CoefficientValo
): ValuationResult {
  const department = DEPARTMENTS_BY_SLUG.get(input.departmentSlug);
  const region = REGIONS_BY_SLUG.get(input.regionSlug);
  if (!department || !region) {
    throw new Error("Localisation inconnue pour le calcul de valorisation");
  }

  const regionModifierUsed = regionOfDepartment(department).modifier;
  const deptAdjustment = effectiveModifier(department) / regionModifierUsed;

  const transactionFactor = TRANSACTION_TYPE_FACTOR[input.transactionType] ?? 1;

  const impliedEbitdaCents =
    input.ebitdaCents ??
    (input.revenueCents ? Math.round(input.revenueCents * DEFAULT_EBITDA_MARGIN) : null);

  const methodBLowCents = round100(
    input.roomCount * coefficient.pricePerRoomLowCents * deptAdjustment * transactionFactor
  );
  const methodBHighCents = round100(
    input.roomCount * coefficient.pricePerRoomHighCents * deptAdjustment * transactionFactor
  );

  let valueLowCents: number;
  let valueHighCents: number;
  const notes: string[] = [];

  notes.push(
    `Méthode « €/chambre » : ${input.roomCount} chambre(s) × fourchette régionale ajustée ` +
      `(${region.name}${department.modifierOverride ? `, ${department.name}` : ""}).`
  );

  if (impliedEbitdaCents !== null) {
    const methodALowCents = round100(
      impliedEbitdaCents * coefficient.ebitdaMultipleLow * deptAdjustment * transactionFactor
    );
    const methodAHighCents = round100(
      impliedEbitdaCents * coefficient.ebitdaMultipleHigh * deptAdjustment * transactionFactor
    );
    valueLowCents = round100((methodALowCents + methodBLowCents) / 2);
    valueHighCents = round100((methodAHighCents + methodBHighCents) / 2);

    notes.push(
      `Méthode « multiple d'EBITDA » : EBITDA ${
        input.ebitdaCents ? "renseigné" : `estimé à ${Math.round(DEFAULT_EBITDA_MARGIN * 100)} % du CA`
      } × ${coefficient.ebitdaMultipleLow.toFixed(1)} à ${coefficient.ebitdaMultipleHigh.toFixed(1)}.`
    );
    notes.push("Fourchette finale = moyenne des deux méthodes.");
  } else {
    valueLowCents = methodBLowCents;
    valueHighCents = methodBHighCents;
    notes.push(
      "CA et EBITDA non renseignés : seule la méthode €/chambre a pu être appliquée. " +
        "Renseigner le CA affine sensiblement la fourchette."
    );
  }

  if (transactionFactor !== 1) {
    notes.push(
      `Ajustement type de transaction (${input.transactionType}) appliqué : ×${transactionFactor}.`
    );
  }

  notes.push(
    "Cette estimation est indicative et ne remplace pas une expertise réalisée par un professionnel " +
      "de la transaction hôtelière."
  );

  return {
    valueLowCents,
    valueHighCents,
    methodNotes: notes.join(" "),
    impliedEbitdaCents,
  };
}

export interface CoefficientRow {
  starRating: number;
  ebitdaMultipleLow: number;
  ebitdaMultipleHigh: number;
  pricePerRoomLow: number;
  pricePerRoomHigh: number;
}

/**
 * Table de coefficients (en euros, par classement) pour une région, éventuellement
 * affinée pour un département dont le marché diffère nettement de sa région
 * (ex. Paris) — utilisée par les pages SEO /prix-hotel/[slug].
 *
 * Calculée à partir des données statiques du dépôt, PAS de la table CoefficientValo :
 * ces pages sont entièrement prérendues au build, donc leur contenu est de toute façon
 * figé jusqu'au prochain déploiement. Les lire en base créait une dépendance à un
 * serveur Postgres joignable au moment du build (CI, build d'image Docker) sans rien
 * apporter. Le moteur d'estimation, lui, reste branché sur la table (lecture à
 * l'exécution, éditable par l'admin — cf. OPS.md §7).
 * La table est seedée depuis ces mêmes constantes : les valeurs sont identiques.
 */
export function getCoefficientTable(
  regionSlug: string,
  departmentSlug?: string
): CoefficientRow[] {
  const region = REGIONS_BY_SLUG.get(regionSlug);
  if (!region) throw new Error(`Région inconnue : ${regionSlug}`);

  const department = departmentSlug ? DEPARTMENTS_BY_SLUG.get(departmentSlug) : undefined;
  const modifier = department ? effectiveModifier(department) : region.modifier;

  return BASE_COEFFICIENTS.map((base) => ({
    starRating: base.starRating,
    ebitdaMultipleLow: base.ebitdaMultipleLow,
    ebitdaMultipleHigh: base.ebitdaMultipleHigh,
    pricePerRoomLow: Math.round(base.pricePerRoomLow * modifier),
    pricePerRoomHigh: Math.round(base.pricePerRoomHigh * modifier),
  }));
}
