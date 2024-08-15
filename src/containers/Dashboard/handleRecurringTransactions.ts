import {
  DatabaseMutationOperation,
  type GenerateDatabaseMutation,
  type SQLocal,
} from "@lofik/react";
import { getAmountInCurrency } from "../../utils/currencies/currencies";
import { getUnixTimestamp } from "../../utils/dates";
import { refetchQueries } from "../../utils/refetchQueries";
import type { RecurringTransaction } from "../../validators/types";
import { TableNames } from "./constants";

export const handleRecurringTransactions = async (
  sqlocal: SQLocal,
  { pubKeyHex }: { pubKeyHex: string; deviceId: string }
): Promise<{
  mutations: GenerateDatabaseMutation[];
  onSuccess?: () => void;
}> => {
  const configs = await sqlocal.sql(
    `SELECT * FROM configs WHERE pubKeyHex = '${pubKeyHex}' LIMIT 1`
  );

  const baseCurrency = configs[0]?.baseCurrency;

  if (!baseCurrency) {
    return { mutations: [] };
  }

  const recurringTransactions: RecurringTransaction[] = await sqlocal.sql(
    `SELECT * FROM recurringTransactions WHERE pubKeyHex = '${pubKeyHex}' AND deletedAt IS NULL`
  );

  const mutations: GenerateDatabaseMutation[] = [];

  for (const recurringTransaction of recurringTransactions) {
    const { id, title, amount, categoryId, createdAt, currency } =
      recurringTransaction;

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
        const baseAmount = await getAmountInCurrency({
          amount,
          currency,
          createdAt: iterationTimestamp,
          baseCurrency,
        });

        if (!baseAmount) {
          continue;
        }

        mutations.push({
          operation: DatabaseMutationOperation.Upsert,
          tableName: TableNames.TRANSACTIONS,
          columnDataMap: {
            id: crypto.randomUUID(),
            title,
            amount,
            baseAmount,
            pubKeyHex,
            categoryId,
            currency,
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
    onSuccess: refetchQueries,
  };
};
