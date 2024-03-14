import { Message } from '@prisma/client'
import { cmp, deserialize } from './hlc'
import { io } from './io'
import { prisma } from './prisma'
import { SocketConnection } from './types'

type MessagesToSyncParams = {
  messagesToSync: Message[]
  socketConnection: SocketConnection
}

export const syncMessages = async ({
  messagesToSync,
  socketConnection: { deviceId, socketId },
}: MessagesToSyncParams) => {
  if (!messagesToSync.length) {
    return
  }

  const sortedMessages = messagesToSync.sort((a, b) =>
    cmp(deserialize(a.hlc), deserialize(b.hlc)),
  )

  try {
    await io.to(socketId).timeout(3000).emitWithAck('messages', sortedMessages)

    console.log(`pushing ${messagesToSync.length} to ${deviceId}`)

    for (const message of sortedMessages) {
      const ackedDeviceIds = message.ackedDeviceIds.split(',')

      await prisma.message.update({
        where: { id: message.id },
        data: {
          ackedDeviceIds: [...ackedDeviceIds, deviceId]
            .filter(Boolean)
            .join(','),
        },
      })
    }
  } catch (err) {
    console.error(err)
  }
}
