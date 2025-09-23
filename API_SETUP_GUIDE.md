# 🔧 Guía de Configuración de APIs Externas - VolunNet

Esta guía te ayudará a configurar las APIs externas para que el sistema de recomendaciones de IA funcione correctamente.

## 📋 APIs Requeridas

### 1. OpenAI API (Recomendaciones de texto)
- **Propósito**: Análisis de descripciones de eventos y generación de recomendaciones personalizadas
- **Costo**: ~$0.01-0.05 por 1000 recomendaciones
- **Configuración**: Gratuita con $5 de crédito inicial

### 2. Hugging Face API (Embeddings semánticos)
- **Propósito**: Análisis semántico de texto para encontrar similitudes
- **Costo**: Gratuita para uso básico
- **Configuración**: Completamente gratuita

### 3. Google Maps API (Opcional - Análisis de ubicación)
- **Propósito**: Cálculo de distancias y análisis de accesibilidad
- **Costo**: ~$0.005 por solicitud
- **Configuración**: $200 de crédito mensual gratuito

## 🚀 Pasos para Configurar

### Paso 1: Configurar OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Inicia sesión o crea una cuenta
3. Haz clic en "Create new secret key"
4. Copia la clave (comienza con `sk-`)
5. Agrega la clave a tu archivo `env.local`:

```bash
OPENAI_API_KEY="sk-tu-clave-real-aqui"
```

### Paso 2: Configurar Hugging Face

1. Ve a [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Inicia sesión o crea una cuenta
3. Haz clic en "New token"
4. Selecciona "Read" como scope
5. Copia el token (comienza con `hf_`)
6. Agrega el token a tu archivo `env.local`:

```bash
HUGGINGFACE_API_KEY="hf_tu-token-real-aqui"
```

### Paso 3: Configurar Google Maps (Opcional)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Crea un proyecto o selecciona uno existente
3. Habilita la API de "Distance Matrix"
4. Ve a "Credentials" y crea una API key
5. Agrega la clave a tu archivo `env.local`:

```bash
GOOGLE_MAPS_API_KEY="tu-clave-de-google-maps-aqui"
```

## 🧪 Verificar Configuración

### Opción 1: Usar el endpoint de debug
Visita: `http://localhost:3001/api/debug/ai-status`

### Opción 2: Verificar en la consola
Revisa los logs del navegador para ver:
- ✅ APIs configuradas correctamente
- ❌ APIs no configuradas o con placeholders

## 📊 Ejemplo de Configuración Completa

```bash
# En tu archivo env.local
OPENAI_API_KEY="sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
HUGGINGFACE_API_KEY="hf_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
GOOGLE_MAPS_API_KEY="AIzaSyBvOkBwvOkBwvOkBwvOkBwvOkBwvOkBwvOk"
```

## 🔍 Troubleshooting

### Problema: "API keys no configuradas"
**Solución**: Verifica que las claves no sean placeholders y estén correctamente configuradas.

### Problema: "OpenAI API key not found"
**Solución**: Asegúrate de que la clave de OpenAI esté en `env.local` y reinicia el servidor.

### Problema: "Hugging Face API key not found"
**Solución**: Verifica que el token de Hugging Face sea válido y tenga permisos de lectura.

### Problema: APIs configuradas pero no funcionan
**Solución**: 
1. Verifica que las claves sean válidas
2. Revisa los límites de uso
3. Verifica la conectividad a internet

## 💰 Costos Estimados

Para una aplicación con 1000 usuarios activos:
- **OpenAI**: ~$5-15/mes
- **Hugging Face**: Gratuito
- **Google Maps**: ~$2-5/mes (opcional)

## 🎯 Beneficios de Usar APIs Externas

### Sin APIs (Recomendaciones básicas):
- ✅ Funciona sin configuración
- ❌ Recomendaciones genéricas
- ❌ No considera preferencias del usuario
- ❌ No analiza contenido semántico

### Con APIs (Recomendaciones inteligentes):
- ✅ Análisis semántico avanzado
- ✅ Recomendaciones personalizadas
- ✅ Análisis de sentimiento
- ✅ Extracción de palabras clave
- ✅ Análisis de ubicación (con Google Maps)

## 🔄 Reiniciar Servidor

Después de configurar las APIs, reinicia el servidor:

```bash
npm run dev
```

## 📞 Soporte

Si tienes problemas con la configuración:
1. Revisa los logs en la consola del navegador
2. Visita `/api/debug/ai-status` para ver el estado de las APIs
3. Verifica que las claves sean válidas en las plataformas respectivas
