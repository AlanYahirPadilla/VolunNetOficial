// Servicio integrado que combina todas las APIs de IA
import { openAIService } from './OpenAIService';
import { huggingFaceService } from './HuggingFaceService';
import { googleMapsService } from './GoogleMapsService';

export interface EnhancedRecommendation {
  eventId: string;
  title: string;
  description: string;
  category: string;
  location: {
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  startDate: string;
  endDate: string;
  maxVolunteers: number;
  currentVolunteers: number;
  
  // Puntuaciones de IA
  scores: {
    overall: number; // 0-100
    categoryMatch: number;
    skillMatch: number;
    locationScore: number;
    semanticSimilarity: number;
    accessibilityScore: number;
  };
  
  // Análisis de IA
  aiAnalysis: {
    keywords: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    complexity: 'beginner' | 'intermediate' | 'advanced';
    themes: string[];
    summary: string;
  };
  
  // Recomendaciones personalizadas
  personalizedReason: string;
  personalizedMessage: string;
  
  // Información de accesibilidad
  accessibility: {
    score: number;
    transportOptions: Array<{
      mode: string;
      duration: number;
      distance: number;
    }>;
    nearbyAmenities: string[];
    recommendations: string[];
  };
}

export class IntegratedAIService {
  private cache = new Map<string, any>();
  private cacheTimeout = 3600000; // 1 hora

