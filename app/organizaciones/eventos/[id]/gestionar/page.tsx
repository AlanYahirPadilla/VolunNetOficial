"use client"

import { useState, useEffect, useRef } from "react" // Añadido useRef
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Building,
  Star,
  CheckCircle,
  Eye,
  Clock,
  Target,
  Heart,
  Grid,
  List,
  Bell,
  // Nuevas importaciones necesarias para la cabecera y acciones rápidas
  Edit,
  BarChart3,
  Zap, // Icono de rayo para Acciones Rápidas
  Settings,
  Home,
  MessageCircle,
  Users as UsersIcon // Renombrar para evitar conflicto con el icono Users en Eventos
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/app/auth/actions"
import { EventCompletionButton } from "@/components/EventCompletionButton"
import { EventStatusControl } from "@/components/EventStatusControl"

interface Event {
  id: string
  title: string
  description: string
  city: string
  state: string
  startDate: string
  endDate: string
  maxVolunteers: number
  currentVolunteers: number
  status: string
  organization_name: string
  category_name?: string
  category_icon?: string
  category_color?: string
  skills?: string[]
  requirements?: string[]
  benefits?: string[]
  imageUrl?: string | null
}

interface Organization {
  id: string
  name: string
  description?: string
  verified?: boolean
  rating?: number
  totalEvents?: number
  email?: string
  website?: string
  // Agregamos un campo para el avatar, aunque el diseño solo muestra las iniciales.
  avatar?: string | null 
}

// ====================================================================
/**
 * Menú de usuario desplegable para la cabecera 
 * @param organizationName Nombre de la organización/usuario.
 * @param organizationAvatar URL del avatar 
 */
