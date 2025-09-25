import { NextApiRequest, NextApiResponseServerIO } from '@/lib/socket'
import { Server as SocketIOServer } from 'socket.io'
import { Server as NetServer } from 'http'
import { chatService } from '@/lib/services/ChatService'

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket_io',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://volunnet.vercel.app'] 
          : ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    })

    // Almacenar usuarios conectados
    const connectedUsers = new Map<string, string>() // userId -> socketId

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id)

      // Usuario se une
      socket.on('join', async (data: { userId: string; userRole: string; userName: string }) => {
        try {
          connectedUsers.set(data.userId, socket.id)
          socket.data = data
          socket.join(`user:${data.userId}`)
          console.log(`User ${data.userName} (${data.userId}) joined`)
        } catch (error) {
          console.error('Error in join:', error)
          socket.emit('error', 'Error joining user')
        }
      })

      // Unirse a un chat
      socket.on('joinChat', async (chatId: string) => {
        try {
          const userData = socket.data as { userId: string; userRole: string; userName: string }
          if (!userData) {
            socket.emit('error', 'User not authenticated')
            return
          }

          // Verificar que el usuario es participante del chat
          const chats = await chatService.getUserChats(userData.userId)
          const userChat = chats.find(chat => chat.id === chatId)
          
          if (!userChat) {
            socket.emit('error', 'User is not a participant of this chat')
            return
          }

          socket.join(`chat:${chatId}`)
          console.log(`User ${userData.userName} joined chat ${chatId}`)
        } catch (error) {
          console.error('Error joining chat:', error)
          socket.emit('error', 'Error joining chat')
        }
      })

      // Salir de un chat
      socket.on('leaveChat', (chatId: string) => {
        socket.leave(`chat:${chatId}`)
        console.log(`User left chat ${chatId}`)
      })

      // Enviar mensaje
      socket.on('sendMessage', async (data: { chatId: string; content: string; type?: 'DIRECT' | 'EVENT_CHAT' | 'SYSTEM' }) => {
        try {
          const userData = socket.data as { userId: string; userRole: string; userName: string }
          if (!userData) {
            socket.emit('error', 'User not authenticated')
            return
          }

          const message = await chatService.sendMessage(
            data.chatId, 
            userData.userId, 
            data.content, 
            data.type || 'DIRECT'
          )

          // Enviar mensaje a todos los participantes del chat
          io.to(`chat:${data.chatId}`).emit('message', {
            id: message.id,
            chatId: message.chatId,
            senderId: message.senderId,
            content: message.content,
            type: message.type,
            createdAt: message.createdAt.toISOString(),
            sender: {
              id: message.sender.id,
              firstName: message.sender.firstName,
              lastName: message.sender.lastName,
              avatar: message.sender.avatar
            }
          })

          // Marcar mensajes como leídos para el remitente
          await chatService.markMessagesAsRead(data.chatId, userData.userId)

        } catch (error) {
          console.error('Error sending message:', error)
          socket.emit('error', 'Error sending message')
        }
      })

      // Responder a invitación
      socket.on('respondToInvitation', async (data: { invitationId: string; response: 'ACCEPTED' | 'DECLINED' }) => {
        try {
          const userData = socket.data as { userId: string; userRole: string; userName: string }
          if (!userData) {
            socket.emit('error', 'User not authenticated')
            return
          }

          const result = await chatService.respondToInvitation(data.invitationId, data.response)
          
          if (result.response === 'ACCEPTED') {
            // Notificar al invitador
            const invitation = await chatService.getUserInvitations(userData.userId)
            const currentInvitation = invitation.find(inv => inv.id === data.invitationId)
            
            if (currentInvitation) {
              const inviterSocketId = connectedUsers.get(currentInvitation.inviterId)
              if (inviterSocketId) {
                io.to(inviterSocketId).emit('invitationAccepted', data.invitationId, currentInvitation.chatId)
              }
            }
          } else {
            // Notificar rechazo
            const invitation = await chatService.getUserInvitations(userData.userId)
            const currentInvitation = invitation.find(inv => inv.id === data.invitationId)
            
            if (currentInvitation) {
              const inviterSocketId = connectedUsers.get(currentInvitation.inviterId)
              if (inviterSocketId) {
                io.to(inviterSocketId).emit('invitationDeclined', data.invitationId)
              }
            }
          }

        } catch (error) {
          console.error('Error responding to invitation:', error)
          socket.emit('error', 'Error responding to invitation')
        }
      })

      // Usuario escribiendo
      socket.on('typing', (chatId: string) => {
        const userData = socket.data as { userId: string; userRole: string; userName: string }
        if (userData) {
          socket.to(`chat:${chatId}`).emit('userTyping', chatId, {
            id: userData.userId,
            name: userData.userName
          })
        }
      })

      // Usuario dejó de escribir
      socket.on('stopTyping', (chatId: string) => {
        const userData = socket.data as { userId: string; userRole: string; userName: string }
        if (userData) {
          socket.to(`chat:${chatId}`).emit('userStoppedTyping', chatId, userData.userId)
        }
      })

      // Desconexión
      socket.on('disconnect', () => {
        const userData = socket.data as { userId: string; userRole: string; userName: string }
        if (userData) {
          connectedUsers.delete(userData.userId)
          console.log(`User ${userData.userName} disconnected`)
        }
      })
    })

    res.socket.server.io = io
  }
  res.end()
}

export default SocketHandler
