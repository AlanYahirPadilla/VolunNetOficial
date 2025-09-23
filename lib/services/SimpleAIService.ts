// Servicio simplificado de IA usando OpenAI y Hugging Face
import { openAIService } from './OpenAIService';
import { huggingFaceService } from './HuggingFaceService';

export interface SimpleAIRecommendation {
  eventId: string;
  title: string;
  description: string;
  category: string;
  location: {
    city: string;
    state: string;
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
    semanticSimilarity: number;
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
}

export class SimpleAIService {
  private cache = new Map<string, any>();
  private cacheTimeout = 1800000; // 30 minutos

  /**
   * Genera recomendaciones mejoradas usando OpenAI y Hugging Face
   */
  async generateAIRecommendations(
    userProfile: {
      id: string;
      interests: string[];
      skills: string[];
      experience: string[];
      location: {
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
        city: string;
        state: string;
      };
      startDate: string;
      endDate: string;
      maxVolunteers: number;
      currentVolunteers: number;
    }>
  ): Promise<SimpleAIRecommendation[]> {
    const cacheKey = `ai_recommendations_${userProfile.id}_${events.length}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      console.log('📋 Usando recomendaciones de IA en caché');
      return cached;
    }

    console.log('🤖 Generando recomendaciones con OpenAI y Hugging Face...');

    try {
      // Verificar si las APIs están realmente disponibles
      const hasOpenAI = !!process.env.OPENAI_API_KEY && 
        process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here' &&
        process.env.OPENAI_API_KEY.startsWith('sk-');
      const hasHuggingFace = !!process.env.HUGGINGFACE_API_KEY && 
        process.env.HUGGINGFACE_API_KEY !== 'hf_your-huggingface-api-key-here' &&
        process.env.HUGGINGFACE_API_KEY.startsWith('hf_');
      
      console.log('🔍 Estado de APIs:');
      console.log(`  - OpenAI: ${hasOpenAI ? '✅ Configurada' : '❌ No configurada'}`);
      console.log(`  - Hugging Face: ${hasHuggingFace ? '✅ Configurada' : '❌ No configurada'}`);
      
      if (!hasOpenAI || !hasHuggingFace) {
        console.log('⚠️ API keys no configuradas o son placeholders, usando recomendaciones básicas');
        console.log('💡 Para usar APIs externas, configura las claves reales en env.local');
        return this.generateBasicRecommendations(userProfile, events);
      }

      // 1. Análisis de eventos con OpenAI
      console.log('📝 Analizando descripciones de eventos con OpenAI...');
      const eventAnalyses = await Promise.all(
        events.map(async (event) => {
          const analysis = await openAIService.analyzeEventDescription(event.description);
          return { eventId: event.id, analysis };
        })
      );

      // 2. Embeddings semánticos con Hugging Face
      console.log('🧠 Calculando similitudes semánticas con Hugging Face...');
      const semanticSimilarities = await huggingFaceService.findSimilarEvents(
        {
          interests: userProfile.interests,
          skills: userProfile.skills,
          experience: userProfile.experience
        },
        events
      );

      // 3. Recomendaciones personalizadas con OpenAI
      console.log('💬 Generando recomendaciones personalizadas con OpenAI...');
      const personalizedRecommendations = await openAIService.generatePersonalizedRecommendations(
        userProfile,
        events
      );

      // 4. Combinar todos los análisis
      const aiRecommendations: SimpleAIRecommendation[] = events.map((event) => {
        const eventAnalysis = eventAnalyses.find(ea => ea.eventId === event.id)?.analysis;
        const semanticSimilarity = semanticSimilarities.find(ss => ss.eventId === event.id);
        const personalizedRec = personalizedRecommendations.recommendations.find(pr => pr.eventTitle === event.title);

        // Calcular puntuaciones
        const categoryMatch = userProfile.interests.includes(event.categoryId) ? 100 : 0;
        const skillMatch = this.calculateSkillMatch(userProfile.skills, event.skills);
        const semanticScore = semanticSimilarity ? semanticSimilarity.similarity * 100 : 0;

        // Puntuación general ponderada
        const overallScore = (
          categoryMatch * 0.40 +      // 40% - Categoría (más importante)
          skillMatch * 0.30 +         // 30% - Habilidades
          semanticScore * 0.30        // 30% - Similitud semántica
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
            semanticSimilarity: Math.round(semanticScore)
          },
          
          aiAnalysis: eventAnalysis || {
            keywords: [],
            sentiment: 'neutral',
            complexity: 'intermediate',
            themes: [],
            summary: event.description.substring(0, 100) + '...'
          },
          
          personalizedReason: personalizedRec?.reason || 'Basado en tu perfil y preferencias',
          personalizedMessage: personalizedRec?.personalizedMessage || 'Este evento parece ser una buena opción para ti.'
        };
      });

      // 5. Ordenar por puntuación general
      const sortedRecommendations = aiRecommendations
        .sort((a, b) => b.scores.overall - a.scores.overall)
        .filter(rec => rec.scores.overall > 40); // Filtrar recomendaciones muy bajas

      // 6. Guardar en caché
      this.setCachedData(cacheKey, sortedRecommendations);

      console.log(`✅ Generadas ${sortedRecommendations.length} recomendaciones con IA`);
      return sortedRecommendations;

    } catch (error) {
      console.error('Error generating AI recommendations:', error);
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
   * Recomendaciones de fallback cuando las APIs no están disponibles
   */
  private getFallbackRecommendations(userProfile: any, events: any[]): SimpleAIRecommendation[] {
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
        semanticSimilarity: 50
      },
      
      aiAnalysis: {
        keywords: ['voluntariado', 'comunidad'],
        sentiment: 'positive',
        complexity: 'intermediate',
        themes: ['ayuda social'],
        summary: event.description.substring(0, 100) + '...'
      },
      
      personalizedReason: 'Basado en tus intereses y habilidades',
      personalizedMessage: 'Este evento parece ser una buena opción para ti.'
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

  // Método para generar recomendaciones básicas sin IA
  private generateBasicRecommendations(userProfile: any, events: any[]): SimpleAIRecommendation[] {
    console.log('🔧 Generando recomendaciones básicas sin IA...');
    console.log('📊 Eventos recibidos:', events.length);
    console.log('👤 Perfil del usuario:', {
      interests: userProfile.interests,
      skills: userProfile.skills
    });
    console.log('📋 Intereses del usuario:', userProfile.interests);
    console.log('🛠️ Habilidades del usuario:', userProfile.skills);
    
    const recommendations = events.map((event) => {
      console.log(`🔍 Procesando evento: ${event.title} (Categoría: ${event.categoryId})`);
      console.log(`  📊 Datos del evento:`, {
        id: event.id,
        title: event.title,
        categoryId: event.categoryId,
        category: event.category,
        skills: event.skills
      });
      
      // Calcular puntuaciones básicas
      const categoryMatch = userProfile.interests.includes(event.categoryId) ? 100 : 0;
      const skillMatch = this.calculateSkillMatch(userProfile.skills, event.skills);
      const semanticScore = 50; // Score neutral sin IA
      
      // Puntuación general ponderada
      const overallScore = (
        categoryMatch * 0.50 +      // 50% - Categoría (más importante)
        skillMatch * 0.30 +         // 30% - Habilidades
        semanticScore * 0.20        // 20% - Score neutral
      );

      console.log(`  📊 Scores para "${event.title}":`, {
        categoryMatch,
        skillMatch,
        semanticScore,
        overallScore: Math.round(overallScore)
      });

      return {
        eventId: event.id,
        title: event.title || 'Sin título',
        description: event.description || 'Sin descripción',
        category: event.category || 'General',
        location: event.location || { city: 'Ciudad', state: 'Estado' },
        startDate: event.startDate,
        endDate: event.endDate,
        maxVolunteers: event.maxVolunteers || 10,
        currentVolunteers: event.currentVolunteers || 0,
        
        scores: {
          overall: Math.round(overallScore),
          categoryMatch,
          skillMatch,
          semanticSimilarity: Math.round(semanticScore)
        },
        
        aiAnalysis: {
          keywords: this.extractKeywords(event.description || ''),
          sentiment: 'positive' as const,
          complexity: 'intermediate' as const,
          themes: [event.category?.toLowerCase() || 'general'],
          summary: (event.description || '').substring(0, 100) + '...'
        },
        
        personalizedReason: this.generatePersonalizedReason(event, userProfile),
        personalizedMessage: this.generatePersonalizedMessage(event, userProfile)
      };
    });

    console.log('📋 Recomendaciones generadas:', recommendations.length);
    console.log('📊 Scores de todas las recomendaciones:', recommendations.map(r => ({ title: r.title, score: r.scores.overall })));

    const filteredRecommendations = recommendations
      .sort((a, b) => b.scores.overall - a.scores.overall)
      .filter(rec => rec.scores.overall > 10); // Reducir filtro de 30 a 10

    console.log('✅ Recomendaciones filtradas (score > 10):', filteredRecommendations.length);
    return filteredRecommendations;
  }

  // Función auxiliar para calcular match de habilidades
  private calculateSkillMatch(userSkills: string[], eventSkills: string[]): number {
    if (eventSkills.length === 0) return 50;
    
    const matchingSkills = userSkills.filter(skill => 
      eventSkills.some(eventSkill => 
        skill.toLowerCase().includes(eventSkill.toLowerCase()) ||
        eventSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    return (matchingSkills.length / eventSkills.length) * 100;
  }

  // Función auxiliar para extraer palabras clave básicas
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['para', 'con', 'los', 'las', 'del', 'una', 'que', 'este', 'esta'].includes(word));
    
    return [...new Set(words)].slice(0, 5);
  }

  // Función auxiliar para generar razón personalizada
  private generatePersonalizedReason(event: any, userProfile: any): string {
    if (userProfile.interests && event.categoryId && userProfile.interests.includes(event.categoryId)) {
      return `Este evento coincide con tu interés en ${event.category || 'esta categoría'}`;
    }
    if (userProfile.skills && event.skills && userProfile.skills.some((skill: string) => 
      event.skills.some((eventSkill: string) => 
        skill.toLowerCase().includes(eventSkill.toLowerCase())
      )
    )) {
      return `Tus habilidades son perfectas para este evento`;
    }
    return 'Este evento parece ser una buena opción para ti';
  }

  // Función auxiliar para generar mensaje personalizado
  private generatePersonalizedMessage(event: any, userProfile: any): string {
    if (userProfile.interests && event.categoryId && userProfile.interests.includes(event.categoryId)) {
      return `¡Perfecto! Este evento de ${event.category || 'esta categoría'} está alineado con tus intereses.`;
    }
    return 'Este evento te permitirá contribuir a la comunidad y desarrollar nuevas habilidades.';
  }
}

export const simpleAIService = new SimpleAIService();
