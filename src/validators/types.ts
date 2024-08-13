import { type TypeOf } from "zod";
import {
  categorySchema,
  recurringTransactionSchema,
  transactionSchema,
} from "./validators";

export type Transaction = TypeOf<typeof transactionSchema>;
export type Category = TypeOf<typeof categorySchema>;

export enum RecurringTransactionRepeatInterval {
  MONTH = "month",
}

export type RecurringTransaction = TypeOf<typeof recurringTransactionSchema>;
