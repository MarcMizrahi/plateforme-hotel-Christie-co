import { describe, expect, it } from "vitest";
import { DEPARTMENTS, REGIONS, REGIONS_BY_SLUG, departmentsOfRegion } from "@/data/geo";

describe("geo data", () => {
  it("has exactly 13 regions and 96 departments (France métropolitaine)", () => {
    expect(REGIONS).toHaveLength(13);
    expect(DEPARTMENTS).toHaveLength(96);
  });

  it("has unique slugs across regions and departments", () => {
    const regionSlugs = new Set(REGIONS.map((r) => r.slug));
    const deptSlugs = new Set(DEPARTMENTS.map((d) => d.slug));
    expect(regionSlugs.size).toBe(REGIONS.length);
    expect(deptSlugs.size).toBe(DEPARTMENTS.length);

    for (const deptSlug of deptSlugs) {
      expect(regionSlugs.has(deptSlug)).toBe(false);
    }
  });

  it("references only existing regions from every department", () => {
    for (const department of DEPARTMENTS) {
      expect(REGIONS_BY_SLUG.has(department.regionSlug)).toBe(true);
    }
  });

  it("groups every department under exactly one region and covers all 96", () => {
    const total = REGIONS.reduce((sum, region) => sum + departmentsOfRegion(region.slug).length, 0);
    expect(total).toBe(96);
  });
});
