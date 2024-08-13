import z from "zod";
import { RecurringTransactionRepeatInterval } from "./types";

export const transactionSchema = z.object({
  id: z.string(),
  title: z.string(),
  amount: z.number(),
  currency: z.string(),
  pubKeyHex: z.string(),
  categoryId: z.string().nullable(),
  recurringTransactionId: z.string().nullable(),
  recurringTransactionIndex: z.number().nullable(),
  deletedAt: z.number().nullable(),
  updatedAt: z.number(),
  createdAt: z.number(),
});

export const transactionsSchema = z.array(transactionSchema);

export const categorySchema = z.object({
  id: z.string(),
  title: z.string(),
  pubKeyHex: z.string(),
  sortOrder: z.number(),
  deletedAt: z.number().nullable(),
  updatedAt: z.number(),
  createdAt: z.number(),
});

export const categoriesSchema = z.array(categorySchema);

export const recurringTransactionSchema = z.object({
  id: z.string(),
  title: z.string(),
  amount: z.number(),
  currency: z.string(),
  pubKeyHex: z.string(),
  categoryId: z.string().nullable(),
  repeatDay: z
    .number()
    .gte(1, "Must be 1 of greater")
    .lte(28, "Must be 28 or lower"),
  repeatInterval: z.nativeEnum(RecurringTransactionRepeatInterval),
  deletedAt: z.number().nullable(),
  updatedAt: z.number(),
  createdAt: z.number(),
});

export const recurringTransactionsSchema = z.array(recurringTransactionSchema);