function UserMenu({ organizationName, organizationAvatar }: { organizationName: string, organizationAvatar?: string | null }) {
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

  // Texto corto para el avatar (ej. 'S' para Scapys, 'UN' para Unicef)
  const shortName = organizationName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'O';
  const displayShortName = shortName.length === 2 ? shortName.charAt(0) : shortName;


  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        // Estilo del botón: Círculo morado/azul con inicial y Engranaje
        className="flex items-center gap-2 p-1.5 rounded-lg transition hover:bg-gray-100"
      >
        {/* Avatar/Iniciales (Diseño "Scapys" de image_4bea5b.png) */}
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden shadow-md">
           {/* La imagen de diseño (image_4bea5b.png) muestra una "S" estilizada con un borde, simplificaremos con un círculo de color */}
           <span className="text-white text-sm font-semibold">{displayShortName}</span>
        </div>
        {/* Texto del nombre (Scapys) y Engranaje */}
        <span className="text-sm font-medium text-gray-700 hidden sm:block">{organizationName}</span>
        <Settings className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <motion.div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 origin-top-right"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          {/* Contenido del menú desplegable (simplificado) */}
          <Link href="/organizaciones/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Perfil
          </Link>
          <Link href="/organizaciones/configuracion" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Configuración
          </Link>
          <div className="border-t border-gray-100 mt-2 pt-2">
            <button 
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                // Lógica de cerrar sesión aquí
                window.location.href = "/logout"
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
// ====================================================================


export default function EventoGestionarPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isEventOwner, setIsEventOwner] = useState(false)
  
  // No usamos viewMode en esta página de detalle, se puede eliminar o ignorar.
  // const [viewMode, setViewMode] = useState<"grid" | "list">("grid") 

  // ------- Helpers (inspirados en el diseño) -------
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getAvailabilityStatus = (ev: Event) => {
    if (!ev) return { text: "N/A", color: "bg-gray-100 text-gray-700" }
    if (ev.currentVolunteers >= ev.maxVolunteers) {
      return { text: "Completo", color: "bg-red-100 text-red-700" }
    }
    if (ev.currentVolunteers >= ev.maxVolunteers * 0.8) {
      return { text: "Casi completo", color: "bg-yellow-100 text-yellow-700" }
    }
    return { text: "Disponible", color: "bg-green-100 text-green-700" }
  }

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        if (currentUser.role !== "ORGANIZATION") {
          router.push("/login")
          return
        }
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error loading user:", error)
      router.push("/login")
    }
  }

  const loadEventDetails = async () => {
    try {
      setLoading(true)
      const eventResponse = await fetch(`/api/events/${eventId}`)
      if (!eventResponse.ok) {
        throw new Error("Error loading event")
      }
      const eventData = await eventResponse.json()
      setEvent(eventData.event)

      // Cargar datos de la organización del usuario
      const orgResponse = await fetch("/api/organizations/me")
      if (orgResponse.ok) {
        const orgData = await orgResponse.json()
        setOrganization(orgData.organization)

        // Verificar si el usuario es dueño del evento
        if (orgData.organization && eventData.event.organization_name === orgData.organization.name) {
          setIsEventOwner(true)
        } else {
          setIsEventOwner(false)
        }
      } else {
        // Fallback si no se puede cargar la org (ej. para la card de Organización)
        setOrganization({ 
            id: 'mock', 
            name: eventData.event.organization_name || "Organización Desconocida",
            rating: 0,
            totalEvents: 0
        })
      }
    } catch (error) {
      console.error("Error loading event details:", error)
      // Si falla la carga del evento, aun podemos mostrar la cabecera si el usuario cargó
      if (!event) setEvent({ id: eventId, title: "Evento no cargado", description: "", city: "", state: "", startDate: new Date().toISOString(), endDate: new Date().toISOString(), maxVolunteers: 0, currentVolunteers: 0, status: "DRAFT", organization_name: "N/A" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (user && eventId) {
      loadEventDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, eventId])

  const handleBackToDashboard = () => {
    router.push("/organizaciones/dashboard")
  }

  const handleViewEventDetails = () => {
    router.push(`/eventos/${eventId}`)
  }

  const handleManageApplications = () => {
    router.push(`/organizaciones/eventos/${params.id}/postulaciones`)
  }
  
  // --- Nuevas funciones de manejo para Acciones Rápidas ---
  const handleEditEvent = () => {
    router.push(`/eventos/editar/${eventId}`) // Ruta asumida para edición
  }

  const handleViewStats = () => {
    router.push(`/organizaciones/eventos/${eventId}/estadisticas`) // Ruta asumida para estadísticas
  }
  // --------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando evento...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!event || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Evento no encontrado o no autorizado</p>
          <Button onClick={handleBackToDashboard} className="mt-4">
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
          <p className="text-gray-600">No tienes permisos para gestionar este evento</p>
          <Button onClick={handleBackToDashboard} className="mt-4">
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Imagen fallback / mosaico helper (tomado del diseño)
  const renderEventImageArea = (ev: Event) => {
    if (ev.imageUrl) {
      return (
        <img
          src={ev.imageUrl}
          alt={ev.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      )
    }

    const normalize = (t?: string) => (t || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
    const name = normalize(ev.category_name)
    const gradient =
      name.includes("ambiente") || name.includes("ecologia") || name.includes("naturaleza")
        ? { from: "#E6F4EA", to: "#D1F1DC" }
        : name.includes("tecnolog")
        ? { from: "#E8EEFF", to: "#EDE6FF" }
        : name.includes("salud")
        ? { from: "#FFE8EC", to: "#FFEDEF" }
        : name.includes("educacion")
        ? { from: "#FFF5E6", to: "#FFEFD6" }
        : name.includes("comunidad") || name.includes("social")
        ? { from: "#E6F0FF", to: "#E6FFF7" }
        : name.includes("arte") || name.includes("cultura")
        ? { from: "#FFE9F2", to: "#FFE6F5" }
        : { from: "#EAF0FF", to: "#F2E9FF" }

    const icon = name.includes("ambiente") || name.includes("ecologia") || name.includes("naturaleza")
      ? "🌱"
      : name.includes("tecnolog")
      ? "💻"
      : name.includes("salud")
      ? "❤️"
      : name.includes("educacion")
      ? "🎓"
      : name.includes("comunidad") || name.includes("social")
      ? "👥"
      : name.includes("arte") || name.includes("cultura")
      ? "🎨"
      : "📅"

    return (
      <div
        className="w-full h-full relative overflow-hidden rounded-t-3xl"
        style={{ background: `linear-gradient(90deg, ${gradient.from}, ${gradient.to})` }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => {
            const r = (s: number) => {
              let x = Math.sin(s) * 10000
              return x - Math.floor(x)
            }
            const r1 = r(i + 1),
              r2 = r((i + 1) * 2),
              r3 = r((i + 1) * 3)
            const size = 12 + Math.floor(r1 * 36)
            const left = Math.floor(r2 * 100)
            const top = Math.floor(r3 * 100)
            const opacity = 0.03 + r1 * 0.12
            const rotate = Math.floor((r2 - 0.5) * 30)
            return (
              <span
                key={i}
                className="absolute select-none"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  fontSize: `${size}px`,
                  opacity,
                  transform: `translate(-50%, -50%) rotate(${rotate}deg)`
                }}
              >
                {icon}
              </span>
            )
          })}
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl select-none pointer-events-none">{icon}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header (Cabecera basada en image_4bea5b.png) */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              {/* Logo VolunNet (Ajustado) */}
              <div className="flex items-center gap-2">
                <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VolunNet</span>
              </div>
            </div >

            {/* Navegación completa para desktop (basada en image_4bea5b.png) */}
            <nav className="hidden md:flex items-center space-x-6">
              {/* Inicio */}
              <Link 
                href="/organizaciones/dashboard" // Asumimos esta es la ruta de inicio para organizaciones
                className="text-gray-600 hover:text-blue-600 transition flex items-center space-x-2 font-medium"
              >
                <Home className="h-5 w-5" />
                <span>Inicio</span>
              </Link>
              
              {/* Notificaciones */}
              <Link 
                href="/notificaciones" 
                className="text-gray-600 hover:text-blue-600 transition flex items-center space-x-2 font-medium"
              >
                <Bell className="h-5 w-5" />
                <span>Notificaciones</span>
              </Link>
              
              {/* Comunidad */}
              <Link 
                href="/organizaciones/comunidad" 
                className="text-gray-600 hover:text-blue-600 transition flex items-center space-x-2 font-medium"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Comunidad</span>
              </Link>
              
              {/* Eventos Finalizados */}
              <Link 
                href="/organizaciones/eventos-finalizados" 
                className="text-gray-600 hover:text-blue-600 transition flex items-center space-x-2 font-medium"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Eventos Finalizados</span>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {/* Uso del componente UserMenu (Asumiendo que organization.name es el nombre del usuario logeado/org) */}
              {organization && (
                <UserMenu 
                  organizationName={organization.name || "Usuario"} 
                  organizationAvatar={organization.avatar} // Asumiendo que el campo existe
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title area */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{event.title}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Gestiona y administra los detalles, postulaciones y cierre de este evento</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event card (visual) */}
            <Card className="overflow-hidden shadow-2xl rounded-3xl border-0 bg-white">
              <div className="relative h-64 w-full overflow-hidden rounded-t-3xl group">
                {renderEventImageArea(event)}

                {/* Badges flotantes */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-white text-xs font-semibold shadow"
                    style={{ backgroundColor: event.category_color || "#6366F1" }}
                  >
                    {event.category_name || "General"}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${getAvailabilityStatus(event).color}`}>
                    {getAvailabilityStatus(event).text}
                  </span>
                </div>

                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Badge variant="secondary">{event.city}</Badge>
                  <Badge variant="secondary">{event.state}</Badge>
                </div>

                {/* overlay info bottom */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex flex-col justify-end p-6">
                <div className="text-white font-bold">{event.organization_name}</div>
                <div className="text-gray-200 text-sm font-bold">{formatDate(event.startDate)}</div>
                </div>

              </div>

              <CardContent className="flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{event.title}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.city}, {event.state}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{event.currentVolunteers} / {event.maxVolunteers}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={handleViewEventDetails} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Público
                      </Button>
                    </div>

                    <div>
                      {/* Status badge big */}
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: "#F3F4F6" }}>
                        <Target className="h-4 w-4 mr-2 text-blue-600" />
                        <span>{event.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="text-gray-700 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
                  <p className="text-sm">{event.description}</p>
                </div>

                {event.skills && event.skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Habilidades requeridas</h4>
                    <div className="flex flex-wrap gap-2">
                      {event.skills.map((s, i) => (
                        <Badge key={i} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estadísticas / progreso */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{event.currentVolunteers}</div>
                    <div className="text-sm text-blue-600">Voluntarios</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{Math.max(0, event.maxVolunteers - event.currentVolunteers)}</div>
                    <div className="text-sm text-green-600">Cupos</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">0</div>
                    <div className="text-sm text-yellow-600">Pendientes</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{event.currentVolunteers}</div>
                    <div className="text-sm text-purple-600">Confirmados</div>
                  </div>
                </div>

                {/* Status control (componente lógico) */}
                <div className="mb-4">
                  <EventStatusControl
                    eventId={event.id}
                    currentStatus={event.status}
                    startDate={event.startDate}
                    endDate={event.endDate}
                    onStatusChange={() => loadEventDetails()}
                    isEventOwner={isEventOwner}
                  />
                </div>

                {/* Completar evento (si aplica) */}
                {event.status === "ONGOING" && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        Completar Evento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-green-700 mb-4">
                        Marca el evento como completado cuando haya finalizado. Esto habilitará la etapa de calificaciones.
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
                        onCompletion={() => loadEventDetails()}
                      />
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Organization card (Basada en image_4bde3c.png / image_4c4c16.png) */}
            {organization && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <Building className="h-5 w-5 text-blue-600" />
                    Tu Organización
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{organization.name}</h4>
                      {organization.verified && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">Verificada</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(organization.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({organization.rating || 0})</span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>{organization.totalEvents || 0} eventos organizados</p>
                    {organization.email && <p className="mt-1">{organization.email}</p>}
                    {organization.website && <p className="mt-1">{organization.website}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick actions (Basado en image_4c4815.png) */}
            <Card className="shadow-lg border-blue-100/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  {/* Icono de rayo estilizado */}
                  <div className="w-10 h-10 bg-gradient-to-br from-green-300 to-blue-200 rounded-xl flex items-center justify-center shadow-md">
                      <Zap className="h-5 w-5 text-green-700" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Acciones Rápidas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-3">
                
                {/* 1. Gestionar Postulaciones (Morado/Azul Gradient) */}
                <Button 
                  onClick={handleManageApplications}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  <UsersIcon className="h-5 w-5 mr-2" />
                  Gestionar Postulaciones
                </Button>

                {/* 2. Editar Evento (Outline Azul) */}
                <Button 
                  variant="outline"
                  onClick={handleEditEvent}
                  className="w-full h-12 border-blue-300 text-blue-700 bg-blue-50/50 hover:bg-blue-100/70 font-semibold shadow-md transition-all duration-300"
                >
                  <Edit className="h-5 w-5 mr-2" />
                  Editar Evento
                </Button>

                {/* 3. Ver Estadísticas (Outline Morado) */}
                <Button 
                  variant="outline"
                  onClick={handleViewStats}
                  className="w-full h-12 border-purple-300 text-purple-700 bg-purple-50/50 hover:bg-purple-100/70 font-semibold shadow-md transition-all duration-300"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Ver Estadísticas
                </Button>
                
                {/* Acción condicional (conservada para COMPLETED, con estilo mejorado) */}
                {event.status === "COMPLETED" && (
                  <Button onClick={() => router.push(`/organizaciones/eventos/${eventId}/calificar`)} className="w-full h-12 bg-yellow-600 hover:bg-yellow-700 font-semibold mt-2">
                    <Star className="h-5 w-5 mr-2" />
                    Calificar Voluntarios
                  </Button>
                )}
                
              </CardContent>
            </Card>
            
          </aside>
        </div>
      </div>
    </div>
  )
}