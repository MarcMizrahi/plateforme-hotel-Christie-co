import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DEPARTMENTS,
  DEPARTMENTS_BY_SLUG,
  REGIONS,
  REGIONS_BY_SLUG,
  departmentsOfRegion,
  regionOfDepartment,
} from "@/data/geo";
import { NATIONAL_FACTS, regionFact } from "@/data/market-facts";
import { getCoefficientTable } from "@/lib/valuation";
import { fr, tformat } from "@/lib/i18n";
import { brandName } from "@/lib/brand";

export function generateStaticParams() {
  return [...REGIONS.map((r) => ({ slug: r.slug })), ...DEPARTMENTS.map((d) => ({ slug: d.slug }))];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

function resolveEntity(slug: string) {
  const region = REGIONS_BY_SLUG.get(slug);
  if (region) return { kind: "region" as const, region };

  const department = DEPARTMENTS_BY_SLUG.get(slug);
  if (department) return { kind: "department" as const, department, region: regionOfDepartment(department) };

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entity = resolveEntity(slug);
  if (!entity) return {};

  const name = entity.kind === "region" ? entity.region.name : entity.department.name;
  const title =
    entity.kind === "region"
      ? tformat(fr.prixHotel.regionTitle, { name })
      : tformat(fr.prixHotel.departmentTitle, { name });

  return {
    title,
    description: `${title}. ${fr.prixHotel.intro}`,
    alternates: { canonical: `/prix-hotel/${slug}` },
  };
}

export default async function PrixHotelPage({ params }: PageProps) {
  const { slug } = await params;
  const entity = resolveEntity(slug);
  if (!entity) notFound();

  const name = entity.kind === "region" ? entity.region.name : entity.department.name;
  const title =
    entity.kind === "region"
      ? tformat(fr.prixHotel.regionTitle, { name })
      : tformat(fr.prixHotel.departmentTitle, { name });

  const table = getCoefficientTable(
    entity.region.slug,
    entity.kind === "department" ? entity.department.slug : undefined
  );

  const utm = `utm_source=seo&utm_medium=organic&utm_campaign=prix-hotel-${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: fr.prixHotel.intro,
    publisher: { "@type": "Organization", name: brandName() },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 text-sm text-warm-500">
        <Link href="/" className="hover:text-gold-700">
          {fr.nav.home}
        </Link>
        {" / "}
        <Link href="/prix-hotel/" className="hover:text-gold-700">
          {fr.nav.barometre}
        </Link>
        {entity.kind === "department" && (
          <>
            {" / "}
            <Link href={`/prix-hotel/${entity.region.slug}`} className="hover:text-gold-700">
              {entity.region.name}
            </Link>
          </>
        )}
      </nav>

      <h1 className="mb-4 font-serif text-3xl text-navy-900 sm:text-4xl">{title}</h1>
      <p className="mb-8 max-w-2xl text-navy-800">{fr.prixHotel.intro}</p>

      <section className="mb-10 rounded-lg border border-warm-200 bg-white p-6">
        <h2 className="mb-4 font-serif text-xl text-navy-900">{fr.prixHotel.tableTitle}</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-warm-200 text-warm-500">
                <th className="py-2 pr-4">{fr.prixHotel.tableStarHeader}</th>
                <th className="py-2 pr-4">{fr.prixHotel.tablePriceHeader}</th>
                <th className="py-2">{fr.prixHotel.tableMultipleHeader}</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {table.map((row) => (
                <tr key={row.starRating} className="border-b border-warm-100">
                  <td className="py-2 pr-4 font-medium text-navy-800">
                    {fr.estimationForm.starRatings[String(row.starRating) as "0"]}
                  </td>
                  <td className="py-2 pr-4">
                    {row.pricePerRoomLow.toLocaleString("fr-FR")} € – {row.pricePerRoomHigh.toLocaleString("fr-FR")} €
                  </td>
                  <td className="py-2">
                    {row.ebitdaMultipleLow.toFixed(1)} – {row.ebitdaMultipleHigh.toFixed(1)}×
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-warm-500">{fr.prixHotel.methodologyNote}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 font-serif text-xl text-navy-900">{fr.prixHotel.nationalContext}</h2>
        <ul className="mb-4 grid gap-2 text-sm text-navy-800 sm:grid-cols-2">
          <li>Volume annuel de transactions en France : {NATIONAL_FACTS.transactionVolume}</li>
          <li>Établissements à reprendre sous 5 ans : {NATIONAL_FACTS.transmissionShare}</li>
          <li>Parc hôtelier français : {NATIONAL_FACTS.hotelCount} hôtels</li>
          <li>RevPAR moyen France : {NATIONAL_FACTS.averageRevpar}</li>
        </ul>
        <p className="text-sm leading-relaxed text-navy-800">{regionFact(entity.region.slug)}</p>
      </section>

      {entity.kind === "region" && (
        <section className="mb-10">
          <h2 className="mb-3 font-serif text-xl text-navy-900">{fr.prixHotel.departmentsInRegion}</h2>
          <div className="flex flex-wrap gap-2">
            {departmentsOfRegion(entity.region.slug).map((d) => (
              <Link
                key={d.slug}
                href={`/prix-hotel/${d.slug}`}
                className="rounded-full border border-warm-200 bg-white px-3 py-1 text-sm text-navy-800 hover:border-gold-500 hover:text-gold-700"
              >
                {d.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {entity.kind === "department" && (
        <p className="mb-10 text-sm">
          <Link href={`/prix-hotel/${entity.region.slug}`} className="text-gold-700 hover:underline">
            {tformat(fr.prixHotel.backToRegion, { name: entity.region.name })}
          </Link>
        </p>
      )}

      <section className="rounded-lg border border-navy-900 bg-navy-900 p-8 text-center text-warm-50">
        <h2 className="mb-2 font-serif text-2xl">{fr.prixHotel.ctaTitle}</h2>
        <Link
          href={`/estimation?${utm}`}
          className="mt-4 inline-block rounded-md bg-gold-500 px-6 py-3 font-semibold text-navy-950 hover:bg-gold-400"
        >
          {fr.prixHotel.cta}
        </Link>
      </section>
    </div>
  );
}
