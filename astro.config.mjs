import node from "@astrojs/node";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import AstroPWA from "@vite-pwa/astro";
import sqlocal from "sqlocal/vite";
import { defineConfig } from "astro/config";
import manifest from "./manifest.json";

// https://astro.build/config
export default defineConfig({
  site: "https://lofextra.com",
  adapter: node({ mode: "standalone" }),
  integrations: [
    react(),
    AstroPWA({
      disable: import.meta.env.DEV,
      manifest,
      manifestFilename: "manifest.json",
      registerType: "autoUpdate",
      // The integration only finds the client dir itself under output: "server".
      outDir: "dist/client",
      workbox: { globDirectory: "dist/client" },
    }),
    sitemap(),
    {
      name: "lofik-sync",
      hooks: {
        "astro:server:setup": async ({ server }) => {
          const { attachSyncServer } = await import("./src/lofik/server.ts");
          attachSyncServer(server.httpServer);
        },
      },
    },
  ],
  prefetch: true,
  vite: { plugins: [sqlocal()] },
});
