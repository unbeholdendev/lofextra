import { type TypeOf } from "zod";
import { categorySchema, transactionSchema } from "./validators";

export type Transaction = TypeOf<typeof transactionSchema>;
export type Category = TypeOf<typeof categorySchema>;
