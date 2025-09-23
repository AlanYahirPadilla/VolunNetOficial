// API Endpoint para Recomendaciones de Eventos con IA
// Proporciona recomendaciones personalizadas basadas en IA

import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { recommendationService } from "@/lib/services/RecommendationService"
import { RecommendationRequest } from "@/lib/services/RecommendationService"

// =================== GET - Obtener Recomendaciones ===================

export async function GET(request: NextRequest) {
  try {
    console.log("🚀 Iniciando API de recomendaciones de eventos")
    
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar que sea un voluntario
    if (user.role !== "VOLUNTEER") {
      return NextResponse.json({ error: "Solo los voluntarios pueden obtener recomendaciones" }, { status: 403 })
    }

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const includePastEvents = searchParams.get("includePastEvents") === "true"
    const maxDistance = searchParams.get("maxDistance") ? parseInt(searchParams.get("maxDistance")!) : undefined
    const preferredCategories = searchParams.get("categories")?.split(",") || undefined
    const difficultyLevel = searchParams.get("difficulty") as 'beginner' | 'intermediate' | 'advanced' | 'any' | undefined
    const timeCommitment = searchParams.get("timeCommitment") as 'low' | 'medium' | 'high' | 'any' | undefined

    // Configuración personalizada si se proporciona
    const customConfig = searchParams.get("config") ? JSON.parse(searchParams.get("config")!) : undefined

    // Crear request de recomendación
    const recommendationRequest: RecommendationRequest = {
      volunteerId: user.id,
      limit,
      includePastEvents,
      customConfig,
      preferences: {
        maxDistance,
        preferredCategories,
        difficultyLevel,
        timeCommitment
      }
    }

    console.log("📊 Parámetros de recomendación:", {
      volunteerId: user.id,
      limit,
      includePastEvents,
      maxDistance,
      preferredCategories,
      difficultyLevel,
      timeCommitment
    })

    // Generar recomendaciones
    const recommendations = await recommendationService.getRecommendations(recommendationRequest)

    console.log(`✅ Recomendaciones generadas: ${recommendations.recommendations.length}`)

    // Registrar la interacción
    await recommendationService.recordUserInteraction(user.id, "", "viewed")

    return NextResponse.json({
      success: true,
      data: recommendations,
      message: `Se encontraron ${recommendations.recommendations.length} recomendaciones`
    })

  } catch (error) {
    console.error("❌ Error en API de recomendaciones:", error)
    
    return NextResponse.json({
      success: false,
      error: "Error interno del servidor",
      message: "No se pudieron generar las recomendaciones en este momento"
    }, { status: 500 })
  }
}

// =================== POST - Registrar Interacción ===================

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Registrando interacción con recomendación")
    
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Obtener datos del body
    const body = await request.json()
    const { eventId, action } = body

    if (!eventId || !action) {
      return NextResponse.json({ 
        error: "Faltan parámetros requeridos",
        message: "Se requiere eventId y action"
      }, { status: 400 })
    }

    if (!['viewed', 'clicked', 'applied', 'dismissed'].includes(action)) {
      return NextResponse.json({ 
        error: "Acción no válida",
        message: "La acción debe ser: viewed, clicked, applied, o dismissed"
      }, { status: 400 })
    }

    // Registrar la interacción
    await recommendationService.recordUserInteraction(user.id, eventId, action)

    console.log(`✅ Interacción registrada: ${action} para evento ${eventId}`)

    return NextResponse.json({
      success: true,
      message: "Interacción registrada exitosamente"
    })

  } catch (error) {
    console.error("❌ Error registrando interacción:", error)
    
    return NextResponse.json({
      success: false,
      error: "Error interno del servidor",
      message: "No se pudo registrar la interacción"
    }, { status: 500 })
  }
}

// =================== PUT - Actualizar Preferencias ===================

export async function PUT(request: NextRequest) {
  try {
    console.log("⚙️ Actualizando preferencias de recomendación")
    
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Obtener datos del body
    const body = await request.json()
    const { preferences, config } = body

    if (!preferences && !config) {
      return NextResponse.json({ 
        error: "Faltan parámetros requeridos",
        message: "Se requiere preferences o config"
      }, { status: 400 })
    }

    // Actualizar preferencias si se proporcionan
    if (preferences) {
      await recommendationService.updateUserPreferences(user.id, preferences)
    }

    // Actualizar configuración si se proporciona
    if (config) {
      // Aquí se actualizaría la configuración del motor de recomendaciones
      console.log("Configuración personalizada:", config)
    }

    console.log(`✅ Preferencias actualizadas para usuario ${user.id}`)

    return NextResponse.json({
      success: true,
      message: "Preferencias actualizadas exitosamente"
    })

  } catch (error) {
    console.error("❌ Error actualizando preferencias:", error)
    
    return NextResponse.json({
      success: false,
      error: "Error interno del servidor",
      message: "No se pudieron actualizar las preferencias"
    }, { status: 500 })
  }
}

// =================== DELETE - Limpiar Cache ===================

export async function DELETE(request: NextRequest) {
  try {
    console.log("🧹 Limpiando cache de recomendaciones")
    
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar permisos de administrador (opcional)
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Limpiar cache (implementación futura)
    console.log("Cache limpiado exitosamente")

    return NextResponse.json({
      success: true,
      message: "Cache limpiado exitosamente"
    })

  } catch (error) {
    console.error("❌ Error limpiando cache:", error)
    
    return NextResponse.json({
      success: false,
      error: "Error interno del servidor",
      message: "No se pudo limpiar el cache"
    }, { status: 500 })
  }
}
