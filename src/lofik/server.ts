import { schnorr } from "@noble/curves/secp256k1.js";
import { hexToBytes, utf8ToBytes } from "@noble/hashes/utils.js";
import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import type { Server as HttpServer } from "node:http";
import { dirname } from "node:path";
import { Server } from "socket.io";
import { messagesSchema } from "./validators/messages";

type Message = { id: number; deviceId: string };
type Connection = { socketId: string; deviceId: string };

const authorised = ({ pubKeyHex, deviceId, ts, sig }: Record<string, unknown>) => {
  if (typeof pubKeyHex !== "string" || typeof deviceId !== "string") return false;
  if (typeof ts !== "number" || typeof sig !== "string") return false;
  if (Math.abs(Date.now() - ts) > 5 * 60_000) return false;
  try {
    return schnorr.verify(hexToBytes(sig), utf8ToBytes(`${deviceId}:${ts}`), hexToBytes(pubKeyHex));
  } catch {
    return false;
  }
};

export const attachSyncServer = (httpServer: HttpServer) => {
  const path = process.env.DATABASE_PATH ?? "data/sync.db";
  mkdirSync(dirname(path), { recursive: true });

  const db = new Database(path);
  // Anyone can mint a key and store messages, so cap the file at 1 GB.
  db.run("PRAGMA max_page_count = 262144");
  db.run(
    "CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, pubKeyHex TEXT NOT NULL, payload TEXT NOT NULL, nonce TEXT NOT NULL, deviceId TEXT NOT NULL, ackedDeviceIds TEXT NOT NULL DEFAULT '', ts INTEGER NOT NULL)"
  );

  const insert = db.query<Message, [string, string, string, string, number]>(
    "INSERT INTO messages (pubKeyHex, payload, nonce, deviceId, ts) VALUES (?, ?, ?, ?, ?) RETURNING *"
  );
  const unacked = db.query<Message, [string, string, string]>(
    "SELECT * FROM messages WHERE pubKeyHex = ? AND deviceId <> ? AND instr(ackedDeviceIds, ?) = 0 ORDER BY id"
  );
  const ack = db.query<null, [string, number]>(
    "UPDATE messages SET ackedDeviceIds = ackedDeviceIds || ? || ',' WHERE id = ?"
  );

  // By default engine.io closes every other websocket upgrade, which kills Vite HMR in dev.
  // Full sync sends the whole history in one message; the 1 MB default holds about 2,000 transactions.
  const io = new Server(httpServer, { destroyUpgrade: false, maxHttpBufferSize: 1e7 });
  const connections = new Map<string, Connection[]>();

  const push = async (messages: Message[], { socketId, deviceId }: Connection) => {
    try {
      await io.to(socketId).timeout(10000).emitWithAck("messages", messages);
      for (const { id } of messages) ack.run(deviceId, id);
    } catch (err) {
      console.error(err);
    }
  };

  const receive =
    (pubKeyHex: string, socketId: string, fullSync: boolean) =>
    async (raw: unknown, done: () => void) => {
      const parsed = messagesSchema.safeParse(raw);
      if (!parsed.success) return;

      let created: Message[];
      try {
        created = db.transaction(() => {
          if (fullSync) db.run("DELETE FROM messages WHERE pubKeyHex = ?", [pubKeyHex]);
          return parsed.data.map((m) => insert.get(pubKeyHex, m.payload, m.nonce, m.deviceId, m.ts)!);
        })();
      } catch (err) {
        console.error(err);
        return;
      }
      done();

      for (const connection of connections.get(pubKeyHex) ?? []) {
        if (connection.socketId !== socketId) await push(created, connection);
      }
    };

  io.on("connection", (socket) => {
    const { pubKeyHex, deviceId } = socket.handshake.auth;
    if (!authorised(socket.handshake.auth)) return socket.disconnect();

    const connection = { socketId: socket.id, deviceId };
    connections.set(pubKeyHex, [...(connections.get(pubKeyHex) ?? []), connection]);

    socket.on("messages", receive(pubKeyHex, socket.id, false));
    socket.on("messages-full-sync", receive(pubKeyHex, socket.id, true));
    socket.on("disconnect", () => {
      const remaining = connections.get(pubKeyHex)!.filter((c) => c !== connection);
      if (remaining.length) connections.set(pubKeyHex, remaining);
      else connections.delete(pubKeyHex);
    });

    push(unacked.all(pubKeyHex, deviceId, deviceId), connection);
  });
};
