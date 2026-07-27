import type { Metadata } from "next";
import { brandName } from "@/lib/brand";

export const metadata: Metadata = { title: "Mentions légales", robots: { index: false } };

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-sm leading-relaxed text-navy-800 sm:px-6">
      <h1 className="mb-6 font-serif text-2xl text-navy-900">Mentions légales</h1>
      <p className="mb-4 rounded-md border border-gold-400/50 bg-gold-400/10 p-4">
        Page provisoire. {brandName()} est en phase de validation de marché (MVP) et n&apos;a pas
        encore de structure juridique immatriculée — cf. DECISIONS.md D2. Cette page devra être
        complétée (éditeur, hébergeur, SIRET, directeur de publication) avant toute mise en ligne
        publique, avec validation par un juriste conformément à MARKET.md §7.
      </p>
    </div>
  );
}
