import { defineConfig } from "prisma/config";

// En local, les variables viennent de .env via dotenv. En conteneur/CI elles sont
// déjà dans l'environnement (env_file, secrets GitHub) et dotenv n'est pas forcément
// installé : son absence ne doit pas faire échouer `prisma migrate deploy`.
try {
  await import("dotenv/config");
} catch {
  // dotenv absent : on se contente des variables déjà présentes dans l'environnement.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
