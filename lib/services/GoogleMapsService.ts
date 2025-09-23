// Servicio de Google Maps para análisis de ubicación
export class GoogleMapsService {
  private apiKey: string | null = null;
  private isEnabled: boolean = false;
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || null;
    this.isEnabled = !!this.apiKey;
    
    if (this.isEnabled) {
      console.log('✅ Google Maps service initialized');
    } else {
      console.log('⚠️ Google Maps API key not found, service disabled');
    }
  }

  /**
   * Calcula la distancia y tiempo de viaje entre dos puntos
   */
  async calculateDistanceAndTime(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
    mode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving'
  ): Promise<{
    distance: { text: string; value: number }; // en metros
    duration: { text: string; value: number }; // en segundos
    status: string;
  }> {
    if (!this.isEnabled || !this.apiKey) {
      return this.getFallbackDistance(origin, destination);
    }

    try {
      const originStr = `${origin.latitude},${origin.longitude}`;
      const destinationStr = `${destination.latitude},${destination.longitude}`;
      
      const response = await fetch(
        `${this.baseUrl}/distancematrix/json?origins=${originStr}&destinations=${destinationStr}&mode=${mode}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.rows[0] && data.rows[0].elements[0]) {
        const element = data.rows[0].elements[0];
        return {
          distance: element.distance,
          duration: element.duration,
          status: element.status
        };
      } else {
        throw new Error(`Google Maps API error: ${data.status}`);
      }
    } catch (error) {
      console.error('Error calculating distance with Google Maps:', error);
      return this.getFallbackDistance(origin, destination);
    }
  }

  /**
   * Encuentra lugares de interés cercanos a una ubicación
   */
  async findNearbyPlaces(
    location: { latitude: number; longitude: number },
    radius: number = 1000, // metros
    types: string[] = ['transit_station', 'parking', 'restaurant', 'hospital']
  ): Promise<Array<{
    name: string;
    place_id: string;
    types: string[];
    rating?: number;
    distance: number;
  }>> {
    if (!this.isEnabled || !this.apiKey) {
      return this.getFallbackNearbyPlaces(location);
    }

    try {
      const locationStr = `${location.latitude},${location.longitude}`;
      const typeStr = types.join('|');
      
      const response = await fetch(
        `${this.baseUrl}/place/nearbysearch/json?location=${locationStr}&radius=${radius}&type=${typeStr}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.results.map((place: any) => ({
          name: place.name,
          place_id: place.place_id,
          types: place.types,
          rating: place.rating,
          distance: place.distance || 0
        }));
      } else {
        throw new Error(`Google Maps API error: ${data.status}`);
      }
    } catch (error) {
      console.error('Error finding nearby places with Google Maps:', error);
      return this.getFallbackNearbyPlaces(location);
    }
  }

  /**
   * Obtiene información detallada de un lugar
   */
  async getPlaceDetails(placeId: string): Promise<{
    name: string;
    formatted_address: string;
    phone_number?: string;
    website?: string;
    opening_hours?: any;
    rating?: number;
    reviews?: any[];
  }> {
    if (!this.isEnabled || !this.apiKey) {
      return this.getFallbackPlaceDetails(placeId);
    }

    try {
      const fields = 'name,formatted_address,phone_number,website,opening_hours,rating,reviews';
      
      const response = await fetch(
        `${this.baseUrl}/place/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        return data.result;
      } else {
        throw new Error(`Google Maps API error: ${data.status}`);
      }
    } catch (error) {
      console.error('Error getting place details with Google Maps:', error);
      return this.getFallbackPlaceDetails(placeId);
    }
  }

  /**
   * Analiza la accesibilidad de una ubicación para eventos
   */
  async analyzeLocationAccessibility(
    eventLocation: { latitude: number; longitude: number },
    volunteerLocation: { latitude: number; longitude: number }
  ): Promise<{
    accessibilityScore: number; // 0-100
    transportOptions: Array<{
      mode: string;
      duration: number;
      distance: number;
      cost?: string;
    }>;
    nearbyAmenities: string[];
    recommendations: string[];
  }> {
    try {
      // Calcular distancias para diferentes modos de transporte
      const transportModes = ['driving', 'transit', 'walking', 'bicycling'] as const;
      const transportOptions = [];

      for (const mode of transportModes) {
        const result = await this.calculateDistanceAndTime(volunteerLocation, eventLocation, mode);
        if (result.status === 'OK') {
          transportOptions.push({
            mode,
            duration: result.duration.value,
            distance: result.distance.value
          });
        }
      }

      // Encontrar lugares cercanos
      const nearbyPlaces = await this.findNearbyPlaces(eventLocation);
      const nearbyAmenities = nearbyPlaces.map(place => place.name);

      // Calcular puntuación de accesibilidad
      const accessibilityScore = this.calculateAccessibilityScore(transportOptions, nearbyPlaces);

      // Generar recomendaciones
      const recommendations = this.generateAccessibilityRecommendations(transportOptions, nearbyPlaces);

      return {
        accessibilityScore,
        transportOptions,
        nearbyAmenities,
        recommendations
      };
    } catch (error) {
      console.error('Error analyzing location accessibility:', error);
      return this.getFallbackAccessibilityAnalysis();
    }
  }

  /**
   * Calcula una puntuación de accesibilidad basada en opciones de transporte y amenidades
   */
  private calculateAccessibilityScore(
    transportOptions: Array<{ mode: string; duration: number; distance: number }>,
    nearbyPlaces: Array<{ name: string; types: string[] }>
  ): number {
    let score = 0;

    // Puntuación basada en opciones de transporte
    const hasTransit = transportOptions.some(option => option.mode === 'transit');
    const hasWalking = transportOptions.some(option => option.mode === 'walking' && option.duration < 1800); // 30 min
    const hasDriving = transportOptions.some(option => option.mode === 'driving');

    if (hasTransit) score += 30;
    if (hasWalking) score += 25;
    if (hasDriving) score += 20;

    // Puntuación basada en amenidades cercanas
    const amenityTypes = ['transit_station', 'parking', 'restaurant', 'hospital'];
    const amenityScore = amenityTypes.reduce((acc, type) => {
      const hasAmenity = nearbyPlaces.some(place => place.types.includes(type));
      return acc + (hasAmenity ? 5 : 0);
    }, 0);

    score += amenityScore;

    return Math.min(100, score);
  }

  /**
   * Genera recomendaciones basadas en el análisis de accesibilidad
   */
  private generateAccessibilityRecommendations(
    transportOptions: Array<{ mode: string; duration: number; distance: number }>,
    nearbyPlaces: Array<{ name: string; types: string[] }>
  ): string[] {
    const recommendations = [];

    const transitOption = transportOptions.find(option => option.mode === 'transit');
    const walkingOption = transportOptions.find(option => option.mode === 'walking');

    if (transitOption && transitOption.duration < 3600) { // 1 hora
      recommendations.push('El evento es accesible por transporte público');
    }

    if (walkingOption && walkingOption.duration < 1800) { // 30 min
      recommendations.push('Puedes caminar al evento en menos de 30 minutos');
    }

    const hasParking = nearbyPlaces.some(place => place.types.includes('parking'));
    if (hasParking) {
      recommendations.push('Hay opciones de estacionamiento cerca');
    }

    const hasTransit = nearbyPlaces.some(place => place.types.includes('transit_station'));
    if (hasTransit) {
      recommendations.push('Hay estaciones de transporte público cercanas');
    }

    return recommendations;
  }

  // Métodos de fallback cuando la API no está disponible
  private getFallbackDistance(origin: any, destination: any) {
    const distance = this.calculateHaversineDistance(origin, destination);
    return {
      distance: { text: `${Math.round(distance)} km`, value: distance * 1000 },
      duration: { text: `${Math.round(distance * 2)} min`, value: distance * 120 },
      status: 'OK'
    };
  }

  private getFallbackNearbyPlaces(location: any) {
    return [
      { name: 'Estación de transporte', place_id: 'fallback_1', types: ['transit_station'], distance: 500 },
      { name: 'Estacionamiento', place_id: 'fallback_2', types: ['parking'], distance: 200 }
    ];
  }

  private getFallbackPlaceDetails(placeId: string) {
    return {
      name: 'Lugar de interés',
      formatted_address: 'Dirección no disponible',
      rating: 4.0
    };
  }

  private getFallbackAccessibilityAnalysis() {
    return {
      accessibilityScore: 50,
      transportOptions: [
        { mode: 'driving', duration: 1800, distance: 5000 },
        { mode: 'walking', duration: 3600, distance: 5000 }
      ],
      nearbyAmenities: ['Estación de transporte', 'Estacionamiento'],
      recommendations: ['El evento es accesible por múltiples medios de transporte']
    };
  }

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
}

export const googleMapsService = new GoogleMapsService();
