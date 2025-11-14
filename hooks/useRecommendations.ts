// Hook personalizado para manejar recomendaciones de IA
// Proporciona una interfaz fácil para usar el sistema de recomendaciones

import { useState, useEffect, useCallback } from 'react'
import { EnhancedRecommendation, RecommendationResponse } from '@/lib/services/RecommendationService'

// =================== TIPOS Y INTERFACES ===================

export interface UseRecommendationsOptions {
  limit?: number
  includePastEvents?: boolean
  maxDistance?: number
  preferredCategories?: string[]
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'any'
  timeCommitment?: 'low' | 'medium' | 'high' | 'any'
  autoRefresh?: boolean
  refreshInterval?: number // en milisegundos
}

export interface UseRecommendationsReturn {
  // Datos
  recommendations: EnhancedRecommendation[]
  insights: RecommendationResponse['insights'] | null
  metadata: RecommendationResponse['metadata'] | null
  
  // Estados
  loading: boolean
  error: string | null
  refreshing: boolean
  
  // Acciones
  refresh: () => Promise<void>
  recordInteraction: (eventId: string, action: 'viewed' | 'clicked' | 'applied' | 'dismissed') => Promise<void>
  updatePreferences: (preferences: Partial<UseRecommendationsOptions>) => Promise<void>
  
  // Utilidades
  getRecommendationById: (eventId: string) => EnhancedRecommendation | undefined
  getRecommendationsByCategory: (categoryId: string) => EnhancedRecommendation[]
  getTopRecommendations: (count: number) => EnhancedRecommendation[]
}

// =================== HOOK PRINCIPAL ===================

export function useRecommendations(options: UseRecommendationsOptions = {}): UseRecommendationsReturn {
  // Estados
  const [recommendations, setRecommendations] = useState<EnhancedRecommendation[]>([])
  const [insights, setInsights] = useState<RecommendationResponse['insights'] | null>(null)
  const [metadata, setMetadata] = useState<RecommendationResponse['metadata'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Configuración por defecto
  const defaultOptions: UseRecommendationsOptions = {
    limit: 10,
    includePastEvents: false,
    maxDistance: 10,
    preferredCategories: undefined,
    difficultyLevel: 'any',
    timeCommitment: 'any',
    autoRefresh: false,
    refreshInterval: 300000 // 5 minutos
  }

  const config = { ...defaultOptions, ...options }

  // =================== FUNCIONES PRINCIPALES ===================

  const fetchRecommendations = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      // Construir URL con parámetros
      const params = new URLSearchParams()
      
      if (config.limit) params.append('limit', config.limit.toString())
      if (config.includePastEvents) params.append('includePastEvents', 'true')
      if (config.maxDistance) params.append('maxDistance', config.maxDistance.toString())
      if (config.preferredCategories?.length) params.append('categories', config.preferredCategories.join(','))
      if (config.difficultyLevel && config.difficultyLevel !== 'any') params.append('difficulty', config.difficultyLevel)
      if (config.timeCommitment && config.timeCommitment !== 'any') params.append('timeCommitment', config.timeCommitment)

      const url = `/api/recommendations/events?${params.toString()}`
      
      console.log('🔄 Obteniendo recomendaciones:', url)

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setRecommendations(data.data.recommendations)
        setInsights(data.data.insights)
        setMetadata(data.data.metadata)
        console.log(`✅ Recomendaciones cargadas: ${data.data.recommendations.length}`)
      } else {
        throw new Error(data.message || 'Error desconocido')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('❌ Error obteniendo recomendaciones:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [config])

  const recordInteraction = useCallback(async (eventId: string, action: 'viewed' | 'clicked' | 'applied' | 'dismissed') => {
    try {
      const response = await fetch('/api/recommendations/events', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, action }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error ${response.status}`)
      }

      console.log(`📝 Interacción registrada: ${action} para evento ${eventId}`)
    } catch (err) {
      console.error('❌ Error registrando interacción:', err)
    }
  }, [])

  const updatePreferences = useCallback(async (preferences: Partial<UseRecommendationsOptions>) => {
    try {
      const response = await fetch('/api/recommendations/events', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error ${response.status}`)
      }

      console.log('⚙️ Preferencias actualizadas')
      
      // Refrescar recomendaciones con nuevas preferencias
      await fetchRecommendations(true)
    } catch (err) {
      console.error('❌ Error actualizando preferencias:', err)
      setError(err instanceof Error ? err.message : 'Error actualizando preferencias')
    }
  }, [fetchRecommendations])

  // =================== FUNCIONES UTILITARIAS ===================

  const getRecommendationById = useCallback((eventId: string): EnhancedRecommendation | undefined => {
    return recommendations.find(rec => rec.eventId === eventId)
  }, [recommendations])

  const getRecommendationsByCategory = useCallback((categoryId: string): EnhancedRecommendation[] => {
    return recommendations.filter(rec => rec.event.category?.id === categoryId || rec.event.categoryId === categoryId)
  }, [recommendations])

  const getTopRecommendations = useCallback((count: number): EnhancedRecommendation[] => {
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
  }, [recommendations])

  // =================== EFECTOS ===================

  // Cargar recomendaciones al montar el componente
  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  // Auto-refresh si está habilitado
  useEffect(() => {
    if (!config.autoRefresh || !config.refreshInterval) return

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh de recomendaciones')
      fetchRecommendations(true)
    }, config.refreshInterval)

    return () => clearInterval(interval)
  }, [config.autoRefresh, config.refreshInterval, fetchRecommendations])

  // =================== RETORNO ===================

  return {
    // Datos
    recommendations,
    insights,
    metadata,
    
    // Estados
    loading,
    error,
    refreshing,
    
    // Acciones
    refresh: () => fetchRecommendations(true),
    recordInteraction,
    updatePreferences,
    
    // Utilidades
    getRecommendationById,
    getRecommendationsByCategory,
    getTopRecommendations,
  }
}

