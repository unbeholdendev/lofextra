import type { z } from "zod";
import {
  generateDatabaseDeleteSchema,
  generateDatabaseMutationSchema,
  generateDatabaseSortSchema,
  generateDatabaseUpsertSchema,
} from "./validators/db";
import { messageSchema } from "./validators/messages";

export { DatabaseMutationOperation } from "./validators/db";

export type Message = z.infer<typeof messageSchema>;

export type GenerateDatabaseUpsert = z.infer<
  typeof generateDatabaseUpsertSchema
>;

export type GenerateDatabaseDelete = z.infer<
  typeof generateDatabaseDeleteSchema
>;

export type GenerateDatabaseSort = z.infer<typeof generateDatabaseSortSchema>;

export type GenerateDatabaseMutation = z.infer<
  typeof generateDatabaseMutationSchema
>;
