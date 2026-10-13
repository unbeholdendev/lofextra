import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, createContext, useEffect, useState } from "react";
import type { SQLocal } from "sqlocal";
import { baseCreate } from "../db/baseCreate";
import { baseSeed } from "../db/baseSeed";
import { sqlocal } from "../db/sqlocal";
import type { GenerateDatabaseMutation } from "../types";
import { AccountProvider } from "./AccountContext";
import { WebsocketProvider } from "./WebsocketContext";

const LofikContext = createContext({});

type Props = {
  children: ReactNode;
  loader?: ReactNode;
  databaseInit?: string[];
  runMigrations?: (sqlocal: SQLocal) => Promise<void>;
  onInitialRemoteUpdatesReceived?: (
    sqlocal: SQLocal,
    { pubKeyHex, deviceId }: { pubKeyHex: string; deviceId: string }
  ) => Promise<{
    mutations: GenerateDatabaseMutation[];
    onSuccess?: () => void;
  }>;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnReconnect: false, refetchOnWindowFocus: false },
  },
});

function isWebAssemblySupported() {
  return (
    typeof WebAssembly === "object" &&
    typeof WebAssembly.instantiate === "function"
  );
}

export const LofikProvider = ({
  children,
  loader,
  databaseInit,
  runMigrations,
  onInitialRemoteUpdatesReceived,
}: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const prepareDatabase = async () => {
      await baseCreate();
      await baseSeed();

      if (databaseInit) {
        for (const sql of databaseInit) {
          await sqlocal.sql(sql);
        }
      }

      await runMigrations?.(sqlocal);

      setIsLoading(false);
    };

    prepareDatabase();
  }, [databaseInit, runMigrations]);

  if (!isWebAssemblySupported()) {
    return <div>Your browser does not support WebAssembly.</div>;
  }

  if (isLoading) {
    return loader || null;
  }

  return (
    <LofikContext.Provider value={{}}>
      <QueryClientProvider client={queryClient}>
        <AccountProvider loader={loader}>
          <WebsocketProvider
            onInitialRemoteUpdatesReceived={onInitialRemoteUpdatesReceived}
          >
            {children}
          </WebsocketProvider>
        </AccountProvider>
      </QueryClientProvider>
    </LofikContext.Provider>
  );
};
