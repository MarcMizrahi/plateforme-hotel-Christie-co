import Link from "next/link";
import { fr } from "@/lib/i18n";
import { brandName } from "@/lib/brand";
import { NATIONAL_FACTS } from "@/data/market-facts";
import { GUIDES } from "@/data/guides";

export default function HomePage() {
  const brand = brandName();

  return (
    <div>
      <section className="bg-navy-950 text-warm-50">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-gold-400">{brand}</p>
          <h1 className="mb-6 font-serif text-4xl leading-tight sm:text-5xl">{fr.home.heroTitle}</h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-warm-200">{fr.home.heroSubtitle}</p>
          <Link
            href="/estimation"
            className="inline-block rounded-md bg-gold-500 px-8 py-4 text-base font-semibold text-navy-950 hover:bg-gold-400"
          >
            {fr.home.heroCta}
          </Link>
          <ul className="mx-auto mt-10 flex max-w-2xl flex-col gap-2 text-sm text-warm-200 sm:flex-row sm:justify-center sm:gap-8">
            {fr.home.trustPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h2 className="mb-6 font-serif text-2xl text-navy-900">{fr.home.barometreTitle}</h2>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-warm-200 bg-white p-5">
            <p className="tabular-nums font-serif text-2xl text-navy-900">{NATIONAL_FACTS.transactionVolume}</p>
            <p className="mt-1 text-sm text-warm-700">de transactions hôtelières par an en France</p>
          </div>
          <div className="rounded-lg border border-warm-200 bg-white p-5">
            <p className="tabular-nums font-serif text-2xl text-navy-900">{NATIONAL_FACTS.transmissionShare}</p>
            <p className="mt-1 text-sm text-warm-700">des établissements à reprendre sous 5 ans</p>
          </div>
          <div className="rounded-lg border border-warm-200 bg-white p-5">
            <p className="tabular-nums font-serif text-2xl text-navy-900">{NATIONAL_FACTS.hotelCount}</p>
            <p className="mt-1 text-sm text-warm-700">hôtels composent le parc français</p>
          </div>
          <div className="rounded-lg border border-warm-200 bg-white p-5">
            <p className="tabular-nums font-serif text-2xl text-navy-900">{NATIONAL_FACTS.averageRevpar}</p>
            <p className="mt-1 text-sm text-warm-700">de RevPAR moyen en France</p>
          </div>
        </div>
        <Link href="/prix-hotel" className="text-sm font-semibold text-gold-700 hover:underline">
          {fr.home.barometreCta} →
        </Link>
      </section>

      <section className="bg-warm-100">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <h2 className="mb-6 font-serif text-2xl text-navy-900">{fr.home.guidesTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="rounded-lg border border-warm-200 bg-white p-5 hover:border-gold-500"
              >
                <h3 className="mb-2 font-serif text-lg text-navy-900">{guide.title}</h3>
                <p className="text-sm text-navy-800">{guide.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
