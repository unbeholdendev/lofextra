import styles from "@/app/dashboard/styles.module.css";
import { SelectRow, initDatabase, utils } from "@/db";
import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

type DatabaseContext = {
  exec: <T extends Record<string, unknown>>(sql: string) => Promise<T[]>;
};

export const DatabaseContext = createContext({} as DatabaseContext);

type Props = {
  children: ReactNode;
};

export const DatabaseProvider = ({ children }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [{ promiser }, setPromiser] = useState({
    promiser: (..._args: unknown[]) => new Promise(() => {}),
  });

  useEffect(() => {
    // @ts-ignore
    import("@sqlite.org/sqlite-wasm").then(({ sqlite3Worker1Promiser }) => {
      initDatabase(sqlite3Worker1Promiser).then((_promiser) => {
        setPromiser({ promiser: _promiser });
        setIsLoading(false);
      });
    });
  }, []);

  const exec = useCallback(
    async <T extends Record<string, unknown>>(sql: string) => {
      const result: T[] = [];

      await promiser("exec", {
        sql,
        callback: (res: SelectRow) => utils.mergeSelect<T>(res, result),
      });

      return result;
    },
    [promiser]
  );

  return (
    <DatabaseContext.Provider value={{ exec }}>
      <main className={styles.main}>{isLoading ? "loading..." : children}</main>
    </DatabaseContext.Provider>
  );
};
