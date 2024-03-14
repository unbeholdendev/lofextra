import { z } from 'zod'

export const messageSchema = z.object({
  pubKeyHex: z.string(),
  payload: z.string(),
  nonce: z.string(),
  hlc: z.string(),
})

export const messagesSchema = z.array(messageSchema)
