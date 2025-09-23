// Motor básico de recomendaciones utilizado por RecommendationService
// Implementación segura para build (sin dependencias externas)

import { Event, EventCategory, Volunteer } from '@/types'

export interface RecommendationScore {
  eventId: string
  score: number // 0 - 100
  confidence: number // 0 - 1
  reasons: string[]
}

export interface RecommendationConfig {
  weights: {
    categoryMatch: number
    skillsMatch: number
    proximity: number
    recency: number
  }
}

interface EngineInput {
  volunteer: Volunteer
  events: Event[]
  categories: EventCategory[]
  config: RecommendationConfig
  userPreferences?: any
}

const DEFAULT_CONFIG: RecommendationConfig = {
  weights: {
    categoryMatch: 0.45,
    skillsMatch: 0.35,
    proximity: 0.1,
    recency: 0.1
  }
}

export class RecommendationEngine {
  private config: RecommendationConfig

  constructor() {
    this.config = DEFAULT_CONFIG
  }

  public updateConfig(config: Partial<RecommendationConfig>) {
    this.config = {
      ...this.config,
      ...config,
      weights: { ...this.config.weights, ...(config.weights || {}) }
    }
  }

  public getConfig(): RecommendationConfig {
    return this.config
  }

  public async getRecommendations(input: EngineInput): Promise<RecommendationScore[]> {
    const { volunteer, events } = input
    const results: RecommendationScore[] = []

    for (const event of events) {
      const reasons: string[] = []

      // Category match (simple check by id)
      let categoryScore = 0
      if (volunteer.interests?.includes(event.category.id)) {
        categoryScore = 100
        reasons.push('Coincidencia de categoría con tus intereses')
      }

      // Skills overlap
      let skillsScore = 0
      const volunteerSkills = (volunteer.skills || []).map(s => s.toLowerCase())
      const eventSkills = (event.skills || []).map(s => s.toLowerCase())
      if (eventSkills.length > 0) {
        const matches = eventSkills.filter(s => volunteerSkills.some(v => v.includes(s) || s.includes(v)))
        skillsScore = (matches.length / eventSkills.length) * 100
        if (matches.length > 0) reasons.push(`Coinciden habilidades: ${matches.slice(0, 3).join(', ')}`)
      } else {
        skillsScore = 50 // neutral si no hay skills
      }

      // Proximity (placeholder neutral 50)
      const proximityScore = 50

      // Recency (futuros > pasados)
      const isFuture = new Date(event.startDate as any).getTime() > Date.now()
      const recencyScore = isFuture ? 100 : 10

      const { categoryMatch, skillsMatch, proximity, recency } = this.config.weights
      const score = Math.round(
        categoryScore * categoryMatch +
        skillsScore * skillsMatch +
        proximityScore * proximity +
        recencyScore * recency
      )

      results.push({
        eventId: event.id,
        score,
        confidence: 0.7,
        reasons
      })
    }

    // Ordenar descendente y regresar
    return results.sort((a, b) => b.score - a.score)
  }
}


