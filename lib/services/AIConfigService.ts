// Servicio de Configuración de IA y Preferencias del Usuario
// Maneja la configuración personalizada del sistema de recomendaciones

import { RecommendationConfig, UserPreferences } from './RecommendationEngine'

// =================== TIPOS Y INTERFACES ===================

export interface AISettings {
  id: string
  userId: string
  config: RecommendationConfig
  preferences: UserPreferences
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AIPerformanceMetrics {
  userId: string
  totalRecommendations: number
  clickedRecommendations: number
  appliedRecommendations: number
  averageScore: number
  satisfactionRating: number
  lastUpdated: Date
}

export interface AIInsight {
  type: 'success' | 'warning' | 'info' | 'suggestion'
  title: string
  message: string
  actionUrl?: string
  priority: 'low' | 'medium' | 'high'
}

// =================== CLASE PRINCIPAL ===================

export class AIConfigService {
  private static instance: AIConfigService
  private settingsCache: Map<string, AISettings> = new Map()
  private metricsCache: Map<string, AIPerformanceMetrics> = new Map()

  private constructor() {}

  static getInstance(): AIConfigService {
    if (!AIConfigService.instance) {
      AIConfigService.instance = new AIConfigService()
    }
    return AIConfigService.instance
  }

  // =================== CONFIGURACIÓN DE USUARIO ===================

  async getUserAISettings(userId: string): Promise<AISettings> {
    // Verificar cache primero
    const cached = this.settingsCache.get(userId)
    if (cached) return cached

    try {
      // En una implementación real, esto vendría de la base de datos
      const settings = await this.loadUserSettingsFromDB(userId)
      this.settingsCache.set(userId, settings)
      return settings
    } catch (error) {
      console.error('Error cargando configuración de IA:', error)
      // Retornar configuración por defecto
      return this.getDefaultAISettings(userId)
    }
  }

  async updateUserAISettings(userId: string, updates: Partial<AISettings>): Promise<AISettings> {
    try {
      const currentSettings = await this.getUserAISettings(userId)
      const updatedSettings = {
        ...currentSettings,
        ...updates,
        updatedAt: new Date()
      }

      // Guardar en base de datos
      await this.saveUserSettingsToDB(updatedSettings)
      
      // Actualizar cache
      this.settingsCache.set(userId, updatedSettings)
      
      return updatedSettings
    } catch (error) {
      console.error('Error actualizando configuración de IA:', error)
      throw error
    }
  }

  async resetUserAISettings(userId: string): Promise<AISettings> {
    const defaultSettings = this.getDefaultAISettings(userId)
    return await this.updateUserAISettings(userId, defaultSettings)
  }

  // =================== CONFIGURACIONES PREDEFINIDAS ===================

