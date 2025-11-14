import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { prisma } from "@/lib/prisma"
import { eventNotificationService } from "@/lib/services/EventNotificationService"

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { status } = await request.json()
    
    if (!['PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ 
        error: "Estado inválido. Debe ser PUBLISHED, IN_PROGRESS, COMPLETED o CANCELLED" 
      }, { status: 400 })
    }

    // Verificar que el usuario es el organizador del evento
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        organization: true
      }
    })

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    if (event.organization.userId !== user.id) {
      return NextResponse.json({ error: "No tienes permisos para modificar este evento" }, { status: 403 })
    }

    // Actualizar el estado del evento
    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: { 
        status,
        updatedAt: new Date()
      }
    })

    // Enviar notificaciones a los voluntarios inscritos
    await eventNotificationService.sendEventStatusChangeNotification(
      params.id,
      status
    )

    return NextResponse.json({
      success: true,
      message: `Estado del evento actualizado a ${status}`,
      event: updatedEvent
    })

  } catch (error) {
    console.error("Error actualizando estado del evento:", error)
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 })
  }
}
