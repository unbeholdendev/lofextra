import { z } from "zod";

export const messageSchema = z.object({
  pubKeyHex: z.string(),
  payload: z.string(),
  nonce: z.string(),
  deviceId: z.string(),
  ts: z.number(),
});

export const messagesSchema = z.array(messageSchema);
