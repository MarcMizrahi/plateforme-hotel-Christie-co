import type { Metadata } from "next";
import { EstimationForm } from "@/components/features/estimation-form";
import { fr } from "@/lib/i18n";

export const metadata: Metadata = {
  title: fr.estimationForm.title,
  description: fr.site.description,
};

interface PageProps {
  searchParams: Promise<{ utm_source?: string; utm_medium?: string; utm_campaign?: string }>;
}

export default async function EstimationPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <EstimationForm utmSource={params.utm_source} utmMedium={params.utm_medium} utmCampaign={params.utm_campaign} />
    </div>
  );
}
