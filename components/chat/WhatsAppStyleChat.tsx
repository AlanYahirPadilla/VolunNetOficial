"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, MoreVertical, Phone, Video, Search, ArrowLeft, Smile, Paperclip } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { EmojiPicker } from './EmojiPicker'
import { MessageReactions } from './MessageReactions'

interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  content: string
  createdAt: string
  reactions?: { [emoji: string]: string[] }
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
  messages: Array<{
    id: string
    content: string
    createdAt: string
    sender: {
      id: string
      firstName: string
      lastName: string
    }
  }>
  lastMessageAt?: string
}

interface WhatsAppStyleChatProps {
  chat: Chat
  user: any
  onBack: () => void
  onSendMessage: (content: string) => Promise<void>
  isSending?: boolean
  otherUserTyping?: boolean
}

export function WhatsAppStyleChat({ 
  chat, 
  user, 
  onBack, 
  onSendMessage, 
  isSending = false,
  otherUserTyping = false 
}: WhatsAppStyleChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Scroll automático al final
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  useEffect(() => {
    // Solo hacer scroll si hay mensajes
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [messages])

  // Cargar mensajes iniciales
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/chat/${chat.id}/messages?limit=50`, {
          credentials: 'include'
        })
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

  // Polling para mensajes cada 3 segundos (menos frecuente para evitar conflictos con reacciones)
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages()
    }, 3000)

    return () => clearInterval(interval)
  }, [chat.id])

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${chat.id}/messages?limit=50`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        const newMessages = data.messages || []
        
        console.log('📨 Mensajes cargados del servidor:', newMessages.length)
        
        // Procesar reacciones de cada mensaje
        const processedMessages = newMessages.map((msg: any) => {
          let reactions = {}
          
          // Intentar obtener reacciones del campo reactions
          if (msg.reactions && typeof msg.reactions === 'object') {
            reactions = msg.reactions
            console.log('📊 Reacciones del campo reactions:', reactions)
          }
          // Si no hay reactions, intentar obtener de metadata
          else if (msg.metadata && typeof msg.metadata === 'object' && msg.metadata.reactions) {
            reactions = msg.metadata.reactions
            console.log('📊 Reacciones del campo metadata:', reactions)
          }
          
          return {
            ...msg,
            reactions: reactions
          }
        })
        
        console.log('✅ Mensajes procesados con reacciones:', processedMessages.length)
        setMessages(processedMessages)
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setShowEmojiPicker(false)
    
    try {
      await onSendMessage(messageContent)
      setTimeout(() => {
        loadMessages()
      }, 100)
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      setNewMessage(messageContent)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    if (e.target.value.trim()) {
      setIsTyping(true)
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
      }, 2000)
    } else {
      setIsTyping(false)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
  }

  const handleReactionToggle = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch('/api/chat/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ messageId, emoji })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Reacción actualizada:', data)
        
        // Actualizar el estado local de mensajes inmediatamente
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, reactions: data.reactions }
            : msg
        ))
        
        console.log('✅ Estado local actualizado con reacciones:', data.reactions)
      } else {
        console.error('Error actualizando reacción:', response.statusText)
      }
    } catch (error) {
      console.error('Error toggling reaction:', error)
    }
  }

  const getOtherParticipant = () => {
    if (!user) return null
    return chat.participants.find(p => p.user.id !== user.id)
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: es })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Ahora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  const otherParticipant = getOtherParticipant()

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header estilo WhatsApp */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-blue-700 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherParticipant?.user.avatar} />
            <AvatarFallback className="bg-blue-500 text-white">
              {otherParticipant?.user.firstName?.[0]}
              {otherParticipant?.user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="font-semibold text-lg">
              {otherParticipant?.user.firstName} {otherParticipant?.user.lastName}
            </h2>
            <p className="text-blue-100 text-sm">
              {otherUserTyping ? 'escribiendo...' : 'en línea'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 p-2">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 p-2">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700 p-2">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-hidden bg-gray-100 relative">
        {/* Patrón de fondo WhatsApp */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <ScrollArea className="h-full p-4 relative z-10">
          <div className="space-y-2">
            {messages.map((message, index) => {
              const isOwnMessage = message.senderId === user?.id
              const showAvatar = !isOwnMessage && (
                index === 0 || 
                messages[index - 1]?.senderId !== message.senderId
              )
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {showAvatar && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender?.avatar} />
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        {message.sender?.firstName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {!showAvatar && !isOwnMessage && <div className="w-8" />}
                  
                  <div className={`max-w-[70%] ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl shadow-sm ${
                        isOwnMessage
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white text-gray-800 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    
                    {/* Reacciones */}
                    <MessageReactions
                      messageId={message.id}
                      reactions={message.reactions || {}}
                      currentUserId={user?.id || ''}
                      onReactionToggle={handleReactionToggle}
                    />
                    
                    <div className={`flex items-center gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.createdAt)}
                      </span>
                      {isOwnMessage && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
            
            {/* Indicador de escritura */}
            <AnimatePresence>
              {otherUserTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-end gap-2 justify-start"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-500 text-white text-xs">
                      {otherParticipant?.user.firstName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-md shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input de mensaje estilo WhatsApp */}
      <div className="bg-gray-100 px-4 py-3 border-t border-gray-200 relative">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`text-gray-600 hover:bg-gray-200 p-2 ${showEmojiPicker ? 'bg-gray-200' : ''}`}
          >
            <Smile className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-200 p-2">
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-12"
              disabled={isSending}
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 disabled:opacity-50"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Selector de Emojis */}
        <AnimatePresence>
          {showEmojiPicker && (
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
