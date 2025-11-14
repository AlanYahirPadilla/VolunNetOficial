import { Server as SocketIOServer } from 'socket.io'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as NetServer } from 'http'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export interface SocketData {
  userId: string
  userRole: string
  userName: string
}

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  content: string
  type: 'DIRECT' | 'EVENT_CHAT' | 'SYSTEM'
  createdAt: string
  sender?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

export interface ChatInvitation {
  id: string
  chatId: string
  inviterId: string
  inviteeId: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  message?: string
  chat?: {
    id: string
    name?: string
    type: 'INDIVIDUAL' | 'GROUP' | 'EVENT' | 'COMMUNITY'
  }
  inviter?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

// Eventos del servidor
export interface ServerToClientEvents {
  // Mensajes
  message: (message: ChatMessage) => void
  messageDeleted: (messageId: string, chatId: string) => void
  messageEdited: (message: ChatMessage) => void
  
  // Invitaciones
  chatInvitation: (invitation: ChatInvitation) => void
  invitationAccepted: (invitationId: string, chatId: string) => void
  invitationDeclined: (invitationId: string) => void
  
  // Estado del chat
  userJoined: (chatId: string, user: { id: string; name: string }) => void
  userLeft: (chatId: string, userId: string) => void
  userTyping: (chatId: string, user: { id: string; name: string }) => void
  userStoppedTyping: (chatId: string, userId: string) => void
  
  // Notificaciones
  notification: (notification: any) => void
  
  // Errores
  error: (error: string) => void
}

// Eventos del cliente
export interface ClientToServerEvents {
  // Conexión
  join: (data: { userId: string; userRole: string; userName: string }) => void
  
  // Chat
  joinChat: (chatId: string) => void
  leaveChat: (chatId: string) => void
  sendMessage: (data: { chatId: string; content: string; type?: 'DIRECT' | 'EVENT_CHAT' | 'SYSTEM' }) => void
  
  // Invitaciones
  respondToInvitation: (data: { invitationId: string; response: 'ACCEPTED' | 'DECLINED' }) => void
  
  // Estado
  typing: (chatId: string) => void
  stopTyping: (chatId: string) => void
  
  // Desconexión
  disconnect: () => void
}

export type SocketServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents>
