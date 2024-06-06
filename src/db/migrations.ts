import { bytesToHex } from "@/utils/bytesToHex";
import { getUnixTimestamp } from "@/utils/dates";
import { OpfsDatabase, Remote } from "@lofik/react";

enum Migrations {
  CategoriesPubKeyHex = "CategoriesPubKeyHex",
  TransactionsCategoriesForeignKey = "TransactionsCategoriesForeignKey",
}

const getPubKeyHex = (pubKey: string) =>
  bytesToHex(new Uint8Array(pubKey.split(",").map(Number)));

const getCurrentAccountPubKey = async (db: Remote<OpfsDatabase>) => {
  const data = await db.selectObjects(
    "select * from accounts order by id desc limit 1"
  );

  return data[0]?.pubKey as string | undefined;
};

const categoriesPubKeyHexMigration = async (db: Remote<OpfsDatabase>) => {
  const existingMigration = await findMigration(
    db,
    Migrations.CategoriesPubKeyHex
  );

  if (existingMigration[0]) {
    return;
  }

  // @ts-expect-error
  await db.exec("ALTER TABLE categories ADD pubKeyHex TEXT;");

  const currentPubKey = await getCurrentAccountPubKey(db);

  if (!currentPubKey) {
    throw new Error("Missing pub key, this should not happen!");
  }

  const pubKeyHex = getPubKeyHex(currentPubKey);

  // @ts-expect-error
  await db.exec(`UPDATE categories SET pubKeyHex = '${pubKeyHex}';`);

  createMigration(db, Migrations.CategoriesPubKeyHex);
};

const transactionsCategoriesForeignKeyMigration = async (
  db: Remote<OpfsDatabase>
) => {
  const existingMigration = await findMigration(
    db,
    Migrations.TransactionsCategoriesForeignKey
  );

  if (existingMigration[0]) {
    return;
  }

  // @ts-expect-error
  await db.exec({
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

  // @ts-expect-error
  await db.exec("insert into transactions_new select * from transactions;");

  // @ts-expect-error
  await db.exec("drop table transactions;");

  // @ts-expect-error
  await db.exec("alter table transactions_new rename to transactions;");

  await createMigration(db, Migrations.TransactionsCategoriesForeignKey);
};

const findMigration = async (
  db: Remote<OpfsDatabase>,
  migration: Migrations
) => {
  const data = await db.selectObjects(
    `select * from migrations where name = '${migration}'`
  );

  return data;
};

const createMigration = async (
  db: Remote<OpfsDatabase>,
  migration: Migrations
) => {
  await db.exec(
    // @ts-expect-error
    `INSERT INTO migrations (name, createdAt) VALUES ('${migration}', ${getUnixTimestamp()});`
  );
};

export const migrate = async (db: Remote<OpfsDatabase>) => {
  await categoriesPubKeyHexMigration(db);
  await transactionsCategoriesForeignKeyMigration(db);
};
