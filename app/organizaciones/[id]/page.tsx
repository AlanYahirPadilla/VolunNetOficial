"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, MapPin, Calendar, Users, Clock, Building, Star, ArrowLeft, Share2, Bookmark, Phone, Mail, Globe, Award, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Organization {
  id: string
  name: string
  description?: string
  email?: string
  phone?: string
  website?: string
  verified: boolean
  rating?: number
  totalEvents?: number
  city?: string
  state?: string
  country?: string
  address?: string
  founded?: string
  mission?: string
  vision?: string
  categories?: string[]
  totalVolunteers?: number
  totalHours?: number
}

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  city: string
  state: string
  category_name: string
  currentVolunteers: number
  maxVolunteers: number
  status: string
  organization_id: string
}

export default function OrganizationProfile() {
  const params = useParams()
  const router = useRouter()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchOrganizationDetails()
    }
  }, [params.id])

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Llamada real a la API para obtener la organización
      const orgResponse = await fetch(`/api/organizations/${params.id}`)
      if (!orgResponse.ok) {
        throw new Error('Organización no encontrada')
      }
      const organizationData = await orgResponse.json()
      
      // Llamada real a la API para obtener los eventos de la organización
      const eventsResponse = await fetch(`/api/organizations/${params.id}/events`)
      const eventsData = eventsResponse.ok ? await eventsResponse.json() : []

      setOrganization(organizationData)
      setEvents(eventsData)
    } catch (error) {
      console.error("Error fetching organization details:", error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando organización...</span>
        </div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Organización no encontrada'}
          </h2>
          <Button onClick={() => router.push("/eventos/buscar")}>
            Volver a buscar eventos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VolunNet
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Seguir
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header de la organización */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-50 p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Building className="h-8 w-8 text-blue-500" />
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
                      {organization.verified && (
                        <Badge className="bg-blue-100 text-blue-700 text-sm mt-2">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificada
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {organization.rating && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < Math.floor(organization.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-lg text-gray-600">({organization.rating})</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{organization.totalEvents || 0} eventos organizados</span>
                    </div>
                  )}

                  {organization.description && (
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">{organization.description}</p>
                  )}

                  {/* Información de contacto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {organization.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <span className="text-gray-700">{organization.email}</span>
                      </div>
                    )}
                    {organization.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">{organization.phone}</span>
                      </div>
                    )}
                    {organization.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-purple-500" />
                        <span className="text-gray-700">{organization.website}</span>
                      </div>
                    )}
                    {organization.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-red-500" />
                        <span className="text-gray-700">{organization.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Misión y Visión */}
            {(organization.mission || organization.vision) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-blue-50 p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Misión y Visión</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {organization.mission && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-500" />
                        Misión
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{organization.mission}</p>
                    </div>
                  )}
                  
                  {organization.vision && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Visión
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{organization.vision}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Estadísticas */}
            {(organization.totalEvents || organization.totalVolunteers || organization.totalHours) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg border border-blue-50 p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Impacto en la Comunidad</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {organization.totalEvents && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{organization.totalEvents}</div>
                      <div className="text-gray-600">Eventos Organizados</div>
                    </div>
                  )}
                  {organization.totalVolunteers && (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">{organization.totalVolunteers}</div>
                      <div className="text-gray-600">Voluntarios Participantes</div>
                    </div>
                  )}
                  {organization.totalHours && (
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{organization.totalHours}</div>
                      <div className="text-gray-600">Horas de Servicio</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Categorías */}
            {organization.categories && organization.categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg border border-blue-50 p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Áreas de Trabajo</h2>
                <div className="flex flex-wrap gap-3">
                  {organization.categories.map((category, index) => (
                    <Badge key={index} variant="secondary" className="text-sm px-4 py-2">
                      {category}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información adicional */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg border border-blue-50 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Información Adicional</h3>
              
              <div className="space-y-4">
                {organization.founded && (
                  <div>
                    <p className="text-sm text-gray-500">Fundada en</p>
                    <p className="font-medium text-gray-900">{organization.founded}</p>
                  </div>
                )}
                
                {(organization.city || organization.state) && (
                  <div>
                    <p className="text-sm text-gray-500">Ubicación</p>
                    <p className="font-medium text-gray-900">
                      {organization.city}{organization.city && organization.state ? ', ' : ''}{organization.state}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Estado de verificación</p>
                  <div className="flex items-center gap-2 mt-1">
                    {organization.verified ? (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificada
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        En proceso
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Eventos recientes */}
            {events.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-lg border border-blue-50 p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Eventos Recientes</h3>
                <div className="space-y-3">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                         onClick={() => router.push(`/eventos/${event.id}`)}>
                      <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                      <p className="text-xs text-gray-600">{event.city} • {formatDate(event.startDate)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {event.category_name}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {event.currentVolunteers}/{event.maxVolunteers} voluntarios
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {events.length > 3 && (
                  <Button variant="outline" className="w-full mt-4">
                    Ver todos los eventos
                  </Button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



