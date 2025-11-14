"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Heart, MapPin, Calendar, Users, Clock, Building, Star, ArrowLeft, Share2, Bookmark, Phone, Mail, Globe, Edit, Users as UsersIcon, CheckCircle, Home, Bell, MessageCircle, Settings, TrendingUp, Award, Target, Zap, Eye, BarChart3, Activity, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/app/auth/actions"
import { EventStatusControl } from "@/components/EventStatusControl"
import { EventCompletionButton } from "@/components/EventCompletionButton"

// Interfaces del archivo original
interface Event {
  id: string
  title: string
  description: string
  organization_name: string
  organization_verified: boolean
  city: string
  state: string
  country: string
  address: string
  startDate: string
  endDate: string
  maxVolunteers: number
  currentVolunteers: number
  category_name: string
  category_icon: string
  category_color: string
  skills: string[]
  requirements: string[]
  benefits: string[]
  status: string
  imageUrl?: string
  latitude?: number
  longitude?: number
  organizationId?: string
}

interface Organization {
  name: string
  description?: string
  email?: string
  phone?: string
  website?: string
  verified: boolean
  rating?: number
  totalEvents?: number
}

function UserMenu({ organizationName, organizationEmail, organizationAvatar }: { organizationName: string, organizationEmail: string, organizationAvatar?: string }) {
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
                // await fetch("/api/auth/logout", { method: "POST" }) // Asumiendo que esta es la acción de logout
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

export default function OrganizadorEventDetails() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isEventOwner, setIsEventOwner] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [organizationName, setOrganizationName] = useState("")
  const [organizationEmail, setOrganizationEmail] = useState("")
  const [organizationAvatar, setOrganizationAvatar] = useState("")

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser && currentUser.role === 'ORGANIZATION') {
          setUser(currentUser)
          if (currentUser.firstName) setOrganizationName(currentUser.firstName)
          if (currentUser.email) setOrganizationEmail(currentUser.email)
          if ((currentUser as any)?.avatar) {
            setOrganizationAvatar((currentUser as any).avatar)
          }
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
    loadUser()
  }, [router])

  useEffect(() => {
    if (params.id && user) {
      fetchEventDetails()
    }
  }, [params.id, user])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Obtener detalles del evento
      const response = await fetch(`/api/events/${params.id}`)
      if (!response.ok) {
        throw new Error('Error al cargar el evento')
      }
      
      const data = await response.json()
      if (!data.event) {
        throw new Error('Evento no encontrado')
      }

      setEvent(data.event)
      
      // Verificar si el usuario es dueño del evento
      if (user && user.role === 'ORGANIZATION') {
        const orgResponse = await fetch('/api/organizations/me')
        if (orgResponse.ok) {
          const orgData = await orgResponse.json()
          
          // Verificar por ID de organización (más confiable)
          if (orgData.organization && data.event.organizationId === orgData.organization.id) {
            console.log("✅ Usuario ES dueño del evento (por ID)")
            setIsEventOwner(true)
          } else {
            // Fallback: comparar nombres
            const eventOrgName = data.event.organization_name?.toLowerCase().trim()
            const userOrgName = orgData.organization?.name?.toLowerCase().trim()
            
            if (eventOrgName === userOrgName) {
              console.log("✅ Usuario ES dueño del evento (por nombre)")
              setIsEventOwner(true)
            } else {
              console.log("❌ Usuario NO es dueño del evento")
              setIsEventOwner(false)
            }
          }
        }
      }
      
    } catch (error) {
      console.error("Error fetching event details:", error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToDashboard = () => {
    router.push('/organizaciones/dashboard')
  }

  const handleEditEvent = () => {
    router.push(`/eventos/editar/${params.id}`)
  }

  const handleManageApplications = () => {
    router.push(`/organizaciones/eventos/${params.id}/postulaciones`)
  }

  const handleStatusChange = (newStatus: string) => {
    if (event) {
      setEvent({ ...event, status: newStatus })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeUntilEvent = (dateString: string) => {
    const now = new Date()
    const eventDate = new Date(dateString)
    const diffTime = eventDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return "Evento pasado"
    if (diffDays === 0) return "Hoy"
    if (diffDays === 1) return "Mañana"
    if (diffDays < 7) return `En ${diffDays} días`
    if (diffDays < 30) return `En ${Math.floor(diffDays / 7)} semanas`
    return `En ${Math.floor(diffDays / 30)} meses`
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
      'PUBLISHED': { label: 'Publicado', color: 'bg-blue-100 text-blue-700' },
      'ONGOING': { label: 'En Proceso', color: 'bg-green-100 text-green-700' },
      'COMPLETED': { label: 'Completado', color: 'bg-purple-100 text-purple-700' },
      'ARCHIVED': { label: 'Archivado', color: 'bg-gray-100 text-gray-700' },
      'CANCELLED': { label: 'Cancelado', color: 'bg-red-100 text-red-700' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-700' }
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando evento...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleBackToDashboard}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Evento no encontrado</p>
          <Button onClick={handleBackToDashboard}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!isEventOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No tienes permisos para ver este evento</p>
          <Button onClick={handleBackToDashboard}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header superior con navegación completa (se mantiene) */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VolunNet</span>
          </div>
          
          {/* Navegación y menú de usuario */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-2 text-gray-600 text-sm font-medium">
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
              <Link 
                href="/organizaciones/eventos-finalizados" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg transition group relative hover:text-blue-700 hover:bg-blue-50"
              >
                <CheckCircle className="h-5 w-5 transition group-hover:text-blue-700" />
                <span>Eventos Finalizados</span>
              </Link>
            </nav>
            {/* Separador visual */}
            <div className="w-px h-8 bg-gray-200 mx-2 hidden md:block" />
            {/* Avatar usuario con menú */}
            <UserMenu organizationName={organizationName} organizationEmail={organizationEmail} organizationAvatar={organizationAvatar}/>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Título de la página estilo imagen - AHORA SIN BOTONES, SOLO TÍTULO CENTRADO */}
        <div className="text-center pb-10 pt-4">
            {/* Div que contenía los botones "Volver" y "Editar" ha sido vaciado */}
            <div className="flex justify-center items-center mb-4 max-w-4xl mx-auto h-8">
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2 leading-none max-w-4xl mx-auto" style={{
                background: 'linear-gradient(to right, #3b82f6, #9333ea)', /* Gradiente azul a morado */
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 10px rgba(147, 51, 234, 0.3)', /* Sombra sutil morada */
                filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.1))'
            }}>
                Detalles del Evento
            </h1>
            <p className="text-lg text-gray-600">
                Gestione y revise la información completa de su evento de voluntariado.
            </p>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del evento - Diseño mejorado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl shadow-xl border border-blue-100/50 p-6 sm:p-10 hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              {/* Elementos decorativos de fondo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-200/20 to-blue-200/20 rounded-full translate-y-12 -translate-x-12"></div>
              
              {/* Header con badges mejorados */}
              <div className="relative flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-lg">
                    <span className="text-3xl">{event.category_icon}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Badge className={`${event.category_color} px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-shadow`}>
                      <Sparkles className="h-4 w-4 mr-1" />
                      {event.category_name}
                    </Badge>
                    {getStatusBadge(event.status)}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <Button variant="outline" size="sm" className="hover:bg-blue-50">
                    <Eye className="h-4 w-4 mr-2" />
                    Vista previa
                  </Button>
                  <Button variant="outline" size="sm" className="hover:bg-green-50">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                </div>
              </div>

              {/* Título y descripción mejorados */}
              <div className="relative mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4 leading-tight">
                  {event.title}
                </h1>
                <p className="text-gray-700 text-lg sm:text-xl leading-relaxed max-w-4xl">
                  {event.description}
                </p>
              </div>

              {/* Grid de información simplificado - **APLICACIÓN DE HOVER Y SOMBRA MEJORADA** */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{formatDate(event.startDate)}</p>
                      <p className="text-xs text-gray-600">{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{event.city}, {event.state}</p>
                      <p className="text-xs text-gray-600">{event.address}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {event.currentVolunteers}/{event.maxVolunteers} voluntarios
                      </p>
                      <p className="text-xs text-gray-600">
                        {event.maxVolunteers - event.currentVolunteers} cupos disponibles
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{getTimeUntilEvent(event.startDate)}</p>
                      <p className="text-xs text-gray-600">Tiempo restante</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de progreso simplificada */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Progreso de Voluntarios
                  </h3>
                  <span className="text-sm font-semibold text-gray-600">
                    {Math.round((event.currentVolunteers / event.maxVolunteers) * 100)}% completado
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(event.currentVolunteers / event.maxVolunteers) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{event.currentVolunteers} voluntarios registrados</span>
                  <span>{event.maxVolunteers - event.currentVolunteers} cupos disponibles</span>
                </div>
              </div>
            </motion.div>

            {/* Detalles del evento - Diseño mejorado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-3xl shadow-xl border border-purple-100/50 p-6 sm:p-10 hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              {/* Elementos decorativos */}
              <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full -translate-y-14 -translate-x-14"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 rounded-full translate-y-10 translate-x-10"></div>
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-800 to-pink-800 bg-clip-text text-transparent">
                    Detalles del Evento
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Habilidades requeridas */}
                  {event.skills && event.skills.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Habilidades Requeridas</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {event.skills.map((skill, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                          >
                            <Badge variant="secondary" className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200 hover:shadow-md transition-shadow">
                              {skill}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requisitos */}
                  {event.requirements && event.requirements.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Requisitos</h3>
                      </div>
                      <ul className="space-y-3">
                        {event.requirements.map((requirement, index) => (
                          <motion.li 
                            key={index} 
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                          >
                            <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm leading-relaxed">{requirement}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Beneficios */}
                  {event.benefits && event.benefits.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                          <Award className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Beneficios</h3>
                      </div>
                      <ul className="space-y-3">
                        {event.benefits.map((benefit, index) => (
                          <motion.li 
                            key={index} 
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                          >
                            <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm leading-relaxed">{benefit}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Control de estado del evento */}
            {isEventOwner && (
              <EventStatusControl
                eventId={event.id}
                currentStatus={event.status}
                startDate={event.startDate}
                endDate={event.endDate}
                onStatusChange={handleStatusChange}
                isEventOwner={isEventOwner}
              />
            )}

            {/* Botón de completar evento para eventos ONGOING */}
            {isEventOwner && event.status === 'ONGOING' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg border border-green-200 p-8"
              >
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Evento en Proceso</h3>
                  <p className="text-gray-600 mb-6">
                    El evento está en ejecución. Cuando termine, puedes marcarlo como completado para que los voluntarios y la organización se califiquen mutuamente.
                  </p>
                  <EventCompletionButton
                    eventId={event.id}
                    eventTitle={event.title}
                    currentVolunteers={event.currentVolunteers}
                    maxVolunteers={event.maxVolunteers}
                    startDate={event.startDate}
                    city={event.city}
                    state={event.state}
                    canComplete={true}
                    onCompletion={() => {
                      fetchEventDetails()
                    }}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar mejorado */}
          <div className="space-y-6">
            {/* Acciones rápidas - Estilo mejorado y animación */}
            <div className="relative bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 rounded-3xl shadow-2xl border border-blue-200/50 p-6 transition-all duration-300 transform hover:scale-[1.01]">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-green-200/20 to-blue-200/20 rounded-full translate-y-6 -translate-x-6"></div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg shadow-md">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                  Acciones Rápidas
                </h3>
              </div>
              
              <div className="space-y-4 relative z-10">
                <Button 
                  onClick={handleManageApplications}
                  // Botón Morado/Azul (Gestión de Postulaciones)
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
                >
                  <UsersIcon className="h-5 w-5 mr-2" />
                  Gestionar Postulaciones
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleEditEvent}
                  className="w-full border-blue-300 text-blue-700 bg-blue-50/50 hover:bg-blue-100/70 py-3 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Edit className="h-5 w-5 mr-2" />
                  Editar Evento
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full border-purple-300 text-purple-700 bg-purple-50/50 hover:bg-purple-100/70 py-3 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Ver Estadísticas
                </Button>
              </div>
            </div>

            {/* Estadísticas simplificadas - Estilo mejorado y animación */}
            <div className="relative bg-gradient-to-br from-white via-green-50/20 to-blue-50/20 rounded-3xl shadow-2xl border border-green-200/50 p-6 transition-all duration-300 transform hover:scale-[1.01]">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-14 h-14 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full translate-y-7 -translate-x-7"></div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg shadow-md">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-green-800 bg-clip-text text-transparent">
                  Estadísticas del Evento
                </h3>
              </div>
              
              {/* CUADROS DE ESTADÍSTICAS CON ACENTO DE COLOR Y HOVER */}
              <div className="space-y-4 relative z-10">
                {/* Voluntarios - Acento azul */}
                <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-all duration-200 transform hover:translate-y-[-2px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Voluntarios</p>
                        <p className="text-lg font-semibold text-gray-900">{event.currentVolunteers}/{event.maxVolunteers}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Progreso</p>
                      <p className="text-sm font-semibold text-blue-600">
                        {Math.round((event.currentVolunteers / event.maxVolunteers) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Estado - Acento verde */}
                <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-200 transform hover:translate-y-[-2px]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Estado</p>
                      <div className="text-sm font-semibold text-gray-900">{getStatusBadge(event.status)}</div>
                    </div>
                  </div>
                </div>
                
                {/* Ubicación - Acento morado */}
                <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-all duration-200 transform hover:translate-y-[-2px]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ubicación</p>
                      <p className="text-sm font-semibold text-gray-900">{event.city}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}