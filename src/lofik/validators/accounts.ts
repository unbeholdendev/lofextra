import { z } from "zod";

export const accountSchema = z.object({
  id: z.number(),
  privKey: z.string(),
  pubKey: z.string(),
  createdAt: z.number(),
});

export const accountsSchema = z.array(accountSchema);
