import { SocketConnection } from './types'
import { PubKey } from './validators'

export const socketConnectionsMap = new Map<PubKey, SocketConnection[]>()
