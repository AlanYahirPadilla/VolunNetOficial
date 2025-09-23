// Servicio Principal de Recomendaciones con IA
// Integra todos los componentes del sistema de recomendaciones inteligentes

import { Volunteer, Event, EventCategory } from '@/types'
import { RecommendationEngine, RecommendationScore, RecommendationConfig } from './RecommendationEngine'
import { AIConfigService, AISettings } from './AIConfigService'
import { ExternalAIService, AIRecommendationInsight } from './ExternalAIService'

// =================== TIPOS Y INTERFACES ===================

export interface EnhancedRecommendation extends RecommendationScore {
  event: Event
  aiInsights: AIRecommendationInsight
  explanation: string
  actionItems: string[]
  relatedEvents: string[]
}

export interface RecommendationRequest {
  volunteerId: string
  limit?: number
  includePastEvents?: boolean
  customConfig?: Partial<RecommendationConfig>
  preferences?: {
    maxDistance?: number
    preferredCategories?: string[]
    difficultyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'any'
    timeCommitment?: 'low' | 'medium' | 'high' | 'any'
  }
}

export interface RecommendationResponse {
  recommendations: EnhancedRecommendation[]
  totalFound: number
  config: RecommendationConfig
  insights: {
    topCategories: string[]
    averageScore: number
    confidenceLevel: 'low' | 'medium' | 'high'
    suggestions: string[]
  }
  metadata: {
    processingTime: number
    aiServicesUsed: string[]
    cacheHitRate: number
  }
}

// =================== CLASE PRINCIPAL ===================

export class RecommendationService {
  private static instance: RecommendationService
  private recommendationEngine: RecommendationEngine
  private aiConfigService: AIConfigService
  private externalAIService: ExternalAIService

  private constructor() {
    this.recommendationEngine = new RecommendationEngine()
    this.aiConfigService = AIConfigService.getInstance()
    this.externalAIService = ExternalAIService.getInstance()
  }

