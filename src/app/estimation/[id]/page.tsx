import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { fr } from "@/lib/i18n";

export const metadata: Metadata = {
  title: fr.estimationResult.title,
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EstimationResultPage({ params }: PageProps) {
  const { id } = await params;
  const estimation = await prisma.estimation.findUnique({ where: { id } });

  if (!estimation) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="mb-2 text-sm font-medium text-gold-700">
        {estimation.region} · {estimation.department}
        {estimation.city ? ` · ${estimation.city}` : ""}
      </p>
      <h1 className="mb-8 font-serif text-3xl text-navy-900">{fr.estimationResult.title}</h1>

      <div className="mb-8 rounded-lg border border-warm-200 bg-white p-8 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-warm-500">
          {fr.estimationResult.rangeLabel}
        </p>
        <p className="tabular-nums font-serif text-4xl text-navy-900">
          {formatCents(estimation.valueLowCents)} – {formatCents(estimation.valueHighCents)}
        </p>
      </div>

      <div className="mb-8 rounded-lg border border-warm-200 bg-warm-100 p-6">
        <h2 className="mb-2 font-serif text-lg text-navy-900">{fr.estimationResult.methodTitle}</h2>
        <p className="text-sm leading-relaxed text-navy-800">{estimation.methodNotes}</p>
      </div>

      <div className="mb-8 rounded-lg border border-gold-400/40 bg-gold-400/10 p-4 text-sm text-navy-800">
        <p className="mb-2 font-medium">{fr.estimationResult.emailSentTitle}</p>
        <p>{fr.estimationResult.emailSentBody}</p>
      </div>

      <p className="mb-8 text-xs text-warm-500">{fr.estimationResult.disclaimer}</p>

      <Link href="/" className="text-sm font-semibold text-gold-700 hover:underline">
        {fr.estimationResult.ctaBack}
      </Link>
    </div>
  );
}
