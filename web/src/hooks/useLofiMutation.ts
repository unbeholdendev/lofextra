import { HLC } from "@/contexts/HlcContext";
import { utils } from "@/db/utils";
import { socket } from "@/io";
import { getUnixTimestamp } from "@/utils/dates";
import { inc, serialize } from "@/utils/hlc";
import {
  DatabaseMutationOperation,
  GenerateDatabaseMutation,
  Message,
} from "@/validators/types";
import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils";
import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { randomBytes } from "crypto";
import { useCallback, useMemo } from "react";
import {
  useAccountContext,
  useDatabaseContext,
  useHlcContext,
} from "./contexts";

type Params = Omit<
  UseMutationOptions<unknown, Error, GenerateDatabaseMutation, unknown>,
  "mutationFn"
> & { shouldSync: boolean };

export const useLofiMutation = ({ shouldSync, ...options }: Params) => {
  const { db } = useDatabaseContext();
  const { hlc, setHlc } = useHlcContext();
  const { sync } = useServerSync();

  const mutate = useCallback(
    async (mutation: GenerateDatabaseMutation) => {
      const updatedHlc = inc(hlc, getUnixTimestamp());

      setHlc(updatedHlc);

      const sql =
        mutation.operation === DatabaseMutationOperation.Upsert
          ? utils.generateUpsert(mutation, updatedHlc)
          : utils.generateDelete(mutation, updatedHlc);

      // @ts-expect-error
      await db.exec(sql);

      if (shouldSync) {
        sync(mutation, updatedHlc);
      }
    },
    [db, hlc, setHlc, shouldSync, sync]
  );

  return useMutation({ ...options, mutationFn: mutate });
};

const useServerSync = () => {
  const { privKey, pubKeyHex } = useAccountContext();
  const { db } = useDatabaseContext();

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

        const sql = utils.generateUpsert(
          {
            operation: DatabaseMutationOperation.Upsert,
            tableName: "pendingUpdates",
            columnDataMap: {
              message: JSON.stringify(message),
              createdAt: getUnixTimestamp(),
            },
          },
          hlc
        );

        // @ts-expect-error
        await db.exec(sql);
      }
    },
    [privKey, pubKeyHex, db]
  );

  return useMemo(() => ({ sync }), [sync]);
};