  getDefaultAISettings(userId: string): AISettings {
    return {
      id: `ai_settings_${userId}`,
      userId,
      config: {
        weights: {
          location: 0.3,
          interests: 0.25,
          skills: 0.2,
          availability: 0.15,
          experience: 0.1
        },
        radius: {
          default: 10,
          max: 100,
          min: 1
        },
        filters: {
          minCompatibilityScore: 30,
          excludePastEvents: true,
          prioritizeVerifiedOrgs: true,
          requireLocationMatch: false
        },
        ai: {
          enableOpenAI: true,
          enableHuggingFace: true,
          enableGoogleMaps: true,
          cacheDuration: 3600
        }
      },
      preferences: {
        preferredTimeSlots: ['morning', 'afternoon'],
        preferredDays: [1, 2, 3, 4, 5], // Lunes a Viernes
        maxTravelDistance: 10,
        difficultyPreference: 'any',
        timeCommitmentPreference: 'any',
        organizationTypes: []
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  getPresetConfigurations(): Record<string, Partial<RecommendationConfig>> {
    return {
      'location_focused': {
        weights: {
          location: 0.5,
          interests: 0.2,
          skills: 0.15,
          availability: 0.1,
          experience: 0.05
        },
        radius: {
          default: 5,
          max: 50,
          min: 1
        }
      },
      'interest_focused': {
        weights: {
          location: 0.2,
          interests: 0.4,
          skills: 0.2,
          availability: 0.15,
          experience: 0.05
        },
        radius: {
          default: 25,
          max: 200,
          min: 1
        }
      },
      'skill_focused': {
        weights: {
          location: 0.2,
          interests: 0.2,
          skills: 0.4,
          availability: 0.15,
          experience: 0.05
        }
      },
      'beginner_friendly': {
        weights: {
          location: 0.25,
          interests: 0.25,
          skills: 0.1,
          availability: 0.25,
          experience: 0.15
        },
        filters: {
          minCompatibilityScore: 20,
          excludePastEvents: true,
          prioritizeVerifiedOrgs: true,
          requireLocationMatch: false
        }
      },
      'expert_mode': {
        weights: {
          location: 0.15,
          interests: 0.2,
          skills: 0.3,
          availability: 0.2,
          experience: 0.15
        },
        filters: {
          minCompatibilityScore: 60,
          excludePastEvents: true,
          prioritizeVerifiedOrgs: true,
          requireLocationMatch: false
        }
      }
    }
  }

  // =================== MÉTRICAS Y ANÁLISIS ===================

  async getUserMetrics(userId: string): Promise<AIPerformanceMetrics> {
    const cached = this.metricsCache.get(userId)
    if (cached) return cached

    try {
      const metrics = await this.loadUserMetricsFromDB(userId)
      this.metricsCache.set(userId, metrics)
      return metrics
    } catch (error) {
      console.error('Error cargando métricas de IA:', error)
      return this.getDefaultMetrics(userId)
    }
  }

  async updateUserMetrics(userId: string, updates: Partial<AIPerformanceMetrics>): Promise<void> {
    try {
      const currentMetrics = await this.getUserMetrics(userId)
      const updatedMetrics = {
        ...currentMetrics,
        ...updates,
        lastUpdated: new Date()
      }

      await this.saveUserMetricsToDB(updatedMetrics)
      this.metricsCache.set(userId, updatedMetrics)
    } catch (error) {
      console.error('Error actualizando métricas de IA:', error)
    }
  }

  async recordRecommendationInteraction(
    userId: string, 
    eventId: string, 
    action: 'viewed' | 'clicked' | 'applied' | 'dismissed'
  ): Promise<void> {
    try {
      const metrics = await this.getUserMetrics(userId)
      
      switch (action) {
        case 'viewed':
          metrics.totalRecommendations += 1
          break
        case 'clicked':
          metrics.clickedRecommendations += 1
          break
        case 'applied':
          metrics.appliedRecommendations += 1
          break
        case 'dismissed':
          // No incrementar contadores para dismissed
          break
      }

      await this.updateUserMetrics(userId, metrics)
    } catch (error) {
      console.error('Error registrando interacción:', error)
    }
  }

  // =================== INSIGHTS INTELIGENTES ===================

  async generateUserInsights(userId: string): Promise<AIInsight[]> {
    const settings = await this.getUserAISettings(userId)
    const metrics = await this.getUserMetrics(userId)
    const insights: AIInsight[] = []

    // Insight sobre configuración de radio
    if (settings.config.radius.default < 5) {
      insights.push({
        type: 'warning',
        title: 'Radio de búsqueda muy limitado',
        message: 'Tu radio de búsqueda es muy pequeño. Considera aumentarlo para ver más oportunidades.',
        actionUrl: '/configuracion/ia',
        priority: 'medium'
      })
    }

    // Insight sobre balance de pesos
    const weights = settings.config.weights
    const maxWeight = Math.max(...Object.values(weights))
    if (maxWeight > 0.5) {
      insights.push({
        type: 'suggestion',
        title: 'Configuración desbalanceada',
        message: 'Uno de los factores tiene demasiado peso. Considera balancear mejor tu configuración.',
        actionUrl: '/configuracion/ia',
        priority: 'low'
      })
    }

    // Insight sobre métricas de rendimiento
    if (metrics.totalRecommendations > 0) {
      const clickRate = metrics.clickedRecommendations / metrics.totalRecommendations
      if (clickRate < 0.1) {
        insights.push({
          type: 'info',
          title: 'Baja interacción con recomendaciones',
          message: 'Pocas recomendaciones te interesan. Actualiza tus preferencias para mejores sugerencias.',
          actionUrl: '/configuracion/ia',
          priority: 'high'
        })
      }
    }

    // Insight sobre diversificación
    if (metrics.appliedRecommendations > 5) {
      const applicationRate = metrics.appliedRecommendations / metrics.clickedRecommendations
      if (applicationRate > 0.8) {
        insights.push({
          type: 'success',
          title: 'Excelente compatibilidad',
          message: 'Las recomendaciones son muy precisas para ti. ¡Sigue así!',
          priority: 'low'
        })
      }
    }

    return insights
  }

  // =================== OPTIMIZACIÓN AUTOMÁTICA ===================

  async optimizeUserSettings(userId: string): Promise<AISettings> {
    const settings = await this.getUserAISettings(userId)
    const metrics = await this.getUserMetrics(userId)
    
    // Optimización basada en métricas
    if (metrics.totalRecommendations > 10) {
      const clickRate = metrics.clickedRecommendations / metrics.totalRecommendations
      
      if (clickRate < 0.2) {
        // Si el click rate es bajo, ajustar pesos para ser más selectivo
        settings.config.weights.location *= 1.1
        settings.config.weights.interests *= 1.1
        settings.config.filters.minCompatibilityScore = Math.min(80, settings.config.filters.minCompatibilityScore + 10)
      } else if (clickRate > 0.6) {
        // Si el click rate es alto, podemos ser más agresivos
        settings.config.weights.location *= 0.95
        settings.config.weights.interests *= 0.95
        settings.config.filters.minCompatibilityScore = Math.max(20, settings.config.filters.minCompatibilityScore - 5)
      }
    }

    // Normalizar pesos para que sumen 1.0
    const totalWeight = Object.values(settings.config.weights).reduce((a, b) => a + b, 0)
    Object.keys(settings.config.weights).forEach(key => {
      settings.config.weights[key as keyof typeof settings.config.weights] /= totalWeight
    })

    return await this.updateUserAISettings(userId, settings)
  }

  // =================== UTILIDADES ===================

  private getDefaultMetrics(userId: string): AIPerformanceMetrics {
    return {
      userId,
      totalRecommendations: 0,
      clickedRecommendations: 0,
      appliedRecommendations: 0,
      averageScore: 0,
      satisfactionRating: 0,
      lastUpdated: new Date()
    }
  }

  // =================== MÉTODOS DE BASE DE DATOS (PLACEHOLDER) ===================

  private async loadUserSettingsFromDB(userId: string): Promise<AISettings> {
    // En una implementación real, esto haría una consulta a la base de datos
    // Por ahora, retornamos configuración por defecto
    return this.getDefaultAISettings(userId)
  }

  private async saveUserSettingsToDB(settings: AISettings): Promise<void> {
    // En una implementación real, esto guardaría en la base de datos
    console.log('Guardando configuración de IA:', settings)
  }

  private async loadUserMetricsFromDB(userId: string): Promise<AIPerformanceMetrics> {
    // En una implementación real, esto haría una consulta a la base de datos
    return this.getDefaultMetrics(userId)
  }

  private async saveUserMetricsToDB(metrics: AIPerformanceMetrics): Promise<void> {
    // En una implementación real, esto guardaría en la base de datos
    console.log('Guardando métricas de IA:', metrics)
  }

  // =================== CACHE ===================

  clearCache(): void {
    this.settingsCache.clear()
    this.metricsCache.clear()
  }

  clearUserCache(userId: string): void {
    this.settingsCache.delete(userId)
    this.metricsCache.delete(userId)
  }
}

// =================== INSTANCIA SINGLETON ===================

export const aiConfigService = AIConfigService.getInstance()
