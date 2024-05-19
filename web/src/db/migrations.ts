import { getPubKeyHex } from "@/utils/account";
import { getUnixTimestamp } from "@/utils/dates";
import { SelectRow, utils } from "./db";
import { getCurrentAccountPubKey } from "./seeds";

enum Migrations {
  CategoriesPubKeyHex = "CategoriesPubKeyHex",
  TransactionsCategoriesForeignKey = "TransactionsCategoriesForeignKey",
}

const categoriesPubKeyHexMigration = async (
  promiser: (..._args: unknown[]) => Promise<unknown>
) => {
  const existingMigration = await findMigration(
    promiser,
    Migrations.CategoriesPubKeyHex
  );

  if (existingMigration[0]) {
    return;
  }

  await promiser("exec", {
    sql: `
              ALTER TABLE categories ADD pubKeyHex TEXT;
          `,
  });

  const currentPubKey = await getCurrentAccountPubKey(promiser);

  if (!currentPubKey) {
    throw new Error("Missing pub key, this should not happen!");
  }

  const pubKeyHex = getPubKeyHex(currentPubKey);

  await promiser("exec", {
    sql: `
              UPDATE categories SET pubKeyHex = '${pubKeyHex}';
          `,
  });

  // sqlite doesnt support modifying columns..
  //   await promiser("exec", {
  //     sql: `
  //             ALTER TABLE categories ALTER COLUMN pubKeyHex TEXT NOT NULL;
  //         `,
  //   });

  await createMigration(promiser, Migrations.CategoriesPubKeyHex);
};

const transactionsCategoriesForeignKeyMigration = async (
  promiser: (..._args: unknown[]) => Promise<unknown>
) => {
  const existingMigration = await findMigration(
    promiser,
    Migrations.TransactionsCategoriesForeignKey
  );

  if (existingMigration[0]) {
    return;
  }

  await promiser("exec", {
    sql: `
          CREATE TABLE IF NOT EXISTS transactions_new (
              id VARCHAR(40) PRIMARY KEY,
              title TEXT NOT NULL,
              amount REAL NOT NULL,
              currency TEXT DEFAULT 'USD',
              pubKeyHex TEXT NOT NULL,
              categoryId VARCHAR(40),
              deletedAt INTEGER,
              updatedAt INTEGER NOT NULL,
              createdAt INTEGER NOT NULL
          );
      `,
  });

  await promiser("exec", {
    sql: `insert into transactions_new select * from transactions;`,
  });

  await promiser("exec", {
    sql: `drop table transactions;`,
  });

  await promiser("exec", {
    sql: `alter table transactions_new rename to transactions;`,
  });

  await createMigration(promiser, Migrations.TransactionsCategoriesForeignKey);
};

const findMigration = async (
  promiser: (..._args: unknown[]) => Promise<unknown>,
  migration: Migrations
) => {
  const result: { id: number }[] = [];

  await promiser("exec", {
    sql: `select * from migrations where name = '${migration}'`,
    callback: (res: SelectRow) => utils.mergeSelect(res, result),
  });

  return result;
};

const createMigration = async (
  promiser: (..._args: unknown[]) => Promise<unknown>,
  migration: Migrations
) => {
  await promiser("exec", {
    sql: `
              INSERT INTO migrations (name, createdAt) VALUES ('${migration}', ${getUnixTimestamp()});
          `,
  });
};

export const migrate = async (
  promiser: (..._args: unknown[]) => Promise<unknown>
) => {
  await categoriesPubKeyHexMigration(promiser);
  await transactionsCategoriesForeignKeyMigration(promiser);
};
