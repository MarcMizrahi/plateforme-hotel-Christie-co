import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { fr } from "@/lib/i18n";
import { brandName } from "@/lib/brand";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brandName()} — ${fr.site.tagline}`,
    template: `%s — ${brandName()}`,
  },
  description: fr.site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-warm-50 text-navy-950">
        <header className="border-b border-warm-200 bg-warm-50/95 backdrop-blur supports-[backdrop-filter]:sticky supports-[backdrop-filter]:top-0 z-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="block py-3 font-serif text-xl font-semibold tracking-tight text-navy-900">
              {brandName()}
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium text-navy-700 sm:flex">
              <Link href="/estimation" className="block py-3 hover:text-gold-700">
                {fr.nav.estimation}
              </Link>
              <Link href="/prix-hotel" className="block py-3 hover:text-gold-700">
                {fr.nav.barometre}
              </Link>
              <Link href="/guides" className="block py-3 hover:text-gold-700">
                {fr.nav.guides}
              </Link>
            </nav>
            <Link
              href="/estimation"
              className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-warm-50 hover:bg-navy-800 sm:hidden"
            >
              {fr.nav.estimation}
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-warm-200 bg-warm-100">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-navy-700 sm:px-6">
            <p className="max-w-3xl text-warm-700">{fr.footer.disclaimer}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span>
                © {new Date().getFullYear()} {brandName()} — {fr.footer.rights}
              </span>
              <Link href="/mentions-legales" className="hover:text-gold-700">
                {fr.footer.legal}
              </Link>
              <Link href="/confidentialite" className="hover:text-gold-700">
                {fr.footer.confidentiality}
              </Link>
              <Link href="/cgu" className="hover:text-gold-700">
                {fr.footer.cgu}
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
