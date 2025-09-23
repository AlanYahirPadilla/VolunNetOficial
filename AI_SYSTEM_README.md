# Sistema de Recomendaciones con Inteligencia Artificial - VolunNet

## 🚀 Descripción General

Este sistema implementa un motor de recomendaciones híbrido que combina algoritmos propios con APIs externas de IA para proporcionar recomendaciones personalizadas de eventos de voluntariado.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **RecommendationEngine** - Motor principal de recomendaciones
2. **AIConfigService** - Gestión de configuración y preferencias
3. **ExternalAIService** - Integración con APIs externas
4. **RecommendationService** - Servicio principal que orquesta todo
5. **useRecommendations** - Hook de React para el frontend
6. **AIRecommendations** - Componente de UI para mostrar recomendaciones

### Flujo de Datos

```
Usuario → Dashboard → useRecommendations → RecommendationService → RecommendationEngine
                                                                    ↓
                                                              ExternalAIService
                                                                    ↓
                                                              APIs Externas (OpenAI, HuggingFace, GoogleMaps)
```

## 🧠 Algoritmos de Recomendación

### Factores de Puntuación

1. **Ubicación (30%)** - Distancia geográfica con radio configurable
2. **Intereses (25%)** - Coincidencia de categorías de interés
3. **Habilidades (20%)** - Match entre skills requeridas y del voluntario
4. **Disponibilidad (15%)** - Compatibilidad horaria
5. **Experiencia (10%)** - Eventos similares completados exitosamente

### Algoritmos Implementados

- **Filtrado Colaborativo** - Basado en voluntarios similares
- **Filtrado Basado en Contenido** - Similitud de categorías e intereses
- **Filtrado Geográfico** - Distancia y radio configurable
- **Filtrado Temporal** - Compatibilidad con disponibilidad
- **Análisis Semántico** - Usando embeddings de Hugging Face
- **Análisis de Sentimiento** - Usando OpenAI GPT-4

## 🔧 Configuración

### Variables de Entorno

```env
# APIs de Inteligencia Artificial
OPENAI_API_KEY="sk-your-openai-api-key-here"
HUGGINGFACE_API_KEY="hf_your-huggingface-api-key-here"
GOOGLE_MAPS_API_KEY="your-google-maps-api-key-here"

# Configuración de IA
AI_RECOMMENDATION_CACHE_TTL=3600
AI_MAX_RECOMMENDATIONS=20
AI_DEFAULT_RADIUS_KM=10
AI_CONFIDENCE_THRESHOLD=0.6
```

### Configuraciones Predefinidas

1. **Enfoque en Ubicación** - Prioriza eventos cercanos
2. **Enfoque en Intereses** - Prioriza coincidencia de categorías
3. **Enfoque en Habilidades** - Prioriza match de skills
4. **Amigable para Principiantes** - Eventos fáciles para empezar
5. **Modo Experto** - Eventos desafiantes para voluntarios experimentados

## 📊 Características del Sistema

### Recomendaciones Inteligentes

- **Score de Compatibilidad** (0-100%)
- **Razones Explicativas** - "¿Por qué te recomendamos esto?"
- **Predicción de Satisfacción** - Basada en usuarios similares
- **Recomendaciones de Contraste** - Para diversificar

### Análisis Avanzado

- **Análisis Semántico** - Entender significado, no solo palabras
- **Análisis de Sentimiento** - Detectar tono de las descripciones
- **Análisis Geográfico** - Tipo de vecindario, accesibilidad, seguridad
- **Análisis de Dificultad** - Nivel apropiado para el voluntario
- **Análisis de Networking** - Potencial de conexiones

### Aprendizaje Continuo

- **Feedback Loop** - Aprende de cada interacción
- **Ajuste Automático** - Mejora pesos según comportamiento
- **Detección de Patrones** - Identifica preferencias cambiantes
- **Optimización Automática** - Ajusta configuración para mejor rendimiento

## 🎯 Uso en el Frontend

