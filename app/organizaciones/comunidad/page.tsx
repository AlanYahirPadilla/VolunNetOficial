"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, Users, Search, AlertCircle, Loader2 } from 'lucide-react'
import { MobileNavigation } from "@/components/ui/mobile-navigation"
import { BottomNavigation } from "@/components/ui/bottom-navigation"
import { getCurrentUser } from '@/app/auth/actions'
import { WhatsAppStyleMenu } from '@/components/chat/WhatsAppStyleMenu'
import { WhatsAppStyleChat } from '@/components/chat/WhatsAppStyleChat'
import { WhatsAppStyleChatList } from '@/components/chat/WhatsAppStyleChatList'

// --- Tipos (mantengo los tuyos) ---
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

// --- Componente de Estado Vacío (mezcla diseño + lógica original) ---
const ChatEmptyState = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => (
  <div className="h-full flex items-center justify-center bg-gradient-to-br from-white to-blue-50 border-l border-gray-200">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 80, damping: 14 }}
      className="text-center p-8 max-w-sm mx-auto bg-white rounded-3xl shadow-2xl border border-blue-100/50 transform transition-shadow duration-300"
    >
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
        <MessageCircle className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-2xl font-extrabold text-gray-800 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        ¡Conecta y Colabora!
      </h2>
      <p className="text-gray-600 mb-6 text-base">
        Tu espacio de mensajería está listo. Selecciona o inicia una nueva conversación.
      </p>
      <Button
        onClick={() => setActiveTab('usuarios')}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl py-3 text-lg shadow-xl shadow-blue-300/50 transition-all duration-300"
      >
        <Users className="h-5 w-5 mr-2" />
        Buscar Usuarios
      </Button>
    </motion.div>
  </div>
)

