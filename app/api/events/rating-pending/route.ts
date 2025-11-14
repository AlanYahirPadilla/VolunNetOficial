import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/auth/actions'
import { RatingService } from '@/lib/services/RatingService'

// Forzar que esta ruta sea dinámica
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Obtener usuario autenticado
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener servicio de calificaciones
    const ratingService = RatingService.getInstance()

    // Obtener eventos que necesitan calificación
    const eventsNeedingRating = await ratingService.getEventsNeedingRating(user.id)

    return NextResponse.json({
      success: true,
      eventsNeedingRating
    })

  } catch (error) {
    console.error('Error fetching events needing rating:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}



