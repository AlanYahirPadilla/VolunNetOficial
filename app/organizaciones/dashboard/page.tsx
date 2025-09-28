"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Heart, Home, Calendar, Users, Bell, LogOut, User, Settings, PlusCircle, CheckCircle, Star, MessageCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/app/auth/actions"
import { ChatList } from "@/components/chat/ChatList"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatInvitations } from "@/components/chat/ChatInvitations"
import { ChatNotificationManager } from "@/components/notifications/ChatNotificationManager"
import { NotificationTest } from "@/components/notifications/NotificationTest"
import { NotificationDebugPanel } from "@/components/notifications/NotificationDebugPanel"
import { MessageSimulator } from "@/components/notifications/MessageSimulator"

// Forzar que esta página sea dinámica
export const dynamic = 'force-dynamic'
import { useRouter, useSearchParams } from "next/navigation"

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  city: string
  state: string
  country: string
  status: string
  maxVolunteers: number
  currentVolunteers: number
  category_name: string
  organization_name: string
}

// Mock de eventos del organizador
const mockEvents = [
  {
    id: "org-1",
    title: "Jornada de Donación de Sangre",
    description: "Organiza una jornada de donación en tu comunidad.",
    date: "2024-07-10",
    city: "Guadalajara",
    state: "Jalisco",
    postulaciones: 5,
    status: "Activo",
  },
  {
    id: "org-2",
    title: "Recolección de Ropa de Invierno",
    description: "Campaña para recolectar ropa para personas vulnerables.",
    date: "2024-08-01",
    city: "Zapopan",
    state: "Jalisco",
    postulaciones: 2,
    status: "Activo",
  },
]

const mockPostulaciones = [
  {
    id: "post-1",
    event: "Jornada de Donación de Sangre",
    postulante: "Ana Martínez",
    estado: "Pendiente",
  },
  {
    id: "post-2",
    event: "Recolección de Ropa de Invierno",
    postulante: "Carlos Ruiz",
    estado: "Aceptado",
  },
]

// Mock de datos de organización
const mockOrganization = {
  name: "Social new",
  averageRating: 4.5,
}

const mockStats = {
  totalEventos: 2,
  postulaciones: 7,
  voluntarios: 5,
  averageRating: 4.5,
}

function UserMenu({ organizationName, organizationEmail , organizationAvatar}: { organizationName: string, organizationEmail: string  , organizationAvatar?: string}) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden">
          {organizationAvatar ? (
            <img 
              src={organizationAvatar} 
              alt="Avatar organización" 
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                // Si la imagen falla al cargar, mostrar la inicial
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement!;
                parent.innerHTML = organizationName?.[0] || 'O';
              }}
            />
          ) : (
            organizationName?.[0] || 'O'
          )}
        </div>
        <span className="text-sm font-medium text-gray-700">{organizationName}</span>
        <Settings className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <motion.div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{organizationName}</p>
            <p className="text-xs text-gray-500">{organizationEmail}</p>
          </div>
          <Link href="/organizaciones/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Perfil
          </Link>
          <Link href="/notificaciones" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Notificaciones
          </Link>
          <Link href="/organizaciones/comunidad" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Comunidad
          </Link>
          <Link href="/organizaciones/configuracion" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Configuración
          </Link>
          <div className="border-t border-gray-100 mt-2 pt-2">
            <button 
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" })
                window.location.href = "/"
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function OrganizadorDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <OrganizadorDashboardContent />
    </Suspense>
  )
}

