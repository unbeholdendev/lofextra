import { handleRemoteDatabaseMutation } from "@/db/db";
import {
  useAccountContext,
  useDatabaseContext,
  useHlcContext,
  useQueryCacheContext,
} from "@/hooks/contexts";
import { usePushPendingUpdates } from "@/hooks/usePushPendingUpdates";
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
  const { setCacheRefetchDate } = useQueryCacheContext();
  const { exec } = useDatabaseContext();
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
  }, [pubKeyHex, exec, deviceId, pushPendingUpdates]);

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
          exec,
          hlc: messageHlc,
          mutation: validatedData,
        });

        setHlc(recv(hlc, messageHlc, getUnixTimestamp()));
      }

      ack();

      setCacheRefetchDate(new Date());
    };

    socket.on("messages", onMessages);

    return () => {
      socket.off("messages", onMessages);
    };
  }, [exec, hlc, setHlc, privKey, setCacheRefetchDate, deviceId]);

  return (
    <WebsocketContext.Provider value={{}}>{children}</WebsocketContext.Provider>
  );
};
