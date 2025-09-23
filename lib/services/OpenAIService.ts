// Servicio de OpenAI para análisis de texto avanzado
import OpenAI from 'openai';

export class OpenAIService {
  private openai: OpenAI | null = null;
  private isEnabled: boolean = false;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.isEnabled = true;
      console.log('✅ OpenAI service initialized');
    } else {
      console.log('⚠️ OpenAI API key not found, service disabled');
    }
  }

  /**
   * Analiza la descripción de un evento y extrae información relevante
   */
  async analyzeEventDescription(description: string): Promise<{
    keywords: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    complexity: 'beginner' | 'intermediate' | 'advanced';
    themes: string[];
    summary: string;
  }> {
    if (!this.isEnabled || !this.openai) {
      return this.getFallbackAnalysis(description);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Eres un experto en análisis de eventos de voluntariado. Analiza la descripción del evento y extrae:
            1. Palabras clave relevantes (máximo 10)
            2. Sentimiento general (positive/neutral/negative)
            3. Nivel de complejidad (beginner/intermediate/advanced)
            4. Temas principales (máximo 5)
            5. Resumen en 1-2 oraciones
            
            Responde en formato JSON válido.`
          },
          {
            role: "user",
            content: `Analiza este evento: "${description}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return analysis;
    } catch (error) {
      console.error('Error analyzing event with OpenAI:', error);
      return this.getFallbackAnalysis(description);
    }
  }

  /**
   * Genera recomendaciones personalizadas basadas en el perfil del usuario
   */
  async generatePersonalizedRecommendations(
    userProfile: {
      interests: string[];
      skills: string[];
      experience: string[];
      location: string;
    },
    events: Array<{
      title: string;
      description: string;
      category: string;
      skills: string[];
    }>
  ): Promise<{
    recommendations: Array<{
      eventTitle: string;
      reason: string;
      compatibilityScore: number;
      personalizedMessage: string;
    }>;
    insights: string[];
  }> {
    if (!this.isEnabled || !this.openai) {
      return this.getFallbackRecommendations(userProfile, events);
    }

    try {
      const prompt = `
        Perfil del usuario:
        - Intereses: ${userProfile.interests.join(', ')}
        - Habilidades: ${userProfile.skills.join(', ')}
        - Experiencia: ${userProfile.experience.join(', ')}
        - Ubicación: ${userProfile.location}

        Eventos disponibles:
        ${events.map(e => `- ${e.title}: ${e.description}`).join('\n')}

        Genera recomendaciones personalizadas para este usuario. Para cada evento recomendado, incluye:
        1. Razón específica por la que es una buena opción
        2. Puntuación de compatibilidad (0-100)
        3. Mensaje personalizado motivacional

        También proporciona 3 insights sobre el perfil del usuario y sus preferencias.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Eres un experto en matching de voluntarios con eventos. Genera recomendaciones personalizadas y útiles."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result;
    } catch (error) {
      console.error('Error generating recommendations with OpenAI:', error);
      return this.getFallbackRecommendations(userProfile, events);
    }
  }

  /**
   * Mejora las descripciones de eventos para hacerlas más atractivas
   */
  async enhanceEventDescription(originalDescription: string): Promise<string> {
    if (!this.isEnabled || !this.openai) {
      return originalDescription;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Eres un experto en marketing de eventos de voluntariado. Mejora la descripción para hacerla más atractiva y motivadora, manteniendo la información esencial."
          },
          {
            role: "user",
            content: `Mejora esta descripción de evento: "${originalDescription}"`
          }
        ],
        temperature: 0.6,
        max_tokens: 300
      });

      return response.choices[0].message.content || originalDescription;
    } catch (error) {
      console.error('Error enhancing description with OpenAI:', error);
      return originalDescription;
    }
  }

  private getFallbackAnalysis(description: string) {
    return {
      keywords: description.toLowerCase().split(' ').slice(0, 10),
      sentiment: 'neutral' as const,
      complexity: 'intermediate' as const,
      themes: ['voluntariado', 'comunidad'],
      summary: description.substring(0, 100) + '...'
    };
  }

  private getFallbackRecommendations(userProfile: any, events: any[]) {
    return {
      recommendations: events.slice(0, 3).map(event => ({
        eventTitle: event.title,
        reason: 'Basado en tus intereses y habilidades',
        compatibilityScore: 75,
        personalizedMessage: 'Este evento parece ser una buena opción para ti.'
      })),
      insights: [
        'Tu perfil muestra interés en múltiples áreas',
        'Tienes habilidades valiosas para la comunidad',
        'Considera eventos que combinen tus intereses'
      ]
    };
  }
}

export const openAIService = new OpenAIService();
