# lofextra

Astro static site with a React app at `/dashboard`. Bun is the package manager
and the runtime (`bun:sqlite`); `bun run check` type-checks.

- `src/lofik` is the local-first layer (browser SQLite, E2EE sync), inlined from
  pycanis/lofik. `src/lofik/server.ts` is the sync server: socket.io on the same
  HTTP server, attached by `server.mjs` in production and an integration in
  `astro.config.mjs` in dev. Its store is `DATABASE_PATH` (default
  `data/sync.db`), which must sit on a persistent volume. Use a Dokploy volume
  mount, not a bind mount: the container runs as `bun`, and a bind mount is
  root-owned.
- Every response needs COOP/COEP headers for the SQLite worker. `server.mjs` sets
  them in production, the `sqlocal/vite` plugin in dev.
- Deploys run by hand: the `deploy` Forgejo workflow builds the image and points
  Dokploy at it.
