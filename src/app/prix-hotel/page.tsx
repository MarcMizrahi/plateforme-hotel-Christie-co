import type { Metadata } from "next";
import Link from "next/link";
import { REGIONS } from "@/data/geo";
import { NATIONAL_FACTS } from "@/data/market-facts";
import { fr } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Prix des hôtels à vendre par région",
  description: fr.prixHotel.intro,
  alternates: { canonical: "/prix-hotel" },
};

export default function PrixHotelIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="mb-4 font-serif text-3xl text-navy-900 sm:text-4xl">
        Prix des hôtels à vendre, région par région
      </h1>
      <p className="mb-8 max-w-2xl text-navy-800">{fr.prixHotel.intro}</p>

      <ul className="mb-4 grid gap-2 text-sm text-navy-800 sm:grid-cols-2">
        <li>Volume annuel de transactions en France : {NATIONAL_FACTS.transactionVolume}</li>
        <li>Établissements à reprendre sous 5 ans : {NATIONAL_FACTS.transmissionShare}</li>
        <li>Parc hôtelier français : {NATIONAL_FACTS.hotelCount} hôtels</li>
        <li>RevPAR moyen France : {NATIONAL_FACTS.averageRevpar}</li>
      </ul>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {REGIONS.map((region) => (
          <Link
            key={region.slug}
            href={`/prix-hotel/${region.slug}`}
            className="rounded-lg border border-warm-200 bg-white p-4 font-medium text-navy-900 hover:border-gold-500 hover:text-gold-700"
          >
            {region.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
