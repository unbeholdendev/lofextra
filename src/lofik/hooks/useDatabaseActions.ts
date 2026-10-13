import { useCallback, useMemo } from "react";
import { sqlocal } from "../db/sqlocal";

export const useDatabaseActions = () => {
  const exportDatabase = useCallback(async (fileName: string) => {
    const file = await sqlocal.getDatabaseFile();

    const fileUrl = URL.createObjectURL(file);

    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    a.click();
    a.remove();

    URL.revokeObjectURL(fileUrl);
  }, []);

  const importDatabase = useCallback(
    async (file: File) => {
      await sqlocal.overwriteDatabaseFile(file);

      await sqlocal.sql("DELETE FROM device");

      await sqlocal.sql(
        `INSERT INTO device (id, createdAt) VALUES ('${crypto.randomUUID()}', strftime('%s', 'now')*1000)`
      );
    },
    []
  );

  return useMemo(
    () => ({
      exportDatabase,
      importDatabase,
    }),
    [exportDatabase, importDatabase]
  );
};
