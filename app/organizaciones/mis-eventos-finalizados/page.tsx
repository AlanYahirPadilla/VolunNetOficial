"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, MapPin, Users, Eye, CheckCircle, Heart, Home, Bell, MessageCircle, Settings, User, LogOut, Award, Star } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { getCurrentUser } from "@/app/auth/actions"

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

function UserMenu({ userName, userEmail, userAvatar }: { userName: string, userEmail: string, userAvatar?: string }) {
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
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt="Avatar usuario" 
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement!;
                parent.innerHTML = userName?.[0] || 'U';
              }}
            />
          ) : (
            userName?.[0] || 'U'
          )}
        </div>
        <span className="text-sm font-medium text-gray-700">{userName}</span>
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
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userEmail}</p>
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

export default function MisEventosFinalizadosPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userAvatar, setUserAvatar] = useState("")

  useEffect(() => {
    loadUser()
    loadEvents()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        if (currentUser.firstName) setUserName(currentUser.firstName)
        if (currentUser.email) setUserEmail(currentUser.email)
        if ((currentUser as any)?.avatar) {
          setUserAvatar((currentUser as any).avatar)
        }
      }
    } catch (error) {
      console.error("Error loading user:", error)
    }
  }

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener el usuario actual para conseguir su organización
      const user = await getCurrentUser()
      if (!user) {
        console.error('No user found')
        setError("Usuario no encontrado")
        return
      }

      // Obtener la organización del usuario
      let organizationId = null
      
      try {
        // Intentar primero con la ruta /me
        let orgResponse = await fetch('/api/organizations/me')
        
        if (orgResponse.ok) {
          const orgData = await orgResponse.json()
          organizationId = orgData?.organization?.id || orgData?.id
        }
      } catch (error) {
        console.log('Error fetching organization /me, using default')
      }
      
      if (!organizationId) {
        console.log('Using default organization ID for demo')
        organizationId = 'org_1' // ID por defecto para demo
      }
      
      // Cargar eventos de la organización
      const response = await fetch(`/api/eventos?organizationId=${organizationId}&includeDrafts=1&upcomingOnly=0`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data?.events && Array.isArray(data.events)) {
          const allEvents = data.events.map((e: any) => ({
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
          
          // Filtrar solo eventos completados
          const completedEvents = allEvents.filter(event => event.status === 'COMPLETED')
          setEvents(completedEvents)
        } else {
          setEvents([])
        }
      } else {
        setError("Error al cargar los eventos finalizados")
      }
    } catch (error) {
      console.error("Error loading completed events:", error)
      setError("Error al cargar los eventos finalizados")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCompletionRate = (current: number, max: number) => {
    return Math.round((current / max) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando eventos finalizados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header superior con navegación completa */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VolunNet</span>
          </div>
          
          {/* Navegación - Oculto en móviles pequeños */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-2 text-gray-600 text-sm font-medium">
              <Link 
                href="/organizaciones/dashboard" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg transition group relative hover:text-blue-700 hover:bg-blue-50"
              >
                <Home className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Inicio</span>
              </Link>
              <Link 
                href="/notificaciones" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative"
              >
                <Bell className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Notificaciones</span>
              </Link>
              <Link 
                href="/organizaciones/comunidad" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group"
              >
                <MessageCircle className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Comunidad</span>
              </Link>
            </nav>
            {/* Separador visual */}
            <div className="w-px h-8 bg-gray-200 mx-2" />
            {/* Avatar usuario con menú */}
            <UserMenu userName={userName} userEmail={userEmail} userAvatar={userAvatar}/>
          </div>

          {/* Menú móvil - Solo avatar en pantallas pequeñas */}
          <div className="md:hidden">
            <UserMenu userName={userName} userEmail={userEmail} userAvatar={userAvatar}/>
          </div>
        </div>
      </div>

      {/* Header específico de la página */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/organizaciones/dashboard')} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Volver al Dashboard</span>
                <span className="sm:hidden">Volver</span>
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-purple-600" />
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Mis Eventos Finalizados</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => router.push('/organizaciones/mis-eventos')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <Calendar className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Ver Todos</span>
                <span className="sm:hidden">Todos</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}

        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Award className="h-16 w-16 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-800 to-blue-800 bg-clip-text text-transparent mb-6">No tienes eventos finalizados</h3>
            <p className="text-gray-600 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
              Los eventos que completes aparecerán aquí. ¡Comienza creando eventos y haz que sucedan cosas increíbles!
            </p>
            <Button 
              onClick={() => router.push('/organizaciones/mis-eventos')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 group px-8 py-3 text-lg"
            >
              <Calendar className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Ver mis eventos
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Card className="relative bg-gradient-to-br from-white via-purple-50/40 to-blue-50/40 rounded-2xl shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Elementos decorativos */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full -translate-y-10 translate-x-10"></div>
                  
                  <CardHeader className="relative z-10 bg-gradient-to-r from-purple-50/60 to-blue-50/60 border-b border-purple-100/50 p-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-800 to-blue-800 bg-clip-text text-transparent leading-tight">
                        {event.title}
                      </CardTitle>
                      <div className="ml-3 flex-shrink-0">
                        <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200 shadow-sm text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completado
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative z-10 p-4 space-y-4">
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{event.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span>{event.city}, {event.state}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>{event.currentVolunteers}/{event.maxVolunteers} voluntarios</span>
                      </div>
                    </div>
                    
                    {/* Barra de progreso de participación */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Participación</span>
                        <span className="font-semibold text-purple-600">{getCompletionRate(event.currentVolunteers, event.maxVolunteers)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${getCompletionRate(event.currentVolunteers, event.maxVolunteers)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs px-2 py-1 h-7"
                          onClick={() => router.push(`/organizaciones/eventos/${event.id}/detalles`)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver Detalles
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs px-2 py-1 h-7"
                          onClick={() => router.push(`/organizaciones/eventos/${event.id}/calificar`)}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Calificar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
