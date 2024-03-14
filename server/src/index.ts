import { Socket } from 'socket.io'
import { socketConnectionsMap } from './connections'
import { registerOnMessagesHandler } from './handlers'
import { httpServer } from './http'
import { io } from './io'
import { syncMessages } from './lib'
import { prisma } from './prisma'

httpServer.listen(8080)

io.on('connection', async (socket: Socket) => {
  const { pubKeyHex, deviceId } = socket.handshake.auth

  if (!pubKeyHex || !deviceId) {
    return socket.disconnect()
  }

  const socketId = socket.id

  socket.on('messages', registerOnMessagesHandler(pubKeyHex, socketId))

  const pubKeyConnections = socketConnectionsMap.get(pubKeyHex)

  socketConnectionsMap.set(
    pubKeyHex,
    pubKeyConnections?.length
      ? [...pubKeyConnections, { socketId, deviceId }]
      : [{ socketId, deviceId }],
  )

  console.log(socketConnectionsMap)

  const messagesToSync = await prisma.message.findMany({
    where: {
      NOT: [
        { deviceId }, // the message is NOT from my device
        { ackedDeviceIds: { contains: deviceId } }, // I haven't acked this message yet
      ],
      pubKeyHex,
    },
  })

  await syncMessages({
    messagesToSync,
    socketConnection: { deviceId, socketId },
  })

  socket.on('disconnect', () => {
    const pubKeyHex = socket.handshake.auth.pubKeyHex

    const remainingConnections = (
      socketConnectionsMap.get(pubKeyHex) ?? []
    ).filter(connection => connection.socketId !== socket.id)

    remainingConnections.length
      ? socketConnectionsMap.set(pubKeyHex, remainingConnections)
      : socketConnectionsMap.delete(pubKeyHex)
  })
})