  static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService()
    }
    return RecommendationService.instance
  }

  // =================== MÉTODO PRINCIPAL ===================

  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    const startTime = Date.now()
    console.log(`🚀 Iniciando generación de recomendaciones para voluntario ${request.volunteerId}`)

    try {
      // 1. Obtener configuración del usuario
      const userSettings = await this.aiConfigService.getUserAISettings(request.volunteerId)
      
      // 2. Aplicar configuración personalizada si se proporciona
      if (request.customConfig) {
        this.recommendationEngine.updateConfig({
          ...userSettings.config,
          ...request.customConfig
        })
      } else {
        this.recommendationEngine.updateConfig(userSettings.config)
      }

      // 3. Obtener datos del voluntario y eventos
      const { volunteer, events, categories } = await this.loadRecommendationData(request)
      
      if (!volunteer) {
        throw new Error('Voluntario no encontrado')
      }

      // 4. Generar recomendaciones básicas
      const basicRecommendations = await this.recommendationEngine.getRecommendations({
        volunteer,
        events,
        categories,
        config: this.recommendationEngine.getConfig(),
        userPreferences: userSettings.preferences
      })

      // 5. Mejorar con IA externa
      const enhancedRecommendations = await this.enhanceRecommendationsWithAI(
        basicRecommendations,
        volunteer,
        events
      )

      // 6. Aplicar filtros finales
      const filteredRecommendations = this.applyFinalFilters(enhancedRecommendations, request)

      // 7. Generar insights y metadatos
      const insights = await this.generateRecommendationInsights(enhancedRecommendations, volunteer)
      const metadata = this.generateMetadata(startTime, request)

      // 8. Registrar interacción para aprendizaje
      await this.recordRecommendationGeneration(request.volunteerId, enhancedRecommendations.length)

      console.log(`✅ Recomendaciones generadas exitosamente: ${filteredRecommendations.length}`)

      return {
        recommendations: filteredRecommendations,
        totalFound: enhancedRecommendations.length,
        config: this.recommendationEngine.getConfig(),
        insights,
        metadata
      }

    } catch (error) {
      console.error('❌ Error generando recomendaciones:', error)
      throw error
    }
  }

  // =================== CARGAR DATOS ===================

  private async loadRecommendationData(request: RecommendationRequest): Promise<{
    volunteer: Volunteer | null
    events: Event[]
    categories: EventCategory[]
  }> {
    try {
      // En una implementación real, esto haría consultas a la base de datos
      // Por ahora, simulamos la carga de datos
      
      const volunteer = await this.loadVolunteer(request.volunteerId)
      const events = await this.loadEvents(request)
      const categories = await this.loadCategories()

      return { volunteer, events, categories }
    } catch (error) {
      console.error('Error cargando datos para recomendaciones:', error)
      throw error
    }
  }

  private async loadVolunteer(volunteerId: string): Promise<Volunteer | null> {
    try {
      // Cargar datos reales del voluntario desde la API
      const response = await fetch(`/api/perfil/voluntario`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        console.error('Error cargando perfil del voluntario:', response.status)
        return null
      }
      
      const data = await response.json()
      const { user, voluntario } = data
      
      if (!voluntario) {
        console.error('No se encontró perfil de voluntario')
        return null
      }
      
      // Convertir datos de la BD al formato esperado
      return {
        id: voluntario.id,
        userId: voluntario.userId,
        skills: voluntario.skills || [],
        interests: voluntario.interests || [],
        bio: voluntario.bio || '',
        rating: voluntario.rating || 0,
        hoursCompleted: voluntario.hoursCompleted || 0,
        eventsParticipated: voluntario.eventsParticipated || 0,
        latitude: voluntario.latitude,
        longitude: voluntario.longitude,
        city: voluntario.city || '',
        state: voluntario.state || '',
        country: voluntario.country || '',
        address: voluntario.address || '',
        availability: voluntario.availability || [],
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      }
    } catch (error) {
      console.error('Error cargando voluntario:', error)
      return null
    }
  }

  private async loadEvents(request: RecommendationRequest): Promise<Event[]> {
    try {
      // Cargar eventos reales desde la API
      const response = await fetch('/api/eventos?limit=50', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        console.error('Error cargando eventos:', response.status)
        return []
      }
      
      const data = await response.json()
      const events = data.events || []
      
      console.log(`📊 Eventos cargados desde la BD: ${events.length}`)
      
      // Convertir eventos de la BD al formato esperado
      return events.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        organizationId: event.organizationId,
        organization: {
          id: event.organizationId,
          name: event.organization_name || 'Organización',
          description: 'Organización sin fines de lucro',
          role: 'organization' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        location: {
          address: event.address || '',
          city: event.city || '',
          state: event.state || '',
          country: event.country || 'México',
          latitude: event.latitude || 0,
          longitude: event.longitude || 0
        },
        startDate: new Date(event.startDate || event.start_date),
        endDate: new Date(event.endDate || event.end_date),
        maxVolunteers: event.maxVolunteers || event.max_volunteers || 10,
        currentVolunteers: event.currentVolunteers || event.current_volunteers || 0,
        skills: event.skills || [],
        category: {
          id: event.categoryId || event.category_id || 'cat_1',
          name: event.category_name || 'General',
          description: 'Categoría general',
          icon: '🎯',
          color: 'bg-gray-100 text-gray-700'
        },
        categoryId: event.categoryId || event.category_id || 'cat_1',
        status: event.status?.toLowerCase() || 'published',
        requirements: event.requirements || [],
        benefits: event.benefits || [],
        createdAt: new Date(event.createdAt || event.created_at),
        updatedAt: new Date(event.updatedAt || event.updated_at)
      }))
    } catch (error) {
      console.error('Error cargando eventos:', error)
      return []
    }
  }

  private async loadCategories(): Promise<EventCategory[]> {
    try {
      // Cargar categorías reales desde la BD
      // Por ahora usamos categorías predefinidas que coinciden con el schema
      return [
        {
          id: 'cat_1',
          name: 'Educación',
          description: 'Enseñanza y capacitación',
          icon: '🎓',
          color: 'bg-blue-100 text-blue-700'
        },
        {
          id: 'cat_2',
          name: 'Medio Ambiente',
          description: 'Conservación y sostenibilidad',
          icon: '🌱',
          color: 'bg-green-100 text-green-700'
        },
        {
          id: 'cat_3',
          name: 'Salud',
          description: 'Bienestar y salud comunitaria',
          icon: '❤️',
          color: 'bg-red-100 text-red-700'
        },
        {
          id: 'cat_4',
          name: 'Alimentación',
          description: 'Programas de nutrición',
          icon: '🍽️',
          color: 'bg-orange-100 text-orange-700'
        },
        {
          id: 'cat_5',
          name: 'Tecnología',
          description: 'Capacitación digital',
          icon: '💻',
          color: 'bg-purple-100 text-purple-700'
        },
        {
          id: 'cat_6',
          name: 'Deportes',
          description: 'Actividades deportivas',
          icon: '🏆',
          color: 'bg-yellow-100 text-yellow-700'
        },
        {
          id: 'cat_7',
          name: 'Arte y Cultura',
          description: 'Expresión artística',
          icon: '🎨',
          color: 'bg-pink-100 text-pink-700'
        },
        {
          id: 'cat_8',
          name: 'Construcción',
          description: 'Proyectos comunitarios',
          icon: '🔨',
          color: 'bg-gray-100 text-gray-700'
        }
      ]
    } catch (error) {
      console.error('Error cargando categorías:', error)
      return []
    }
  }

  // =================== MEJORAR CON IA ===================

  private async enhanceRecommendationsWithAI(
    basicRecommendations: RecommendationScore[],
    volunteer: Volunteer,
    events: Event[]
  ): Promise<EnhancedRecommendation[]> {
    const enhanced: EnhancedRecommendation[] = []

    for (const rec of basicRecommendations) {
      try {
        const event = events.find(e => e.id === rec.eventId)
        if (!event) continue

        // Generar insights de IA
        const aiInsights = await this.externalAIService.generateComprehensiveInsights(volunteer, event)
        
        // Generar explicación personalizada
        const explanation = this.generateExplanation(rec, aiInsights, volunteer, event)
        
        // Generar elementos de acción
        const actionItems = this.generateActionItems(rec, aiInsights, event)
        
        // Encontrar eventos relacionados
        const relatedEvents = this.findRelatedEvents(event, events)

        enhanced.push({
          ...rec,
          event,
          aiInsights,
          explanation,
          actionItems,
          relatedEvents
        })

      } catch (error) {
        console.error(`Error mejorando recomendación ${rec.eventId}:`, error)
        // Agregar recomendación básica sin mejoras de IA
        const event = events.find(e => e.id === rec.eventId)
        if (event) {
          enhanced.push({
            ...rec,
            event,
            aiInsights: {
              semanticSimilarity: 0.5,
              sentimentAnalysis: {
                sentiment: 'neutral',
                keywords: [],
                categoryHints: [],
                difficultyLevel: 'intermediate',
                timeCommitment: 'medium',
                language: 'es',
                confidence: 0.5
              },
              difficultyMatch: 'good',
              timeCommitmentMatch: 'good',
              networkingPotential: 50,
              growthOpportunity: 50,
              riskFactors: [],
              opportunityFactors: []
            },
            explanation: 'Recomendación basada en compatibilidad básica',
            actionItems: ['Revisar detalles del evento'],
            relatedEvents: []
          })
        }
      }
    }

    return enhanced
  }

  // =================== GENERAR EXPLICACIONES ===================

  private generateExplanation(
    rec: RecommendationScore,
    aiInsights: AIRecommendationInsight,
    volunteer: Volunteer,
    event: Event
  ): string {
    const reasons = rec.reasons
    const score = rec.score
    const confidence = rec.confidence

    let explanation = `Este evento tiene una compatibilidad del ${score}% contigo. `

    // Agregar razones principales
    if (reasons.length > 0) {
      explanation += `Las principales razones son: ${reasons.slice(0, 3).join(', ')}. `
    }

    // Agregar insights de IA
    if (aiInsights.semanticSimilarity > 0.7) {
      explanation += `El contenido del evento se alinea muy bien con tus intereses. `
    }

    if (aiInsights.sentimentAnalysis.sentiment === 'positive') {
      explanation += `La descripción del evento es muy motivadora. `
    }

    if (aiInsights.difficultyMatch === 'perfect') {
      explanation += `El nivel de dificultad es perfecto para tu experiencia. `
    }

    if (aiInsights.networkingPotential > 70) {
      explanation += `Es una excelente oportunidad para conocer a otros voluntarios. `
    }

    // Agregar nivel de confianza
    if (confidence > 0.8) {
      explanation += `Tenemos mucha confianza en esta recomendación.`
    } else if (confidence > 0.6) {
      explanation += `Esta recomendación tiene una buena probabilidad de éxito.`
    } else {
      explanation += `Considera revisar los detalles antes de decidir.`
    }

    return explanation
  }

  private generateActionItems(
    rec: RecommendationScore,
    aiInsights: AIRecommendationInsight,
    event: Event
  ): string[] {
    const actions: string[] = []

    // Acciones basadas en el score
    if (rec.score >= 80) {
      actions.push('¡Aplica ahora! Este evento es perfecto para ti')
    } else if (rec.score >= 60) {
      actions.push('Considera aplicar - es una buena opción')
    } else {
      actions.push('Revisa cuidadosamente antes de aplicar')
    }

    // Acciones basadas en insights de IA
    if (aiInsights.riskFactors.length > 0) {
      actions.push(`Considera: ${aiInsights.riskFactors[0]}`)
    }

    if (aiInsights.opportunityFactors.length > 0) {
      actions.push(`Oportunidad: ${aiInsights.opportunityFactors[0]}`)
    }

    if (aiInsights.timeCommitmentMatch === 'too_much') {
      actions.push('Verifica tu disponibilidad - requiere mucho tiempo')
    }

    if (aiInsights.difficultyMatch === 'challenging') {
      actions.push('Prepárate para un desafío - puede ser intenso')
    }

    // Acciones generales
    actions.push('Lee la descripción completa del evento')
    actions.push('Contacta al organizador si tienes preguntas')

    return actions
  }

  private findRelatedEvents(event: Event, allEvents: Event[]): string[] {
    // Encontrar eventos relacionados por categoría, ubicación o habilidades
    return allEvents
      .filter(e => e.id !== event.id)
      .filter(e => 
        e.categoryId === event.categoryId ||
        e.skills.some(skill => event.skills.includes(skill)) ||
        e.city === event.city
      )
      .slice(0, 3)
      .map(e => e.id)
  }

  // =================== FILTROS FINALES ===================

  private applyFinalFilters(
    recommendations: EnhancedRecommendation[],
    request: RecommendationRequest
  ): EnhancedRecommendation[] {
    let filtered = [...recommendations]

    // Filtrar por distancia máxima
    if (request.preferences?.maxDistance) {
      // Implementar filtro de distancia si es necesario
    }

    // Filtrar por categorías preferidas
    if (request.preferences?.preferredCategories?.length) {
      filtered = filtered.filter(rec => 
        request.preferences!.preferredCategories!.includes(rec.event.categoryId)
      )
    }

    // Filtrar por nivel de dificultad
    if (request.preferences?.difficultyLevel && request.preferences.difficultyLevel !== 'any') {
      filtered = filtered.filter(rec => 
        rec.aiInsights.sentimentAnalysis.difficultyLevel === request.preferences!.difficultyLevel
      )
    }

    // Limitar número de resultados
    if (request.limit) {
      filtered = filtered.slice(0, request.limit)
    }

    return filtered
  }

  // =================== GENERAR INSIGHTS ===================

  private async generateRecommendationInsights(
    recommendations: EnhancedRecommendation[],
    volunteer: Volunteer
  ): Promise<RecommendationResponse['insights']> {
    if (recommendations.length === 0) {
      return {
        topCategories: [],
        averageScore: 0,
        confidenceLevel: 'low',
        suggestions: ['No se encontraron recomendaciones adecuadas']
      }
    }

    // Categorías más frecuentes
    const categoryCounts = new Map<string, number>()
    recommendations.forEach(rec => {
      const category = rec.event.categoryId
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1)
    })
    const topCategories = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category)

    // Score promedio
    const averageScore = recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length

    // Nivel de confianza
    const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length
    const confidenceLevel = avgConfidence > 0.7 ? 'high' : avgConfidence > 0.5 ? 'medium' : 'low'

    // Sugerencias
    const suggestions: string[] = []
    if (averageScore < 60) {
      suggestions.push('Considera actualizar tus intereses para mejores recomendaciones')
    }
    if (topCategories.length < 2) {
      suggestions.push('Explora diferentes categorías de eventos')
    }
    if (recommendations.length < 5) {
      suggestions.push('Amplía tu radio de búsqueda para ver más opciones')
    }

    return {
      topCategories,
      averageScore: Math.round(averageScore),
      confidenceLevel,
      suggestions
    }
  }

  private generateMetadata(startTime: number, request: RecommendationRequest): RecommendationResponse['metadata'] {
    const processingTime = Date.now() - startTime
    
    return {
      processingTime,
      aiServicesUsed: ['OpenAI', 'HuggingFace', 'GoogleMaps'],
      cacheHitRate: 0.75 // Simulado
    }
  }

  // =================== REGISTRAR INTERACCIONES ===================

  private async recordRecommendationGeneration(volunteerId: string, count: number): Promise<void> {
    try {
      await this.aiConfigService.recordRecommendationInteraction(volunteerId, '', 'viewed')
    } catch (error) {
      console.error('Error registrando generación de recomendaciones:', error)
    }
  }

  // =================== MÉTODOS PÚBLICOS ===================

  async recordUserInteraction(
    volunteerId: string,
    eventId: string,
    action: 'viewed' | 'clicked' | 'applied' | 'dismissed'
  ): Promise<void> {
    await this.aiConfigService.recordRecommendationInteraction(volunteerId, eventId, action)
  }

  async getUserInsights(volunteerId: string) {
    return await this.aiConfigService.generateUserInsights(volunteerId)
  }

  async optimizeUserSettings(volunteerId: string) {
    return await this.aiConfigService.optimizeUserSettings(volunteerId)
  }

  async updateUserPreferences(volunteerId: string, preferences: any) {
    const settings = await this.aiConfigService.getUserAISettings(volunteerId)
    return await this.aiConfigService.updateUserAISettings(volunteerId, {
      ...settings,
      preferences: { ...settings.preferences, ...preferences }
    })
  }
}

// =================== INSTANCIA SINGLETON ===================

export const recommendationService = RecommendationService.getInstance()
