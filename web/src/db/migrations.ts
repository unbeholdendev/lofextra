import { getPubKeyHex } from "@/utils/account";
import { getUnixTimestamp } from "@/utils/dates";
import { SelectRow, utils } from "./db";
import { getCurrentAccountPubKey } from "./seeds";

enum Migrations {
  CategoriesPubKeyHex = "CategoriesPubKeyHex",
}

const categoriesPubKeyHexMigration = async (
  promiser: (..._args: unknown[]) => Promise<unknown>
) => {
  const result: { id: number }[] = [];
  await promiser("exec", {
    sql: `select * from migrations where name = '${Migrations.CategoriesPubKeyHex}'`,
    callback: (res: SelectRow) => utils.mergeSelect(res, result),
  });

  if (result[0]) {
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

  await promiser("exec", {
    sql: `
              INSERT INTO migrations (name, createdAt) VALUES ('${
                Migrations.CategoriesPubKeyHex
              }', ${getUnixTimestamp()});
          `,
  });
};

export const migrate = async (
  promiser: (..._args: unknown[]) => Promise<unknown>
) => {
  await categoriesPubKeyHexMigration(promiser);
};
