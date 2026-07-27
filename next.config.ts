import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Image de production autonome (DEPLOY.md §4) : .next/standalone embarque son propre
  // serveur Node minimal, sans dépendre de node_modules complet dans l'image finale.
  output: "standalone",
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
