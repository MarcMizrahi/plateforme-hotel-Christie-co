import Link from "next/link";
import { fr } from "@/lib/i18n";

export function GuideCta({ campaign }: { campaign: string }) {
  return (
    <div className="not-prose mt-10 rounded-lg border border-navy-900 bg-navy-900 p-8 text-center text-warm-50">
      <p className="mb-4 font-serif text-xl">{fr.prixHotel.ctaTitle}</p>
      <Link
        href={`/estimation?utm_source=seo&utm_medium=organic&utm_campaign=${campaign}`}
        className="inline-block rounded-md bg-gold-500 px-6 py-3 font-semibold text-navy-950 hover:bg-gold-400"
      >
        {fr.home.heroCta}
      </Link>
    </div>
  );
}
