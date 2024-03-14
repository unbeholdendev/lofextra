import z from "zod";
import { DatabaseMutationOperation } from "./types";

export const transactionSchema = z.object({
  id: z.string(),
  title: z.string(),
  amount: z.number(),
  currency: z.string(),
  pubKeyHex: z.string(),
  categoryId: z.string().nullable(),
  deletedAt: z.number().nullable(),
  updatedAt: z.number(),
  createdAt: z.number(),
});

export const transactionsSchema = z.array(transactionSchema);

export const categorySchema = z.object({
  id: z.string(),
  title: z.string(),
  deletedAt: z.number().nullable(),
  updatedAt: z.number(),
  createdAt: z.number(),
});

export const categoriesSchema = z.array(categorySchema);

export const accountSchema = z.object({
  id: z.number(),
  privKey: z.string(),
  pubKey: z.string(),
  createdAt: z.number(),
});

export const accountsSchema = z.array(accountSchema);

export const deviceSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
});

export const devicesSchema = z.array(deviceSchema);

export const messageSchema = z.object({
  pubKeyHex: z.string(),
  payload: z.string(),
  nonce: z.string(),
  hlc: z.string(),
});

export const messagesSchema = z.array(messageSchema);

const generateDatabaseMutationBaseSchema = z.object({
  tableName: z.string(),
  identifierColumn: z.string().optional(),
});

export const generateDatabaseUpsertSchema =
  generateDatabaseMutationBaseSchema.extend({
    operation: z.literal(DatabaseMutationOperation.Upsert),
    columnDataMap: z.record(z.unknown()),
  });

export const generateDatabaseDeleteSchema =
  generateDatabaseMutationBaseSchema.extend({
    operation: z.literal(DatabaseMutationOperation.Delete),
    identifierValue: z.union([z.number(), z.string()]),
  });

export const generateDatabaseMutationSchema = z.union([
  generateDatabaseUpsertSchema,
  generateDatabaseDeleteSchema,
]);
