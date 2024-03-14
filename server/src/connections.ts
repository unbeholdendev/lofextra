import { PubKey, SocketConnection } from './types'

export const socketConnectionsMap = new Map<PubKey, SocketConnection[]>()
