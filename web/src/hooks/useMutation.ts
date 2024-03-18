import { HLC } from "@/contexts/HlcContext";
import { utils } from "@/db";
import { socket } from "@/io";
import { inc, serialize } from "@/utils/hlc";
import {
  DatabaseMutationOperation,
  GenerateDatabaseMutation,
  Message,
} from "@/validators/types";
import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import { bytesToHex, utf8ToBytes } from "@noble/ciphers/utils";
import { sha256 } from "@noble/hashes/sha256";
import { randomBytes } from "crypto";
import { useCallback, useMemo, useState } from "react";
import {
  useAccountContext,
  useDatabaseContext,
  useHlcContext,
} from "./contexts";

type MutationOptions = {
  onSettled: () => void;
  shouldSync?: boolean;
};

export const useMutation = (options?: MutationOptions) => {
  const { exec } = useDatabaseContext();
  const [isLoading, setIsLoading] = useState(false);
  const { hlc, setHlc } = useHlcContext();
  const { sync } = useServerSync();

  const shouldSync = options?.shouldSync ?? true;

  const mutate = useCallback(
    async (mutation: GenerateDatabaseMutation) => {
      setIsLoading(true);

      const updatedHlc = inc(hlc, Date.now());

      setHlc(updatedHlc);

      const sql =
        mutation.operation === DatabaseMutationOperation.Upsert
          ? utils.generateUpsert(mutation, updatedHlc)
          : utils.generateDelete(mutation, updatedHlc);

      await exec(sql);

      setIsLoading(false);
      options?.onSettled();

      if (shouldSync) {
        sync(mutation, updatedHlc);
      }
    },
    [shouldSync, exec, options, sync, hlc, setHlc]
  );

  return useMemo(
    () => ({
      mutate,
      isLoading,
    }),
    [mutate, isLoading]
  );
};

const useServerSync = () => {
  const { privKey, pubKeyHex } = useAccountContext();
  const { exec } = useDatabaseContext();

  const sync = useCallback(
    async (mutation: GenerateDatabaseMutation, hlc: HLC) => {
      const nonce = randomBytes(24);

      const chacha = xchacha20poly1305(sha256(privKey), nonce);

      const encryptedMutation = chacha.encrypt(
        utf8ToBytes(JSON.stringify(mutation))
      );

      const message: Message = {
        pubKeyHex,
        payload: bytesToHex(encryptedMutation),
        nonce: bytesToHex(nonce),
        hlc: serialize(hlc),
      };

      try {
        await socket.timeout(3000).emitWithAck("messages", [message]);
      } catch (err) {
        console.error(err);

        await exec(
          utils.generateUpsert(
            {
              operation: DatabaseMutationOperation.Upsert,
              tableName: "pendingUpdates",
              columnDataMap: {
                message: JSON.stringify(message),
                createdAt: Date.now(),
              },
            },
            hlc
          )
        );
      }
    },
    [privKey, pubKeyHex, exec]
  );

  return useMemo(() => ({ sync }), [sync]);
};
