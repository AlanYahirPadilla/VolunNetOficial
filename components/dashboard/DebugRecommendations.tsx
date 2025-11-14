// Componente de Debug para Recomendaciones
// Muestra todos los eventos sin filtros para diagnosticar

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
  Bug
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// =================== TIPOS ===================

interface DebugRecommendationsProps {
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
  category: string
  status: string
}

// =================== COMPONENTE PRINCIPAL ===================

export function DebugRecommendations({ 
  className = "", 
  showHeader = true, 
  limit = 10 
}: DebugRecommendationsProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [rawData, setRawData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // =================== CARGAR EVENTOS ===================

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 DEBUG: Cargando eventos...')

      // Cargar eventos desde la API
      const response = await fetch('/api/eventos?limit=20', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('🔍 DEBUG: Respuesta completa:', data)
      
      setRawData(data)
      const eventsData = data.events || []
      console.log(`🔍 DEBUG: Eventos en data.events: ${eventsData.length}`)

      // Mostrar TODOS los eventos sin filtros
      const allEvents = eventsData.map((event: any, index: number) => {
        console.log(`🔍 DEBUG: Evento ${index + 1}:`, event)
        
        return {
          id: event.id || `event_${index}`,
          title: event.title || 'Sin título',
          description: event.description || 'Sin descripción',
          startDate: event.startDate || event.start_date || new Date().toISOString(),
          endDate: event.endDate || event.end_date || new Date().toISOString(),
          city: event.city || 'Ciudad no especificada',
          state: event.state || 'Estado no especificado',
          maxVolunteers: event.maxVolunteers || event.max_volunteers || 10,
          currentVolunteers: event.currentVolunteers || event.current_volunteers || 0,
          category: event.category_name || event.category || 'General',
          status: event.status || 'unknown'
        }
      })

      console.log(`🔍 DEBUG: Eventos procesados: ${allEvents.length}`)
      setEvents(allEvents.slice(0, limit))

    } catch (err) {
      console.error('❌ DEBUG: Error cargando eventos:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // =================== EFECTOS ===================

  useEffect(() => {
    loadEvents()
  }, [])

  // =================== RENDER ===================

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-500" />
              Debug Recomendaciones
            </h3>
          </div>
        )}
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de debug...</p>
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
              <Bug className="h-5 w-5 text-red-500" />
              Debug Recomendaciones
            </h3>
          </div>
        )}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h4 className="font-semibold text-red-700 mb-2">Error en Debug</h4>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <Button onClick={loadEvents} variant="outline" size="sm">
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
              <Bug className="h-5 w-5 text-red-500" />
              Debug Recomendaciones
            </h3>
            <Badge variant="destructive">
              {events.length} eventos (sin filtros)
            </Badge>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadEvents}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      )}

      {/* Datos Raw */}
      {rawData && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800">Datos Raw de la API</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-yellow-700 overflow-auto max-h-40">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </CardContent>
        </Card>
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
              <Card className="border-2 border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-red-900 mb-2">
                    {event.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive">
                      DEBUG #{index + 1}
                    </Badge>
                    <Badge variant="outline">
                      {event.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Información de Debug */}
                  <div className="bg-red-100 rounded-lg p-3">
                    <div className="text-sm font-medium text-red-800 mb-2">Información de Debug:</div>
                    <div className="text-xs text-red-700 space-y-1">
                      <div><strong>ID:</strong> {event.id}</div>
                      <div><strong>Estado:</strong> {event.status}</div>
                      <div><strong>Fecha:</strong> {new Date(event.startDate).toLocaleString()}</div>
                      <div><strong>Voluntarios:</strong> {event.currentVolunteers}/{event.maxVolunteers}</div>
                      <div><strong>Categoría:</strong> {event.category}</div>
                    </div>
                  </div>

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
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-8 text-center">
            <Bug className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-700 mb-2">No hay eventos en los datos</h4>
            <p className="text-gray-500 text-sm mb-4">
              Los datos de la API no contienen eventos o están en un formato inesperado.
            </p>
            <Button onClick={loadEvents} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DebugRecommendations
