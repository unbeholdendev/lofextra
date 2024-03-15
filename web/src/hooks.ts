import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import { randomBytes } from "@noble/ciphers/crypto";
import { bytesToHex, utf8ToBytes } from "@noble/ciphers/utils";
import { sha256 } from "@noble/hashes/sha256";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TypeOf, ZodSchema, optional, z } from "zod";
import { AccountContext } from "./contexts/AccountContext";
import { DatabaseContext } from "./contexts/DatabaseContext";
import { HLC, HlcContext } from "./contexts/HlcContext";
import { QueryCacheContext } from "./contexts/QueryCacheContext";
import { utils } from "./db";
import { socket } from "./io";
import { inc, serialize } from "./utils/hlc";
import {
  DatabaseMutationOperation,
  GenerateDatabaseMutation,
  Message,
} from "./validators/types";

export const useDatabaseContext = () => {
  const ctx = useContext(DatabaseContext);

  if (!ctx) {
    throw new Error("Not inside DatabaseContext!");
  }

  return ctx;
};

export const useAccountContext = () => {
  const ctx = useContext(AccountContext);

  if (!ctx) {
    throw new Error("Not inside AccountContext!");
  }

  return ctx;
};

export const useQueryCacheContext = () => {
  const ctx = useContext(QueryCacheContext);

  if (!ctx) {
    throw new Error("Not inside QueryCacheContext!");
  }

  return ctx;
};

export const useHlcContext = () => {
  const ctx = useContext(HlcContext);

  if (!ctx) {
    throw new Error("Not inside HlcContext!");
  }

  return ctx;
};

// type UseQueryReturnType<> = {
//   data: T[] | undefined;
//   isLoading: boolean | undefined;
//   refetch: () => void;
// };

type QueryOptions = {
  refetchOnRemoteUpdate?: boolean;
};

export const useQuery = <T extends ZodSchema>(
  query: string,
  schema: T,
  options?: QueryOptions
): {
  data: TypeOf<T> | undefined;
  isLoading: boolean;
  refetch: () => Promise<void>;
} => {
  const { exec } = useDatabaseContext();
  const { cache, setCache, cacheRefetchDate } = useQueryCacheContext();

  const { data, isLoading } = useMemo(
    () =>
      cache[query] ?? {
        data: undefined,
        isLoading: false,
      },
    [cache, query]
  );

  const fetch = useCallback(async () => {
    setCache((prev) => ({
      ...prev,
      [query]: { ...prev[query], isLoading: true },
    }));

    const res = await exec(query);

    setCache((prev) => ({
      ...prev,
      [query]: { data: res, isLoading: false },
    }));
  }, [exec, query, setCache]);

  useEffect(() => {
    if (!cache[query] || options?.refetchOnRemoteUpdate) {
      fetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetch, cacheRefetchDate, options?.refetchOnRemoteUpdate, query]);

  const validatedData = useMemo(
    () => optional(schema).parse(data),
    [data, schema]
  );

  return useMemo(
    () => ({
      data: validatedData,
      isLoading,
      refetch: fetch,
    }),
    [validatedData, fetch, isLoading]
  );
};

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

      console.log(message);

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

export const usePushPendingUpdates = () => {
  const { exec } = useDatabaseContext();

  return useCallback(async () => {
    const pendingUpdates = await exec(
      "select * from pendingUpdates order by id"
    );

    if (!pendingUpdates.length) {
      return;
    }

    try {
      await socket.timeout(3000).emitWithAck(
        "messages",
        pendingUpdates.map((update) =>
          JSON.parse(z.string().parse(update.message))
        )
      );

      for (const update of pendingUpdates) {
        await exec(`delete from pendingUpdates where id = ${update.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  }, [exec]);
};
