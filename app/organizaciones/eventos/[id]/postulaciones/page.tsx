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
  Settings
} from "lucide-react"
import { getCurrentUser } from "@/app/auth/actions"

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
  status: string
  appliedAt: string
  volunteer: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
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
  const [statusFilter, setStatusFilter] = useState("all")
  const [organizationName, setOrganizationName] = useState("")
  const [organizationEmail, setOrganizationEmail] = useState("")
  const [organizationAvatar, setOrganizationAvatar] = useState("")

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
      console.log(`🔍 Loading event details for event: ${eventId}`)
      const eventResponse = await fetch(`/api/events/${eventId}`)
      console.log(`📡 Event API response status:`, eventResponse.status)
      
      if (!eventResponse.ok) {
        throw new Error('Error loading event')
      }
      
      const eventData = await eventResponse.json()
      console.log(`📊 Event API response data:`, eventData)
      setEvent(eventData.event)

      // Verificar si el usuario es dueño del evento
      const orgResponse = await fetch('/api/organizations/me')
      if (orgResponse.ok) {
        const orgData = await orgResponse.json()
        console.log(`🏢 Organization data:`, orgData)
        console.log(`🎯 Event organization:`, eventData.event.organizationId)
        console.log(`👤 Current user:`, user?.id)
        
        // Verificar propiedad usando organizationId en lugar de organization_name
        if (orgData.organization && eventData.event.organizationId === orgData.organization.id) {
          console.log(`✅ User is event owner`)
          setIsEventOwner(true)
        } else {
          console.log(`❌ User is NOT event owner`)
          setIsEventOwner(false)
        }
      }
    } catch (error) {
      console.error("❌ Error loading event details:", error)
    }
  }

  const loadApplications = async () => {
    try {
      console.log(`🔍 Loading applications for event: ${eventId}`)
      const response = await fetch(`/api/events/${eventId}/applications`)
      console.log(`📡 Applications API response status:`, response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`📊 Applications API response data:`, data)
        console.log(`📊 Data type:`, typeof data)
        console.log(`📊 Is array:`, Array.isArray(data))
        console.log(`📊 Data length:`, Array.isArray(data) ? data.length : 'N/A')
        
        // La API devuelve directamente el array de aplicaciones, no data.applications
        const applicationsArray = Array.isArray(data) ? data : []
        setApplications(applicationsArray)
        console.log(`✅ Applications set:`, applicationsArray.length)
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

  const handleBackToDashboard = () => {
    router.push('/organizaciones/dashboard')
  }

  const handleBackToEvent = () => {
    router.push(`/organizaciones/eventos/${eventId}/detalles`)
  }

  const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject' | 'remove') => {
    try {
      const response = await fetch(`/api/events/${eventId}/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        // Recargar aplicaciones
        loadApplications()
        // Recargar detalles del evento para actualizar contadores
        loadEventDetails()
      }
    } catch (error) {
      console.error(`Error ${action}ing application:`, error)
    }
  }

  const handleViewVolunteerProfile = (volunteerId: string) => {
    // El volunteerId que recibimos es el ID del usuario, no del voluntario
    router.push(`/voluntarios/${volunteerId}`)
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery === "" || 
      app.volunteer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.volunteer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.volunteer.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
      'ACCEPTED': { label: 'Aceptada', color: 'bg-green-100 text-green-700' },
      'REJECTED': { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
      'COMPLETED': { label: 'Completada', color: 'bg-purple-100 text-purple-700' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-700' }
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getStatusCounts = () => {
    const counts = {
      pending: applications.filter(app => app.status === 'PENDING').length,
      accepted: applications.filter(app => app.status === 'ACCEPTED').length,
      rejected: applications.filter(app => app.status === 'REJECTED').length,
      completed: applications.filter(app => app.status === 'COMPLETED').length
    }
    return counts
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando postulaciones...</p>
        </div>
      </div>
    )
  }

  if (!event || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No tienes permisos para gestionar este evento</p>
          <Button onClick={handleBackToDashboard} className="mt-4">
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const statusCounts = getStatusCounts()

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
            <UserMenu organizationName={organizationName} organizationEmail={organizationEmail} organizationAvatar={organizationAvatar}/>
          </div>

          {/* Menú móvil - Solo avatar en pantallas pequeñas */}
          <div className="md:hidden">
            <UserMenu organizationName={organizationName} organizationEmail={organizationEmail} organizationAvatar={organizationAvatar}/>
          </div>
        </div>
      </div>

      {/* Header específico de la página */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleBackToEvent} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Volver al Evento</span>
                <span className="sm:hidden">Volver</span>
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-blue-600" />
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Gestión de Postulaciones</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleBackToDashboard} className="hidden sm:flex">
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={handleBackToDashboard} className="sm:hidden">
                <Home className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Título del evento */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h2>
          <p className="text-gray-600">Gestiona las postulaciones de voluntarios para este evento</p>
        </div>

        {/* Estadísticas rápidas mejoradas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{statusCounts.pending}</div>
              <div className="text-sm font-medium text-blue-700">Pendientes</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{statusCounts.accepted}</div>
              <div className="text-sm font-medium text-green-700">Aceptadas</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{statusCounts.rejected}</div>
              <div className="text-sm font-medium text-red-700">Rechazadas</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{statusCounts.completed}</div>
              <div className="text-sm font-medium text-purple-700">Completadas</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Buscar por nombre o email..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="PENDING">Pendientes</SelectItem>
                  <SelectItem value="ACCEPTED">Aceptadas</SelectItem>
                  <SelectItem value="REJECTED">Rechazadas</SelectItem>
                  <SelectItem value="COMPLETED">Completadas</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadApplications} variant="outline" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de postulaciones */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay postulaciones</h3>
                <p className="text-gray-600">
                  {applications.length === 0 
                    ? "Aún no hay voluntarios postulados para este evento."
                    : "No se encontraron postulaciones con los filtros aplicados."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.volunteer.firstName} {application.volunteer.lastName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {application.volunteer.email}
                            </span>
                            
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(application.appliedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(application.status)}
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewVolunteerProfile(application.volunteer.id)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Ver Perfil</span>
                          </Button>
                          
                          {application.status === 'PENDING' && (
                            <>
                              <Button
                                onClick={() => handleApplicationAction(application.id, 'accept')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aceptar
                              </Button>
                              <Button
                                onClick={() => handleApplicationAction(application.id, 'reject')}
                                variant="destructive"
                                size="sm"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Rechazar
                              </Button>
                            </>
                          )}
                          
                          {application.status === 'ACCEPTED' && (
                            <Button
                              onClick={() => handleApplicationAction(application.id, 'remove')}
                              variant="destructive"
                              size="sm"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remover
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
