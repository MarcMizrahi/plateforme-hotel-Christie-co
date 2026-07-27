// Géographie France métropolitaine (13 régions, 96 départements) — sert au moteur
// d'estimation ET aux pages SEO programmatiques /prix-hotel/[slug] (PLAN.md §0.3).
// Les modificateurs sont des hypothèses de travail (cf. MARKET.md §5, BUSINESS.md),
// à affiner avec des données réelles — pas des vérités absolues.

export interface Region {
  slug: string;
  name: string;
  /** Multiplicateur appliqué aux fourchettes nationales (1 = moyenne nationale). */
  modifier: number;
}

export interface Department {
  code: string;
  slug: string;
  name: string;
  regionSlug: string;
  /** Dérogation ponctuelle au modificateur régional pour quelques marchés atypiques connus. */
  modifierOverride?: number;
}

export const REGIONS: Region[] = [
  { slug: "ile-de-france", name: "Île-de-France", modifier: 1.35 },
  { slug: "provence-alpes-cote-dazur", name: "Provence-Alpes-Côte d'Azur", modifier: 1.2 },
  { slug: "auvergne-rhone-alpes", name: "Auvergne-Rhône-Alpes", modifier: 1.15 },
  { slug: "corse", name: "Corse", modifier: 1.1 },
  { slug: "nouvelle-aquitaine", name: "Nouvelle-Aquitaine", modifier: 1.05 },
  { slug: "bretagne", name: "Bretagne", modifier: 1.05 },
  { slug: "occitanie", name: "Occitanie", modifier: 1.05 },
  { slug: "pays-de-la-loire", name: "Pays de la Loire", modifier: 1.0 },
  { slug: "normandie", name: "Normandie", modifier: 1.0 },
  { slug: "grand-est", name: "Grand Est", modifier: 0.95 },
  { slug: "hauts-de-france", name: "Hauts-de-France", modifier: 0.9 },
  { slug: "centre-val-de-loire", name: "Centre-Val de Loire", modifier: 0.9 },
  { slug: "bourgogne-franche-comte", name: "Bourgogne-Franche-Comté", modifier: 0.9 },
];

