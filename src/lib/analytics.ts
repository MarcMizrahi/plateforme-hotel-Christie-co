import { prisma } from "@/lib/prisma";
import { getOrCreateSessionId } from "@/lib/session";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Enregistre un événement de conversion en base, indépendamment du script analytics
 * tiers (insensible aux adblockers) — METRICS.md §5. Convention de nommage : `domaine.action`.
 * À appeler uniquement depuis une Server Action ou un Route Handler (nécessite d'écrire
 * un cookie de session).
 */
export async function logEvent(
  name: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const sessionId = await getOrCreateSessionId();
  await prisma.analyticsEvent.create({
    data: { name, sessionId, metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined },
  });
}
