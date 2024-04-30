import z from "zod";
import { HLC } from "./contexts/HlcContext";
import { generateNewAccountKeyPair } from "./utils/account";
import {
  DatabaseMutationOperation,
  GenerateDatabaseDelete,
  GenerateDatabaseMutation,
  GenerateDatabaseUpsert,
} from "./validators/types";

export type SelectRow = {
  type: string;
  columnNames: string[];
  row: string[];
  rowNumber: number;
};

const DB_NAME = "mydb.sqlite3";

export const initDatabase = async (
  sqlite3Worker1Promiser: (...args: unknown[]) => unknown
) => {
  const promiser: (..._args: unknown[]) => Promise<unknown> = await new Promise(
    (resolve) => {
      const _promiser = sqlite3Worker1Promiser({
        onready: () => {
          resolve(_promiser as (..._args: unknown[]) => Promise<unknown>);
        },
      });
    }
  );

  // @ts-expect-error
  const { dbId } = await promiser("open", {
    filename: `file:${DB_NAME}?vfs=opfs`,
  });

  await createTables(promiser);
  await seed(promiser);

  const exportDatabase = async () => {
    // @ts-expect-error
    const { result } = await promiser("export", { dbId });

    const blob = new Blob([result.byteArray], {
      type: "application/x-sqlite3",
    });
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = window.URL.createObjectURL(blob);
    a.download = "lofextra.sqlite3";
    a.addEventListener("click", function () {
      setTimeout(function () {
        window.URL.revokeObjectURL(a.href);
        a.remove();
      }, 500);
    });
    a.click();
  };

  return { promiser, exportDatabase };
};

const tables = [
  "transactions",
  "device",
  "pendingUpdates",
  "accounts",
  "categories",
];

const createTables = async (
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
};

const seed = async (promiser: (..._args: unknown[]) => Promise<unknown>) => {
  await seedDevice(promiser);
  await seedAccount(promiser);
  await seedCategories(promiser);
};

const seedAccount = async (
  promiser: (..._args: unknown[]) => Promise<unknown>
) => {
  const result: { id: number }[] = [];

  await promiser("exec", {
    sql: "select * from accounts order by id desc limit 1",
    callback: (res: SelectRow) => utils.mergeSelect(res, result),
  });

  if (!result[0]) {
    const { privKey, pubKey } = generateNewAccountKeyPair();

    await promiser("exec", {
      sql: `insert into accounts (privKey, pubKey, createdAt, updatedAt) values ('${privKey}', '${pubKey}', strftime('%s', 'now')*1000, strftime('%s', 'now')*1000)`,
    });
  }
};

const seedDevice = async (
  promiser: (..._args: unknown[]) => Promise<unknown>
) => {
  const result: { id: number }[] = [];

  await promiser("exec", {
    sql: "select * from device",
    callback: (res: SelectRow) => utils.mergeSelect(res, result),
  });

  if (!result[0]) {
    await promiser("exec", {
      sql: `insert into device (id, createdAt) values ('${crypto.randomUUID()}', strftime('%s', 'now')*1000)`,
    });
  }
};

const defaultCategoryIds = [
  "groceries",
  "restaurants",
  "bar",
  "clothes",
  "drug-store",
  "electronics",
  "free-time",
  "gifts",
  "health",
  "beauty",
  "home",
  "garden",
  "kids",
  "pets",
  "housing",
  "mortgage",
  "rent",
  "utilities",
  "insurance",
  "transportation",
  "taxi",
  "public-transport",
  "vehicle",
  "parking",
  "fuel",
  "rental",
  "maintenance",
  "sport",
  "books",
  "subscriptions",
  "charity",
  "culture",
  "education",
  "doctor",
  "hobbies",
  "gambling",
  "wellness",
  "holiday",
  "internet",
  "phone",
  "software",
  "fines",
  "investments",
  "taxes",
  "others",
];

const seedCategories = async (
  promiser: (..._args: unknown[]) => Promise<unknown>
) => {
  for (const category of defaultCategoryIds) {
    await promiser("exec", {
      sql: `insert into categories (id, title, updatedAt, createdAt) values ('${category}','${category}',strftime('%s', 'now')*1000,strftime('%s', 'now')*1000) on conflict (id) do nothing`,
    });
  }
};

export const utils = {
  generateUpsert: (
    {
      tableName,
      columnDataMap,
      identifierColumn = "id",
    }: GenerateDatabaseUpsert,
    hlc: HLC
  ) => {
    const columns = Object.keys(columnDataMap);
    const values = Object.values(columnDataMap);

    const updateClause = columns
      .map((column, i) =>
        values[i] === null ? `${column}=null` : `${column}='${values[i]}'`
      )
      .join(",");

    const sql = `insert into ${tableName} (${columns.join(
      ","
    )}, updatedAt) values (${values
      .map((v) => (v === null ? "null" : `'${v}'`))
      .join(",")},'${
      hlc.ts
    }') on conflict (${identifierColumn}) do update set ${updateClause},updatedAt='${
      hlc.ts
    }';`;

    return sql;
  },
  generateDelete: (
    {
      tableName,
      identifierValue,
      identifierColumn = "id",
    }: GenerateDatabaseDelete,
    hlc: HLC
  ) => {
    const sql = `update ${tableName} set deletedAt = '${hlc.ts}', updatedAt = '${hlc.ts}' where ${identifierColumn} = '${identifierValue}'`;

    return sql;
  },
  mergeSelect: <T>({ row, columnNames }: SelectRow, result: T[]) => {
    if (!row) {
      return;
    }

    const data = row.reduce((acc, row, i) => {
      acc[columnNames[i] as keyof T] = row as T[keyof T];

      return acc;
    }, {} as T);

    result.push(data);
  },
};

export const handleRemoteDatabaseMutation = async ({
  exec,
  hlc,
  mutation,
}: {
  exec: (sql: string) => Promise<Record<string, unknown>[]>;
  hlc: HLC;
  mutation: GenerateDatabaseMutation;
}) => {
  const identifierColumn = mutation.identifierColumn || "id";
  const identifierValue =
    mutation.operation === DatabaseMutationOperation.Upsert
      ? mutation.columnDataMap[identifierColumn]
      : mutation.identifierValue;

  const record = await exec(
    `select * from ${mutation.tableName} where ${identifierColumn} = '${identifierValue}'`
  );

  if (
    record[0] &&
    new Date(z.number().parse(record[0].updatedAt)) >= new Date(hlc.ts)
  ) {
    return;
  }

  await exec(
    mutation.operation === DatabaseMutationOperation.Upsert
      ? utils.generateUpsert(mutation, hlc)
      : utils.generateDelete(mutation, hlc)
  );
};
