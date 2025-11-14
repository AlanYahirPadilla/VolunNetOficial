import { useState, useEffect, useCallback } from 'react'
import { getCurrentUser } from '@/app/auth/actions'

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

interface Chat {
  id: string
  type: 'INDIVIDUAL' | 'GROUP' | 'EVENT' | 'COMMUNITY'
  name?: string
  description?: string
  participants: Array<{
    id: string
    userId: string
    role: 'ADMIN' | 'MODERATOR' | 'MEMBER'
    user: {
      id: string
      firstName: string
      lastName: string
      avatar?: string
    }
  }>
  messages: ChatMessage[]
  lastMessageAt?: string
  event?: {
    id: string
    title: string
  }
}

export const useChat = () => {
  const [user, setUser] = useState<any>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar usuario actual
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error loading user:', error)
      }
    }
    loadUser()
  }, [])

  // Cargar chats del usuario
  const loadChats = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch('/api/chat', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setChats(data.chats || [])
      }
    } catch (error) {
      console.error('Error loading chats:', error)
    }
  }, [user])

  // Cargar mensajes de un chat
  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}/messages?limit=50`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }, [])

  // Enviar mensaje
  const sendMessage = useCallback(async (chatId: string, content: string, type: 'DIRECT' | 'EVENT_CHAT' | 'SYSTEM' = 'DIRECT') => {
    if (!user) return

    try {
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content, type })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Agregar el mensaje a la lista local
        setMessages(prev => [...prev, data.message])
        // Recargar chats para actualizar lastMessageAt
        loadChats()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }, [user, loadChats])

  // Crear chat
  const createChat = useCallback(async (type: 'INDIVIDUAL' | 'GROUP' | 'EVENT' | 'COMMUNITY', participantIds: string[], name?: string, description?: string, eventId?: string) => {
    if (!user) return

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type,
          participantIds,
          name,
          description,
          eventId
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setChats(prev => [...prev, data.chat])
        return data.chat
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }, [user])

  // Seleccionar chat
  const selectChat = useCallback((chat: Chat) => {
    setActiveChat(chat)
    loadMessages(chat.id)
  }, [loadMessages])

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      loadChats()
      setLoading(false)
    }
  }, [user, loadChats])

  // Polling para mensajes nuevos (cada 5 segundos)
  useEffect(() => {
    if (!activeChat) return

    const interval = setInterval(() => {
      loadMessages(activeChat.id)
    }, 5000)

    return () => clearInterval(interval)
  }, [activeChat, loadMessages])

  return {
    user,
    chats,
    activeChat,
    messages,
    loading,
    loadChats,
    loadMessages,
    sendMessage,
    createChat,
    selectChat,
    setActiveChat
  }
}
