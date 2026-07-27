import fr from "@/locales/fr.json";

export { fr };

/** Remplace les `{clé}` d'un gabarit fr.json par les valeurs fournies. */
export function tformat(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}
