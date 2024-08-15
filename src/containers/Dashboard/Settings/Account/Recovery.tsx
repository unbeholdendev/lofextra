import {
  DatabaseMutationOperation,
  type GenerateDatabaseMutation,
  sqlocal,
  useDatabaseActions,
  useLofikAccount,
  useLofikMutation,
} from "@lofik/react";
import { type ChangeEvent, useRef, useState } from "react";
import { getUnixTimestamp } from "../../../../utils/dates";
import { TableNames } from "../../constants";
import styles from "../styles.module.css";

export const Recovery = () => {
  const [isServerSyncing, setIsServerSyncing] = useState(false);
  const { pubKeyHex } = useLofikAccount();
  const { exportDatabase, importDatabase } = useDatabaseActions();

  const { mutateAsync } = useLofikMutation({
    shouldSync: true,
    isFullSync: true,
    onSuccess: () => {
      setIsServerSyncing(false);
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDatabaseImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return alert("Failed to upload file");
    }

    await importDatabase(file);
  };

  const handleServerSync = async () => {
    setIsServerSyncing(true);

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
      ...categoriesMutations,
      ...recurringTransactionsMutations,
      ...transactionsMutations,
    ];

    await mutateAsync(mutations);
  };

  return (
    <div>
      <p>download all your data in a single database file</p>
      <button onClick={() => exportDatabase("lofextra.sqlite3")}>export</button>

      <p className={styles["margin-top"]}>import a database</p>
      <button onClick={() => fileInputRef.current?.click()}>import</button>
      <input
        type="file"
        ref={fileInputRef}
        accept=".sqlite3"
        style={{ display: "none" }}
        onChange={handleDatabaseImport}
      />

      <p className={styles["margin-top"]}>
        full sync with the server (pushes all current transactions and
        categories)
      </p>
      <button onClick={handleServerSync} disabled={isServerSyncing}>
        sync
      </button>
    </div>
  );
};
