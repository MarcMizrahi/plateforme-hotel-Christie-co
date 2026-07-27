import type { Metadata } from "next";

export const metadata: Metadata = { title: "Confidentialité", robots: { index: false } };

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-sm leading-relaxed text-navy-800 sm:px-6">
      <h1 className="mb-6 font-serif text-2xl text-navy-900">Politique de confidentialité</h1>
      <p className="mb-4 rounded-md border border-gold-400/50 bg-gold-400/10 p-4">
        Page provisoire — TODO juriste (MARKET.md §7, RISKS.md R7) : registre des traitements RGPD,
        base légale du traitement des emails et données d&apos;estimation, durée de conservation des
        leads, procédure d&apos;exercice des droits (accès, rectification, effacement), hébergement
        des données en UE, politique de cookies. Ne pas considérer cette page comme conforme en
        l&apos;état.
      </p>
      <p>
        En résumé du fonctionnement actuel du produit : les données saisies dans le formulaire
        d&apos;estimation (email, caractéristiques de l&apos;établissement, intention de vente) sont
        utilisées pour vous transmettre votre estimation et, si vous y consentez explicitement, pour
        vous mettre en relation avec des agences partenaires de votre secteur.
      </p>
    </div>
  );
}
