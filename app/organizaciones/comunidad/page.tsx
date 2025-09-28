"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, Users, Send, ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/app/auth/actions'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { WhatsAppStyleMenu } from '@/components/chat/WhatsAppStyleMenu'
import { WhatsAppStyleChat } from '@/components/chat/WhatsAppStyleChat'
import { WhatsAppStyleChatList } from '@/components/chat/WhatsAppStyleChatList'

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

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  role: 'VOLUNTEER' | 'ORGANIZATION'
  volunteer?: {
    bio?: string
    skills?: string[]
  }
  organization?: {
    name: string
    description?: string
  }
}

interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  content: string
  createdAt: string
  sender?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

export default function OrganizadorComunidadPage() {
  const [user, setUser] = useState<any>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('usuarios')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        if (currentUser) {
          // Cargar todos los usuarios
          const usersResponse = await fetch('/api/users/all')
          if (usersResponse.ok) {
            const usersData = await usersResponse.json()
            setAllUsers(usersData.users || [])
          }

          // Cargar chats del usuario
          const chatsResponse = await fetch('/api/chat')
          if (chatsResponse.ok) {
            const chatsData = await chatsResponse.json()
            setChats(chatsData.chats || [])
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Polling para mensajes cada 2 segundos
  useEffect(() => {
    if (!selectedChat) return

    const interval = setInterval(() => {
      loadMessages(selectedChat.id)
    }, 2000)

    return () => clearInterval(interval)
  }, [selectedChat])

  // Indicador de escritura del usuario actual
  useEffect(() => {
    if (!newMessage.trim()) {
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    
    const timer = setTimeout(() => {
      setIsTyping(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [newMessage])

  // Simular indicador de escritura del otro usuario
  useEffect(() => {
    if (!selectedChat || !user) return

    const simulateTyping = () => {
      const shouldShowTyping = Math.random() < 0.3
      if (shouldShowTyping) {
        setOtherUserTyping(true)
        setTimeout(() => {
          setOtherUserTyping(false)
        }, 2000 + Math.random() * 3000)
      }
    }

    const interval = setInterval(simulateTyping, 10000)
    return () => clearInterval(interval)
  }, [selectedChat, user])

  const loadMessages = async (chatId: string, showIndicator = false) => {
    try {
      if (showIndicator) setIsUpdating(true)
      
      const response = await fetch(`/api/chat/${chatId}/messages?limit=50`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      if (showIndicator) {
        setTimeout(() => setIsUpdating(false), 500)
      }
    }
  }

  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || !user || isSending) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setIsSending(true)

    try {
      const response = await fetch(`/api/chat/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: messageContent, type: 'DIRECT' })
      })

      if (response.ok) {
        setTimeout(() => {
          loadMessages(selectedChat.id)
        }, 100)
      } else {
        setNewMessage(messageContent)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setNewMessage(messageContent)
    } finally {
      setIsSending(false)
    }
  }

  const createChat = async (targetUserId: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'INDIVIDUAL',
          participantIds: [targetUserId]
        })
      })
      
      if (response.ok) {
        const chatData = await response.json()
        setSelectedChat(chatData.chat)
        setActiveTab('chats')
        
        const chatsResponse = await fetch('/api/chat')
        if (chatsResponse.ok) {
          const chatsData = await chatsResponse.json()
          setChats(chatsData.chats || [])
        }
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const getOtherParticipant = (chat: Chat) => {
    if (!user) return null
    return chat.participants.find(p => p.user.id !== user.id)
  }

  const getLastMessage = (chat: Chat) => {
    if (chat.messages && chat.messages.length > 0) {
      return chat.messages[0]
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando comunidad...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Menú superior estilo WhatsApp */}
      <WhatsAppStyleMenu user={user} currentPage="comunidad" />
      
      {/* Layout principal estilo WhatsApp */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar de chats */}
        <div className="w-1/3 border-r border-gray-200 bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
              <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
              <TabsTrigger value="chats">Chats</TabsTrigger>
            </TabsList>

            {/* Tab de Usuarios */}
            <TabsContent value="usuarios" className="flex-1 p-4">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Todos los Usuarios
                </h2>
                
                {allUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay usuarios disponibles</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[calc(100vh-200px)]">
                    <div className="space-y-3">
                      {allUsers.map((user) => (
                        <div
                          key={user.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => createChat(user.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-blue-500 text-white">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </h3>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              <div className="mt-1">
                                <Badge variant={user.role === 'VOLUNTEER' ? 'default' : 'secondary'} className="text-xs">
                                  {user.role === 'VOLUNTEER' ? 'Voluntario' : 'Organización'}
                                </Badge>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>

            {/* Tab de Chats */}
            <TabsContent value="chats" className="flex-1">
              <WhatsAppStyleChatList 
                chats={chats}
                user={user}
                onChatSelect={setSelectedChat}
                onCreateChat={() => setActiveTab('usuarios')}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Área principal de chat */}
        <div className="flex-1">
          {selectedChat ? (
            <WhatsAppStyleChat
              chat={selectedChat}
              user={user}
              onBack={() => setSelectedChat(null)}
              onSendMessage={async (content: string) => {
                const response = await fetch(`/api/chat/${selectedChat.id}/messages`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ content, type: 'DIRECT' })
                })
                if (!response.ok) throw new Error('Error enviando mensaje')
              }}
              isSending={isSending}
              otherUserTyping={otherUserTyping}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 mb-2">
                  Selecciona un chat
                </h2>
                <p className="text-gray-500">
                  Elige una conversación de la lista o contacta a un nuevo usuario
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}