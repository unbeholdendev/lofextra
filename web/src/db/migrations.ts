import { getPubKeyHex } from "@/utils/account";
import { getUnixTimestamp } from "@/utils/dates";
import { OpfsDatabase } from "@sqlite.org/sqlite-wasm";
import { getCurrentAccountPubKey } from "./seeds";

enum Migrations {
  CategoriesPubKeyHex = "CategoriesPubKeyHex",
  TransactionsCategoriesForeignKey = "TransactionsCategoriesForeignKey",
}

const categoriesPubKeyHexMigration = async (db: OpfsDatabase) => {
  const existingMigration = await findMigration(
    db,
    Migrations.CategoriesPubKeyHex
  );

  if (existingMigration[0]) {
    return;
  }

  db.exec({ sql: "ALTER TABLE categories ADD pubKeyHex TEXT;" });

  const currentPubKey = getCurrentAccountPubKey(db);

  if (!currentPubKey) {
    throw new Error("Missing pub key, this should not happen!");
  }

  const pubKeyHex = getPubKeyHex(currentPubKey);

  db.exec({ sql: `UPDATE categories SET pubKeyHex = '${pubKeyHex}';` });

  createMigration(db, Migrations.CategoriesPubKeyHex);
};

const transactionsCategoriesForeignKeyMigration = async (db: OpfsDatabase) => {
  const existingMigration = await findMigration(
    db,
    Migrations.TransactionsCategoriesForeignKey
  );

  if (existingMigration[0]) {
    return;
  }

  db.exec({
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

  db.exec("insert into transactions_new select * from transactions;");

  db.exec("drop table transactions;");

  db.exec("alter table transactions_new rename to transactions;");

  await createMigration(db, Migrations.TransactionsCategoriesForeignKey);
};

const findMigration = async (db: OpfsDatabase, migration: Migrations) => {
  const data = db.selectObjects(
    `select * from migrations where name = '${migration}'`
  );

  return data;
};

const createMigration = async (db: OpfsDatabase, migration: Migrations) => {
  db.exec(
    `INSERT INTO migrations (name, createdAt) VALUES ('${migration}', ${getUnixTimestamp()});`
  );
};

export const migrate = (db: OpfsDatabase) => {
  categoriesPubKeyHexMigration(db);
  transactionsCategoriesForeignKeyMigration(db);
};