function OrganizadorDashboardContent() {
  const [tab, setTab] = useState("mis-eventos")
  const [organizationName, setOrganizationName] = useState(mockOrganization.name)
  const [organizationEmail, setOrganizationEmail] = useState("")
  const [organizationAvatar, setOrganizationAvatar] = useState("") // Agregado estado para avatar
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [stats, setStats] = useState({
    totalEventos: 0,
    postulaciones: 0,
    voluntarios: 0,
    averageRating: 4.5,
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
        const fetchUserData = async () => {
    try {
      const user = await getCurrentUser()
      if (user?.firstName) setOrganizationName(user.firstName)
      if (user?.email) setOrganizationEmail(user.email)
      if ((user as any)?.avatar) {
        console.log("Avatar found in user data:", (user as any).avatar)
        setOrganizationAvatar((user as any).avatar)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  fetchUserData()
  }, [])

  // Detectar el parámetro tab de la URL y cambiar la pestaña automáticamente
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab')
    if (tabFromUrl && ['mis-eventos', 'postulaciones', 'estadisticas', 'notificaciones', 'comunidad'].includes(tabFromUrl)) {
      setTab(tabFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    // Cargar eventos del organizador
    const fetchEvents = async () => {
      try {
        setLoading(true)
        
        // Obtener el usuario actual para conseguir su organización
        const user = await getCurrentUser()
        if (!user) {
          console.error('No user found')
          return
        }

        // Obtener la organización del usuario
        let organizationId = null
        
        try {
          // Intentar primero con la ruta /me
          let orgResponse = await fetch('/api/organizations/me')
          console.log('Organization /me API response status:', orgResponse.status)
          
          if (orgResponse.ok) {
            const orgData = await orgResponse.json()
            console.log('Organization data from /me:', orgData)
            
            if (orgData.organization) {
              organizationId = orgData.organization.id
            }
          } else {
            console.log('Trying alternative route /api/organizations')
            // Intentar con la ruta alternativa
            orgResponse = await fetch('/api/organizations')
            console.log('Organization alternative API response status:', orgResponse.status)
            
            if (orgResponse.ok) {
              const orgData = await orgResponse.json()
              console.log('Organization data from alternative route:', orgData)
              
              if (orgData.organization) {
                organizationId = orgData.organization.id
              }
            } else {
              console.error('Both organization APIs failed')
            }
          }
        } catch (error) {
          console.error('Error fetching organization:', error)
        }
        
        // Si no se pudo obtener la organización, usar un ID por defecto para demo
        if (!organizationId) {
          console.log('Using default organization ID for demo')
          organizationId = 'org_1' // ID por defecto para demo
        }
        
        // Cargar eventos de la organización
        const response = await fetch(`/api/eventos?organizationId=${organizationId}&includeDrafts=1&upcomingOnly=0`)
        console.log('Events API response status:', response.status)
        const data = await response.json()
        console.log('Events API response data:', data)
        
        if (data?.events && Array.isArray(data.events)) {
          console.log('Processing events array with length:', data.events.length)
          const realEvents = data.events.map((e: any) => ({
            id: e.id,
            title: e.title,
            description: e.description,
            startDate: e.startDate || e.start_date,
            endDate: e.endDate || e.end_date,
            city: e.city,
            state: e.state,
            country: e.country,
            status: e.status,
            maxVolunteers: e.maxVolunteers || e.max_volunteers || 10,
            currentVolunteers: e.currentVolunteers || e.current_volunteers || 0,
            category_name: e.category_name,
            organization_name: e.organization_name,
          }))
          
          console.log('Processed events:', realEvents)
          setEvents(realEvents)
          
          // Actualizar estadísticas basadas en eventos reales
          const totalEventos = realEvents.length
          const totalPostulaciones = realEvents.reduce((sum: number, event: Event) => sum + event.currentVolunteers, 0)
          const totalVoluntarios = realEvents.reduce((sum: number, event: Event) => sum + event.currentVolunteers, 0)
          
          setStats({
            totalEventos,
            postulaciones: totalPostulaciones,
            voluntarios: totalVoluntarios,
            averageRating: 4.5, // Mantener rating por ahora
          })
        } else {
          console.log('No events found or invalid response structure:', data)
          // Si no hay eventos, establecer array vacío
          setEvents([])
          setStats({
            totalEventos: 0,
            postulaciones: 0,
            voluntarios: 0,
            averageRating: 4.5,
          })
        }
      } catch (error) {
        console.error('Error loading events:', error)
        // Si falla, usar datos mock como fallback
        setEvents([
          {
            id: "evt_me3jwb6h2sccxn",
            title: "Jornada de Donación de Sangre",
            description: "Organiza una jornada de donación en tu comunidad.",
            startDate: "2024-07-10",
            endDate: "2024-07-11",
            city: "Guadalajara",
            state: "Jalisco",
            country: "México",
            status: "PUBLISHED",
            maxVolunteers: 10,
            currentVolunteers: 5,
            category_name: "Salud",
            organization_name: "Social new",
          },
          {
            id: "evt_me3jwb6h2sccxn2",
            title: "Recolección de Ropa de Invierno",
            description: "Campaña para recolectar ropa para personas vulnerables.",
            startDate: "2024-08-01",
            endDate: "2024-08-02",
            city: "Zapopan",
            state: "Jalisco",
            country: "México",
            status: "PUBLISHED",
            maxVolunteers: 15,
            currentVolunteers: 2,
            category_name: "Social",
            organization_name: "Social new",
          },
        ])
        
        // Actualizar estadísticas con datos mock
        setStats({
          totalEventos: 2,
          postulaciones: 7,
          voluntarios: 7,
          averageRating: 4.5,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Cargar notificaciones no leídas
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications/user')
        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error('Error loading notifications:', error)
      }
    }

    fetchNotifications()
  }, [])

  // Actualizar estadísticas basadas en eventos reales
  useEffect(() => {
    setStats(prev => ({ ...prev, totalEventos: events.length }))
  }, [events])

  const getStatusBadge = (status: string, startDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    
    // Sistema de estados mejorado
    if (status === 'DRAFT') return { text: 'Borrador', color: 'bg-gray-100 text-gray-700' }
    if (status === 'CANCELLED') return { text: 'Cancelado', color: 'bg-red-100 text-red-700' }
    
    if (status === 'PUBLISHED') {
      if (start > now) {
        const daysUntilStart = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return { text: `Próximo (${daysUntilStart}d)`, color: 'bg-yellow-100 text-yellow-700' }
      } else {
        return { text: 'Iniciando', color: 'bg-blue-100 text-blue-700' }
      }
    }
    
    if (status === 'ONGOING') return { text: 'En Proceso', color: 'bg-green-100 text-green-700' }
    if (status === 'COMPLETED') return { text: 'Completado', color: 'bg-purple-100 text-purple-700' }
    if (status === 'ARCHIVED') return { text: 'Archivado', color: 'bg-gray-100 text-gray-700' }
    
    return { text: status, color: 'bg-gray-100 text-gray-700' }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <ChatNotificationManager />
      <NotificationTest />
      <NotificationDebugPanel />
      <MessageSimulator />
      {/* Header superior */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VolunNet</span>
          </div>
          {/* Navegación */}
          <div className="flex-1 mx-8 max-w-xl">
              <input
                type="text"
                placeholder="Buscar eventos, organizaciones..."
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-700 shadow-sm"
              />
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex gap-2 text-gray-600 text-sm font-medium">
              <Link 
                href="/organizaciones/dashboard" 
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition group relative ${
                  tab === "mis-eventos" 
                    ? "text-blue-700 bg-blue-50 border-b-2 border-blue-600" 
                    : "hover:text-blue-700 hover:bg-blue-50"
                }`}
                onClick={() => setTab("mis-eventos")}
              >
                <Home className={`h-5 w-5 transition ${
                  tab === "mis-eventos" ? "text-blue-700" : "group-hover:text-blue-700"
                }`} />
                <span>Inicio</span>
              </Link>
              <Link 
                href="/notificaciones" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative"
              >
                <Bell className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Notificaciones</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link 
                href="/organizaciones/comunidad" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group"
              >
                <MessageCircle className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Comunidad</span>
              </Link>
              <Link 
                href="/organizaciones/eventos-finalizados" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg transition group relative hover:text-blue-700 hover:bg-blue-50"
              >
                <CheckCircle className="h-5 w-5 transition group-hover:text-blue-700" />
                <span>Eventos Finalizados</span>
              </Link>
            </nav>
            {/* Separador visual */}
            <div className="w-px h-8 bg-gray-200 mx-2" />
            {/* Avatar usuario con menú */}
            <UserMenu organizationName={organizationName} organizationEmail={organizationEmail} organizationAvatar={organizationAvatar}/>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr_minmax(0,320px)] gap-8">
          {/* Sidebar izquierda */}
          <div className="space-y-6">
            {/* Tarjeta de perfil */}
            <motion.div
              className="bg-white rounded-3xl shadow-lg border border-blue-50 p-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold mb-3">
                  {organizationAvatar ? (
                    <img 
                      src={organizationAvatar} 
                      alt="Avatar de organización" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{organizationName?.[0] || 'O'}</span>
                  )}
                </div>
                <div className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-semibold mb-2">
                  Organizador
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{organizationName}</h3>
                <p className="text-gray-500 text-sm mb-3">{organizationEmail}</p>
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm font-semibold text-gray-700">{stats.averageRating}</span>
                </div>
                <Link href="/organizaciones/perfil" className="text-blue-600 text-sm font-medium hover:text-blue-700 transition">
                  Panel de Control
                </Link>
              </div>
              {/* Estadísticas rápidas */}
              <div className="flex justify-between mt-6 pt-6 border-t border-gray-100">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-blue-600 text-base">{stats.totalEventos}</span>
                  <span className="text-gray-500">Eventos</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-green-600 text-base">{stats.postulaciones}</span>
                  <span className="text-gray-500">Postulaciones</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-purple-700 text-base">{stats.voluntarios}</span>
                  <span className="text-gray-500">Voluntarios</span>
                </div>
              </div>
            </motion.div>
            {/* Tarjeta de estadísticas debajo */}
            <Card className="bg-white rounded-2xl shadow-lg border border-blue-50 mt-6">
              <CardHeader>
                <CardTitle>Estadísticas de la Organización</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 text-sm">
                  <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-2 text-blue-700 font-medium">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Eventos creados
                    </span>
                    <span className="font-bold text-blue-700 bg-blue-100 rounded px-2 py-0.5">{stats.totalEventos}</span>
                  </div>
                  <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-2 text-green-700 font-medium">
                      <Users className="h-4 w-4 text-green-500" />
                      Postulaciones recibidas
                    </span>
                    <span className="font-bold text-green-700 bg-green-100 rounded px-2 py-0.5">{stats.postulaciones}</span>
                  </div>
                  <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-2 text-violet-700 font-medium">
                      <User className="h-4 w-4 text-violet-500" />
                      Voluntarios únicos
                    </span>
                    <span className="font-bold text-violet-700 bg-purple-100 rounded px-2 py-0.5">{stats.voluntarios}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna central: Tabs */}
          <div className="space-y-6">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="w-full bg-gray-50 border rounded-lg mb-4">
                <TabsTrigger value="mis-eventos" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Mis Eventos</TabsTrigger>
                <TabsTrigger value="postulaciones" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Postulaciones</TabsTrigger>
                <TabsTrigger value="estadisticas" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Estadísticas</TabsTrigger>
                <TabsTrigger value="notificaciones" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white relative">
                  Notificaciones
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="comunidad" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Comunidad</TabsTrigger>
              </TabsList>
              <TabsContent value="mis-eventos">
                <div className="flex justify-end mb-4 gap-2">
                  <Button 
                    className="flex items-center gap-2 bg-white text-blue-700 border border-blue-200 hover:bg-blue-50"
                    onClick={() => router.push('/eventos/buscar')}
                  >
                    Buscar eventos
                  </Button>
                  <Button 
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    onClick={() => router.push('/eventos/crear')}
                  >
                    <PlusCircle className="h-5 w-5" /> Crear Evento
                  </Button>
                </div>
                <div className="space-y-5">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Cargando eventos...</p>
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="bg-white rounded-2xl shadow-lg border border-blue-50 p-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes eventos aún</h3>
                        <p className="text-gray-600 mb-4">Crea tu primer evento para comenzar a recibir voluntarios</p>
                        <Button 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={() => router.push('/eventos/crear')}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Crear mi primer evento
                        </Button>
                      </div>
                    </div>
                  ) : (
                    events.map((event, index) => {
                      const statusBadge = getStatusBadge(event.status, event.startDate)
                      return (
                        <motion.div
                          key={event.id}
                          className="bg-white rounded-3xl shadow-lg border border-blue-50 p-7 flex flex-col gap-3"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ scale: 1.025 }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl mr-1">🏢</span>
                            <span className="font-bold text-blue-700 text-lg leading-tight">{event.title}</span>
                            <span className={`text-xs rounded px-2 py-0.5 ml-2 font-semibold ${statusBadge.color}`}>
                              {statusBadge.text}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            {formatDate(event.startDate)} - {event.city}, {event.state}
                          </div>
                          <div className="text-sm text-gray-700 mb-2 line-clamp-2">{event.description}</div>
                          <div className="flex items-center gap-4 text-xs mb-2">
                            <span className="text-green-600 font-semibold flex items-center gap-1">
                              <Users className="h-3 w-3 text-green-500" />
                              {event.currentVolunteers} postulaciones
                            </span>
                            <span className="text-gray-500">
                              {event.currentVolunteers}/{event.maxVolunteers} voluntarios
                            </span>
                            {event.currentVolunteers > 0 && (
                              <span className="text-blue-600 font-semibold flex items-center gap-1">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                {event.currentVolunteers} pendiente{event.currentVolunteers !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button 
                              size="sm" 
                              className="rounded-full px-5 py-2 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm hover:from-blue-700 hover:to-purple-700 transition-all"
                              onClick={() => router.push(`/organizaciones/eventos/${event.id}/detalles`)}
                            >
                              Ver Detalles
                            </Button>
                            {event.currentVolunteers > 0 && (
                              <Button 
                                size="sm" 
                                className="rounded-full px-5 py-2 font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all"
                                onClick={() => router.push(`/organizaciones/eventos/${event.id}/gestionar`)}
                              >
                                <Users className="h-4 w-4 mr-1" />
                                Gestionar
                              </Button>
                            )}
                            {event.status === 'COMPLETED' && (
                              <Button 
                                size="sm" 
                                className="rounded-full px-5 py-2 font-semibold text-white bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 transition-all"
                                onClick={() => router.push(`/organizaciones/eventos/${event.id}/calificar`)}
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Calificar
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="rounded-full px-5 py-2 font-semibold border-gray-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all"
                              onClick={() => router.push(`/eventos/editar/${event.id}`)}
                            >
                              Editar
                            </Button>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </TabsContent>
              <TabsContent value="postulaciones">
                <div className="space-y-5">
                  {/* Header con botón de gestión */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Gestión de Postulaciones</h3>
                      <p className="text-gray-600">Revisa y gestiona las aplicaciones de voluntarios para tus eventos</p>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={() => router.push('/eventos')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Ver Todos los Eventos
                    </Button>
                  </div>

                  {/* Resumen de postulaciones por evento */}
                  {events.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="bg-white rounded-2xl shadow-lg border border-blue-50 p-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay eventos para gestionar</h3>
                        <p className="text-gray-600 mb-4">Crea eventos para comenzar a recibir postulaciones de voluntarios</p>
                        <Button 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={() => router.push('/eventos/crear')}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Crear Evento
                        </Button>
                      </div>
                    </div>
                  ) : (
                    events.map((event, index) => {
                      const hasApplications = event.currentVolunteers > 0
                      return (
                        <motion.div
                          key={event.id}
                          className="bg-white rounded-3xl shadow-lg border border-blue-50 p-6"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">🎯</span>
                                <h4 className="font-semibold text-gray-900 text-lg">{event.title}</h4>
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                  event.status === 'PUBLISHED' 
                                    ? 'bg-green-100 text-green-700' 
                                    : event.status === 'DRAFT'
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {event.status === 'PUBLISHED' ? 'Activo' : event.status === 'DRAFT' ? 'Borrador' : event.status}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-blue-400" />
                                  {formatDate(event.startDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-green-400" />
                                  {event.currentVolunteers}/{event.maxVolunteers} voluntarios
                                </span>
                              </div>

                              <div className="text-sm text-gray-700 mb-4 line-clamp-2">{event.description}</div>
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              {hasApplications ? (
                                <Button 
                                size="sm" 
                                className="rounded-full px-5 py-2 font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all"
                                onClick={() => router.push(`/organizaciones/eventos/${event.id}/gestionar`)}
                                >
                                  <Users className="h-4 w-4 mr-1" />
                                  Gestionar
                                  </Button>

                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="rounded-full px-4 py-2 font-semibold border-gray-300 text-gray-600 bg-gray-50 cursor-not-allowed"
                                  disabled
                                >
                                  <Users className="h-4 w-4 mr-2" />
                                  Sin Postulaciones
                                </Button>
                              )}
                              
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="rounded-full px-4 py-2 font-semibold border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all"
                                onClick={() => router.push(`/organizaciones/eventos/${event.id}/detalles`)}
                              >
                                Ver Detalles
                              </Button>
                            </div>
                          </div>

                          {/* Indicador de estado de postulaciones */}
                          {hasApplications && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  {event.currentVolunteers} postulación{event.currentVolunteers !== 1 ? 'es' : ''} pendiente{event.currentVolunteers !== 1 ? 's' : ''} de revisión
                                </span>
                                <span className="text-xs text-blue-600 font-medium">
                                  ¡Revisa pronto para no perder voluntarios!
                                </span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </TabsContent>
              <TabsContent value="estadisticas">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white rounded-2xl shadow-lg border border-blue-50">
                    <CardHeader>
                      <CardTitle>Eventos por Estado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Activos</span>
                          <span className="font-semibold text-blue-600">2</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Borradores</span>
                          <span className="font-semibold text-gray-600">1</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Cancelados</span>
                          <span className="font-semibold text-red-600">0</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white rounded-2xl shadow-lg border border-blue-50">
                    <CardHeader>
                      <CardTitle>Postulaciones Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Esta semana</span>
                          <span className="font-semibold text-green-600">3</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Este mes</span>
                          <span className="font-semibold text-blue-600">7</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total</span>
                          <span className="font-semibold text-purple-600">12</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="notificaciones">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Notificaciones</h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = '/notificaciones'}
                    >
                      Ver todas
                    </Button>
                  </div>
                  
                  <Card className="bg-white rounded-2xl shadow-lg border border-blue-50">
                    <CardContent className="p-6">
                      <div className="text-center py-12">
                        <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Notificaciones de tu organización
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Aquí verás notificaciones sobre nuevas postulaciones, cambios en tus eventos y mensajes de voluntarios.
                        </p>
                        <Button onClick={() => window.location.href = '/notificaciones'}>
                          Ver Centro de Notificaciones
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="comunidad">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Comunidad</h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = '/organizaciones/comunidad'}
                    >
                      Ver comunidad completa
                    </Button>
                  </div>
                  
                  {selectedChat ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedChat(null)}
                          className="flex items-center gap-2"
                        >
                          ← Volver a chats
                        </Button>
                        <h3 className="text-lg font-semibold">Chat activo</h3>
                      </div>
                      <ChatInterface chat={selectedChat} onClose={() => setSelectedChat(null)} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <ChatList 
                        onChatSelect={setSelectedChat}
                        onCreateChat={() => window.location.href = '/organizaciones/comunidad'}
                      />
                      <ChatInvitations 
                        onInvitationAccepted={() => {}}
                        onInvitationDeclined={() => {}}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Columna derecha: espacio para widgets futuros */}
          <div className="space-y-6">
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6 border border-blue-50 flex flex-col items-center justify-center min-h-[200px]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.13 }}
              whileHover={{ scale: 1.025 }}
            >
              <div className="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-400" />
                Notificaciones
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div className="text-gray-500 text-xs text-center mb-4">
                {unreadCount > 0 
                  ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
                  : "No tienes notificaciones nuevas"
                }
              </div>
              <Button 
                size="sm" 
                onClick={() => window.location.href = '/notificaciones'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Ver todas
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
