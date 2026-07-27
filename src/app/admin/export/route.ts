import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const COLUMNS = [
  "id",
  "createdAt",
  "email",
  "region",
  "department",
  "city",
  "transactionType",
  "roomCount",
  "starRating",
  "revenueCents",
  "ebitdaCents",
  "valueLowCents",
  "valueHighCents",
  "saleIntention",
  "consentContact",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "referrer",
] as const;

export async function GET() {
  const estimations = await prisma.estimation.findMany({
    include: { emailLead: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = estimations.map((e) =>
    [
      e.id,
      e.createdAt.toISOString(),
      e.email,
      e.region,
      e.department,
      e.city,
      e.transactionType,
      e.roomCount,
      e.starRating,
      e.revenueCents,
      e.ebitdaCents,
      e.valueLowCents,
      e.valueHighCents,
      e.emailLead?.saleIntention,
      e.emailLead?.consentContact,
      e.utmSource,
      e.utmMedium,
      e.utmCampaign,
      e.referrer,
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv = [COLUMNS.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
