import {
  DatabaseMutationOperation,
  sqlocal,
  useLofikAccount,
  useLofikMutation,
  type GenerateDatabaseMutation,
} from "@lofik/react";
import { useState } from "react";
import { TableNames } from "../containers/Dashboard/constants";
import { getUnixTimestamp } from "../utils/dates";

export const useFullServerSync = () => {
  const { pubKeyHex } = useLofikAccount();
  const [isLoading, setIsLoading] = useState(false);

  const { mutate } = useLofikMutation({
    shouldSync: true,
    isFullSync: true,
    onSuccess: () => {
      setIsLoading(false);
    },
  });

  const handleFullServerSync = async () => {
    setIsLoading(true);

    const configs = await sqlocal.sql(
      `SELECT * FROM configs WHERE pubKeyHex = '${pubKeyHex}' AND deletedAt IS NULL`
    );

    const configsMutations: GenerateDatabaseMutation[] = configs.map(
      (config) => ({
        operation: DatabaseMutationOperation.Upsert,
        tableName: TableNames.CONFIGS,
        identifierColumn: "pubKeyHex",
        columnDataMap: {
          ...config,
          updatedAt: getUnixTimestamp(),
        },
      })
    );

    const categories = await sqlocal.sql(
      `SELECT * FROM categories WHERE pubKeyHex = '${pubKeyHex}' AND deletedAt IS NULL`
    );

    const categoriesMutations: GenerateDatabaseMutation[] = categories.map(
      (category) => ({
        operation: DatabaseMutationOperation.Upsert,
        tableName: TableNames.CATEGORIES,
        columnDataMap: {
          ...category,
          updatedAt: getUnixTimestamp(),
        },
      })
    );

    const recurringTransactions = await sqlocal.sql(
      `SELECT * FROM recurringTransactions WHERE pubKeyHex = '${pubKeyHex}' AND deletedAt IS NULL`
    );

    const recurringTransactionsMutations: GenerateDatabaseMutation[] =
      recurringTransactions.map((recurringTransaction) => ({
        operation: DatabaseMutationOperation.Upsert,
        tableName: TableNames.RECURRING_TRANSACTIONS,
        columnDataMap: {
          ...recurringTransaction,
          updatedAt: getUnixTimestamp(),
        },
      }));

    const transactions = await sqlocal.sql(
      `SELECT * FROM transactions WHERE pubKeyHex = '${pubKeyHex}' AND deletedAt IS NULL`
    );

    const transactionsMutations: GenerateDatabaseMutation[] = transactions.map(
      (transaction) => ({
        operation: DatabaseMutationOperation.Upsert,
        tableName: TableNames.TRANSACTIONS,
        columnDataMap: {
          ...transaction,
          updatedAt: getUnixTimestamp(),
        },
      })
    );

    const mutations = [
      ...configsMutations,
      ...categoriesMutations,
      ...recurringTransactionsMutations,
      ...transactionsMutations,
    ];

    !!mutations.length && mutate(mutations);
  };

  return { handleFullServerSync, isLoading };
};
