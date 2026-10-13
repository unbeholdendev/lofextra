import type { z } from "zod";
import {
  categorySchema,
  configSchema,
  recurringTransactionSchema,
  transactionSchema,
} from "./validators";

export type Transaction = z.infer<typeof transactionSchema>;
export type Category = z.infer<typeof categorySchema>;

export enum RecurringTransactionRepeatInterval {
  MONTH = "month",
}

export type RecurringTransaction = z.infer<typeof recurringTransactionSchema>;

export type Config = z.infer<typeof configSchema>;