export const DEPARTMENTS: Department[] = [
  { code: "01", slug: "01-ain", name: "Ain", regionSlug: "auvergne-rhone-alpes" },
  { code: "02", slug: "02-aisne", name: "Aisne", regionSlug: "hauts-de-france" },
  { code: "03", slug: "03-allier", name: "Allier", regionSlug: "auvergne-rhone-alpes" },
  { code: "04", slug: "04-alpes-de-haute-provence", name: "Alpes-de-Haute-Provence", regionSlug: "provence-alpes-cote-dazur" },
  { code: "05", slug: "05-hautes-alpes", name: "Hautes-Alpes", regionSlug: "provence-alpes-cote-dazur" },
  { code: "06", slug: "06-alpes-maritimes", name: "Alpes-Maritimes", regionSlug: "provence-alpes-cote-dazur", modifierOverride: 1.4 },
  { code: "07", slug: "07-ardeche", name: "Ardèche", regionSlug: "auvergne-rhone-alpes" },
  { code: "08", slug: "08-ardennes", name: "Ardennes", regionSlug: "grand-est" },
  { code: "09", slug: "09-ariege", name: "Ariège", regionSlug: "occitanie" },
  { code: "10", slug: "10-aube", name: "Aube", regionSlug: "grand-est" },
  { code: "11", slug: "11-aude", name: "Aude", regionSlug: "occitanie" },
  { code: "12", slug: "12-aveyron", name: "Aveyron", regionSlug: "occitanie" },
  { code: "13", slug: "13-bouches-du-rhone", name: "Bouches-du-Rhône", regionSlug: "provence-alpes-cote-dazur", modifierOverride: 1.25 },
  { code: "14", slug: "14-calvados", name: "Calvados", regionSlug: "normandie" },
  { code: "15", slug: "15-cantal", name: "Cantal", regionSlug: "auvergne-rhone-alpes" },
  { code: "16", slug: "16-charente", name: "Charente", regionSlug: "nouvelle-aquitaine" },
  { code: "17", slug: "17-charente-maritime", name: "Charente-Maritime", regionSlug: "nouvelle-aquitaine", modifierOverride: 1.15 },
  { code: "18", slug: "18-cher", name: "Cher", regionSlug: "centre-val-de-loire" },
  { code: "19", slug: "19-correze", name: "Corrèze", regionSlug: "nouvelle-aquitaine" },
  { code: "2A", slug: "2a-corse-du-sud", name: "Corse-du-Sud", regionSlug: "corse" },
  { code: "2B", slug: "2b-haute-corse", name: "Haute-Corse", regionSlug: "corse" },
  { code: "21", slug: "21-cote-dor", name: "Côte-d'Or", regionSlug: "bourgogne-franche-comte" },
  { code: "22", slug: "22-cotes-darmor", name: "Côtes-d'Armor", regionSlug: "bretagne" },
  { code: "23", slug: "23-creuse", name: "Creuse", regionSlug: "nouvelle-aquitaine" },
  { code: "24", slug: "24-dordogne", name: "Dordogne", regionSlug: "nouvelle-aquitaine" },
  { code: "25", slug: "25-doubs", name: "Doubs", regionSlug: "bourgogne-franche-comte" },
  { code: "26", slug: "26-drome", name: "Drôme", regionSlug: "auvergne-rhone-alpes" },
  { code: "27", slug: "27-eure", name: "Eure", regionSlug: "normandie" },
  { code: "28", slug: "28-eure-et-loir", name: "Eure-et-Loir", regionSlug: "centre-val-de-loire" },
  { code: "29", slug: "29-finistere", name: "Finistère", regionSlug: "bretagne" },
  { code: "30", slug: "30-gard", name: "Gard", regionSlug: "occitanie" },
  { code: "31", slug: "31-haute-garonne", name: "Haute-Garonne", regionSlug: "occitanie", modifierOverride: 1.15 },
  { code: "32", slug: "32-gers", name: "Gers", regionSlug: "occitanie" },
  { code: "33", slug: "33-gironde", name: "Gironde", regionSlug: "nouvelle-aquitaine", modifierOverride: 1.2 },
  { code: "34", slug: "34-herault", name: "Hérault", regionSlug: "occitanie", modifierOverride: 1.1 },
  { code: "35", slug: "35-ille-et-vilaine", name: "Ille-et-Vilaine", regionSlug: "bretagne", modifierOverride: 1.1 },
  { code: "36", slug: "36-indre", name: "Indre", regionSlug: "centre-val-de-loire" },
  { code: "37", slug: "37-indre-et-loire", name: "Indre-et-Loire", regionSlug: "centre-val-de-loire" },
  { code: "38", slug: "38-isere", name: "Isère", regionSlug: "auvergne-rhone-alpes" },
  { code: "39", slug: "39-jura", name: "Jura", regionSlug: "bourgogne-franche-comte" },
  { code: "40", slug: "40-landes", name: "Landes", regionSlug: "nouvelle-aquitaine" },
  { code: "41", slug: "41-loir-et-cher", name: "Loir-et-Cher", regionSlug: "centre-val-de-loire" },
  { code: "42", slug: "42-loire", name: "Loire", regionSlug: "auvergne-rhone-alpes" },
  { code: "43", slug: "43-haute-loire", name: "Haute-Loire", regionSlug: "auvergne-rhone-alpes" },
  { code: "44", slug: "44-loire-atlantique", name: "Loire-Atlantique", regionSlug: "pays-de-la-loire", modifierOverride: 1.1 },
  { code: "45", slug: "45-loiret", name: "Loiret", regionSlug: "centre-val-de-loire" },
  { code: "46", slug: "46-lot", name: "Lot", regionSlug: "occitanie" },
  { code: "47", slug: "47-lot-et-garonne", name: "Lot-et-Garonne", regionSlug: "nouvelle-aquitaine" },
  { code: "48", slug: "48-lozere", name: "Lozère", regionSlug: "occitanie" },
  { code: "49", slug: "49-maine-et-loire", name: "Maine-et-Loire", regionSlug: "pays-de-la-loire" },
  { code: "50", slug: "50-manche", name: "Manche", regionSlug: "normandie" },
  { code: "51", slug: "51-marne", name: "Marne", regionSlug: "grand-est" },
  { code: "52", slug: "52-haute-marne", name: "Haute-Marne", regionSlug: "grand-est" },
  { code: "53", slug: "53-mayenne", name: "Mayenne", regionSlug: "pays-de-la-loire" },
  { code: "54", slug: "54-meurthe-et-moselle", name: "Meurthe-et-Moselle", regionSlug: "grand-est" },
  { code: "55", slug: "55-meuse", name: "Meuse", regionSlug: "grand-est" },
  { code: "56", slug: "56-morbihan", name: "Morbihan", regionSlug: "bretagne", modifierOverride: 1.1 },
  { code: "57", slug: "57-moselle", name: "Moselle", regionSlug: "grand-est" },
  { code: "58", slug: "58-nievre", name: "Nièvre", regionSlug: "bourgogne-franche-comte" },
  { code: "59", slug: "59-nord", name: "Nord", regionSlug: "hauts-de-france", modifierOverride: 1.0 },
  { code: "60", slug: "60-oise", name: "Oise", regionSlug: "hauts-de-france" },
  { code: "61", slug: "61-orne", name: "Orne", regionSlug: "normandie" },
  { code: "62", slug: "62-pas-de-calais", name: "Pas-de-Calais", regionSlug: "hauts-de-france" },
  { code: "63", slug: "63-puy-de-dome", name: "Puy-de-Dôme", regionSlug: "auvergne-rhone-alpes" },
  { code: "64", slug: "64-pyrenees-atlantiques", name: "Pyrénées-Atlantiques", regionSlug: "nouvelle-aquitaine", modifierOverride: 1.1 },
  { code: "65", slug: "65-hautes-pyrenees", name: "Hautes-Pyrénées", regionSlug: "occitanie" },
  { code: "66", slug: "66-pyrenees-orientales", name: "Pyrénées-Orientales", regionSlug: "occitanie" },
  { code: "67", slug: "67-bas-rhin", name: "Bas-Rhin", regionSlug: "grand-est", modifierOverride: 1.05 },
  { code: "68", slug: "68-haut-rhin", name: "Haut-Rhin", regionSlug: "grand-est" },
  { code: "69", slug: "69-rhone", name: "Rhône", regionSlug: "auvergne-rhone-alpes", modifierOverride: 1.3 },
  { code: "70", slug: "70-haute-saone", name: "Haute-Saône", regionSlug: "bourgogne-franche-comte" },
  { code: "71", slug: "71-saone-et-loire", name: "Saône-et-Loire", regionSlug: "bourgogne-franche-comte" },
  { code: "72", slug: "72-sarthe", name: "Sarthe", regionSlug: "pays-de-la-loire" },
  { code: "73", slug: "73-savoie", name: "Savoie", regionSlug: "auvergne-rhone-alpes", modifierOverride: 1.3 },
  { code: "74", slug: "74-haute-savoie", name: "Haute-Savoie", regionSlug: "auvergne-rhone-alpes", modifierOverride: 1.35 },
  { code: "75", slug: "75-paris", name: "Paris", regionSlug: "ile-de-france", modifierOverride: 1.7 },
  { code: "76", slug: "76-seine-maritime", name: "Seine-Maritime", regionSlug: "normandie" },
  { code: "77", slug: "77-seine-et-marne", name: "Seine-et-Marne", regionSlug: "ile-de-france", modifierOverride: 1.1 },
  { code: "78", slug: "78-yvelines", name: "Yvelines", regionSlug: "ile-de-france", modifierOverride: 1.2 },
  { code: "79", slug: "79-deux-sevres", name: "Deux-Sèvres", regionSlug: "nouvelle-aquitaine" },
  { code: "80", slug: "80-somme", name: "Somme", regionSlug: "hauts-de-france" },
  { code: "81", slug: "81-tarn", name: "Tarn", regionSlug: "occitanie" },
  { code: "82", slug: "82-tarn-et-garonne", name: "Tarn-et-Garonne", regionSlug: "occitanie" },
  { code: "83", slug: "83-var", name: "Var", regionSlug: "provence-alpes-cote-dazur", modifierOverride: 1.3 },
  { code: "84", slug: "84-vaucluse", name: "Vaucluse", regionSlug: "provence-alpes-cote-dazur", modifierOverride: 1.15 },
  { code: "85", slug: "85-vendee", name: "Vendée", regionSlug: "pays-de-la-loire", modifierOverride: 1.05 },
  { code: "86", slug: "86-vienne", name: "Vienne", regionSlug: "nouvelle-aquitaine" },
  { code: "87", slug: "87-haute-vienne", name: "Haute-Vienne", regionSlug: "nouvelle-aquitaine" },
  { code: "88", slug: "88-vosges", name: "Vosges", regionSlug: "grand-est" },
  { code: "89", slug: "89-yonne", name: "Yonne", regionSlug: "bourgogne-franche-comte" },
  { code: "90", slug: "90-territoire-de-belfort", name: "Territoire de Belfort", regionSlug: "bourgogne-franche-comte" },
  { code: "91", slug: "91-essonne", name: "Essonne", regionSlug: "ile-de-france" },
  { code: "92", slug: "92-hauts-de-seine", name: "Hauts-de-Seine", regionSlug: "ile-de-france", modifierOverride: 1.3 },
  { code: "93", slug: "93-seine-saint-denis", name: "Seine-Saint-Denis", regionSlug: "ile-de-france" },
  { code: "94", slug: "94-val-de-marne", name: "Val-de-Marne", regionSlug: "ile-de-france" },
  { code: "95", slug: "95-val-doise", name: "Val-d'Oise", regionSlug: "ile-de-france" },
];

export const REGIONS_BY_SLUG = new Map(REGIONS.map((r) => [r.slug, r]));
export const DEPARTMENTS_BY_SLUG = new Map(DEPARTMENTS.map((d) => [d.slug, d]));

export function departmentsOfRegion(regionSlug: string): Department[] {
  return DEPARTMENTS.filter((d) => d.regionSlug === regionSlug);
}

export function regionOfDepartment(dept: Department): Region {
  const region = REGIONS_BY_SLUG.get(dept.regionSlug);
  if (!region) throw new Error(`Région inconnue pour le département ${dept.code}`);
  return region;
}

export function effectiveModifier(dept: Department): number {
  if (dept.modifierOverride) return dept.modifierOverride;
  return regionOfDepartment(dept).modifier;
}
