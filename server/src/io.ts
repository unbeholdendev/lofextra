import { Server } from 'socket.io'
import { httpServer } from './http'

export const io = new Server(httpServer, {
  cors: { origin: process.env.ORIGIN || 'http://localhost:3000' },
})
