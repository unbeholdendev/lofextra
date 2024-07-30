import type { SQLocal } from "@lofik/react";
import { getUnixTimestamp } from "../../utils/dates";

enum Migrations {
  CategoriesSortColumn = "CategoriesSortColumn",
}

const findMigration = async (sqlocal: SQLocal, migration: Migrations) => {
  const data = await sqlocal.sql(
    `select * from migrations where name = '${migration}'`
  );

  return data[0];
};

const createMigration = async (sqlocal: SQLocal, migration: Migrations) => {
  await sqlocal.sql(
    `INSERT INTO migrations (name, createdAt) VALUES ('${migration}', ${getUnixTimestamp()});`
  );
};

const catgoriesSortColumnMigration = async (sqlocal: SQLocal) => {
  const migration = await findMigration(
    sqlocal,
    Migrations.CategoriesSortColumn
  );

  if (migration) {
    return;
  }

  await sqlocal.sql("ALTER TABLE categories ADD COLUMN sortOrder INTEGER");

  const categories = await sqlocal.sql(
    "SELECT * FROM categories WHERE deletedAt IS NULL ORDER BY createdAt ASC"
  );

  const groupedCategoriesByPubKeyHex = Object.groupBy(
    categories,
    (c) => c.pubKeyHex
  );

  for (const pubKeyHex of Object.keys(groupedCategoriesByPubKeyHex)) {
    const categoriesByPubKeyHex = groupedCategoriesByPubKeyHex[pubKeyHex];

    for (const [i, category] of (categoriesByPubKeyHex ?? []).entries()) {
      await sqlocal.sql(
        `UPDATE categories SET sortOrder = ${i + 1} WHERE id = '${category.id}'`
      );
    }
  }

  await createMigration(sqlocal, Migrations.CategoriesSortColumn);
};

export const runMigrations = async (sqlocal: SQLocal) => {
  await catgoriesSortColumnMigration(sqlocal);
};
