import { type TypeOf } from "zod";
import {
  categorySchema,
  configSchema,
  recurringTransactionSchema,
  transactionSchema,
} from "./validators";

export type Transaction = TypeOf<typeof transactionSchema>;
export type Category = TypeOf<typeof categorySchema>;

export enum RecurringTransactionRepeatInterval {
  MONTH = "month",
}

export type RecurringTransaction = TypeOf<typeof recurringTransactionSchema>;

export type Config = TypeOf<typeof configSchema>;
