/**
 * Nom de marque paramétrable — D1 ouverte (DECISIONS.md §A) : « HotelMarket » est un nom
 * de code, pas une décision finale. Ne jamais coder ce nom en dur ailleurs que via cette
 * fonction / la variable d'environnement NEXT_PUBLIC_BRAND_NAME (BRAND.md §2).
 */
export function brandName(): string {
  return process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || "HotelMarket";
}