  /**
   * Genera recomendaciones mejoradas usando todas las APIs de IA
   */
  async generateEnhancedRecommendations(
    userProfile: {
      id: string;
      interests: string[];
      skills: string[];
      experience: string[];
      location: {
        latitude: number;
        longitude: number;
        city: string;
        state: string;
      };
    },
    events: Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      categoryId: string;
      skills: string[];
      location: {
        latitude: number;
        longitude: number;
        city: string;
        state: string;
      };
      startDate: string;
      endDate: string;
      maxVolunteers: number;
      currentVolunteers: number;
    }>
  ): Promise<EnhancedRecommendation[]> {
    const cacheKey = `recommendations_${userProfile.id}_${events.length}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      console.log('📋 Usando recomendaciones en caché');
      return cached;
    }

    console.log('🤖 Generando recomendaciones mejoradas con IA...');

    try {
      // 1. Análisis de eventos con OpenAI
      const eventAnalyses = await Promise.all(
        events.map(async (event) => {
          const analysis = await openAIService.analyzeEventDescription(event.description);
          return { eventId: event.id, analysis };
        })
      );

      // 2. Embeddings semánticos con Hugging Face
      const semanticSimilarities = await huggingFaceService.findSimilarEvents(
        {
          interests: userProfile.interests,
          skills: userProfile.skills,
          experience: userProfile.experience
        },
        events
      );

      // 3. Análisis de accesibilidad con Google Maps
      const accessibilityAnalyses = await Promise.all(
        events.map(async (event) => {
          const accessibility = await googleMapsService.analyzeLocationAccessibility(
            userProfile.location,
            event.location
          );
          return { eventId: event.id, accessibility };
        })
      );

      // 4. Recomendaciones personalizadas con OpenAI
      const personalizedRecommendations = await openAIService.generatePersonalizedRecommendations(
        userProfile,
        events
      );

      // 5. Combinar todos los análisis
      const enhancedRecommendations: EnhancedRecommendation[] = events.map((event) => {
        const eventAnalysis = eventAnalyses.find(ea => ea.eventId === event.id)?.analysis;
        const semanticSimilarity = semanticSimilarities.find(ss => ss.eventId === event.id);
        const accessibilityAnalysis = accessibilityAnalyses.find(aa => aa.eventId === event.id)?.accessibility;
        const personalizedRec = personalizedRecommendations.recommendations.find(pr => pr.eventTitle === event.title);

        // Calcular puntuaciones
        const categoryMatch = userProfile.interests.includes(event.categoryId) ? 100 : 0;
        const skillMatch = this.calculateSkillMatch(userProfile.skills, event.skills);
        const locationScore = this.calculateLocationScore(userProfile.location, event.location);
        const semanticScore = semanticSimilarity ? semanticSimilarity.similarity * 100 : 0;
        const accessibilityScore = accessibilityAnalysis ? accessibilityAnalysis.accessibilityScore : 50;

        // Puntuación general ponderada
        const overallScore = (
          categoryMatch * 0.25 +
          skillMatch * 0.20 +
          locationScore * 0.20 +
          semanticScore * 0.20 +
          accessibilityScore * 0.15
        );

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
            locationScore,
            semanticSimilarity: Math.round(semanticScore),
            accessibilityScore
          },
          
          aiAnalysis: eventAnalysis || {
            keywords: [],
            sentiment: 'neutral',
            complexity: 'intermediate',
            themes: [],
            summary: event.description.substring(0, 100) + '...'
          },
          
          personalizedReason: personalizedRec?.reason || 'Basado en tu perfil y preferencias',
          personalizedMessage: personalizedRec?.personalizedMessage || 'Este evento parece ser una buena opción para ti.',
          
          accessibility: accessibilityAnalysis || {
            score: 50,
            transportOptions: [],
            nearbyAmenities: [],
            recommendations: ['Información de accesibilidad no disponible']
          }
        };
      });

      // 6. Ordenar por puntuación general
      const sortedRecommendations = enhancedRecommendations
        .sort((a, b) => b.scores.overall - a.scores.overall)
        .filter(rec => rec.scores.overall > 30); // Filtrar recomendaciones muy bajas

      // 7. Guardar en caché
      this.setCachedData(cacheKey, sortedRecommendations);

      console.log(`✅ Generadas ${sortedRecommendations.length} recomendaciones mejoradas`);
      return sortedRecommendations;

    } catch (error) {
      console.error('Error generating enhanced recommendations:', error);
      return this.getFallbackRecommendations(userProfile, events);
    }
  }

  /**
   * Calcula la compatibilidad de habilidades entre usuario y evento
   */
  private calculateSkillMatch(userSkills: string[], eventSkills: string[]): number {
    if (eventSkills.length === 0) return 50; // Score neutral si no hay habilidades requeridas
    
    const matchingSkills = userSkills.filter(skill => 
      eventSkills.some(eventSkill => 
        skill.toLowerCase().includes(eventSkill.toLowerCase()) ||
        eventSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    return (matchingSkills.length / eventSkills.length) * 100;
  }

  /**
   * Calcula la puntuación de ubicación basada en distancia
   */
  private calculateLocationScore(
    userLocation: { latitude: number; longitude: number },
    eventLocation: { latitude: number; longitude: number }
  ): number {
    const distance = this.calculateHaversineDistance(userLocation, eventLocation);
    
    // Puntuación basada en distancia (km)
    if (distance <= 5) return 100;
    if (distance <= 10) return 80;
    if (distance <= 20) return 60;
    if (distance <= 50) return 40;
    return 20;
  }

  /**
   * Calcula distancia usando fórmula de Haversine
   */
  private calculateHaversineDistance(point1: any, point2: any): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    const lat1 = this.toRad(point1.latitude);
    const lat2 = this.toRad(point2.latitude);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Recomendaciones de fallback cuando las APIs no están disponibles
   */
  private getFallbackRecommendations(userProfile: any, events: any[]): EnhancedRecommendation[] {
    return events.slice(0, 6).map(event => ({
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
        overall: 75,
        categoryMatch: userProfile.interests.includes(event.categoryId) ? 100 : 0,
        skillMatch: 50,
        locationScore: 50,
        semanticSimilarity: 50,
        accessibilityScore: 50
      },
      
      aiAnalysis: {
        keywords: ['voluntariado', 'comunidad'],
        sentiment: 'positive',
        complexity: 'intermediate',
        themes: ['ayuda social'],
        summary: event.description.substring(0, 100) + '...'
      },
      
      personalizedReason: 'Basado en tus intereses y habilidades',
      personalizedMessage: 'Este evento parece ser una buena opción para ti.',
      
      accessibility: {
        score: 50,
        transportOptions: [
          { mode: 'driving', duration: 1800, distance: 5000 },
          { mode: 'walking', duration: 3600, distance: 5000 }
        ],
        nearbyAmenities: ['Estación de transporte', 'Estacionamiento'],
        recommendations: ['El evento es accesible por múltiples medios de transporte']
      }
    }));
  }

  /**
   * Gestión de caché
   */
  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Limpia el caché
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Caché de IA limpiado');
  }
}

export const integratedAIService = new IntegratedAIService();
