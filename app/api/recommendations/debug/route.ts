// Endpoint de Debug para el Sistema de Recomendaciones
// Ayuda a diagnosticar problemas con las recomendaciones

import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Iniciando debug del sistema de recomendaciones")
    
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Obtener datos del voluntario
    let volunteerData = null
    try {
      const volunteerResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/perfil/voluntario`, {
        headers: {
          'Cookie': request.headers.get('cookie') || ''
        }
      })
      
      if (volunteerResponse.ok) {
        volunteerData = await volunteerResponse.json()
      }
    } catch (error) {
      console.error('Error obteniendo datos del voluntario:', error)
    }

    // Obtener eventos
    let eventsData = null
    try {
      const eventsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/eventos?limit=10`, {
        headers: {
          'Cookie': request.headers.get('cookie') || ''
        }
      })
      
      if (eventsResponse.ok) {
        eventsData = await eventsResponse.json()
      }
    } catch (error) {
      console.error('Error obteniendo eventos:', error)
    }

    // Información de debug
    const debugInfo = {
      user: {
        id: user.id,
        role: user.role,
        email: user.email
      },
      volunteer: volunteerData ? {
        hasProfile: !!volunteerData.voluntario,
        skills: volunteerData.voluntario?.skills || [],
        interests: volunteerData.voluntario?.interests || [],
        location: {
          city: volunteerData.voluntario?.city,
          state: volunteerData.voluntario?.state,
          latitude: volunteerData.voluntario?.latitude,
          longitude: volunteerData.voluntario?.longitude
        },
        availability: volunteerData.voluntario?.availability || []
      } : null,
      events: eventsData ? {
        total: eventsData.events?.length || 0,
        sample: eventsData.events?.slice(0, 3).map((e: any) => ({
          id: e.id,
          title: e.title,
          status: e.status,
          city: e.city,
          category: e.category_name,
          volunteers: `${e.current_volunteers || 0}/${e.max_volunteers || 0}`
        })) || []
      } : null,
      system: {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV
      }
    }

    console.log("📊 Debug info:", JSON.stringify(debugInfo, null, 2))

    return NextResponse.json({
      success: true,
      debug: debugInfo,
      message: "Información de debug generada exitosamente"
    })

  } catch (error) {
    console.error("❌ Error en debug:", error)
    
    return NextResponse.json({
      success: false,
      error: "Error interno del servidor",
      message: "No se pudo generar la información de debug"
    }, { status: 500 })
  }
}
