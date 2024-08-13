import {
  DatabaseMutationOperation,
  queryClient,
  type GenerateDatabaseMutation,
  type SQLocal,
} from "@lofik/react";
import { QueryKeys } from "../../queries";
import { getUnixTimestamp } from "../../utils/dates";
import type { RecurringTransaction } from "../../validators/types";

export const handleRecurringTransactions = async (
  sqlocal: SQLocal,
  { pubKeyHex }: { pubKeyHex: string; deviceId: string }
): Promise<{
  mutations: GenerateDatabaseMutation[];
  onSuccess?: () => void;
}> => {
  const recurringTransactions: RecurringTransaction[] = await sqlocal.sql(
    `SELECT * FROM recurringTransactions WHERE pubKeyHex = '${pubKeyHex}' AND deletedAt IS NULL`
  );

  const mutations: GenerateDatabaseMutation[] = [];

  for (const recurringTransaction of recurringTransactions) {
    const { id, title, amount, categoryId, createdAt } = recurringTransaction;

    const recurringTransactionIndexData = await sqlocal.sql(
      `SELECT MAX(recurringTransactionIndex) AS maxRecurringTransactionIndex FROM transactions WHERE recurringTransactionId = '${id}'`
    );

    const maxRecurringTransactionIndex =
      recurringTransactionIndexData[0]?.maxRecurringTransactionIndex ?? 0;

    const now = getUnixTimestamp();
    const startsAt = new Date(new Date(createdAt).setHours(8, 0, 0, 0));

    let index = 0;

    let iterationTimestamp =
      startsAt.getDate() <= recurringTransaction.repeatDay
        ? new Date(startsAt).setDate(recurringTransaction.repeatDay)
        : new Date(
            new Date(startsAt).setDate(recurringTransaction.repeatDay)
          ).setMonth(startsAt.getMonth() + 1);

    while (iterationTimestamp < now) {
      index++;

      if (maxRecurringTransactionIndex < index) {
        mutations.push({
          operation: DatabaseMutationOperation.Upsert,
          tableName: "transactions",
          columnDataMap: {
            id: crypto.randomUUID(),
            title,
            amount,
            pubKeyHex,
            categoryId,
            createdAt: iterationTimestamp,
            recurringTransactionId: id,
            recurringTransactionIndex: index,
          },
        });
      }

      iterationTimestamp = new Date(iterationTimestamp).setMonth(
        startsAt.getMonth() + index
      );
    }
  }

  return {
    mutations,
    onSuccess: () => {
      for (const queryKey of Object.keys(QueryKeys)) {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      }
    },
  };
};
