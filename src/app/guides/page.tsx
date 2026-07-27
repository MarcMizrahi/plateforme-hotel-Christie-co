import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/data/guides";

export const metadata: Metadata = {
  title: "Guides : comprendre la transmission hôtelière",
  description: "Valorisation, étapes de cession, multiple d'EBITDA : nos guides pour comprendre la transmission d'un hôtel en France.",
};

export default function GuidesIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-serif text-3xl text-navy-900 sm:text-4xl">
        Comprendre la transmission hôtelière
      </h1>
      <div className="grid gap-4">
        {GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="rounded-lg border border-warm-200 bg-white p-6 hover:border-gold-500"
          >
            <h2 className="mb-2 font-serif text-xl text-navy-900">{guide.title}</h2>
            <p className="text-sm text-navy-800">{guide.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
