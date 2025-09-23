// Servicio de Integración con APIs Externas de IA
// Integra OpenAI, Hugging Face, Google Maps y otras APIs para análisis avanzado

import { Volunteer, Event } from '@/types'

// =================== TIPOS Y INTERFACES ===================

export interface TextAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative'
  keywords: string[]
  categoryHints: string[]
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  timeCommitment: 'low' | 'medium' | 'high'
  language: string
  confidence: number
}

export interface SemanticEmbedding {
  vector: number[]
  dimension: number
  model: string
}

export interface LocationAnalysis {
  neighborhoodType: 'residential' | 'commercial' | 'industrial' | 'mixed'
  accessibilityScore: number
  safetyRating: number
  publicTransportScore: number
  parkingAvailability: 'low' | 'medium' | 'high'
  walkabilityScore: number
}

export interface AIRecommendationInsight {
  semanticSimilarity: number
  sentimentAnalysis: TextAnalysis
  locationAnalysis?: LocationAnalysis
  difficultyMatch: 'perfect' | 'good' | 'challenging' | 'too_easy'
  timeCommitmentMatch: 'perfect' | 'good' | 'too_much' | 'too_little'
  networkingPotential: number
  growthOpportunity: number
  riskFactors: string[]
  opportunityFactors: string[]
}

// =================== CLASE PRINCIPAL ===================

export class ExternalAIService {
  private static instance: ExternalAIService
  private openaiApiKey: string | null = null
  private huggingfaceApiKey: string | null = null
  private googleMapsApiKey: string | null = null
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()

  private constructor() {
    this.initializeApiKeys()
  }

  static getInstance(): ExternalAIService {
    if (!ExternalAIService.instance) {
      ExternalAIService.instance = new ExternalAIService()
    }
    return ExternalAIService.instance
  }

  // =================== INICIALIZACIÓN ===================

  private initializeApiKeys(): void {
    this.openaiApiKey = process.env.OPENAI_API_KEY || null
    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY || null
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || null

    if (!this.openaiApiKey) {
      console.warn('⚠️ OpenAI API key no encontrada. Funcionalidades de análisis de texto deshabilitadas.')
    }
    if (!this.huggingfaceApiKey) {
      console.warn('⚠️ Hugging Face API key no encontrada. Funcionalidades de embeddings deshabilitadas.')
    }
    if (!this.googleMapsApiKey) {
      console.warn('⚠️ Google Maps API key no encontrada. Funcionalidades de análisis geográfico deshabilitadas.')
    }
  }

  // =================== OPENAI INTEGRATION ===================

