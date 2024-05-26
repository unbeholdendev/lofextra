import { useLofiQuery } from "@/hooks/useLofiQuery";
import { QueryKeys } from "@/queries";
import { accountsSchema, devicesSchema } from "@/validators/validators";
import { bytesToHex } from "@noble/hashes/utils";
import { ReactNode, createContext, useMemo } from "react";

type AccountContext = {
  privKey: Uint8Array;
  pubKeyHex: string;
  deviceId: string;
};

export const AccountContext = createContext({} as AccountContext);

type Props = {
  children: ReactNode;
};

export const AccountProvider = ({ children }: Props) => {
  const { data: accountsData } = useLofiQuery({
    sql: "select * from accounts order by id desc limit 1",
    schema: accountsSchema,
    queryKey: [QueryKeys.GET_ACCOUNT],
  });

  const { data: deviceData } = useLofiQuery({
    sql: "select * from device",
    schema: devicesSchema,
    queryKey: [QueryKeys.GET_DEVICE],
  });

  const keyPair = useMemo(
    () =>
      accountsData?.[0]
        ? {
            privKey: new Uint8Array(
              accountsData[0].privKey.split(",").map(Number)
            ),
            pubKeyHex: bytesToHex(
              new Uint8Array(accountsData[0].pubKey.split(",").map(Number))
            ),
          }
        : undefined,
    [accountsData]
  );

  const deviceId = useMemo(() => deviceData?.[0].id, [deviceData]);

  if (!keyPair || !deviceId) {
    return <div aria-busy="true" />;
  }

  return (
    <AccountContext.Provider value={{ ...keyPair, deviceId }}>
      {children}
    </AccountContext.Provider>
  );
};
