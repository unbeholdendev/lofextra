import { useLofikDatabase } from "@lofik/react";
import { ChangeEvent, useRef } from "react";
import styles from "./styles.module.css";

export const Recovery = () => {
  const { exportDatabase, importDatabase } = useLofikDatabase();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDatabaseImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return alert("Failed to upload file");
    }

    await importDatabase(await file.arrayBuffer());
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
    </div>
  );
};