// =================== HOOKS ESPECIALIZADOS ===================

// Hook para recomendaciones de alta prioridad
export function useTopRecommendations(count: number = 5, options: UseRecommendationsOptions = {}) {
  const { recommendations, ...rest } = useRecommendations({ ...options, limit: count * 2 })
  
  const topRecommendations = recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, count)

  return {
    ...rest,
    recommendations: topRecommendations
  }
}

// Hook para recomendaciones por categoría
export function useRecommendationsByCategory(categoryId: string, options: UseRecommendationsOptions = {}) {
  const { recommendations, ...rest } = useRecommendations(options)
  
  const categoryRecommendations = recommendations.filter(rec => 
    rec.event.category?.id === categoryId || rec.event.categoryId === categoryId
  )

  return {
    ...rest,
    recommendations: categoryRecommendations
  }
}

// Hook para recomendaciones cercanas
export function useNearbyRecommendations(maxDistance: number = 5, options: UseRecommendationsOptions = {}) {
  return useRecommendations({
    ...options,
    maxDistance,
    limit: options.limit || 8
  })
}

// =================== UTILIDADES ADICIONALES ===================

export function useRecommendationAnalytics() {
  const [analytics, setAnalytics] = useState<{
    totalViews: number
    totalClicks: number
    totalApplications: number
    averageScore: number
    topCategories: string[]
  } | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      // En una implementación real, esto vendría de una API de analytics
      // Por ahora, simulamos datos
      setAnalytics({
        totalViews: 45,
        totalClicks: 12,
        totalApplications: 3,
        averageScore: 78,
        topCategories: ['Educación', 'Tecnología', 'Medio Ambiente']
      })
    } catch (error) {
      console.error('Error obteniendo analytics:', error)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    analytics,
    refreshAnalytics: fetchAnalytics
  }
}
