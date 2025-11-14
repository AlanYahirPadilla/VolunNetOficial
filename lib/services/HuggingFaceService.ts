// Servicio de Hugging Face para embeddings semánticos
export class HuggingFaceService {
  private apiKey: string | null = null;
  private isEnabled: boolean = false;
  private baseUrl = 'https://api-inference.huggingface.co/models';

  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || null;
    this.isEnabled = !!this.apiKey;
    
    if (this.isEnabled) {
      console.log('✅ Hugging Face service initialized');
    } else {
      console.log('⚠️ Hugging Face API key not found, service disabled');
    }
  }

  /**
   * Genera embeddings para un texto usando un modelo de Hugging Face
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.isEnabled || !this.apiKey) {
      return this.getFallbackEmbedding(text);
    }

    try {
      const response = await fetch(`${this.baseUrl}/sentence-transformers/all-MiniLM-L6-v2`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true }
        })
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const result = await response.json();
      
      // El resultado puede ser un array de embeddings o un objeto con embeddings
      if (Array.isArray(result) && result[0] && Array.isArray(result[0])) {
        return result[0];
      } else if (result.embeddings) {
        return result.embeddings;
      } else {
        throw new Error('Unexpected response format from Hugging Face API');
      }
    } catch (error) {
      console.error('Error generating embedding with Hugging Face:', error);
      return this.getFallbackEmbedding(text);
    }
  }

  /**
   * Calcula la similitud coseno entre dos embeddings
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    return Math.max(0, Math.min(1, similarity)); // Asegurar que esté entre 0 y 1
  }

  /**
   * Genera embeddings para múltiples textos de forma eficiente
   */
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.isEnabled || !this.apiKey) {
      return texts.map(text => this.getFallbackEmbedding(text));
    }

    try {
      const response = await fetch(`${this.baseUrl}/sentence-transformers/all-MiniLM-L6-v2`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: texts,
          options: { wait_for_model: true }
        })
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (Array.isArray(result)) {
        return result;
      } else {
        throw new Error('Unexpected response format from Hugging Face API');
      }
    } catch (error) {
      console.error('Error generating batch embeddings with Hugging Face:', error);
      return texts.map(text => this.getFallbackEmbedding(text));
    }
  }

  /**
   * Encuentra eventos similares basándose en embeddings semánticos
   */
  async findSimilarEvents(
    userProfile: {
      interests: string[];
      skills: string[];
      experience: string[];
    },
    events: Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      skills: string[];
    }>
  ): Promise<Array<{
    eventId: string;
    similarity: number;
    reason: string;
  }>> {
    try {
      // Crear perfil de texto del usuario
      const userProfileText = [
        ...userProfile.interests,
        ...userProfile.skills,
        ...userProfile.experience
      ].join(' ');

      // Generar embedding del perfil del usuario
      const userEmbedding = await this.generateEmbedding(userProfileText);

      // Crear textos de eventos
      const eventTexts = events.map(event => 
        `${event.title} ${event.description} ${event.category} ${event.skills.join(' ')}`
      );

      // Generar embeddings de eventos
      const eventEmbeddings = await this.generateBatchEmbeddings(eventTexts);

      // Calcular similitudes
      const similarities = events.map((event, index) => {
        const similarity = this.calculateSimilarity(userEmbedding, eventEmbeddings[index]);
        return {
          eventId: event.id,
          similarity,
          reason: this.generateSimilarityReason(similarity, event)
        };
      });

      // Ordenar por similitud descendente
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .filter(item => item.similarity > 0.3); // Filtrar similitudes muy bajas
    } catch (error) {
      console.error('Error finding similar events:', error);
      return [];
    }
  }

  /**
   * Genera una razón para la similitud encontrada
   */
  private generateSimilarityReason(similarity: number, event: any): string {
    if (similarity > 0.8) {
      return `Muy alta compatibilidad semántica con el evento "${event.title}"`;
    } else if (similarity > 0.6) {
      return `Alta compatibilidad semántica con el evento "${event.title}"`;
    } else if (similarity > 0.4) {
      return `Compatibilidad moderada con el evento "${event.title}"`;
    } else {
      return `Compatibilidad baja con el evento "${event.title}"`;
    }
  }

  /**
   * Embedding de fallback cuando la API no está disponible
   */
  private getFallbackEmbedding(text: string): number[] {
    // Generar un embedding simple basado en hash del texto
    const hash = this.simpleHash(text);
    const embedding = new Array(384).fill(0); // Tamaño estándar de all-MiniLM-L6-v2
    
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] = Math.sin(hash + i) * 0.1;
    }
    
    return embedding;
  }

  /**
   * Función hash simple para generar embeddings de fallback
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    return Math.abs(hash);
  }
}

export const huggingFaceService = new HuggingFaceService();
