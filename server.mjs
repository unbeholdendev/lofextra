import { createServer } from "node:http";
import { attachSyncServer } from "./src/lofik/server.ts";

process.env.ASTRO_NODE_AUTOSTART = "disabled";
const { handler } = await import("./dist/server/entry.mjs");

// The adapter's static headers option only carries CSP, and SQLite's worker needs these on every file.
const server = createServer((req, res) => {
  res.setHeader("cross-origin-embedder-policy", "require-corp");
  res.setHeader("cross-origin-opener-policy", "same-origin");
  handler(req, res);
});
attachSyncServer(server);
server.listen(4321, "0.0.0.0");
