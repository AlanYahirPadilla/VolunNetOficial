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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
            Comunidad de Organizadores
          </h1>
          <p className="text-center text-gray-600">
            Conecta con voluntarios y otros organizadores
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="usuarios">Todos los Usuarios</TabsTrigger>
            <TabsTrigger value="chats">Mis Chats</TabsTrigger>
          </TabsList>

          {/* Tab de Usuarios */}
          <TabsContent value="usuarios" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Todos los Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay usuarios disponibles</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {allUsers.map((user) => (
                      <Card key={user.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </h3>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <Badge variant={user.role === 'VOLUNTEER' ? 'default' : 'secondary'}>
                              {user.role === 'VOLUNTEER' ? 'Voluntario' : 'Organización'}
                            </Badge>
                          </div>

                          {user.volunteer && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-2">{user.volunteer.bio}</p>
                              {user.volunteer.skills && user.volunteer.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {user.volunteer.skills.slice(0, 3).map((skill: string) => (
                                    <Badge key={skill} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {user.organization && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-900">{user.organization.name}</p>
                              <p className="text-sm text-gray-600">{user.organization.description}</p>
                            </div>
                          )}
                          
                          <Button 
                            size="sm" 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => createChat(user.id)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Contactar
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Chats */}
          <TabsContent value="chats" className="mt-6">
            {selectedChat ? (
              <div className="space-y-4">
                {/* Header del chat */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedChat(null)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a chats
                  </Button>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getOtherParticipant(selectedChat)?.user.avatar} />
                      <AvatarFallback>
                        {getOtherParticipant(selectedChat)?.user.firstName?.[0]}
                        {getOtherParticipant(selectedChat)?.user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold">
                        {getOtherParticipant(selectedChat)?.user.firstName} {getOtherParticipant(selectedChat)?.user.lastName}
                      </h2>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        {otherUserTyping ? (
                          <span className="flex items-center gap-1 text-green-500">
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            escribiendo...
                          </span>
                        ) : (
                          <>
                            Chat activo
                            {isUpdating && (
                              <span className="flex items-center gap-1 text-blue-500">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500"></div>
                                Actualizando...
                              </span>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interfaz de chat */}
                <Card className="h-[600px] flex flex-col">
                  <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                    {/* Mensajes */}
                    <div className="flex-1 overflow-hidden">
                      <ScrollArea className="h-full p-4">
                        <div className="space-y-4 pb-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex items-end gap-3 ${
                                message.senderId === user?.id ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              {message.senderId !== user?.id && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={message.sender?.avatar} />
                                  <AvatarFallback>
                                    {message.sender?.firstName?.[0]}{message.sender?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                                  message.senderId === user?.id
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                }`}
                              >
                                {message.senderId !== user?.id && (
                                  <p className="text-xs font-semibold mb-1">
                                    {message.sender?.firstName} {message.sender?.lastName}
                                  </p>
                                )}
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {format(new Date(message.createdAt), 'HH:mm', { locale: es })}
                                </p>
                              </div>
                              {message.senderId === user?.id && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user?.avatar} />
                                  <AvatarFallback>
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          ))}

                          {/* Indicador de escritura del otro usuario */}
                          {otherUserTyping && (
                            <div className="flex items-end gap-3 justify-start">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {getOtherParticipant(selectedChat)?.user.firstName?.[0]}
                                  {getOtherParticipant(selectedChat)?.user.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none p-3 shadow-md">
                                <div className="flex items-center gap-1">
                                  <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                  </div>
                                  <span className="text-xs text-gray-500 ml-2">escribiendo...</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Elemento invisible para auto-scroll */}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Input de mensaje */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Escribe un mensaje..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              sendMessage()
                            }
                          }}
                          className="flex-1"
                        />
                        <Button onClick={sendMessage} disabled={!newMessage.trim() || isSending}>
                          {isSending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Mis Chats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chats.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No tienes chats aún</p>
                      <p className="text-sm">Ve a "Todos los Usuarios" para contactar a alguien</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chats.map((chat) => {
                        const otherParticipant = getOtherParticipant(chat)
                        const lastMessage = getLastMessage(chat)
                        
                        return (
                          <div
                            key={chat.id}
                            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => setSelectedChat(chat)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={otherParticipant?.user.avatar} />
                                <AvatarFallback>
                                  {otherParticipant?.user.firstName?.[0]}
                                  {otherParticipant?.user.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="font-medium">
                                  {otherParticipant?.user.firstName} {otherParticipant?.user.lastName}
                                </h3>
                                {lastMessage && (
                                  <p className="text-sm text-gray-500 truncate">
                                    {lastMessage.content}
                                  </p>
                                )}
                              </div>
                              {lastMessage && (
                                <div className="text-xs text-gray-400">
                                  {format(new Date(lastMessage.createdAt), 'p', { locale: es })}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}