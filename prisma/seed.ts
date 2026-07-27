import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { REGIONS } from "../src/data/geo";
import { BASE_COEFFICIENTS, DEFAULT_EBITDA_MARGIN } from "../src/data/coefficients";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const region of REGIONS) {
    for (const base of BASE_COEFFICIENTS) {
      await prisma.coefficientValo.upsert({
        where: { regionSlug_starRating: { regionSlug: region.slug, starRating: base.starRating } },
        create: {
          regionSlug: region.slug,
          starRating: base.starRating,
          ebitdaMultipleLow: base.ebitdaMultipleLow,
          ebitdaMultipleHigh: base.ebitdaMultipleHigh,
          pricePerRoomLowCents: Math.round(base.pricePerRoomLow * region.modifier * 100),
          pricePerRoomHighCents: Math.round(base.pricePerRoomHigh * region.modifier * 100),
          ebitdaMarginDefault: DEFAULT_EBITDA_MARGIN,
        },
        update: {
          ebitdaMultipleLow: base.ebitdaMultipleLow,
          ebitdaMultipleHigh: base.ebitdaMultipleHigh,
          pricePerRoomLowCents: Math.round(base.pricePerRoomLow * region.modifier * 100),
          pricePerRoomHighCents: Math.round(base.pricePerRoomHigh * region.modifier * 100),
          ebitdaMarginDefault: DEFAULT_EBITDA_MARGIN,
        },
      });
    }
  }

  const count = await prisma.coefficientValo.count();
  console.log(`Coefficients de valorisation seedés : ${count} lignes (13 régions × 6 classements).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
