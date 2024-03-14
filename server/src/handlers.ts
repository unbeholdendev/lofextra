import { Message } from '@prisma/client'
import { socketConnectionsMap } from './connections'
import { deserialize } from './hlc'
import { syncMessages } from './lib'
import { prisma } from './prisma'
import { messagesSchema } from './validators'

export const registerOnMessagesHandler =
  (pubKeyHex: string, socketId: string) =>
  async (messages: unknown, ack: () => void) => {
    const createdMessages: Message[] = []

    console.log(
      // @ts-ignore
      `received ${messages.length} from ${deserialize(messages[0].hlc).deviceId}`,
    )

    for (const message of messagesSchema.parse(messages)) {
      const { pubKeyHex, payload, nonce, hlc } = message

      const newMessage = await prisma.message.create({
        data: {
          payload,
          pubKeyHex,
          nonce,
          deviceId: deserialize(hlc).deviceId,
          hlc,
          ackedDeviceIds: '',
        },
      })

      createdMessages.push(newMessage)
    }

    ack()

    const socketConnectionsToSync = socketConnectionsMap
      .get(pubKeyHex)
      ?.filter(connection => connection.socketId !== socketId)

    if (!socketConnectionsToSync?.length) {
      return
    }

    for (const socketConnectionToSync of socketConnectionsToSync) {
      await syncMessages({
        messagesToSync: createdMessages,
        socketConnection: socketConnectionToSync,
      })
    }
  }
