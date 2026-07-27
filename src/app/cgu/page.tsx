import type { Metadata } from "next";
import { brandName } from "@/lib/brand";

export const metadata: Metadata = { title: "Conditions générales d'utilisation", robots: { index: false } };

export default function CguPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-sm leading-relaxed text-navy-800 sm:px-6">
      <h1 className="mb-6 font-serif text-2xl text-navy-900">Conditions générales d&apos;utilisation</h1>
      <p className="mb-4 rounded-md border border-gold-400/50 bg-gold-400/10 p-4">
        Page provisoire — TODO juriste (MARKET.md §7, DECISIONS.md D2). Doit notamment formaliser le
        positionnement de {brandName()} comme simple support de diffusion et de mise en relation
        (pas un intermédiaire au sens de la loi Hoguet), conformément à MARKET.md §4 : {brandName()}{" "}
        ne négocie pas, ne rédige pas de mandats et ne perçoit ni honoraires de transaction ni fonds
        pour le compte de tiers.
      </p>
    </div>
  );
}
