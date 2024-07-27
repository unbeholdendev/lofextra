import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import AstroPWA from "@vite-pwa/astro";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import manifest from "./manifest.json";

const { PUBLIC_SITE_URL } = loadEnv(
  process.env.PUBLIC_SITE_URL,
  process.cwd(),
  ""
);

// https://astro.build/config
export default defineConfig({
  site: PUBLIC_SITE_URL,
  integrations: [
    react(),
    AstroPWA({
      disable: import.meta.env.DEV,
      manifest,
      manifestFilename: "manifest.json",
      registerType: "autoUpdate",
    }),
    sitemap(),
  ],
  // prefetch: true,
  vite: {
    // this is needed because there's issue in vite regarding importing worker files
    // https://github.com/vitejs/vite/issues/8427
    optimizeDeps: {
      exclude: ["@lofik/react"],
    },
  },
  server: {
    headers: {
      "cross-origin-embedder-policy": "require-corp",
      "cross-origin-opener-policy": "same-origin",
    },
  },
});
