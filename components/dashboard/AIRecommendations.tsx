// Componente de Recomendaciones con IA para el Dashboard
// Muestra eventos recomendados con explicaciones inteligentes

"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Calendar, 
  Brain, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Settings,
  RefreshCw,
  Filter,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRecommendations } from '@/hooks/useRecommendations'
import { EnhancedRecommendation } from '@/lib/services/RecommendationService'

// =================== TIPOS ===================

interface AIRecommendationsProps {
  className?: string
  showHeader?: boolean
  limit?: number
  autoRefresh?: boolean
}

interface RecommendationCardProps {
  recommendation: EnhancedRecommendation
  onInteraction: (eventId: string, action: 'viewed' | 'clicked' | 'applied' | 'dismissed') => void
}

// =================== COMPONENTE PRINCIPAL ===================

export function AIRecommendations({ 
  className = "", 
  showHeader = true, 
  limit = 6,
  autoRefresh = true 
}: AIRecommendationsProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const {
    recommendations,
    insights,
    loading,
    error,
    refreshing,
    refresh,
    recordInteraction,
    updatePreferences
  } = useRecommendations({
    limit,
    autoRefresh,
    refreshInterval: 300000 // 5 minutos
  })

  // Estado para debug
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  // Cargar información de debug
  useEffect(() => {
    const loadDebugInfo = async () => {
      try {
        const response = await fetch('/api/recommendations/debug', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setDebugInfo(data.debug)
        }
      } catch (error) {
        console.error('Error cargando debug info:', error)
      }
    }
    loadDebugInfo()
  }, [])

  // =================== MANEJADORES ===================

  const handleInteraction = async (eventId: string, action: 'viewed' | 'clicked' | 'applied' | 'dismissed') => {
    await recordInteraction(eventId, action)
  }

  const handleRefresh = async () => {
    await refresh()
  }

  const handleCategoryFilter = async (categoryId: string | null) => {
    setSelectedCategory(categoryId)
    if (categoryId) {
      await updatePreferences({ preferredCategories: [categoryId] })
    } else {
      await updatePreferences({ preferredCategories: undefined })
    }
  }

  // =================== FILTRAR RECOMENDACIONES ===================

  const filteredRecommendations = selectedCategory 
    ? recommendations.filter(rec => rec.event.categoryId === selectedCategory)
    : recommendations

  // =================== RENDER ===================

  if (loading && !refreshing) {
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
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
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
            {insights && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {insights.confidenceLevel === 'high' ? 'Alta precisión' : 
                 insights.confidenceLevel === 'medium' ? 'Buena precisión' : 'Baja precisión'}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Debug
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            
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
        </div>
      )}

      {/* Filtros */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Categorías:</span>
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryFilter(null)}
              >
                Todas
              </Button>
              {insights?.topCategories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryFilter(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel de Debug */}
      <AnimatePresence>
        {showDebug && debugInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-800">Información de Debug</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDebug(false)}
                className="text-gray-500"
              >
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Usuario</h5>
                <div className="space-y-1 text-gray-600">
                  <div>ID: {debugInfo.user?.id}</div>
                  <div>Rol: {debugInfo.user?.role}</div>
                  <div>Email: {debugInfo.user?.email}</div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Voluntario</h5>
                <div className="space-y-1 text-gray-600">
                  <div>Perfil: {debugInfo.volunteer?.hasProfile ? '✅' : '❌'}</div>
                  <div>Habilidades: {debugInfo.volunteer?.skills?.length || 0}</div>
                  <div>Intereses: {debugInfo.volunteer?.interests?.length || 0}</div>
                  <div>Ubicación: {debugInfo.volunteer?.location?.city || 'No definida'}</div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Eventos</h5>
                <div className="space-y-1 text-gray-600">
                  <div>Total: {debugInfo.events?.total || 0}</div>
                  <div>Muestra: {debugInfo.events?.sample?.length || 0}</div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Sistema</h5>
                <div className="space-y-1 text-gray-600">
                  <div>Timestamp: {new Date(debugInfo.system?.timestamp).toLocaleString()}</div>
                  <div>Ambiente: {debugInfo.system?.environment}</div>
                </div>
              </div>
            </div>
            
            {debugInfo.events?.sample && debugInfo.events.sample.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Eventos de Muestra</h5>
                <div className="space-y-1">
                  {debugInfo.events.sample.map((event: any, index: number) => (
                    <div key={index} className="text-xs text-gray-600 bg-white p-2 rounded">
                      <div className="font-medium">{event.title}</div>
                      <div>Estado: {event.status} | Ciudad: {event.city} | Categoría: {event.category}</div>
                      <div>Voluntarios: {event.volunteers}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insights */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Score Promedio</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{insights.averageScore}%</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700">Precisión</span>
              </div>
              <div className="text-2xl font-bold text-green-900 capitalize">{insights.confidenceLevel}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-700">Encontradas</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">{filteredRecommendations.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recomendaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredRecommendations.map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.eventId}
              recommendation={recommendation}
              onInteraction={handleInteraction}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Estado vacío - Mostrar eventos básicos como fallback */}
      {filteredRecommendations.length === 0 && !loading && (
        <div className="space-y-4">
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-700 mb-2">No hay recomendaciones de IA disponibles</h4>
              <p className="text-gray-500 text-sm mb-4">
                El sistema de IA está procesando tus datos. Mientras tanto, aquí tienes algunos eventos disponibles:
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </CardContent>
          </Card>
          
          {/* Fallback: Mostrar eventos básicos */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Eventos Disponibles (Vista Básica)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">Sistema de IA en Desarrollo</h5>
                  <p className="text-blue-700 text-sm mb-3">
                    Estamos trabajando en mejorar las recomendaciones personalizadas para ti.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Clock className="h-3 w-3" />
                    <span>Próximamente: Recomendaciones más precisas</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <h5 className="font-semibold text-green-900 mb-2">Explora Eventos</h5>
                  <p className="text-green-700 text-sm mb-3">
                    Mientras tanto, puedes explorar todos los eventos disponibles en la pestaña "Eventos Disponibles".
                  </p>
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <MapPin className="h-3 w-3" />
                    <span>Encuentra eventos cerca de ti</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Sugerencias */}
      {insights?.suggestions && insights.suggestions.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">Sugerencias para mejores recomendaciones:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {insights.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-600">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// =================== COMPONENTE DE TARJETA ===================

function RecommendationCard({ recommendation, onInteraction }: RecommendationCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  const handleViewDetails = () => {
    setShowDetails(!showDetails)
    onInteraction(recommendation.eventId, 'viewed')
  }

  const handleApply = async () => {
    setIsApplying(true)
    try {
      // Aquí iría la lógica de aplicación al evento
      onInteraction(recommendation.eventId, 'applied')
      // Simular delay de aplicación
      await new Promise(resolve => setTimeout(resolve, 1000))
    } finally {
      setIsApplying(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle2 className="h-4 w-4 text-green-500" />
    if (confidence >= 0.6) return <AlertCircle className="h-4 w-4 text-yellow-500" />
    return <AlertCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                {recommendation.event.title}
              </CardTitle>
              
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getScoreColor(recommendation.score)}>
                  {recommendation.score}% compatible
                </Badge>
                {getConfidenceIcon(recommendation.confidence)}
                <span className="text-xs text-gray-500">
                  {Math.round(recommendation.confidence * 100)}% confianza
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Información básica */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>
                {new Date(recommendation.event.startDate).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-green-500" />
              <span>{recommendation.event.location.city}, {recommendation.event.location.state}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4 text-purple-500" />
              <span>
                {recommendation.event.currentVolunteers}/{recommendation.event.maxVolunteers} voluntarios
              </span>
            </div>
          </div>

          {/* Razones de recomendación */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">¿Por qué te recomendamos esto?</h4>
            <div className="space-y-1">
              {recommendation.reasons.slice(0, 2).map((reason, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Insights de IA */}
          {recommendation.aiInsights && (
            <div className="bg-purple-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-700">Análisis de IA</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-600">Similitud:</span>
                  <span className="font-medium text-purple-700">
                    {Math.round(recommendation.aiInsights.semanticSimilarity * 100)}%
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-gray-600">Networking:</span>
                  <span className="font-medium text-purple-700">
                    {recommendation.aiInsights.networkingPotential}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Elementos de acción */}
          {recommendation.actionItems.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700">Acciones sugeridas:</h4>
              <div className="space-y-1">
                {recommendation.actionItems.slice(0, 2).map((action, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <ArrowRight className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="flex-1"
            >
              Ver detalles
            </Button>
            
            <Button
              size="sm"
              onClick={handleApply}
              disabled={isApplying}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isApplying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Aplicando...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Aplicar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// =================== EXPORT ===================

export default AIRecommendations
