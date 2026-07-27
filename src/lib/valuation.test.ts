import { describe, expect, it } from "vitest";
import { computeValuation, getCoefficientTable } from "@/lib/valuation";
import { BASE_COEFFICIENTS } from "@/data/coefficients";
import { REGIONS_BY_SLUG } from "@/data/geo";
import type { CoefficientValo } from "@/generated/prisma/client";

function makeCoefficient(overrides: Partial<CoefficientValo> = {}): CoefficientValo {
  return {
    id: "coef_test",
    regionSlug: "bretagne",
    starRating: 3,
    ebitdaMultipleLow: 5,
    ebitdaMultipleHigh: 7,
    pricePerRoomLowCents: 68_250 * 100,
    pricePerRoomHighCents: 105_000 * 100,
    ebitdaMarginDefault: 0.3,
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("computeValuation", () => {
  it("blends the EBITDA-multiple and per-room methods when EBITDA is provided", () => {
    const result = computeValuation(
      {
        transactionType: "MURS_FONDS",
        regionSlug: "bretagne",
        departmentSlug: "35-ille-et-vilaine",
        roomCount: 32,
        starRating: 3,
        revenueCents: 850_000 * 100,
        ebitdaCents: 220_000 * 100,
      },
      makeCoefficient()
    );

    expect(result.valueLowCents).toBeGreaterThan(0);
    expect(result.valueHighCents).toBeGreaterThan(result.valueLowCents);
    expect(result.impliedEbitdaCents).toBe(220_000 * 100);
  });

  it("derives EBITDA from revenue when only the CA is provided", () => {
    const result = computeValuation(
      {
        transactionType: "MURS_FONDS",
        regionSlug: "bretagne",
        departmentSlug: "35-ille-et-vilaine",
        roomCount: 32,
        starRating: 3,
        revenueCents: 1_000_000 * 100,
        ebitdaCents: null,
      },
      makeCoefficient()
    );

    expect(result.impliedEbitdaCents).toBe(300_000 * 100);
  });

  it("falls back to the per-room method alone when no financials are given", () => {
    // Côtes-d'Armor n'a pas de modificateur départemental propre : le calcul
    // reste celui de la région, ce qui permet une assertion exacte.
    const result = computeValuation(
      {
        transactionType: "MURS_FONDS",
        regionSlug: "bretagne",
        departmentSlug: "22-cotes-darmor",
        roomCount: 10,
        starRating: 3,
        revenueCents: null,
        ebitdaCents: null,
      },
      makeCoefficient()
    );

    expect(result.impliedEbitdaCents).toBeNull();
    expect(result.valueLowCents).toBe(Math.round(10 * 68_250 * 100));
    expect(result.valueHighCents).toBe(Math.round(10 * 105_000 * 100));
  });

  it("discounts the value for a fonds-de-commerce-only transaction", () => {
    const roomsOnly = { regionSlug: "bretagne", departmentSlug: "35-ille-et-vilaine", roomCount: 10, starRating: 3 as const };

    const mursFonds = computeValuation(
      { ...roomsOnly, transactionType: "MURS_FONDS", revenueCents: null, ebitdaCents: null },
      makeCoefficient()
    );
    const fondsSeul = computeValuation(
      { ...roomsOnly, transactionType: "FONDS", revenueCents: null, ebitdaCents: null },
      makeCoefficient()
    );

    expect(fondsSeul.valueLowCents).toBeLessThan(mursFonds.valueLowCents);
  });

  it("values Paris above the Île-de-France regional baseline", () => {
    const idfCoefficient = makeCoefficient({ regionSlug: "ile-de-france" });

    const genericIdf = computeValuation(
      {
        transactionType: "MURS_FONDS",
        regionSlug: "ile-de-france",
        departmentSlug: "77-seine-et-marne",
        roomCount: 20,
        starRating: 3,
        revenueCents: null,
        ebitdaCents: null,
      },
      idfCoefficient
    );
    const paris = computeValuation(
      {
        transactionType: "MURS_FONDS",
        regionSlug: "ile-de-france",
        departmentSlug: "75-paris",
        roomCount: 20,
        starRating: 3,
        revenueCents: null,
        ebitdaCents: null,
      },
      idfCoefficient
    );

    expect(paris.valueLowCents).toBeGreaterThan(genericIdf.valueLowCents);
  });
});

describe("getCoefficientTable", () => {
  it("matches, for a region, the exact values prisma/seed.ts writes into CoefficientValo", () => {
    // Verrou anti-dérive : les pages SEO lisent les constantes statiques, le moteur
    // d'estimation lit la table seedée. Les deux doivent rester alignés.
    const regionSlug = "occitanie";
    const region = REGIONS_BY_SLUG.get(regionSlug)!;

    const table = getCoefficientTable(regionSlug);

    expect(table).toHaveLength(BASE_COEFFICIENTS.length);
    for (const base of BASE_COEFFICIENTS) {
      const row = table.find((r) => r.starRating === base.starRating)!;
      const seededLowCents = Math.round(base.pricePerRoomLow * region.modifier * 100);
      const seededHighCents = Math.round(base.pricePerRoomHigh * region.modifier * 100);

      expect(row.pricePerRoomLow).toBe(Math.round(seededLowCents / 100));
      expect(row.pricePerRoomHigh).toBe(Math.round(seededHighCents / 100));
      expect(row.ebitdaMultipleLow).toBe(base.ebitdaMultipleLow);
      expect(row.ebitdaMultipleHigh).toBe(base.ebitdaMultipleHigh);
    }
  });

  it("applies the department modifier for markets that deviate from their region", () => {
    const idf = getCoefficientTable("ile-de-france");
    const paris = getCoefficientTable("ile-de-france", "75-paris");
    const seineEtMarne = getCoefficientTable("ile-de-france", "77-seine-et-marne");

    expect(paris[3].pricePerRoomLow).toBeGreaterThan(idf[3].pricePerRoomLow);
    expect(seineEtMarne[3].pricePerRoomLow).toBeLessThan(idf[3].pricePerRoomLow);
  });

  it("falls back to the plain region values for a department without an override", () => {
    const bretagne = getCoefficientTable("bretagne");
    const cotesDarmor = getCoefficientTable("bretagne", "22-cotes-darmor");

    expect(cotesDarmor).toEqual(bretagne);
  });
});
