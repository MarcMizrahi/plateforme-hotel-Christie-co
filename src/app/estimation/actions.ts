"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { estimationSubmissionSchema } from "@/lib/schemas/estimation";
import { computeValuation } from "@/lib/valuation";
import { DEPARTMENTS_BY_SLUG, REGIONS_BY_SLUG } from "@/data/geo";
import { sendEstimationReportEmail } from "@/lib/email";
import { formatCents } from "@/lib/money";
import { logEvent } from "@/lib/analytics";

export interface EstimationFormState {
  status: "idle" | "error";
  errors?: Record<string, string>;
  message?: string;
}

export async function submitEstimation(
  _prevState: EstimationFormState,
  formData: FormData
): Promise<EstimationFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = estimationSubmissionSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] = issue.message;
    }
    return { status: "error", errors };
  }

  const data = parsed.data;
  const department = DEPARTMENTS_BY_SLUG.get(data.departmentSlug)!;
  const region = REGIONS_BY_SLUG.get(data.regionSlug)!;

  const coefficient = await prisma.coefficientValo.findUnique({
    where: { regionSlug_starRating: { regionSlug: region.slug, starRating: data.starRating } },
  });

  if (!coefficient) {
    return {
      status: "error",
      message: "Coefficients de valorisation indisponibles pour cette combinaison. Merci de réessayer.",
    };
  }

  const revenueCents = data.revenue !== undefined ? Math.round(data.revenue * 100) : null;
  const ebitdaCents = data.ebitda !== undefined ? Math.round(data.ebitda * 100) : null;

  const valuation = computeValuation(
    {
      transactionType: data.transactionType,
      regionSlug: region.slug,
      departmentSlug: department.slug,
      roomCount: data.roomCount,
      starRating: data.starRating,
      revenueCents,
      ebitdaCents,
    },
    coefficient
  );

  const estimation = await prisma.estimation.create({
    data: {
      email: data.email,
      transactionType: data.transactionType,
      regionSlug: region.slug,
      region: region.name,
      departmentSlug: department.slug,
      department: department.name,
      city: data.city || null,
      roomCount: data.roomCount,
      starRating: data.starRating,
      hasLicence4: data.hasLicence4 ?? false,
      revenueCents,
      ebitdaCents,
      valueLowCents: valuation.valueLowCents,
      valueHighCents: valuation.valueHighCents,
      methodNotes: valuation.methodNotes,
      utmSource: data.utmSource || null,
      utmMedium: data.utmMedium || null,
      utmCampaign: data.utmCampaign || null,
      referrer: data.referrer || null,
      emailLead: {
        create: {
          email: data.email,
          saleIntention: data.saleIntention,
          consentContact: data.consentContact,
        },
      },
    },
  });

  await logEvent("estimation.completed", {
    estimationId: estimation.id,
    regionSlug: region.slug,
    starRating: data.starRating,
  });
  await logEvent("lead.qualified", {
    estimationId: estimation.id,
    saleIntention: data.saleIntention,
  });

  const resultUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/estimation/${estimation.id}`;

  try {
    await sendEstimationReportEmail({
      to: data.email,
      resultUrl,
      valueLowFormatted: formatCents(valuation.valueLowCents),
      valueHighFormatted: formatCents(valuation.valueHighCents),
      methodNotes: valuation.methodNotes,
    });
  } catch (error) {
    console.error("Échec d'envoi du rapport d'estimation par email", error);
  }

  redirect(`/estimation/${estimation.id}`);
}
