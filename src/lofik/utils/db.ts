import type { Socket } from "socket.io-client";
import { z } from "zod";
import { sqlocal } from "../db/sqlocal";
import {
  DatabaseMutationOperation,
  type GenerateDatabaseDelete,
  type GenerateDatabaseMutation,
  type GenerateDatabaseSort,
  type GenerateDatabaseUpsert,
} from "../types";

export const utils: Record<
  DatabaseMutationOperation,
  // todo fix
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (operation: any, ts: number) => string
> = {
  [DatabaseMutationOperation.Upsert]: (
    {
      tableName,
      columnDataMap,
      identifierColumn = "id",
    }: GenerateDatabaseUpsert,
    ts: number
  ) => {
    const columns = Object.keys(columnDataMap);
    const values = Object.values(columnDataMap);

    const updateClause = columns
      .map((column, i) =>
        values[i] === null ? `${column}=NULL` : `${column}='${values[i]}'`
      )
      .join(",");

    const sql = `INSERT INTO ${tableName} (${columns.join(
      ","
    )}, updatedAt) VALUES (${values
      .map((v) => (v === null ? "NULL" : `'${v}'`))
      .join(",")},'${
      ts
    }') ON CONFLICT (${identifierColumn}) DO UPDATE SET ${updateClause},updatedAt='${
      ts
    }';`;

    return sql;
  },
  [DatabaseMutationOperation.Delete]: (
    {
      tableName,
      identifierValue,
      identifierColumn = "id",
    }: GenerateDatabaseDelete,
    ts: number
  ) => {
    const sql = `UPDATE ${tableName} SET deletedAt = '${ts}', updatedAt = '${ts}' WHERE ${identifierColumn} = '${identifierValue}'`;

    return sql;
  },
  [DatabaseMutationOperation.Sort]: (
    {
      tableName,
      identifierValue,
      identifierColumn = "id",
      sortColumn = "sortOrder",
      order,
    }: GenerateDatabaseSort,
    ts: number
  ) => {
    const sql = `
      UPDATE ${tableName} SET updatedAt = '${ts}', 
        ${sortColumn} = CASE 
          WHEN ${identifierColumn} = '${identifierValue}' THEN ${order}
          WHEN ${sortColumn} >= ${order} AND ${identifierColumn} <> '${identifierValue}' THEN ${sortColumn} + 1
          ELSE ${sortColumn}
        END
      WHERE ${identifierColumn} = '${identifierValue}' 
        OR (${sortColumn} >= ${order} AND ${identifierColumn} <> '${identifierValue}' 
          AND deletedAt IS NULL)
    `;

    return sql;
  },
};

export const handleRemoteDatabaseMutation = async ({
  ts,
  mutation,
}: {
  ts: number;
  mutation: GenerateDatabaseMutation;
}) => {
  const identifierColumn = mutation.identifierColumn || "id";
  const identifierValue =
    mutation.operation === DatabaseMutationOperation.Upsert
      ? mutation.columnDataMap[identifierColumn]
      : mutation.identifierValue;

  const record = await sqlocal.sql(
    `SELECT * FROM ${mutation.tableName} WHERE ${identifierColumn} = '${identifierValue}'`
  );

  if (
    record[0] &&
    new Date(z.number().parse(record[0].updatedAt)) >= new Date(ts)
  ) {
    return;
  }

  const sql = utils[mutation.operation](mutation, ts);

  await sqlocal.sql(sql);
};

export const pushPendingUpdates = async (socket: Socket) => {
  const pendingUpdates = await sqlocal.sql(
    "SELECT * FROM pendingUpdates ORDER BY id"
  );

  if (!pendingUpdates.length) {
    return;
  }

  try {
    await socket.timeout(10000).emitWithAck(
      "messages",
      pendingUpdates.flatMap((update) =>
        JSON.parse(z.string().parse(update.message))
      )
    );

    for (const update of pendingUpdates) {
      await sqlocal.sql(`DELETE FROM pendingUpdates WHERE id = ${update.id}`);
    }
  } catch (err) {
    console.error(err);
  }
};
