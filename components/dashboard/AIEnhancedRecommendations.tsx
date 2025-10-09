// Componente de Recomendaciones Mejoradas con IA
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
  Sparkles,
  TrendingUp,
  Target,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SimpleAIRecommendation } from '@/lib/services/SimpleAIService'
import Link from 'next/link'

interface AIEnhancedRecommendationsProps {
  className?: string
  showHeader?: boolean
  limit?: number
}

export function AIEnhancedRecommendations({ 
  className = "", 
  showHeader = true, 
  limit = 6 
}: AIEnhancedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<SimpleAIRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aiInsights, setAiInsights] = useState<string[]>([])

  useEffect(() => {
    // Cargar recomendaciones de IA
    loadAIRecommendations()
  }, [limit])

  const loadAIRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🤖 Cargando recomendaciones con IA...')

      // Obtener perfil del voluntario
      const volunteerResponse = await fetch('/api/perfil/voluntario', {
        credentials: 'include'
      })
      
      if (!volunteerResponse.ok) {
        throw new Error('No se pudo cargar el perfil del voluntario')
      }

      const volunteerData = await volunteerResponse.json()
      const volunteer = volunteerData.voluntario

      if (!volunteer) {
        throw new Error('Perfil de voluntario no encontrado')
      }

      // Obtener eventos
      const eventsResponse = await fetch('/api/eventos?limit=20', {
        credentials: 'include'
      })

      if (!eventsResponse.ok) {
        throw new Error('No se pudieron cargar los eventos')
      }

      const eventsData = await eventsResponse.json()
      const events = eventsData.events || []
      
      console.log('📋 Eventos recibidos del API:', events)
      console.log('📊 Primer evento completo:', events[0])

      // Crear perfil de usuario para IA
      const userProfile = {
        id: volunteer.userId,
        interests: volunteer.interests || [],
        skills: volunteer.skills || [],
        experience: volunteer.experience || [],
        location: {
          city: volunteer.city || 'Guadalajara',
          state: volunteer.state || 'Jalisco'
        }
      }

      console.log('👤 Perfil del usuario para IA:', userProfile)

      // Generar recomendaciones con IA usando el endpoint del servidor
      let aiRecommendations: SimpleAIRecommendation[] = []
      
      try {
        console.log('🚀 Enviando solicitud al servidor para recomendaciones de IA...')
        const aiResponse = await fetch('/api/recommendations/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            userProfile,
            events
          })
        })

        if (!aiResponse.ok) {
          throw new Error(`Error del servidor: ${aiResponse.status}`)
        }

        const aiData = await aiResponse.json()
        aiRecommendations = aiData.recommendations || []
        
        console.log(`✅ Servidor generó ${aiRecommendations.length} recomendaciones de IA`)
      } catch (error) {
        console.log('⚠️ Error con el servidor de IA, usando recomendaciones básicas:', error)
        // Generar recomendaciones básicas sin IA
        aiRecommendations = generateBasicRecommendations(userProfile, events)
      }

      setRecommendations(aiRecommendations.slice(0, limit))
      
      // Generar insights de IA
      const insights = [
        `Basado en tus intereses en ${userProfile.interests.join(', ')}`,
        `Tus habilidades en ${userProfile.skills.slice(0, 3).join(', ')} son muy valoradas`,
        `Hemos encontrado ${aiRecommendations.length} eventos compatibles contigo`
      ]
      setAiInsights(insights)

      console.log(`✅ ${aiRecommendations.length} recomendaciones de IA cargadas`)

    } catch (err: any) {
      console.error('Error cargando recomendaciones de IA:', err)
      setError('No se pudieron cargar las recomendaciones de IA. Intenta de nuevo más tarde.')
    } finally {
      setLoading(false)
    }
  }

  // Método para generar recomendaciones básicas sin IA
  const generateBasicRecommendations = (userProfile: any, events: any[]): SimpleAIRecommendation[] => {
    console.log('🔧 Generando recomendaciones básicas sin IA...')
    
    return events.map((event) => {
      // Calcular puntuaciones básicas
      const categoryMatch = userProfile.interests.includes(event.categoryId) ? 100 : 0
      const skillMatch = calculateSkillMatch(userProfile.skills, event.skills)
      const semanticScore = 50 // Score neutral sin IA
      
      // Puntuación general ponderada
      const overallScore = (
        categoryMatch * 0.50 +      // 50% - Categoría (más importante)
        skillMatch * 0.30 +         // 30% - Habilidades
        semanticScore * 0.20        // 20% - Score neutral
      )

      return {
        eventId: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        maxVolunteers: event.maxVolunteers,
        currentVolunteers: event.currentVolunteers,
        
        scores: {
          overall: Math.round(overallScore),
          categoryMatch,
          skillMatch,
          semanticSimilarity: Math.round(semanticScore)
        },
        
        aiAnalysis: {
          keywords: extractKeywords(event.description),
          sentiment: 'positive' as const,
          complexity: 'intermediate' as const,
          themes: [event.category.toLowerCase()],
          summary: event.description.substring(0, 100) + '...'
        },
        
        personalizedReason: generatePersonalizedReason(event, userProfile),
        personalizedMessage: generatePersonalizedMessage(event, userProfile)
      }
    }).sort((a, b) => b.scores.overall - a.scores.overall)
      .filter(rec => rec.scores.overall > 30)
  }

  // Función auxiliar para calcular match de habilidades
  const calculateSkillMatch = (userSkills: string[], eventSkills: string[]): number => {
    if (eventSkills.length === 0) return 50
    
    const matchingSkills = userSkills.filter(skill => 
      eventSkills.some(eventSkill => 
        skill.toLowerCase().includes(eventSkill.toLowerCase()) ||
        eventSkill.toLowerCase().includes(skill.toLowerCase())
      )
    )
    
    return (matchingSkills.length / eventSkills.length) * 100
  }

  // Función auxiliar para extraer palabras clave básicas
  const extractKeywords = (text: string): string[] => {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['para', 'con', 'los', 'las', 'del', 'una', 'que', 'este', 'esta'].includes(word))
    
    return [...new Set(words)].slice(0, 5)
  }

  // Función auxiliar para generar razón personalizada
  const generatePersonalizedReason = (event: any, userProfile: any): string => {
    if (userProfile.interests.includes(event.categoryId)) {
      return `Este evento coincide con tu interés en ${event.category}`
    }
    if (userProfile.skills.some((skill: string) => 
      event.skills.some((eventSkill: string) => 
        skill.toLowerCase().includes(eventSkill.toLowerCase())
      )
    )) {
      return `Tus habilidades son perfectas para este evento`
    }
    return 'Este evento parece ser una buena opción para ti'
  }

  // Función auxiliar para generar mensaje personalizado
  const generatePersonalizedMessage = (event: any, userProfile: any): string => {
    if (userProfile.interests.includes(event.categoryId)) {
      return `¡Perfecto! Este evento de ${event.category} está alineado con tus intereses.`
    }
    return 'Este evento te permitirá contribuir a la comunidad y desarrollar nuevas habilidades.'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊'
      case 'negative': return '😔'
      default: return '😐'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'bg-green-100 text-green-700'
      case 'advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-yellow-100 text-yellow-700'
    }
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showHeader && (
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                <h3 className="text-sm sm:text-lg font-semibold">Recomendaciones por IA</h3>
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
              </div>
            </div>
            <Button variant="outline" size="sm" disabled className="w-full sm:w-auto">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
              Analizando...
            </Button>
          </div>
        )}
        
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Recomendaciones por IA</h3>
          </div>
        )}
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <Brain className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-red-800 mb-2">
              Error en las Recomendaciones de IA
            </h4>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadAIRecommendations} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showHeader && (
          <div className="flex items-center gap-2 flex-wrap">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            <h3 className="text-sm sm:text-lg font-semibold">Recomendaciones por IA</h3>
          </div>
        )}
        
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-4 sm:p-6 text-center">
            <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h4 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">
              No hay recomendaciones disponibles
            </h4>
            <p className="text-sm sm:text-base text-gray-500 mb-4">
              La IA no encontró eventos que coincidan con tu perfil actual.
            </p>
            <Button onClick={loadAIRecommendations} variant="outline" size="sm" className="w-full sm:w-auto">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Actualizar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showHeader && (
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              <h3 className="text-sm sm:text-lg font-semibold">Recomendaciones por IA</h3>
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
            </div>
            <Badge variant="secondary" className="text-xs">
              {recommendations.length} eventos
            </Badge>
          </div>
          <Button onClick={loadAIRecommendations} variant="outline" size="sm" className="w-full sm:w-auto">
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      )}

      {/* Insights de IA */}
      {aiInsights.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">Insights de IA</h4>
                <ul className="space-y-1">
                  {aiInsights.map((insight, index) => (
                    <li key={index} className="text-sm text-purple-700">
                      • {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendaciones */}
      <div className="grid gap-4">
        {recommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.eventId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{recommendation.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{recommendation.location?.city || 'Ciudad'}, {recommendation.location?.state || 'Estado'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(recommendation.startDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{recommendation.currentVolunteers}/{recommendation.maxVolunteers}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(recommendation.scores.overall)}`}>
                      {recommendation.scores.overall}%
                    </div>
                    <div className="text-xs text-gray-500">Compatibilidad</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-700 mb-4">{recommendation.description}</p>
                
                {/* Puntuaciones de IA */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Categoría</span>
                    </div>
                    <Progress value={recommendation.scores.categoryMatch} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">{recommendation.scores.categoryMatch}%</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Habilidades</span>
                    </div>
                    <Progress value={recommendation.scores.skillMatch} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">{recommendation.scores.skillMatch}%</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Semántica</span>
                    </div>
                    <Progress value={recommendation.scores.semanticSimilarity} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">{recommendation.scores.semanticSimilarity}%</div>
                  </div>
                </div>

                {/* Análisis de IA */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">
                    {getSentimentIcon(recommendation.aiAnalysis.sentiment)} {recommendation.aiAnalysis.sentiment}
                  </Badge>
                  <Badge className={`text-xs ${getComplexityColor(recommendation.aiAnalysis.complexity)}`}>
                    {recommendation.aiAnalysis.complexity}
                  </Badge>
                  {recommendation.aiAnalysis.keywords.slice(0, 3).map((keyword, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>

                {/* Razón personalizada */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-blue-800 mb-1">
                        ¿Por qué te recomendamos este evento?
                      </div>
                      <div className="text-sm text-blue-700">
                        {recommendation.personalizedReason}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button size="sm" asChild>
                    <Link href={`/eventos/${recommendation.eventId}`}>
                      Ver detalles
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
