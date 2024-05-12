import z from "zod";
import { HLC } from "../contexts/HlcContext";
import {
  DatabaseMutationOperation,
  GenerateDatabaseDelete,
  GenerateDatabaseMutation,
  GenerateDatabaseUpsert,
} from "../validators/types";
import { createTables } from "./create";
import { migrate } from "./migrations";
import { seed } from "./seeds";

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
  await migrate(promiser);

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
