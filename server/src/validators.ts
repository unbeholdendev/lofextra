import { z } from 'zod'

const pubKey = z.string().brand<'PubKey'>()

export type PubKey = z.infer<typeof pubKey>

export const messageSchema = z.object({
  pubKeyHex: pubKey,
  payload: z.string(),
  nonce: z.string(),
  hlc: z.string(),
})

export const messagesSchema = z.array(messageSchema)
