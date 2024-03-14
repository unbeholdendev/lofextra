import { TypeOf } from "zod";
import {
  categorySchema,
  generateDatabaseDeleteSchema,
  generateDatabaseMutationSchema,
  generateDatabaseUpsertSchema,
  messageSchema,
  transactionSchema,
} from "./validators";

export enum DatabaseMutationOperation {
  Upsert = "Upsert",
  Delete = "Delete",
}

export type Message = TypeOf<typeof messageSchema>;

export type Transaction = TypeOf<typeof transactionSchema>;
export type Category = TypeOf<typeof categorySchema>;

export type GenerateDatabaseUpsert = TypeOf<
  typeof generateDatabaseUpsertSchema
>;

export type GenerateDatabaseDelete = TypeOf<
  typeof generateDatabaseDeleteSchema
>;

export type GenerateDatabaseMutation = TypeOf<
  typeof generateDatabaseMutationSchema
>;
