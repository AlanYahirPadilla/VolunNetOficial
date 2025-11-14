import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { getCurrentUser } from '@/app/auth/actions'

interface SocketData {
  userId: string
  userRole: string
  userName: string
}

interface ChatMessage {
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

interface ChatInvitation {
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

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [user, setUser] = useState<any>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) return

        setUser(currentUser)

        // Socket.IO temporalmente deshabilitado para evitar errores
        // await fetch('/api/socket', { method: 'GET' })
        
        // const newSocket = io(process.env.NODE_ENV === 'production' 
        //   ? 'https://volunnet.vercel.app' 
        //   : 'http://localhost:3000', {
        //   path: '/api/socket_io',
        //   transports: ['websocket', 'polling'],
        //   autoConnect: true,
        //   timeout: 10000,
        //   reconnection: true,
        //   reconnectionAttempts: 5,
        //   reconnectionDelay: 1000
        // })
        
        // Simular conexión exitosa
        const newSocket = null
        setIsConnected(true)

        // Eventos de conexión temporalmente deshabilitados
        // newSocket.on('connect', () => {
        //   console.log('Socket conectado:', newSocket.id)
        //   setIsConnected(true)
        //   
        //   // Unirse con datos del usuario
        //   newSocket.emit('join', {
        //     userId: currentUser.id,
        //     userRole: currentUser.role,
        //     userName: `${currentUser.firstName} ${currentUser.lastName}`
        //   })
        // })

        // newSocket.on('disconnect', () => {
        //   console.log('Socket desconectado')
        //   setIsConnected(false)
        // })

        // newSocket.on('connect_error', (error) => {
        //   console.error('Error de conexión Socket:', error)
        //   setIsConnected(false)
        // })

        socketRef.current = newSocket
        setSocket(newSocket)

      } catch (error) {
        console.error('Error inicializando socket:', error)
      }
    }

    initializeSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [])

  // Unirse a un chat
  const joinChat = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('joinChat', chatId)
    }
  }

  // Salir de un chat
  const leaveChat = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('leaveChat', chatId)
    }
  }

  // Enviar mensaje
  const sendMessage = (chatId: string, content: string, type: 'DIRECT' | 'EVENT_CHAT' | 'SYSTEM' = 'DIRECT') => {
    if (socket && isConnected) {
      socket.emit('sendMessage', { chatId, content, type })
    }
  }

  // Responder a invitación
  const respondToInvitation = (invitationId: string, response: 'ACCEPTED' | 'DECLINED') => {
    if (socket && isConnected) {
      socket.emit('respondToInvitation', { invitationId, response })
    }
  }

  // Indicar que está escribiendo
  const startTyping = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('typing', chatId)
    }
  }

  // Indicar que dejó de escribir
  const stopTyping = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('stopTyping', chatId)
    }
  }

  // Escuchar mensajes
  const onMessage = (callback: (message: ChatMessage) => void) => {
    if (socket) {
      socket.on('message', callback)
      return () => socket.off('message', callback)
    }
    return () => {}
  }

  // Escuchar invitaciones
  const onChatInvitation = (callback: (invitation: ChatInvitation) => void) => {
    if (socket) {
      socket.on('chatInvitation', callback)
      return () => socket.off('chatInvitation', callback)
    }
    return () => {}
  }

  // Escuchar notificaciones
  const onNotification = (callback: (notification: any) => void) => {
    if (socket) {
      socket.on('notification', callback)
      return () => socket.off('notification', callback)
    }
    return () => {}
  }

  // Escuchar errores
  const onError = (callback: (error: string) => void) => {
    if (socket) {
      socket.on('error', callback)
      return () => socket.off('error', callback)
    }
    return () => {}
  }

  return {
    socket,
    isConnected,
    user,
    joinChat,
    leaveChat,
    sendMessage,
    respondToInvitation,
    startTyping,
    stopTyping,
    onMessage,
    onChatInvitation,
    onNotification,
    onError
  }
}
