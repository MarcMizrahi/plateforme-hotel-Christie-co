import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const SESSION_COOKIE = "hm_sid";

/**
 * Identifiant de session anonyme (aucune donnée personnelle) utilisé pour relier les
 * événements analytics d'un même visiteur — METRICS.md §5.
 */
export async function getOrCreateSessionId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const id = randomUUID();
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
  });
  return id;
}