// --- Componente: Lista de Usuarios (diseño del segundo, lógica de filtrado del primero) ---
const UserList = ({ allUsers, currentUser, createChat }: { allUsers: User[], currentUser: User | null, createChat: (id: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = allUsers.filter(u =>
    u.id !== currentUser?.id &&
    (u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Users className="h-5 w-5 text-blue-600" />
        Usuarios Activos
      </h2>
      
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
        <Input 
          placeholder="Buscar voluntarios u organizaciones..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-4 rounded-xl shadow-inner border-blue-100 bg-blue-50/50 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-1 transition-all"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500 flex-1 flex flex-col justify-center items-center">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50 text-gray-400" />
          <p className="font-medium">No se encontraron usuarios.</p>
          {searchTerm && <p className="text-sm">Intenta con otra búsqueda.</p>}
        </div>
      ) : (
        <ScrollArea className="flex-1 overflow-y-auto pr-2">
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
          >
            {filteredUsers.map((u) => (
              <motion.div
                key={u.id}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="p-3 border border-gray-100 bg-white rounded-xl hover:bg-gradient-to-r from-blue-50/70 to-purple-50/70 cursor-pointer transition-colors shadow-md"
                onClick={() => createChat(u.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 shadow-lg">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {u.firstName} {u.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{u.email}</p>
                    <Badge 
                      variant={u.role === 'VOLUNTEER' ? 'default' : 'secondary'} 
                      className={`text-xs mt-1 font-semibold ${u.role === 'VOLUNTEER' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}
                    >
                      {u.role === 'VOLUNTEER' ? 'Voluntario' : 'Organización'}
                    </Badge>
                  </div>

                  <Button 
                    size="icon" 
                    className="bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-md shadow-purple-300/50"
                    onClick={(e) => { e.stopPropagation(); createChat(u.id) }}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>
      )}
    </div>
  )
}

// --- Componente principal (mantengo el nombre solicitado y toda la lógica original) ---
export default function OrganizadorComunidadPage() {
  // Estados (mantengo exactamente la lógica original donde corresponde)
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
  const [searchTerm, setSearchTerm] = useState('') // para compatibilidad aunque UserList tiene su propio search
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Nuevo estado para layout responsive del diseño aplicado
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // --- loadData (mantengo la misma lógica del archivo original) ---
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

  // --- Polling y typing (mantengo lógica original) ---
  useEffect(() => {
    if (!selectedChat) return

    const interval = setInterval(() => {
      loadMessages(selectedChat.id)
    }, 2000)

    return () => clearInterval(interval)
  }, [selectedChat])

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

  // --- loadMessages (mantengo exactamente) ---
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

  // --- sendMessage (mantengo exactamente) ---
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

  // --- createChat (mantengo la lógica original) ---
  const createChat = async (targetUserId: string) => {
    try {
      const existingChat = chats.find(chat => 
        chat.type === 'INDIVIDUAL' && 
        chat.participants.some(p => p.userId === targetUserId)
      )

      if (existingChat) {
        setSelectedChat(existingChat)
        setActiveTab('chats')
        if (window.innerWidth < 768) setSidebarOpen(false)
        return
      }

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
        if (window.innerWidth < 768) setSidebarOpen(false)
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  // --- Helpers (mantengo originales) ---
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

  // Comportamiento responsive del sidebar (diseño aplicado)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(!selectedChat)
      }
    }

    handleResize()

    if (window.innerWidth < 768) {
      setSidebarOpen(!selectedChat)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [selectedChat])

  // Filtrado simple que usabas en el original (lo dejo por compatibilidad)
  const filteredUsers = allUsers.filter(u =>
    u.id !== user?.id &&
    (u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // --- Estados de carga / errores (mantengo la UI de carga del segundo diseño) ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-8 bg-white rounded-xl shadow-xl border border-blue-200"
        >
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 font-medium">Cargando comunidad y chats...</p>
        </motion.div>
      </div>
    )
  }

  // --- Render principal: diseño moderno (sidebar responsive, bottom nav, etc.) ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-gray-50 to-purple-50/50 flex flex-col relative overflow-hidden">
      {/* Patrón sutil de fondo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>

      {/* Menú superior estilo WhatsApp */}
      <WhatsAppStyleMenu user={user} currentPage="comunidad" />

      {/* Layout principal */}
      <div className="flex flex-1 overflow-hidden z-10">
        {/* Sidebar (animado con framer-motion como en diseño) */}
        <motion.div
          initial={false}
          animate={{ width: sidebarOpen ? '100%' : '0%', opacity: sidebarOpen ? 1 : 0 }}
          transition={{ duration: 0.28 }}
          className={`absolute inset-y-0 left-0 z-20 md:relative md:w-1/3 md:max-w-sm lg:max-w-md ${sidebarOpen ? 'w-full' : 'w-0 hidden md:block'} border-r border-gray-200 bg-white/95 backdrop-blur-sm shadow-xl md:shadow-none transition-all duration-300 ease-in-out flex flex-col`}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col p-4 pt-2">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100 rounded-2xl p-1 shadow-inner border border-gray-200">
              <TabsTrigger 
                value="chats" 
                className="rounded-xl data-[state=active]:bg-gradient-to-r from-blue-500 to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-300/50 transition-all text-gray-700 hover:bg-gray-200"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chats
              </TabsTrigger>
              <TabsTrigger 
                value="usuarios"
                className="rounded-xl data-[state=active]:bg-gradient-to-r from-blue-500 to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-300/50 transition-all text-gray-700 hover:bg-gray-200"
              >
                <Users className="h-4 w-4 mr-2" />
                Usuarios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chats" className="flex-1 min-h-0 overflow-hidden">
              <WhatsAppStyleChatList 
                chats={chats}
                user={user}
                onChatSelect={(chat) => {
                  setSelectedChat(chat)
                  if (window.innerWidth < 768) setSidebarOpen(false)
                }}
                onCreateChat={() => setActiveTab('usuarios')}
              />
            </TabsContent>

            <TabsContent value="usuarios" className="flex-1 min-h-0 overflow-hidden">
              <UserList 
                allUsers={allUsers}
                currentUser={user}
                createChat={createChat}
              />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Área principal de chat */}
        <div className={`flex-1 relative transition-all duration-300 ease-in-out h-full ${selectedChat ? 'block' : 'hidden md:block'}`}>
          {selectedChat ? (
            <WhatsAppStyleChat
              chat={selectedChat}
              user={user}
              onBack={() => { setSelectedChat(null); setSidebarOpen(true) }}
              onSendMessage={sendMessage}
              isSending={isSending}
              otherUserTyping={otherUserTyping}
            />
          ) : (
            <ChatEmptyState setActiveTab={setActiveTab} />
          )}
        </div>
      </div>

      {/* Bottom navigation (diseño incluido) */}
      <BottomNavigation />
    </div>
  )
}
