import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { fr } from "@/lib/i18n";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

const SALE_INTENTION_LABELS: Record<string, string> = fr.estimationForm.saleIntentions;

export default async function AdminDashboardPage() {
  const [totalLeads, byIntention, bySource, recentEstimations] = await Promise.all([
    prisma.emailLead.count(),
    prisma.emailLead.groupBy({ by: ["saleIntention"], _count: { _all: true } }),
    prisma.estimation.groupBy({ by: ["utmSource"], _count: { _all: true } }),
    prisma.estimation.findMany({
      include: { emailLead: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const qualifiedLessThan2Years = byIntention
    .filter((row) => row.saleIntention !== "CURIOSITY")
    .reduce((sum, row) => sum + row._count._all, 0);
  const qualifiedShare = totalLeads > 0 ? Math.round((qualifiedLessThan2Years / totalLeads) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-navy-900">{fr.admin.dashboardTitle}</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/export" className="text-sm font-semibold text-gold-700 hover:underline">
            {fr.admin.exportCsv}
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-navy-700 hover:text-navy-900">
              {fr.admin.logout}
            </button>
          </form>
        </div>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-warm-200 bg-white p-5">
          <p className="tabular-nums font-serif text-3xl text-navy-900">{totalLeads}</p>
          <p className="mt-1 text-sm text-warm-700">Leads vendeurs captés (GATE : 30-50 attendus)</p>
        </div>
        <div className="rounded-lg border border-warm-200 bg-white p-5">
          <p className="tabular-nums font-serif text-3xl text-navy-900">{qualifiedShare}%</p>
          <p className="mt-1 text-sm text-warm-700">avec intention de vente &lt; 2 ans (cible ≥ 30 %)</p>
        </div>
        <div className="rounded-lg border border-warm-200 bg-white p-5">
          <p className="tabular-nums font-serif text-3xl text-navy-900">{recentEstimations.length}</p>
          <p className="mt-1 text-sm text-warm-700">estimations les plus récentes (aperçu ci-dessous)</p>
        </div>
      </div>

      <div className="mb-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-serif text-lg text-navy-900">{fr.admin.funnelTitle}</h2>
          <ul className="space-y-2">
            {byIntention.map((row) => (
              <li key={row.saleIntention} className="flex justify-between rounded-md border border-warm-200 bg-white px-4 py-2 text-sm">
                <span>{SALE_INTENTION_LABELS[row.saleIntention] ?? row.saleIntention}</span>
                <span className="tabular-nums font-medium">{row._count._all}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-serif text-lg text-navy-900">{fr.admin.sourcesTitle}</h2>
          <ul className="space-y-2">
            {bySource.map((row) => (
              <li key={row.utmSource ?? "direct"} className="flex justify-between rounded-md border border-warm-200 bg-white px-4 py-2 text-sm">
                <span>{row.utmSource || "Direct / non attribué"}</span>
                <span className="tabular-nums font-medium">{row._count._all}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <h2 className="mb-3 font-serif text-lg text-navy-900">{fr.admin.leadsTitle}</h2>
        <div className="overflow-x-auto rounded-lg border border-warm-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-warm-200 text-warm-500">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Localisation</th>
                <th className="px-4 py-2">Intention</th>
                <th className="px-4 py-2">Fourchette</th>
                <th className="px-4 py-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {recentEstimations.map((estimation) => (
                <tr key={estimation.id} className="border-b border-warm-100">
                  <td className="px-4 py-2 whitespace-nowrap">
                    {estimation.createdAt.toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-2">{estimation.email}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {estimation.department}, {estimation.region}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {estimation.emailLead
                      ? SALE_INTENTION_LABELS[estimation.emailLead.saleIntention] ?? estimation.emailLead.saleIntention
                      : "—"}
                  </td>
                  <td className="tabular-nums px-4 py-2 whitespace-nowrap">
                    {formatCents(estimation.valueLowCents)} – {formatCents(estimation.valueHighCents)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{estimation.utmSource || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
