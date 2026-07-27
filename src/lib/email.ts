import nodemailer from "nodemailer";
import { brandName } from "@/lib/brand";

interface EstimationReportEmailInput {
  to: string;
  resultUrl: string;
  valueLowFormatted: string;
  valueHighFormatted: string;
  methodNotes: string;
}

function buildTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
}

/**
 * Envoie le rapport d'estimation par email. En l'absence de SMTP configuré (Phase 0
 * locale/démo), l'envoi est simplement journalisé — l'utilisateur voit de toute façon
 * le résultat sur la page dédiée.
 */
export async function sendEstimationReportEmail(input: EstimationReportEmailInput): Promise<void> {
  const transport = buildTransport();
  const brand = brandName();
  const subject = `Votre estimation ${brand} : ${input.valueLowFormatted} – ${input.valueHighFormatted}`;

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #16233d;">
      <h1 style="font-size: 20px;">${brand}</h1>
      <p style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6;">
        Voici votre estimation, fondée sur les données du marché hôtelier français.
      </p>
      <p style="font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; margin: 24px 0;">
        ${input.valueLowFormatted} – ${input.valueHighFormatted}
      </p>
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #4d463d;">
        ${input.methodNotes}
      </p>
      <p style="font-family: Arial, sans-serif; font-size: 14px;">
        <a href="${input.resultUrl}" style="color: #a8823c;">Revoir le détail de votre estimation</a>
      </p>
      <p style="font-family: Arial, sans-serif; font-size: 12px; color: #8a8072; margin-top: 32px;">
        Cette estimation est indicative et ne remplace pas une expertise réalisée par un professionnel
        de la transaction hôtelière.
      </p>
    </div>
  `;

  if (!transport) {
    console.info(`[email:dev] SMTP non configuré — rapport non envoyé à ${input.to}. Sujet : ${subject}`);
    return;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || `no-reply@${brand.toLowerCase()}.example`,
    to: input.to,
    subject,
    html,
  });
}
