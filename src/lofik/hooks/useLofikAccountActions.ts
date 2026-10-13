import { useCallback, useMemo } from "react";
import { QueryKeys } from "../queries";
import { DatabaseMutationOperation } from "../types";
import {
  generateNewAccountKeyPair,
  getAccountKeyPairFromMnemonic,
} from "../utils/account";
import { getUnixTimestamp } from "../utils/dates";
import { useLofikMutation } from "./useLofikMutation";
import { useLofikQueryClient } from "./useLofikQueryClient";

export const useLofikAccountActions = () => {
  const queryClient = useLofikQueryClient();

  const { mutateAsync } = useLofikMutation({
    shouldSync: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_ACCOUNT] });
    },
  });

  const generateNewAccount = useCallback(async () => {
    const { privKey, pubKey } = generateNewAccountKeyPair();

    await mutateAsync({
      operation: DatabaseMutationOperation.Upsert,
      tableName: "accounts",
      columnDataMap: { privKey, pubKey, createdAt: getUnixTimestamp() },
    });
  }, [mutateAsync]);

  const setAccountFromMnemonic = useCallback(
    async (mnemonic: string) => {
      const keys = getAccountKeyPairFromMnemonic(mnemonic);

      if (!keys) {
        return;
      }

      const { privKey, pubKey } = keys;

      await mutateAsync({
        operation: DatabaseMutationOperation.Upsert,
        tableName: "accounts",
        columnDataMap: { privKey, pubKey, createdAt: getUnixTimestamp() },
      });
    },
    [mutateAsync]
  );

  return useMemo(
    () => ({
      generateNewAccount,
      setAccountFromMnemonic,
    }),
    [generateNewAccount, setAccountFromMnemonic]
  );
};
