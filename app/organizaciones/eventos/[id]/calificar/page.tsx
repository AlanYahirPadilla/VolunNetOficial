'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Users, Calendar, MapPin, Home, Bell, ArrowLeft, Settings } from 'lucide-react'
import { RatingModal } from '@/components/RatingModal/RatingModal'
import { motion } from 'framer-motion'
import { getCurrentUser } from '@/app/auth/actions'

interface Volunteer {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  rating?: number
}

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  address: string
  city: string
  state: string
  status: string
  organization: {
    id: string
    name: string
  }
}

interface Application {
  id: string
  volunteerId: string
  status: string
  appliedAt: string
  volunteer: Volunteer
  rating?: number
}

export default function EventRatingPage() {
  const router = useRouter()
  const { id: eventId } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    loadUser()
  }, [])

  useEffect(() => {
    if (user && eventId) {
      loadEventData()
    }
  }, [user, eventId])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error("Error loading user:", error)
      router.push('/login')
    }
  }

  const loadEventData = async () => {
    try {
      setLoading(true)
      
      // Cargar datos del evento
      const eventResponse = await fetch(`/api/events/${eventId}`)
      if (!eventResponse.ok) throw new Error('Error al cargar el evento')
      const eventData = await eventResponse.json()
      if (eventData.event) {
        setEvent(eventData.event)
      } else {
        throw new Error('Formato de respuesta del evento inválido')
      }

      // Cargar aplicaciones completadas (incluyendo las que ya tienen rating)
      const applicationsResponse = await fetch(`/api/events/${eventId}/applications?status=COMPLETED`)
      if (!applicationsResponse.ok) throw new Error('Error al cargar las aplicaciones')
      const applicationsData = await applicationsResponse.json()
      console.log("📊 Applications loaded:", applicationsData)
      setApplications(applicationsData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleRateVolunteer = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer)
    setShowRatingModal(true)
  }

  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (!selectedVolunteer || !event) return

    try {
      const response = await fetch(`/api/events/${eventId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          volunteerId: selectedVolunteer.id,
          rating,
          comment,
          type: 'ORGANIZATION_TO_VOLUNTEER'
        }),
      })

      if (!response.ok) {
        throw new Error('Error al enviar la calificación')
      }

      // Actualizar la lista de aplicaciones
      console.log("🔄 Reloading event data after rating...")
      await loadEventData()
      console.log("✅ Event data reloaded")
      setShowRatingModal(false)
      setSelectedVolunteer(null)

    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Error al enviar la calificación')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'COMPLETED': { label: 'Completado', className: 'bg-green-100 text-green-700' },
      'ACCEPTED': { label: 'Aceptado', className: 'bg-blue-100 text-blue-700' },
      'PENDING': { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
      'REJECTED': { label: 'Rechazado', className: 'bg-red-100 text-red-700' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-700' }
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    )
  }

  // Evitar render hasta que el componente esté montado en el cliente
  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos del evento...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="mb-4">Error: {error}</p>
              <Button onClick={() => router.back()}>
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="mb-4">Evento no encontrado</p>
              <Button onClick={() => router.back()}>
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completedApplications = applications.filter(app => app.status === 'COMPLETED')
  const ratedApplications = applications.filter(app => app.rating)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/organizaciones/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VolunNet
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex gap-2 text-gray-600 text-sm font-medium">
              <Link href="/organizaciones/dashboard" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                <Home className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Inicio</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
              <Link href="/comunidad" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                <Users className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Comunidad</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
              <Link href="/notificaciones" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                <Bell className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Notificaciones</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              {user && (
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} alt={user.name || user.email} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm">
                      {user.name?.[0] || user.email?.[0] || 'O'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user.name || user.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              ⭐ Calificar Voluntarios
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Evalúa el desempeño de los voluntarios que participaron en tu evento
            </p>
          </div>

          {/* Event Info Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{event?.title}</h2>
                    <p className="text-blue-100">Evento completado</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3">
                    <MapPin className="h-5 w-5" />
                    <span className="text-sm">
                      {event?.address}, {event?.city}, {event?.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">
                      {event?.startDate && new Date(event.startDate).toLocaleDateString()} - {event?.endDate && new Date(event.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3">
                    <Users className="h-5 w-5" />
                    <span className="text-sm">
                      {completedApplications.length} voluntarios participantes
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Progreso de Calificaciones</h3>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1">
                    {ratedApplications.length} de {completedApplications.length} calificados
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${completedApplications.length > 0 ? (ratedApplications.length / completedApplications.length) * 100 : 0}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {completedApplications.length - ratedApplications.length} voluntarios pendientes de calificar
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Volunteers List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Voluntarios Participantes
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedApplications.length === 0 ? (
              <div className="col-span-full">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500 py-12">
                      <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold mb-2">No hay voluntarios completados</h3>
                      <p>Los voluntarios que completen este evento aparecerán aquí para calificarlos</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              completedApplications.map((application, idx) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={application.volunteer.avatar} alt={`${application.volunteer.firstName} ${application.volunteer.lastName}`} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg">
                            {application.volunteer.firstName[0]}{application.volunteer.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">
                            {application.volunteer.firstName} {application.volunteer.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{application.volunteer.email}</p>
                          <p className="text-xs text-gray-500">
                            Participó el {new Date(application.appliedAt).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {application.rating ? (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i < application.rating! 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                              Calificado
                            </Badge>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleRateVolunteer(application.volunteer)}
                            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Calificar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedVolunteer && event && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
          event={{
            id: event.id,
            title: event.title,
            startDate: event.startDate,
            endDate: event.endDate
          }}
          userToRate={{
            id: selectedVolunteer.id,
            name: `${selectedVolunteer.firstName} ${selectedVolunteer.lastName}`,
            role: 'VOLUNTEER'
          }}
        />
      )}
    </div>
  )
}

