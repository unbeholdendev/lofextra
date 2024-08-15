import { useLofikAccount, useLofikQuery } from "@lofik/react";
import { type ReactNode, createContext, useContext, useMemo } from "react";
import { type Config } from "../../../validators/types";
import { configsSchema } from "../../../validators/validators";
import { QueryKeys } from "../constants";
import { ConfigModalForm } from "./ConfigModalForm";

export const ConfigContext = createContext({} as Config);

type Props = {
  children: ReactNode;
  loader: ReactNode;
};

export const ConfigProvider = ({ children, loader }: Props) => {
  const { pubKeyHex } = useLofikAccount();

  const { data: configData, isLoading } = useLofikQuery({
    sql: `SELECT * FROM configs WHERE pubKeyHex = '${pubKeyHex}' LIMIT 1`,
    schema: configsSchema,
    queryKey: [QueryKeys.GET_CONFIG, pubKeyHex],
  });

  const config = useMemo(() => configData?.[0], [configData]);

  if (isLoading) {
    return loader;
  }

  if (!config) {
    return <ConfigModalForm />;
  }

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

export const useConfigContext = () => useContext(ConfigContext);
