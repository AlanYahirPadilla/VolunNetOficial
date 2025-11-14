"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  X,
  User,
  Mail,
  Eye,
  Target,
  Heart,
  Home,
  Bell,
  MessageCircle,
  Settings,
  ListFilter,
  RefreshCw,
  Clock,
  CheckSquare
} from "lucide-react"
import { getCurrentUser } from "@/app/auth/actions"

// --- Tipos de Datos (Interfaces) ---
// (MANTENIDOS SIN CAMBIOS)

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
}

interface Application {
  id: string
  eventId: string
  volunteerId: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'
  appliedAt: string
  volunteer: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

// --- Componente de Menú de Usuario (UserMenu) - Para el Dropdown ---
// (Ajustes de tamaño de avatar e ícono de configuración para coincidir con la imagen)

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

  const initialLetter = organizationName?.[0] || 'O'

  return (
    <div className="relative z-50 flex items-center gap-2" ref={menuRef}>
      {/* Sección de Usuario (Avatar y Nombre) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition focus:outline-none"
        aria-expanded={isOpen}
      >
        {/* Tamaño de avatar ajustado a h-6 w-6 para que se parezca al de la imagen */}
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-md">
          {organizationAvatar ? (
            <img
              src={organizationAvatar}
              alt="Avatar organización"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement!;
                parent.innerHTML = initialLetter;
              }}
            />
          ) : (
            initialLetter
          )}
        </div>
        {/* Nombre de usuario visible para pantallas grandes */}
        <span className="text-sm font-semibold text-gray-800 hidden lg:inline">{organizationName}</span>
      </button>

      {/* Ícono de Configuración - Copiando el diseño de la imagen (h-5 w-5) */}
      <Link href="/organizaciones/configuracion" className="p-1 rounded-full hover:bg-gray-100 transition">
        <Settings className="h-5 w-5 text-gray-500" />
      </Link>

      {/* Dropdown Menu (Lógica sin cambios) */}
      {isOpen && (
        <motion.div
          className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 origin-top-right"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          <div className="px-4 py-3 border-b border-gray-100 mb-1">
            <p className="text-sm font-bold text-gray-900 truncate">{organizationName}</p>
            <p className="text-xs text-gray-500 truncate">{organizationEmail}</p>
          </div>
          <Link href="/organizaciones/perfil" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
            <User className="h-4 w-4 mr-3" />
            Perfil
          </Link>
          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" })
                window.location.href = "/"
              }}
            >
              <X className="h-4 w-4 mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// --- Componente de Badge de Estado (getStatusBadge) ---
// (MANTENIDO SIN CAMBIOS)

const getStatusBadge = (status: Application['status']) => {
  const statusConfig = {
    'PENDING': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    'ACCEPTED': { label: 'Aceptada', color: 'bg-green-100 text-green-700 border-green-200' },
    'REJECTED': { label: 'Rechazada', color: 'bg-red-100 text-red-700 border-red-200' },
    'COMPLETED': { label: 'Completada', color: 'bg-blue-100 text-blue-700 border-blue-200' }
  }

  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200' }

  return (
    <Badge className={`border px-3 py-1 text-xs font-semibold ${config.color}`}>
      {config.label}
    </Badge>
  )
}

// --- Componente Principal (EventoPostulacionesPage) ---
// (LÓGICA MANTENIDA SIN CAMBIOS)

