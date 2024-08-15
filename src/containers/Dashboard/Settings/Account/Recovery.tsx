import { useDatabaseActions } from "@lofik/react";
import { type ChangeEvent, useRef } from "react";
import { useFullServerSync } from "../../../../hooks/useFullServerSync";
import styles from "../styles.module.css";

export const Recovery = () => {
  const { exportDatabase, importDatabase } = useDatabaseActions();
  const { handleFullServerSync, isLoading } = useFullServerSync();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDatabaseImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return alert("Failed to upload file");
    }

    await importDatabase(file);

    location.reload();
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
      <button onClick={handleFullServerSync} disabled={isLoading}>
        sync
      </button>
    </div>
  );
};
