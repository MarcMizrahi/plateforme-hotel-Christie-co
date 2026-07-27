const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** Formate un montant stocké en centimes (CLAUDE.md §4 : jamais de Float en base). */
export function formatCents(cents: number): string {
  return formatter.format(cents / 100);
}
