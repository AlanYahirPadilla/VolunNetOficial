import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/auth/actions'
import { prisma } from '@/lib/prisma'

// Forzar que esta ruta sea dinámica
export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    // Obtener usuario autenticado
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Eliminar todas las notificaciones del usuario
    await prisma.notification.deleteMany({
      where: {
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Todas las notificaciones eliminadas'
    })

  } catch (error) {
    console.error('Error clearing all notifications:', error)
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}



