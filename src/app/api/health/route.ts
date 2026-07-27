import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Healthcheck utilisé par le monitoring (UptimeRobot) et la vérification post-déploiement — DEPLOY.md §4-6. */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Healthcheck DB failure", error);
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