### Hook Principal

```typescript
import { useRecommendations } from '@/hooks/useRecommendations'

function MyComponent() {
  const {
    recommendations,
    insights,
    loading,
    error,
    refresh,
    recordInteraction
  } = useRecommendations({
    limit: 10,
    maxDistance: 15,
    preferredCategories: ['Educación', 'Tecnología'],
    autoRefresh: true
  })

  return (
    <div>
      {recommendations.map(rec => (
        <RecommendationCard 
          key={rec.eventId}
          recommendation={rec}
          onInteraction={recordInteraction}
        />
      ))}
    </div>
  )
}
```

### Componente de Recomendaciones

```typescript
import AIRecommendations from '@/components/dashboard/AIRecommendations'

function Dashboard() {
  return (
    <AIRecommendations 
      limit={6}
      autoRefresh={true}
      showHeader={true}
    />
  )
}
```

## 🔌 APIs Externas Integradas

### OpenAI GPT-4
- **Análisis de Texto** - Sentimiento, palabras clave, dificultad
- **Generación de Descripciones** - Mejora automática de descripciones
- **Análisis de Contexto** - Entender mejor los eventos

### Hugging Face
- **Embeddings Semánticos** - Vectores para comparación profunda
- **Modelo**: sentence-transformers/all-MiniLM-L6-v2
- **Dimensión**: 384

### Google Maps API
- **Análisis de Ubicación** - Tipo de vecindario, accesibilidad
- **Puntuación de Seguridad** - Basada en datos de la zona
- **Análisis de Transporte** - Acceso a transporte público

## 📈 Métricas y Analytics

### Métricas del Usuario
- Total de recomendaciones vistas
- Tasa de clics en recomendaciones
- Tasa de aplicación a eventos
- Score promedio de compatibilidad
- Rating de satisfacción

### Métricas del Sistema
- Tiempo de procesamiento
- Tasa de acierto del cache
- Servicios de IA utilizados
- Precisión de las recomendaciones

## 🚀 Próximas Mejoras

### Fase 2: IA Conversacional
- Chatbot de recomendaciones
- Asistente de perfil
- Notificaciones inteligentes

### Fase 3: Análisis Predictivo
- Predicción de abandono
- Sugerencias de retención
- Análisis de impacto

### Fase 4: Machine Learning Avanzado
- Modelos de deep learning
- Análisis de comportamiento
- Recomendaciones en tiempo real

## 🛠️ Desarrollo y Mantenimiento

### Estructura de Archivos

```
lib/services/
├── RecommendationEngine.ts      # Motor principal
├── AIConfigService.ts          # Configuración
├── ExternalAIService.ts        # APIs externas
└── RecommendationService.ts    # Servicio principal

hooks/
└── useRecommendations.ts       # Hook de React

components/dashboard/
├── AIRecommendations.tsx       # Componente principal
└── AIConfigPanel.tsx          # Panel de configuración

app/api/recommendations/
└── events/route.ts            # API endpoint
```

### Testing

```bash
# Ejecutar tests del sistema de IA
npm run test:ai

# Test de recomendaciones
npm run test:recommendations

# Test de APIs externas
npm run test:external-apis
```

### Monitoreo

- **Logs de Recomendaciones** - En `/logs/recommendations/`
- **Métricas de Performance** - Dashboard en `/admin/ai-metrics`
- **Alertas de Error** - Notificaciones automáticas

## 📚 Documentación Adicional

- [Guía de Configuración](./docs/ai-configuration.md)
- [API Reference](./docs/api-reference.md)
- [Ejemplos de Uso](./docs/usage-examples.md)
- [Troubleshooting](./docs/troubleshooting.md)

## 🤝 Contribución

Para contribuir al sistema de IA:

1. Fork del repositorio
2. Crear branch para feature
3. Implementar cambios
4. Agregar tests
5. Crear pull request

## 📄 Licencia

Este sistema de IA es parte de VolunNet y está bajo la misma licencia del proyecto principal.
