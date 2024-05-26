import { handleRemoteDatabaseMutation } from "@/db/utils";
import {
  useAccountContext,
  useDatabaseContext,
  useHlcContext,
} from "@/hooks/contexts";
import { usePushPendingUpdates } from "@/hooks/usePushPendingUpdates";
import { useRefetchQueries } from "@/hooks/useRefetchQueries";
import { getUnixTimestamp } from "@/utils/dates";
import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import { bytesToUtf8, hexToBytes } from "@noble/ciphers/utils";
import { sha256 } from "@noble/hashes/sha256";
import { ReactNode, createContext, useEffect } from "react";
import { socket } from "../io";
import { deserialize, recv } from "../utils/hlc";
import {
  generateDatabaseMutationSchema,
  messagesSchema,
} from "../validators/validators";

export const WebsocketContext = createContext({});

type Props = {
  children: ReactNode;
};

export const WebsocketProvider = ({ children }: Props) => {
  const { privKey, pubKeyHex, deviceId } = useAccountContext();
  const refetchQueries = useRefetchQueries();
  const { db } = useDatabaseContext();
  const { hlc, setHlc } = useHlcContext();
  const pushPendingUpdates = usePushPendingUpdates();

  useEffect(() => {
    socket.on("connect", pushPendingUpdates);

    if (socket.connected) {
      socket.disconnect();
    }

    socket.auth = { pubKeyHex, deviceId };

    socket.connect();

    return () => {
      socket.off("connect", pushPendingUpdates);
    };
  }, [pubKeyHex, db, deviceId, pushPendingUpdates]);

  useEffect(() => {
    const onMessages = async (messages: unknown, ack: () => void) => {
      for (const message of messagesSchema.parse(messages)) {
        const messageHlc = deserialize(message.hlc);

        if (messageHlc.deviceId === deviceId) {
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
          db,
          hlc: messageHlc,
          mutation: validatedData,
        });

        setHlc(recv(hlc, messageHlc, getUnixTimestamp()));
      }

      ack();

      refetchQueries();
    };

    socket.on("messages", onMessages);

    return () => {
      socket.off("messages", onMessages);
    };
  }, [db, hlc, setHlc, privKey, refetchQueries, deviceId]);

  return (
    <WebsocketContext.Provider value={{}}>{children}</WebsocketContext.Provider>
  );
};
