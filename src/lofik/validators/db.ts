import { z } from "zod";

export enum DatabaseMutationOperation {
  Upsert = "Upsert",
  Delete = "Delete",
  Sort = "Sort",
}

const generateDatabaseMutationBaseSchema = z.object({
  tableName: z.string(),
  identifierColumn: z.string().optional(),
});

export const generateDatabaseUpsertSchema =
  generateDatabaseMutationBaseSchema.extend({
    operation: z.literal(DatabaseMutationOperation.Upsert),
    columnDataMap: z.record(z.string(), z.unknown()),
  });

export const generateDatabaseDeleteSchema =
  generateDatabaseMutationBaseSchema.extend({
    operation: z.literal(DatabaseMutationOperation.Delete),
    identifierValue: z.union([z.number(), z.string()]),
  });

export const generateDatabaseSortSchema =
  generateDatabaseMutationBaseSchema.extend({
    operation: z.literal(DatabaseMutationOperation.Sort),
    sortColumn: z.string().optional(),
    identifierValue: z.union([z.number(), z.string()]),
    order: z.number(),
  });

export const generateDatabaseMutationSchema = z.union([
  generateDatabaseUpsertSchema,
  generateDatabaseDeleteSchema,
  generateDatabaseSortSchema,
]);
