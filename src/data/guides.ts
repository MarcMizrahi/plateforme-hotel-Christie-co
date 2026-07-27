// Registre des guides de fond (PLAN.md §0.3). Le contenu vit dans des fichiers .mdx
// séparés (src/app/guides/[slug]/page.mdx) ; ce fichier sert à l'index /guides et au sitemap.

export interface GuideMeta {
  slug: string;
  title: string;
  description: string;
}

export const GUIDES: GuideMeta[] = [
  {
    slug: "combien-vaut-mon-hotel",
    title: "Combien vaut mon hôtel ?",
    description:
      "Les méthodes utilisées pour valoriser un hôtel indépendant en France : multiple d'EBITDA, prix au €/chambre, et les facteurs qui font varier la fourchette.",
  },
  {
    slug: "vendre-son-hotel-les-etapes",
    title: "Vendre son hôtel : les étapes",
    description:
      "De l'estimation initiale à la signature, les grandes étapes d'une cession d'hôtel réussie et les points de vigilance à chaque phase.",
  },
  {
    slug: "multiple-ebitda-hotellerie",
    title: "Le multiple d'EBITDA en hôtellerie, expliqué simplement",
    description:
      "Pourquoi les professionnels valorisent les hôtels en multiple d'EBITDA plutôt qu'en chiffre d'affaires, et comment ce multiple varie selon la catégorie et la localisation.",
  },
];
