import { bytesToHex } from "@noble/hashes/utils.js";
import { entropyToMnemonic } from "@scure/bip39";
import { wordlist as english } from "@scure/bip39/wordlists/english.js";
import { type ReactNode, createContext, useMemo } from "react";
import { useLofikQuery } from "../hooks/useLofikQuery";
import { QueryKeys } from "../queries";
import { accountsSchema } from "../validators/accounts";
import { devicesSchema } from "../validators/device";

type AccountContext = {
  privKey: Uint8Array;
  pubKeyHex: string;
  deviceId: string;
  currentMnemonic: string;
};

export const AccountContext = createContext({} as AccountContext);

type Props = {
  children: ReactNode;
  loader?: ReactNode;
};

export const AccountProvider = ({ children, loader }: Props) => {
  const { data: accountsData } = useLofikQuery({
    sql: "SELECT * FROM accounts ORDER BY id DESC LIMIT 1",
    schema: accountsSchema,
    queryKey: [QueryKeys.GET_ACCOUNT],
  });

  const { data: deviceData } = useLofikQuery({
    sql: "SELECT * FROM device",
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

  const currentMnemonic = useMemo(
    () => (keyPair ? entropyToMnemonic(keyPair.privKey, english) : undefined),
    [keyPair]
  );

  const deviceId = useMemo(() => deviceData?.[0].id, [deviceData]);

  const contextValue = useMemo(
    () => ({
      ...keyPair,
      deviceId,
      currentMnemonic,
    }),
    [keyPair, deviceId, currentMnemonic]
  );

  return (
    <AccountContext.Provider value={contextValue as AccountContext}>
      {!keyPair || !deviceId ? loader || null : children}
    </AccountContext.Provider>
  );
};
