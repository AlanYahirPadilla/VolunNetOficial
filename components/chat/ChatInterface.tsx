"use client"

import { useState, useEffect, useRef } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Users, MessageCircle, Phone, Video } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
}

interface ChatInterfaceProps {
  chat: Chat
  onClose?: () => void
}

export function ChatInterface({ chat, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Array<{ id: string; name: string }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const { socket, isConnected, user, sendMessage, startTyping, stopTyping, onMessage } = useSocket()

  // Scroll automático al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cargar mensajes iniciales
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/chat/${chat.id}/messages?limit=50`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
        }
      } catch (error) {
        console.error('Error cargando mensajes:', error)
      }
    }

    loadMessages()
  }, [chat.id])

  // Unirse al chat cuando se conecte
  useEffect(() => {
    if (isConnected && socket) {
      socket.emit('joinChat', chat.id)
    }
  }, [isConnected, socket, chat.id])

  // Escuchar nuevos mensajes
  useEffect(() => {
    const unsubscribe = onMessage((message: ChatMessage) => {
      if (message.chatId === chat.id) {
        setMessages(prev => [...prev, message])
      }
    })

    return unsubscribe
  }, [onMessage, chat.id])

  // Manejar envío de mensaje
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isConnected) return

    try {
      sendMessage(chat.id, newMessage.trim(), chat.type === 'EVENT' ? 'EVENT_CHAT' : 'DIRECT')
      setNewMessage('')
    } catch (error) {
      console.error('Error enviando mensaje:', error)
    }
  }

  // Manejar tecla Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Manejar typing
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    if (e.target.value.trim()) {
      startTyping(chat.id)
      
      // Limpiar timeout anterior
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Parar de escribir después de 2 segundos
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(chat.id)
      }, 2000)
    } else {
      stopTyping(chat.id)
    }
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Ahora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  // Obtener nombre del chat
  const getChatName = () => {
    if (chat.name) return chat.name
    if (chat.type === 'INDIVIDUAL') {
      const otherParticipant = chat.participants.find(p => p.userId !== user?.id)
      return otherParticipant ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}` : 'Chat'
    }
    return 'Chat'
  }

  // Obtener avatar del chat
  const getChatAvatar = () => {
    if (chat.type === 'INDIVIDUAL') {
      const otherParticipant = chat.participants.find(p => p.userId !== user?.id)
      return otherParticipant?.user.avatar
    }
    return null
  }

  return (
    <Card className="w-full h-[600px] flex flex-col">
      {/* Header */}
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getChatAvatar()} />
              <AvatarFallback>
                {chat.type === 'INDIVIDUAL' ? 
                  chat.participants.find(p => p.userId !== user?.id)?.user.firstName[0] :
                  <Users className="h-5 w-5" />
                }
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{getChatName()}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {chat.type === 'INDIVIDUAL' ? 'Individual' : 
                   chat.type === 'EVENT' ? 'Evento' : 
                   chat.type === 'GROUP' ? 'Grupal' : 'Comunidad'}
                </Badge>
                <span className="text-sm text-gray-500">
                  {chat.participants.length} {chat.participants.length === 1 ? 'participante' : 'participantes'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Cerrar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Mensajes */}
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[70%] ${message.senderId === user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                  {message.senderId !== user?.id && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender?.avatar} />
                      <AvatarFallback>
                        {message.sender?.firstName[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-2xl px-4 py-2 ${
                    message.senderId === user?.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Indicador de typing */}
            <AnimatePresence>
              {typingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-gray-500 text-sm"
                >
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>
                    {typingUsers.length === 1 
                      ? `${typingUsers[0].name} está escribiendo...`
                      : `${typingUsers.length} personas están escribiendo...`
                    }
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input de mensaje */}
        <div className="flex-shrink-0 p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              disabled={!isConnected}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!isConnected && (
            <p className="text-xs text-gray-500 mt-2">
              Conectando al chat...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