export default function EventoPostulacionesPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isEventOwner, setIsEventOwner] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<Application['status'] | 'all'>("all")
  const [organizationName, setOrganizationName] = useState("")
  const [organizationEmail, setOrganizationEmail] = useState("")
  const [organizationAvatar, setOrganizationAvatar] = useState("")
  const [isActionLoading, setIsActionLoading] = useState(false) 

  // --- Lógica de Carga de Datos (SIN CAMBIOS) ---

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user && eventId) {
      loadEventDetails()
      loadApplications()
    }
  }, [user, eventId])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        if (currentUser.firstName) setOrganizationName(currentUser.firstName)
        if (currentUser.email) setOrganizationEmail(currentUser.email)
        if ((currentUser as any)?.avatar) {
          setOrganizationAvatar((currentUser as any).avatar)
        }
        if (currentUser.role !== 'ORGANIZATION') {
          router.push('/login')
          return
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error("Error loading user:", error)
      router.push('/login')
    }
  }

  const loadEventDetails = async () => {
    try {
      const eventResponse = await fetch(`/api/events/${eventId}`)
      if (!eventResponse.ok) throw new Error('Error loading event')
      const eventData = await eventResponse.json()
      setEvent(eventData.event)

      const orgResponse = await fetch('/api/organizations/me')
      if (orgResponse.ok) {
        const orgData = await orgResponse.json()
        if (orgData.organization && eventData.event.organizationId === orgData.organization.id) {
          setIsEventOwner(true)
        } else {
          setIsEventOwner(false)
        }
      }
    } catch (error) {
      console.error("❌ Error loading event details:", error)
    }
  }

  const loadApplications = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/applications`)
      if (response.ok) {
        const data = await response.json()
        const applicationsArray = Array.isArray(data) ? data : []
        setApplications(applicationsArray)
      } else {
        console.error("❌ Error loading applications:", response.status, response.statusText)
        setApplications([])
      }
    } catch (error) {
      console.error("❌ Error loading applications:", error)
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  // --- Manejo de Acciones y Navegación (SIN CAMBIOS) ---

  const handleBackToDashboard = () => {
    router.push('/organizaciones/dashboard')
  }

  const handleBackToEvent = () => {
    router.push(`/organizaciones/eventos/${eventId}/detalles`)
  }

  const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject' | 'remove') => {
    setIsActionLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        await loadApplications()
        await loadEventDetails()
      } else {
        console.error("Error al actualizar la postulación.")
      }
    } catch (error) {
      console.error(`Error ${action}ing application:`, error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleViewVolunteerProfile = (volunteerId: string) => {
    router.push(`/voluntarios/${volunteerId}`)
  }

  // --- Lógica de Filtro (SIN CAMBIOS) ---

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery === "" ||
      app.volunteer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.volunteer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.volunteer.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusCounts = () => {
    const counts = {
      pending: applications.filter(app => app.status === 'PENDING').length,
      accepted: applications.filter(app => app.status === 'ACCEPTED').length,
      rejected: applications.filter(app => app.status === 'REJECTED').length,
      completed: applications.filter(app => app.status === 'COMPLETED').length,
      total: applications.length
    }
    return counts
  }

  // --- Componentes de Carga/Error (SIN CAMBIOS) ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-lg font-medium text-gray-700">Cargando postulaciones...</p>
        </div>
      </div>
    )
  }

  if (!event || !user || !isEventOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 shadow-xl">
          <Target className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Acceso No Autorizado o Evento No Encontrado</h2>
          <p className="text-gray-600 mb-6">
            {isEventOwner === false ? "No tienes permisos para gestionar este evento." : "El evento no existe o no se pudo cargar."}
          </p>
          <Button onClick={handleBackToDashboard}>
            Volver al Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  const statusCounts = getStatusCounts()

  // --- Renderizado Principal (Diseño Corregido) ---

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* -------------------- HEADER SUPERIOR (DISEÑO IDÉNTICO A LA IMAGEN) -------------------- */}
      <div className="sticky top-0 z-30 bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          
          {/* Logo VolunNet - Icono y texto ajustados */}
          <Link href="/organizaciones/dashboard" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-blue-600 fill-blue-200" /> {/* Tamaño de ícono ajustado */}
            <span className="text-xl font-extrabold text-blue-600">VolunNet</span>
          </Link>

          {/* Navegación Principal y Usuario */}
          <div className="flex items-center gap-6">
            
            {/* Navegación - visible en md y más, con tamaños de íconos y texto ajustados */}
            <nav className="hidden md:flex items-center gap-4 text-gray-600 text-sm font-medium">
              <Link 
                href="/organizaciones/dashboard" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg transition group hover:text-blue-700 hover:bg-blue-50"
              >
                <Home className="h-4 w-4" /> {/* Tamaño de ícono ajustado */}
                <span>Inicio</span>
              </Link>
              <Link 
                href="/notificaciones" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group"
              >
                <Bell className="h-4 w-4" /> {/* Tamaño de ícono ajustado */}
                <span>Notificaciones</span>
              </Link>
              <Link 
                href="/organizaciones/comunidad" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group"
              >
                <MessageCircle className="h-4 w-4" /> {/* Tamaño de ícono ajustado */}
                <span>Comunidad</span>
              </Link>
              <Link 
                href="/organizaciones/eventos/finalizados" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group"
              >
                <CheckSquare className="h-4 w-4" /> {/* Tamaño de ícono ajustado */}
                <span>Eventos Finalizados</span>
              </Link>
            </nav>

            <UserMenu organizationName={organizationName} organizationEmail={organizationEmail} organizationAvatar={organizationAvatar} />
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* --- Encabezado de Gestión (Título similar a la imagen, botón de "Volver" eliminado) --- */}
        <div className="mb-10 text-center relative pt-4"> 
            {/* Título y Subtítulo con el estilo del ejemplo, aumentado de tamaño */}
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-3 inline-block leading-tight">
                {/* Gradiente ajustado para coincidir más con el púrpura/azul de la imagen */}
                <span className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Postulaciones del Evento
                </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Gestiona y revisa las postulaciones de voluntarios para tu evento.
            </p>
        </div>

        {/* --- Sección de Estadísticas Rápidas (Diseño Mejorado) --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <motion.div whileHover={{ y: -2 }} className="col-span-1">
            <Card className="shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Voluntarios Necesarios</p>
                    <div className="text-2xl font-bold text-gray-900">{event.maxVolunteers}</div>
                  </div>
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="col-span-1">
            <Card className="shadow-lg border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Postulaciones Pendientes</p>
                    <div className="text-2xl font-bold text-gray-900">{statusCounts.pending}</div>
                  </div>
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="col-span-1">
            <Card className="shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Voluntarios Confirmados</p>
                    <div className="text-2xl font-bold text-gray-900">{statusCounts.accepted}</div>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="col-span-1">
            <Card className="shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Postulaciones</p>
                    <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
                  </div>
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* --- Sección de Filtros y Búsqueda (Diseño Mejorado) --- */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre o email del voluntario..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="w-full md:w-56">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Application['status'] | 'all')}>
                  <SelectTrigger className="h-10 border-gray-300 focus:ring-blue-500">
                    <ListFilter className="h-4 w-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados ({applications.length})</SelectItem>
                    <SelectItem value="PENDING">Pendientes ({statusCounts.pending})</SelectItem>
                    <SelectItem value="ACCEPTED">Aceptadas ({statusCounts.accepted})</SelectItem>
                    <SelectItem value="REJECTED">Rechazadas ({statusCounts.rejected})</SelectItem>
                    <SelectItem value="COMPLETED">Completadas ({statusCounts.completed})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={loadApplications} variant="outline" className="w-full md:w-auto h-10 bg-white hover:bg-gray-100">
                <RefreshCw className="h-4 w-4 mr-2" />
                Recargar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- Lista/Tabla de Postulaciones (Diseño Mejorado) --- */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Voluntarios Postulados ({filteredApplications.length})</h2>

        {isActionLoading && (
          <div className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg mb-4 shadow-sm">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            <span className="text-sm font-medium">Procesando acción...</span>
          </div>
        )}

        <div className="overflow-x-auto">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center bg-white rounded-xl">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">¡No hay postulaciones!</h3>
                <p className="text-gray-600">
                  {applications.length === 0
                    ? "Aún no hay voluntarios postulados para este evento. ¡Comparte el enlace!"
                    : "No se encontraron postulaciones que coincidan con tus criterios de búsqueda/filtro."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 * filteredApplications.indexOf(application) }}
                >
                  <Card className="hover:shadow-lg transition-shadow border border-gray-200">
                    <CardContent className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 items-center">
                        {/* Columna 1: Voluntario */}
                        <div className="col-span-1 md:col-span-2 flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-md font-bold flex-shrink-0">
                            {application.volunteer.firstName?.[0] || 'V'}
                          </div>
                          <div className="truncate">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {application.volunteer.firstName} {application.volunteer.lastName}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center truncate">
                              <Mail className="h-3.5 w-3.5 mr-1" />
                              {application.volunteer.email}
                            </p>
                          </div>
                        </div>

                        {/* Columna 2: Estado */}
                        <div className="col-span-1 flex justify-start md:justify-center">
                          {getStatusBadge(application.status)}
                        </div>

                        {/* Columna 3: Fecha de Postulación */}
                        <div className="col-span-1 flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1.5 text-gray-400 hidden sm:inline" />
                          <div className="flex flex-col">
                              <span className="font-medium text-gray-700">Postulado</span>
                              <span className="text-xs">{new Date(application.appliedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Columna 4: Acciones */}
                        <div className="col-span-1 flex flex-wrap gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewVolunteerProfile(application.volunteer.id)}
                            className="flex items-center space-x-1 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">Perfil</span>
                          </Button>

                          {application.status === 'PENDING' && (
                            <>
                              <Button
                                onClick={() => handleApplicationAction(application.id, 'accept')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={isActionLoading}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Aceptar</span>
                              </Button>
                              <Button
                                onClick={() => handleApplicationAction(application.id, 'reject')}
                                variant="destructive"
                                size="sm"
                                disabled={isActionLoading}
                              >
                                <X className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Rechazar</span>
                              </Button>
                            </>
                          )}

                          {application.status === 'ACCEPTED' && (
                            <Button
                              onClick={() => handleApplicationAction(application.id, 'remove')}
                              variant="destructive"
                              size="sm"
                              disabled={isActionLoading}
                            >
                              <X className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Remover</span>
                            </Button>
                          )}
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
    </div>
  )
}