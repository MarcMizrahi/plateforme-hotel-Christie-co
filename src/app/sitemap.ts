import type { MetadataRoute } from "next";
import { REGIONS, DEPARTMENTS } from "@/data/geo";
import { GUIDES } from "@/data/guides";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/estimation", "/prix-hotel", "/guides"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "weekly" as const,
  }));

  const prixHotelRoutes = [...REGIONS.map((r) => r.slug), ...DEPARTMENTS.map((d) => d.slug)].map((slug) => ({
    url: `${siteUrl}/prix-hotel/${slug}`,
    changeFrequency: "monthly" as const,
  }));

  const guideRoutes = GUIDES.map((guide) => ({
    url: `${siteUrl}/guides/${guide.slug}`,
    changeFrequency: "monthly" as const,
  }));

  return [...staticRoutes, ...prixHotelRoutes, ...guideRoutes];
}
