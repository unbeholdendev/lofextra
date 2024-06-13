import { getUnixTimestamp } from "@/utils/dates";
import {
  useLofikAccount,
  useLofikDatabase,
  useLofikMutation,
} from "@lofik/react";
import {
  DatabaseMutationOperation,
  GenerateDatabaseMutation,
} from "@lofik/react/dist/types";
import { ChangeEvent, useRef, useState } from "react";
import styles from "./styles.module.css";

export const Recovery = () => {
  const [isServerSyncing, setIsServerSyncing] = useState(false);
  const { db, exportDatabase, importDatabase } = useLofikDatabase();
  const { pubKeyHex } = useLofikAccount();

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

    await importDatabase(await file.arrayBuffer());
  };

  const handleServerSync = async () => {
    setIsServerSyncing(true);

    const categories = await db.selectObjects(
      `select * from categories where pubKeyHex = '${pubKeyHex}' and deletedAt is null`
    );

    const categoriesMutations: GenerateDatabaseMutation[] = categories.map(
      (category) => ({
        operation: DatabaseMutationOperation.Upsert,
        tableName: "categories",
        columnDataMap: {
          ...category,
          updatedAt: getUnixTimestamp(),
        },
      })
    );

    const transactions = await db.selectObjects(
      `select * from transactions where pubKeyHex = '${pubKeyHex}' and deletedAt is null`
    );

    const transactionsMutations: GenerateDatabaseMutation[] = transactions.map(
      (transaction) => ({
        operation: DatabaseMutationOperation.Upsert,
        tableName: "transactions",
        columnDataMap: {
          ...transaction,
          updatedAt: getUnixTimestamp(),
        },
      })
    );

    const mutations = [...categoriesMutations, ...transactionsMutations];

    await mutateAsync(mutations);
  };

  return (
    <div>
      <h3>recovery</h3>
      <p>download all your data in a single database file</p>
      <button onClick={exportDatabase}>export</button>

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
