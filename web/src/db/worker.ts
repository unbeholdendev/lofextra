import * as comlink from "comlink";

import { DB_NAME } from "@/constants";
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { createTables } from "./create";
import { migrate } from "./migrations";
import { seed } from "./seeds";

const initSqlite = async () => {
  try {
    const sqlite3 = await sqlite3InitModule();

    if (!("opfs" in sqlite3)) {
      throw new Error("OPFS not suppored");
    }

    const db = new sqlite3.oo1.OpfsDb(
      DB_NAME,
      "c".concat(process.env.NODE_ENV === "development" ? "t" : "")
    );

    createTables(db);
    seed(db);
    migrate(db);

    comlink.expose({ db, sqlite3 });

    self.postMessage({ type: "dbReady" });
  } catch (err) {
    console.error("Initialization error:", err);
  }
};

initSqlite();