  async analyzeTextWithOpenAI(text: string): Promise<TextAnalysis> {
    if (!this.openaiApiKey) {
      return this.getDefaultTextAnalysis()
    }

    const cacheKey = `openai_${this.hashString(text)}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Analiza el siguiente texto de un evento de voluntariado y extrae:
              1. Sentimiento (positive/neutral/negative)
              2. Palabras clave importantes
              3. Pistas sobre la categoría del evento
              4. Nivel de dificultad (beginner/intermediate/advanced)
              5. Compromiso de tiempo requerido (low/medium/high)
              6. Idioma del texto
              7. Nivel de confianza en el análisis (0-1)
              
              Responde en formato JSON.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const analysis = JSON.parse(data.choices[0].message.content)
      
      this.setCachedData(cacheKey, analysis, 3600) // Cache por 1 hora
      return analysis

    } catch (error) {
      console.error('Error con OpenAI API:', error)
      return this.getDefaultTextAnalysis()
    }
  }

  async generateEventDescription(event: Event): Promise<string> {
    if (!this.openaiApiKey) {
      return event.description
    }

    const cacheKey = `openai_desc_${event.id}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'Escribe una descripción atractiva y motivadora para un evento de voluntariado basándote en la información proporcionada. Máximo 200 palabras.'
              },
              {
                role: 'user',
                content: `Título: ${event.title}\nDescripción actual: ${event.description}\nCategoría: ${event.category?.name || event.categoryId}\nHabilidades requeridas: ${event.skills.join(', ')}`
              }
            ],
          temperature: 0.7,
          max_tokens: 300
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const description = data.choices[0].message.content.trim()
      
      this.setCachedData(cacheKey, description, 7200) // Cache por 2 horas
      return description

    } catch (error) {
      console.error('Error generando descripción con OpenAI:', error)
      return event.description
    }
  }

  // =================== HUGGING FACE INTEGRATION ===================

  async generateEmbedding(text: string): Promise<SemanticEmbedding> {
    if (!this.huggingfaceApiKey) {
      return this.getDefaultEmbedding()
    }

    const cacheKey = `hf_embedding_${this.hashString(text)}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch('https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.huggingfaceApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true }
        })
      })

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`)
      }

      const vector = await response.json()
      
      const embedding: SemanticEmbedding = {
        vector: Array.isArray(vector) ? vector : vector[0],
        dimension: Array.isArray(vector) ? vector.length : vector[0].length,
        model: 'sentence-transformers/all-MiniLM-L6-v2'
      }
      
      this.setCachedData(cacheKey, embedding, 3600) // Cache por 1 hora
      return embedding

    } catch (error) {
      console.error('Error con Hugging Face API:', error)
      return this.getDefaultEmbedding()
    }
  }

  async calculateSemanticSimilarity(text1: string, text2: string): Promise<number> {
    try {
      const [embedding1, embedding2] = await Promise.all([
        this.generateEmbedding(text1),
        this.generateEmbedding(text2)
      ])

      return this.cosineSimilarity(embedding1.vector, embedding2.vector)
    } catch (error) {
      console.error('Error calculando similitud semántica:', error)
      return 0
    }
  }

  // =================== GOOGLE MAPS INTEGRATION ===================

  async analyzeLocation(latitude: number, longitude: number): Promise<LocationAnalysis> {
    if (!this.googleMapsApiKey) {
      return this.getDefaultLocationAnalysis()
    }

    const cacheKey = `gmaps_${latitude}_${longitude}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      // Place Details API para obtener información detallada
      const placeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=500&key=${this.googleMapsApiKey}`
      )

      if (!placeResponse.ok) {
        throw new Error(`Google Maps API error: ${placeResponse.status}`)
      }

      const placeData = await placeResponse.json()
      
      // Geocoding API para obtener información de la dirección
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.googleMapsApiKey}`
      )

      const geocodeData = await geocodeResponse.json()
      
      const analysis = this.processLocationData(placeData, geocodeData)
      
      this.setCachedData(cacheKey, analysis, 86400) // Cache por 24 horas
      return analysis

    } catch (error) {
      console.error('Error con Google Maps API:', error)
      return this.getDefaultLocationAnalysis()
    }
  }

  // =================== ANÁLISIS INTEGRADO ===================

  async generateComprehensiveInsights(volunteer: Volunteer, event: Event): Promise<AIRecommendationInsight> {
    try {
      // Análisis de texto del evento
      const eventText = `${event.title} ${event.description}`
      const textAnalysis = await this.analyzeTextWithOpenAI(eventText)
      
      // Análisis de ubicación si está disponible
      let locationAnalysis: LocationAnalysis | undefined
      if (event.location?.latitude && event.location?.longitude) {
        locationAnalysis = await this.analyzeLocation(event.location.latitude, event.location.longitude)
      }

      // Similitud semántica con intereses del voluntario
      const volunteerInterests = volunteer.interests?.join(' ') || ''
      const semanticSimilarity = await this.calculateSemanticSimilarity(eventText, volunteerInterests)

      // Análisis de dificultad
      const difficultyMatch = this.analyzeDifficultyMatch(volunteer, event, textAnalysis)

      // Análisis de compromiso de tiempo
      const timeCommitmentMatch = this.analyzeTimeCommitmentMatch(volunteer, event, textAnalysis)

      // Factores de riesgo y oportunidad
      const riskFactors = this.identifyRiskFactors(volunteer, event, textAnalysis)
      const opportunityFactors = this.identifyOpportunityFactors(volunteer, event, textAnalysis)

      return {
        semanticSimilarity,
        sentimentAnalysis: textAnalysis,
        locationAnalysis,
        difficultyMatch,
        timeCommitmentMatch,
        networkingPotential: this.calculateNetworkingPotential(volunteer, event),
        growthOpportunity: this.calculateGrowthOpportunity(volunteer, event),
        riskFactors,
        opportunityFactors
      }

    } catch (error) {
      console.error('Error generando insights comprehensivos:', error)
      return this.getDefaultInsights()
    }
  }

  // =================== UTILIDADES ===================

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i]
      normA += vecA[i] * vecA[i]
      normB += vecB[i] * vecB[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString()
  }

  private processLocationData(placeData: any, geocodeData: any): LocationAnalysis {
    // Procesar datos de Google Maps para generar análisis de ubicación
    const places = placeData.results || []
    const addressComponents = geocodeData.results?.[0]?.address_components || []

    // Determinar tipo de vecindario basado en tipos de lugares cercanos
    const placeTypes = places.flatMap((place: any) => place.types || [])
    const commercialCount = placeTypes.filter((type: string) => 
      ['store', 'shopping_mall', 'restaurant', 'bank'].includes(type)
    ).length
    const residentialCount = placeTypes.filter((type: string) => 
      ['school', 'hospital', 'church'].includes(type)
    ).length

    let neighborhoodType: 'residential' | 'commercial' | 'industrial' | 'mixed' = 'mixed'
    if (commercialCount > residentialCount) neighborhoodType = 'commercial'
    else if (residentialCount > commercialCount) neighborhoodType = 'residential'

    return {
      neighborhoodType,
      accessibilityScore: Math.min(100, places.length * 10), // Basado en densidad de lugares
      safetyRating: 75, // Valor por defecto - en implementación real se usarían datos de seguridad
      publicTransportScore: this.calculatePublicTransportScore(places),
      parkingAvailability: this.calculateParkingAvailability(places),
      walkabilityScore: this.calculateWalkabilityScore(places, addressComponents)
    }
  }

  private calculatePublicTransportScore(places: any[]): number {
    const transportTypes = places.flatMap((place: any) => place.types || [])
    const hasTransit = transportTypes.some((type: string) => 
      ['transit_station', 'bus_station', 'subway_station'].includes(type)
    )
    return hasTransit ? 80 : 40
  }

  private calculateParkingAvailability(places: any[]): 'low' | 'medium' | 'high' {
    const parkingTypes = places.flatMap((place: any) => place.types || [])
    const hasParking = parkingTypes.some((type: string) => 
      ['parking', 'parking_lot'].includes(type)
    )
    return hasParking ? 'high' : 'medium'
  }

  private calculateWalkabilityScore(places: any[], addressComponents: any[]): number {
    // Score basado en densidad de lugares caminables
    const walkablePlaces = places.filter((place: any) => 
      place.types?.some((type: string) => 
        ['store', 'restaurant', 'park', 'school'].includes(type)
      )
    )
    return Math.min(100, walkablePlaces.length * 15)
  }

  private analyzeDifficultyMatch(volunteer: Volunteer, event: Event, textAnalysis: TextAnalysis): 'perfect' | 'good' | 'challenging' | 'too_easy' {
    const volunteerExperience = volunteer.eventsParticipated || 0
    const eventDifficulty = textAnalysis.difficultyLevel

    if (volunteerExperience < 3 && eventDifficulty === 'advanced') return 'challenging'
    if (volunteerExperience > 10 && eventDifficulty === 'beginner') return 'too_easy'
    if (volunteerExperience >= 5 && eventDifficulty === 'intermediate') return 'perfect'
    if (volunteerExperience >= 2 && eventDifficulty === 'beginner') return 'good'
    
    return 'good'
  }

  private analyzeTimeCommitmentMatch(volunteer: Volunteer, event: Event, textAnalysis: TextAnalysis): 'perfect' | 'good' | 'too_much' | 'too_little' {
    const eventTimeCommitment = textAnalysis.timeCommitment
    const volunteerAvailability = volunteer.availability || []

    if (eventTimeCommitment === 'high' && volunteerAvailability.length < 3) return 'too_much'
    if (eventTimeCommitment === 'low' && volunteerAvailability.length > 5) return 'too_little'
    if (eventTimeCommitment === 'medium') return 'perfect'
    
    return 'good'
  }

  private calculateNetworkingPotential(volunteer: Volunteer, event: Event): number {
    // Basado en el tamaño del evento y la experiencia del voluntario
    const eventSize = event.maxVolunteers
    const volunteerExperience = volunteer.eventsParticipated || 0
    
    let score = 50
    if (eventSize > 20) score += 20
    if (volunteerExperience > 5) score += 15
    if (event.skills && event.skills.length > 3) score += 15
    
    return Math.min(100, score)
  }

  private calculateGrowthOpportunity(volunteer: Volunteer, event: Event): number {
    // Basado en nuevas habilidades y desafíos
    const volunteerSkills = volunteer.skills || []
    const eventSkills = event.skills || []
    const newSkills = eventSkills.filter(skill => !volunteerSkills.includes(skill))
    
    let score = 30
    score += newSkills.length * 15
    if (event.maxVolunteers > 15) score += 10 // Oportunidad de liderazgo
    if (volunteer.eventsParticipated < 5) score += 20 // Más oportunidades para principiantes
    
    return Math.min(100, score)
  }

  private identifyRiskFactors(volunteer: Volunteer, event: Event, textAnalysis: TextAnalysis): string[] {
    const risks: string[] = []
    
    if (textAnalysis.sentiment === 'negative') risks.push('Descripción con tono negativo')
    if (textAnalysis.difficultyLevel === 'advanced' && (volunteer.eventsParticipated || 0) < 3) {
      risks.push('Puede ser muy desafiante para tu nivel de experiencia')
    }
    if (textAnalysis.timeCommitment === 'high' && (volunteer.availability?.length || 0) < 2) {
      risks.push('Requiere mucho tiempo - verifica tu disponibilidad')
    }
    
    return risks
  }

  private identifyOpportunityFactors(volunteer: Volunteer, event: Event, textAnalysis: TextAnalysis): string[] {
    const opportunities: string[] = []
    
    if (textAnalysis.sentiment === 'positive') opportunities.push('Evento con descripción muy motivadora')
    if (event.skills && event.skills.some(skill => !volunteer.skills?.includes(skill))) {
      opportunities.push('Oportunidad de aprender nuevas habilidades')
    }
    if (event.maxVolunteers > 20) opportunities.push('Gran oportunidad de networking')
    if (volunteer.eventsParticipated === 0) opportunities.push('Perfecto para tu primer evento')
    
    return opportunities
  }

  // =================== DEFAULTS ===================

  private getDefaultTextAnalysis(): TextAnalysis {
    return {
      sentiment: 'neutral',
      keywords: [],
      categoryHints: [],
      difficultyLevel: 'intermediate',
      timeCommitment: 'medium',
      language: 'es',
      confidence: 0.5
    }
  }

  private getDefaultEmbedding(): SemanticEmbedding {
    return {
      vector: new Array(384).fill(0), // Dimensión típica de all-MiniLM-L6-v2
      dimension: 384,
      model: 'default'
    }
  }

  private getDefaultLocationAnalysis(): LocationAnalysis {
    return {
      neighborhoodType: 'mixed',
      accessibilityScore: 50,
      safetyRating: 75,
      publicTransportScore: 50,
      parkingAvailability: 'medium',
      walkabilityScore: 50
    }
  }

  private getDefaultInsights(): AIRecommendationInsight {
    return {
      semanticSimilarity: 0.5,
      sentimentAnalysis: this.getDefaultTextAnalysis(),
      difficultyMatch: 'good',
      timeCommitmentMatch: 'good',
      networkingPotential: 50,
      growthOpportunity: 50,
      riskFactors: [],
      opportunityFactors: []
    }
  }

  // =================== CACHE ===================

  private getCachedData(key: string): any {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  private setCachedData(key: string, data: any, ttlSeconds: number): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl: ttlSeconds })
  }

  clearCache(): void {
    this.cache.clear()
  }
}

// =================== INSTANCIA SINGLETON ===================

export const externalAIService = ExternalAIService.getInstance()
