"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, Plus, Search, Users, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

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
  event?: {
    id: string
    title: string
  }
}

interface ChatListProps {
  onChatSelect: (chat: Chat) => void
  onCreateChat?: () => void
}

export function ChatList({ onChatSelect, onCreateChat }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Cargar chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        console.log('ChatList: Cargando chats...')
        const response = await fetch('/api/chat')
        if (response.ok) {
          const data = await response.json()
          console.log('ChatList: Chats recibidos:', data.chats?.length || 0)
          console.log('ChatList: Detalles de chats:', data.chats?.map(c => ({
            id: c.id,
            type: c.type,
            participants: c.participants?.map(p => `${p.user.firstName} ${p.user.lastName}`)
          })))
          setChats(data.chats || [])
        } else {
          console.error('ChatList: Error en respuesta:', response.status)
        }
      } catch (error) {
        console.error('Error cargando chats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadChats()
  }, [])

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
      const otherParticipant = chat.participants[0]
      return otherParticipant ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}` : 'Chat'
    }
    return 'Chat'
  }

  // Obtener avatar del chat
  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'INDIVIDUAL') {
      return chat.participants[0]?.user.avatar
    }
    return null
  }

  // Obtener último mensaje
  const getLastMessage = (chat: Chat) => {
    if (chat.messages.length === 0) return 'Sin mensajes'
    
    const lastMessage = chat.messages[0]
    const senderName = lastMessage.sender.firstName
    const content = lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + '...'
      : lastMessage.content
    
    return `${senderName}: ${content}`
  }

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

  if (loading) {
    return (
      <Card className="w-full h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando chats...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full h-[600px] flex flex-col">
      {/* Header */}
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chats
          </CardTitle>
          {onCreateChat && (
            <Button size="sm" onClick={onCreateChat}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Chat
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
            className="pl-10"
          />
        </div>
      </CardHeader>

      {/* Lista de chats */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          {filteredChats.length === 0 ? (
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
                  <Button onClick={onCreateChat}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Chat
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => onChatSelect(chat)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getChatAvatar(chat)} />
                      <AvatarFallback>
                        {chat.type === 'INDIVIDUAL' ? 
                          chat.participants[0]?.user.firstName[0] :
                          getChatIcon(chat.type)
                        }
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {getChatName(chat)}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {chat.type === 'INDIVIDUAL' ? 'Individual' : 
                           chat.type === 'EVENT' ? 'Evento' : 
                           chat.type === 'GROUP' ? 'Grupal' : 'Comunidad'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {getLastMessage(chat)}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatDate(chat.lastMessageAt)}</span>
                        {chat.event && (
                          <>
                            <span>•</span>
                            <span>{chat.event.title}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{chat.participants.length} participantes</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
