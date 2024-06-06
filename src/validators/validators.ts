import z from "zod";

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
  pubKeyHex: z.string(),
  deletedAt: z.number().nullable(),
  updatedAt: z.number(),
  createdAt: z.number(),
});

export const categoriesSchema = z.array(categorySchema);
