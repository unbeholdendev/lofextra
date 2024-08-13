import { sqlocal, type SQLocal } from "@lofik/react";
import { getUnixTimestamp } from "../../utils/dates";

enum Migrations {
  CategoriesSortColumn = "CategoriesSortColumn",
  RecurringTransactions = "RecurringTransactions",
}

const findMigration = async (sqlocal: SQLocal, migration: Migrations) => {
  const data = await sqlocal.sql(
    `select * from migrations where name = '${migration}'`
  );

  return data[0];
};

const createMigration = async (sql = sqlocal.sql, migration: Migrations) => {
  await sql(
    `INSERT INTO migrations (name, createdAt) VALUES ('${migration}', ${getUnixTimestamp()});`
  );
};

const categoriesSortColumnMigration = async (sqlocal: SQLocal) => {
  const migration = await findMigration(
    sqlocal,
    Migrations.CategoriesSortColumn
  );

  if (migration) {
    return;
  }

  await sqlocal.transaction(async (tx) => {
    await tx.sql("ALTER TABLE categories ADD COLUMN sortOrder INTEGER");

    const categories = await tx.sql(
      "SELECT * FROM categories WHERE deletedAt IS NULL ORDER BY createdAt ASC"
    );

    const groupedCategoriesByPubKeyHex = Object.groupBy(
      categories,
      (c) => c.pubKeyHex
    );

    for (const pubKeyHex of Object.keys(groupedCategoriesByPubKeyHex)) {
      const categoriesByPubKeyHex = groupedCategoriesByPubKeyHex[pubKeyHex];

      for (const [i, category] of (categoriesByPubKeyHex ?? []).entries()) {
        await tx.sql(
          `UPDATE categories SET sortOrder = ${i + 1} WHERE id = '${
            category.id
          }'`
        );
      }
    }

    await createMigration(tx.sql, Migrations.CategoriesSortColumn);
  });
};

const RecurringTransactionsMigration = async (sqlocal: SQLocal) => {
  const migration = await findMigration(
    sqlocal,
    Migrations.RecurringTransactions
  );

  if (migration) {
    return;
  }

  await sqlocal.transaction(async (tx) => {
    await tx.sql(
      "CREATE TABLE recurringTransactions (id VARCHAR(40) PRIMARY KEY, title TEXT NOT NULL, amount REAL NOT NULL, currency TEXT DEFAULT 'USD', categoryId VARCHAR(40), repeatDay INTEGER NOT NULL, repeatInterval TEXT NOT NULL CHECK(repeatInterval IN ('month')), pubKeyHex TEXT NOT NULL, deletedAt INTEGER, updatedAt INTEGER NOT NULL, createdAt INTEGER NOT NULL, FOREIGN KEY (categoryId) REFERENCES categories(id))"
    );

    await tx.sql(
      "ALTER TABLE transactions ADD COLUMN recurringTransactionId VARCHAR(40)"
    );

    await tx.sql(
      "ALTER TABLE transactions ADD COLUMN recurringTransactionIndex INTEGER"
    );

    await tx.sql(
      "CREATE TABLE transactionsNew (id VARCHAR(40) PRIMARY KEY, title TEXT NOT NULL, amount REAL NOT NULL, currency TEXT DEFAULT 'USD', pubKeyHex TEXT NOT NULL, categoryId VARCHAR(40), deletedAt INTEGER, updatedAt INTEGER NOT NULL, createdAt INTEGER NOT NULL, recurringTransactionId VARCHAR(40), recurringTransactionIndex INTEGER, FOREIGN KEY (recurringTransactionId) REFERENCES recurringTransactions(id))"
    );

    await tx.sql("INSERT INTO transactionsNew SELECT * FROM transactions");

    await tx.sql("DROP TABLE transactions");

    await tx.sql("ALTER TABLE transactionsNew RENAME TO transactions");

    await createMigration(tx.sql, Migrations.RecurringTransactions);
  });
};

export const runMigrations = async (sqlocal: SQLocal) => {
  await categoriesSortColumnMigration(sqlocal);
  await RecurringTransactionsMigration(sqlocal);
};
