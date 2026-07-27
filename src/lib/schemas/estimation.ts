import { z } from "zod";
import { DEPARTMENTS_BY_SLUG, REGIONS_BY_SLUG } from "@/data/geo";

// À terme (Phase 1), ce schéma migre vers packages/shared pour être partagé front/back
// (CLAUDE.md §6). En Phase 0, front et "back" sont le même processus Next.js.

export const transactionTypeSchema = z.enum(["MURS", "FONDS", "MURS_FONDS", "GERANCE"]);
export const saleIntentionSchema = z.enum(["LESS_THAN_1_YEAR", "ONE_TO_TWO_YEARS", "CURIOSITY"]);

export const estimationSubmissionSchema = z.object({
  regionSlug: z.string().refine((v) => REGIONS_BY_SLUG.has(v), "Région invalide"),
  departmentSlug: z.string().refine((v) => DEPARTMENTS_BY_SLUG.has(v), "Département invalide"),
  city: z.string().trim().max(120).optional().or(z.literal("")),

  transactionType: transactionTypeSchema,

  roomCount: z.coerce.number().int().min(1).max(2000),
  starRating: z.coerce.number().int().min(0).max(5),
  hasLicence4: z.coerce.boolean().optional().default(false),

  revenue: z.coerce.number().min(0).max(100_000_000).optional().or(z.literal("").transform(() => undefined)),
  ebitda: z.coerce.number().min(-10_000_000).max(100_000_000).optional().or(z.literal("").transform(() => undefined)),

  email: z.string().trim().email("Adresse email invalide"),
  saleIntention: saleIntentionSchema,
  consentContact: z
    .union([z.literal("on"), z.literal("true"), z.boolean()])
    .transform((v) => v === "on" || v === "true" || v === true)
    .refine((v) => v === true, "Le consentement est requis"),

  utmSource: z.string().trim().max(200).optional().or(z.literal("")),
  utmMedium: z.string().trim().max(200).optional().or(z.literal("")),
  utmCampaign: z.string().trim().max(200).optional().or(z.literal("")),
  referrer: z.string().trim().max(500).optional().or(z.literal("")),
});

export type EstimationSubmission = z.infer<typeof estimationSubmissionSchema>;
