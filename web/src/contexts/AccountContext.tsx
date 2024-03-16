import { useQuery } from "@/hooks/useQuery";
import { accountsSchema, devicesSchema } from "@/validators/validators";
import { bytesToHex } from "@noble/hashes/utils";
import { ReactNode, createContext, useMemo } from "react";

type AccountContext = {
  privKey: Uint8Array;
  pubKeyHex: string;
  deviceId: string;
  refetchKeyPair: () => void;
};

export const AccountContext = createContext({} as AccountContext);

type Props = {
  children: ReactNode;
};

export const AccountProvider = ({ children }: Props) => {
  const { data, refetch } = useQuery(
    "select * from accounts order by id desc limit 1",
    accountsSchema
  );

  const { data: deviceData } = useQuery("select * from device", devicesSchema);

  const keyPair = useMemo(
    () =>
      data?.[0]
        ? {
            privKey: new Uint8Array(data[0].privKey.split(",").map(Number)),
            pubKeyHex: bytesToHex(
              new Uint8Array(data[0].pubKey.split(",").map(Number))
            ),
          }
        : undefined,
    [data]
  );

  const deviceId = useMemo(() => deviceData?.[0].id, [deviceData]);

  if (!keyPair || !deviceId) {
    return <>authenticating..</>;
  }

  return (
    <AccountContext.Provider
      value={{ ...keyPair, refetchKeyPair: refetch, deviceId }}
    >
      {children}
    </AccountContext.Provider>
  );
};
