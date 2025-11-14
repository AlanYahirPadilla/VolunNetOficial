// Componente Simplificado de Recomendaciones
// Versión básica que funciona con datos reales

"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  MapPin, 
  Clock, 
  Users, 
  Calendar, 
  Star,
  RefreshCw,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// =================== TIPOS ===================

interface SimpleRecommendationsProps {
  className?: string
  showHeader?: boolean
  limit?: number
}

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  city: string
  state: string
  maxVolunteers: number
  currentVolunteers: number
  categoryId: string // Usaremos este para el filtro
  categoryName: string // Usaremos este para la visualización
  status: string
}

// =================== COMPONENTE PRINCIPAL ===================

export function SimpleRecommendations({ 
  className = "", 
  showHeader = true, 
  limit = 6 
}: SimpleRecommendationsProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // =================== CARGAR EVENTOS ===================

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Cargando eventos para recomendaciones...')

      // Primero obtener datos del voluntario para debug
      try {
        const volunteerResponse = await fetch('/api/perfil/voluntario', {
          credentials: 'include'
        })
        
        if (volunteerResponse.ok) {
          const volunteerData = await volunteerResponse.json()
          console.log(`👤 Datos del voluntario:`, volunteerData)
          console.log(`🎯 Intereses del voluntario:`, volunteerData.voluntario?.interests || [])
          console.log(`🛠️ Habilidades del voluntario:`, volunteerData.voluntario?.skills || [])
        }
      } catch (error) {
        console.log('⚠️ No se pudieron cargar datos del voluntario:', error)
      }

      // Cargar eventos desde la API
      const response = await fetch('/api/eventos?limit=20', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      let eventsData = data.events || []

      // Usar solo eventos reales de la base de datos
      console.log('📊 Usando eventos reales de la base de datos')

      console.log(`📊 Eventos cargados: ${eventsData.length}`)
      console.log(`📋 Datos de eventos:`, eventsData)

      // Convertir a formato esperado
      const formattedEvents = eventsData.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description || 'Sin descripción',
        startDate: event.startDate || event.start_date,
        endDate: event.endDate || event.end_date,
        city: event.city || 'Ciudad no especificada',
        state: event.state || 'Estado no especificado',
        maxVolunteers: event.maxVolunteers || event.max_volunteers || 10,
        currentVolunteers: event.currentVolunteers || event.current_volunteers || 0,
        categoryId: event.categoryId || event.category, // Aseguramos que sea el ID
        categoryName: event.category_name || event.category || 'General', // Para mostrar el nombre
        status: event.status || 'published'
      }))

      console.log(`📋 Eventos formateados:`, formattedEvents)

      // Obtener intereses del voluntario para filtro de categorías
      let volunteerInterests: string[] = []
      try {
        const volunteerResponse = await fetch('/api/perfil/voluntario', {
          credentials: 'include'
        })
        if (volunteerResponse.ok) {
          const volunteerData = await volunteerResponse.json()
          volunteerInterests = volunteerData.voluntario?.interests || []
          console.log(`🎯 Intereses del voluntario para filtro:`, volunteerInterests)
        }
      } catch (error) {
        console.log('⚠️ No se pudieron cargar intereses del voluntario')
      }

      // Filtrar eventos futuros y con cupo disponible
      const availableEvents = formattedEvents.filter(event => {
        const eventDate = new Date(event.startDate)
        const now = new Date()
        const hasSpace = event.currentVolunteers < event.maxVolunteers
        const isFuture = eventDate > now
        const isPublished = event.status === 'published' || event.status === 'PUBLISHED'
        
        // Verificar si la categoría del evento coincide con los intereses del voluntario
        const eventCategoryId = event.categoryId;
        const eventCategoryName = event.categoryName;
        const categoryMatch = volunteerInterests.length === 0 || 
          volunteerInterests.includes(eventCategoryId)
        
        console.log(`🔍 Evento: ${event.title}`)
        console.log(`  - Categoría: ${eventCategoryName} (ID: ${eventCategoryId})`)
        console.log(`  - Intereses del voluntario: ${volunteerInterests.join(', ')}`)
        console.log(`  - Coincide categoría: ${categoryMatch}`)
        console.log(`  - Fecha evento: ${eventDate.toISOString()}`)
        console.log(`  - Fecha actual: ${now.toISOString()}`)
        console.log(`  - Es futuro: ${isFuture}`)
        console.log(`  - Tiene espacio: ${hasSpace} (${event.currentVolunteers}/${event.maxVolunteers})`)
        console.log(`  - Está publicado: ${isPublished} (${event.status})`)
        
        // Aplicar filtros correctos
        const passesFilter = isPublished && hasSpace && categoryMatch
        console.log(`  - Pasa filtro: ${passesFilter}`)
        
        return passesFilter
      })

      console.log(`✅ Eventos disponibles: ${availableEvents.length}`)
      setEvents(availableEvents.slice(0, limit))

    } catch (err) {
      console.error('❌ Error cargando eventos:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // =================== EFECTOS ===================

  useEffect(() => {
    loadEvents()
  }, [])

  // =================== MANEJADORES ===================

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadEvents()
  }

  const handleApply = async (eventId: string) => {
    try {
      console.log(`📝 Aplicando a evento: ${eventId}`)
      // Aquí iría la lógica de aplicación
      alert(`Aplicación enviada para el evento ${eventId}`)
    } catch (error) {
      console.error('Error aplicando al evento:', error)
    }
  }

  // =================== RENDER ===================

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Recomendaciones por IA
            </h3>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Recomendaciones por IA
            </h3>
          </div>
        )}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h4 className="font-semibold text-red-700 mb-2">Error cargando recomendaciones</h4>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Recomendaciones por IA
            </h3>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {events.length} eventos
            </Badge>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      )}

      {/* Eventos */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                    {event.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-purple-100 text-purple-700">
                      Recomendado por IA
                    </Badge>
                    <Badge variant="outline">
                      {event.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Información básica */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span>{event.city}, {event.state}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span>
                        {event.currentVolunteers}/{event.maxVolunteers} voluntarios
                      </span>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="text-sm text-gray-700">
                    {event.description.length > 100 
                      ? `${event.description.substring(0, 100)}...` 
                      : event.description
                    }
                  </div>

                  {/* Razones de recomendación */}
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-700">¿Por qué te recomendamos esto?</span>
                    </div>
                    <div className="text-sm text-purple-600">
                      • Está en tu área geográfica<br/>
                      • Tiene cupo disponible<br/>
                      • Es un evento futuro<br/>
                      • Coincide con tus intereses
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/eventos/${event.id}`}>Ver detalles</Link>
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => handleApply(event.id)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Aplicar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-700 mb-2">No hay eventos disponibles</h4>
            <p className="text-gray-500 text-sm mb-4">
              No se encontraron eventos que coincidan con tus criterios de búsqueda.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SimpleRecommendations
