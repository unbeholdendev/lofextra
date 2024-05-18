const tables = [
  "transactions",
  "device",
  "pendingUpdates",
  "accounts",
  "categories",
];

export const createTables = async (
  promiser: (..._args: unknown[]) => Promise<unknown>
) => {
  // for (const table of tables) {
  // await promiser("exec", {
  //   sql: `
  //            drop table pendingUpdates
  //         `,
  // });
  // }

  await promiser("exec", {
    sql: `
            PRAGMA foreign_keys=on
        `,
  });

  await promiser("exec", {
    sql: `
            CREATE TABLE IF NOT EXISTS device (
              id VARCHAR(40) PRIMARY KEY,
              createdAt INTEGER NOT NULL
            );
        `,
  });

  await promiser("exec", {
    sql: `
          CREATE TABLE IF NOT EXISTS accounts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              privKey TEXT NOT NULL,
              pubKey TEXT NOT NULL,
              updatedAt INTEGER NOT NULL,
              createdAt INTEGER NOT NULL
          );
      `,
  });

  await promiser("exec", {
    sql: `
            CREATE TABLE IF NOT EXISTS pendingUpdates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message TEXT NOT NULL,
                updatedAt INTEGER NOT NULL,
                createdAt INTEGER NOT NULL
            );
        `,
  });

  await promiser("exec", {
    sql: `
          CREATE TABLE IF NOT EXISTS categories (
              id VARCHAR(40) PRIMARY KEY,
              title TEXT NOT NULL,
              deletedAt INTEGER,
              updatedAt INTEGER NOT NULL,
              createdAt INTEGER NOT NULL
          );
      `,
  });

  await promiser("exec", {
    sql: `
          CREATE TABLE IF NOT EXISTS transactions (
              id VARCHAR(40) PRIMARY KEY,
              title TEXT NOT NULL,
              amount REAL NOT NULL,
              currency TEXT DEFAULT 'USD',
              pubKeyHex TEXT NOT NULL,
              categoryId VARCHAR(40),
              deletedAt INTEGER,
              updatedAt INTEGER NOT NULL,
              createdAt INTEGER NOT NULL,
              FOREIGN KEY(categoryId) REFERENCES categories(id)
          );
      `,
  });

  await promiser("exec", {
    sql: `
          CREATE TABLE IF NOT EXISTS migrations (
              id SERIAL PRIMARY KEY,
              name TEXT UNIQUE NOT NULL,
              createdAt INTEGER NOT NULL
          );
      `,
  });
};
