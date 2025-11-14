"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, MessageCircle, Users, Calendar, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

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

interface WhatsAppStyleChatListProps {
  chats: Chat[]
  user: any
  onChatSelect: (chat: Chat) => void
  onCreateChat?: () => void
}

export function WhatsAppStyleChatList({ 
  chats, 
  user, 
  onChatSelect, 
  onCreateChat 
}: WhatsAppStyleChatListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrar chats
  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    const chatName = chat.name?.toLowerCase() || ''
    const participantNames = chat.participants
      .map(p => `${p.user.firstName} ${p.user.lastName}`.toLowerCase())
      .join(' ')
    
    return chatName.includes(searchLower) || participantNames.includes(searchLower)
  })

  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Ahora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  // Obtener nombre del chat
  const getChatName = (chat: Chat) => {
    if (chat.name) return chat.name
    if (chat.type === 'INDIVIDUAL') {
      const otherParticipant = chat.participants.find(p => p.user.id !== user?.id)
      return otherParticipant ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}` : 'Chat'
    }
    return 'Chat'
  }

  // Obtener avatar del chat
  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'INDIVIDUAL') {
      const otherParticipant = chat.participants.find(p => p.user.id !== user?.id)
      return otherParticipant?.user.avatar
    }
    return null
  }

  // Obtener último mensaje
  const getLastMessage = (chat: Chat) => {
    if (chat.messages.length === 0) return null
    
    const lastMessage = chat.messages[0]
    const senderName = lastMessage.sender.firstName
    const content = lastMessage.content.length > 30 
      ? lastMessage.content.substring(0, 30) + '...'
      : lastMessage.content
    
    return `${senderName}: ${content}`
  }

  // Filtrar chats que tienen mensajes
  const chatsWithMessages = filteredChats.filter(chat => chat.messages.length > 0)

  // Obtener ícono del tipo de chat
  const getChatIcon = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL':
        return <MessageCircle className="h-4 w-4" />
      case 'GROUP':
        return <Users className="h-4 w-4" />
      case 'EVENT':
        return <Calendar className="h-4 w-4" />
      default:
        return <MessageCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold">Chats</h1>
          {onCreateChat && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateChat}
              className="text-white hover:bg-blue-700 p-2"
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white text-gray-900 border-gray-300 focus:border-white focus:ring-white"
          />
        </div>
      </div>

      {/* Lista de chats */}
      <ScrollArea className="flex-1">
        {chatsWithMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron chats' : 'No tienes chats aún'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza una conversación con otros voluntarios'
                }
              </p>
              {!searchTerm && onCreateChat && (
                <Button onClick={onCreateChat} className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Chat
                </Button>
              )}
            </div>
          </div>
        ) : (
            <div className="space-y-1">
              {chatsWithMessages.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                onClick={() => onChatSelect(chat)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getChatAvatar(chat)} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {chat.type === 'INDIVIDUAL' ? 
                          chat.participants.find(p => p.user.id !== user?.id)?.user.firstName[0] :
                          getChatIcon(chat.type)
                        }
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Indicador online */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {getChatName(chat)}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDate(chat.lastMessageAt)}
                      </span>
                    </div>
                    
                    {getLastMessage(chat) && (
                      <p className="text-sm text-gray-600 truncate">
                        {getLastMessage(chat)}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
