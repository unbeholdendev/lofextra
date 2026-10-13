import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { bytesToUtf8, hexToBytes } from "@noble/ciphers/utils.js";
import { schnorr } from "@noble/curves/secp256k1.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";
import { type ReactNode, createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { SQLocal } from "sqlocal";
import { sqlocal } from "../db/sqlocal";
import { useAccountContext } from "../hooks/contexts";
import { useLofikMutation } from "../hooks/useLofikMutation";
import { useLofikQueryClient } from "../hooks/useLofikQueryClient";
import type { GenerateDatabaseMutation } from "../types";
import { handleRemoteDatabaseMutation, pushPendingUpdates } from "../utils/db";
import { generateDatabaseMutationSchema } from "../validators/db";
import { messagesSchema } from "../validators/messages";

type WebsocketContext = {
  socket?: ReturnType<typeof io>;
};

export const WebsocketContext = createContext({} as WebsocketContext);

type Props = {
  children: ReactNode;
  onInitialRemoteUpdatesReceived?: (
    sqlocal: SQLocal,
    { pubKeyHex, deviceId }: { pubKeyHex: string; deviceId: string }
  ) => Promise<{
    mutations: GenerateDatabaseMutation[];
    onSuccess?: () => void;
  }>;
};

export const WebsocketProvider = ({
  children,
  onInitialRemoteUpdatesReceived,
}: Props) => {
  const [socket] = useState(() => io({ autoConnect: false }));
  const { privKey, pubKeyHex, deviceId } = useAccountContext();
  const queryClient = useLofikQueryClient();
  const [initialRemoteUpdatesReceived, setInitialRemoteUpdatesReceived] =
    useState(false);

  const { mutateAsync } = useLofikMutation({ shouldSync: true, socket });

  useEffect(() => {
    const onConnect = () => pushPendingUpdates(socket);
    socket.on("connect", onConnect);

    if (socket.connected) {
      socket.disconnect();
    }

    socket.auth = (cb) => {
      const ts = Date.now();
      const sig = schnorr.sign(utf8ToBytes(`${deviceId}:${ts}`), sha256(privKey));
      cb({ pubKeyHex, deviceId, ts, sig: bytesToHex(sig) });
    };

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
    };
  }, [privKey, pubKeyHex, deviceId, socket]);

  useEffect(() => {
    const onMessages = async (messages: unknown, ack: () => void) => {
      for (const message of messagesSchema.parse(messages)) {
        if (message.deviceId === deviceId) {
          continue;
        }

        const chacha = xchacha20poly1305(
          sha256(privKey),
          hexToBytes(message.nonce)
        );

        const decryptedData = chacha.decrypt(hexToBytes(message.payload));

        const data = JSON.parse(bytesToUtf8(decryptedData));

        const validatedData = generateDatabaseMutationSchema.parse(data);

        await handleRemoteDatabaseMutation({
          ts: message.ts,
          mutation: validatedData,
        });
      }

      ack();

      await queryClient.invalidateQueries();

      setInitialRemoteUpdatesReceived(true);
    };

    socket.on("messages", onMessages);

    return () => {
      socket.off("messages", onMessages);
    };
  }, [privKey, deviceId, queryClient, socket]);

  useEffect(() => {
    if (initialRemoteUpdatesReceived) {
      onInitialRemoteUpdatesReceived?.(sqlocal, { pubKeyHex, deviceId }).then(
        ({ mutations, onSuccess }) => {
          if (!mutations.length) {
            return;
          }

          mutateAsync(mutations).then(() => {
            onSuccess?.();
          });
        }
      );
    }
  }, [
    initialRemoteUpdatesReceived,
    onInitialRemoteUpdatesReceived,
    pubKeyHex,
    deviceId,
    mutateAsync,
  ]);

  return (
    <WebsocketContext.Provider value={{ socket } as WebsocketContext}>
      {children}
    </WebsocketContext.Provider>
  );
};
