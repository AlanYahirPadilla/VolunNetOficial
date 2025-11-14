import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { prisma } from "@/lib/prisma"
import { eventNotificationService } from "@/lib/services/EventNotificationService"

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; applicationId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { status } = await request.json()
    
    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ 
        error: "Estado inválido. Debe ser ACCEPTED o REJECTED" 
      }, { status: 400 })
    }

    // Verificar que el usuario es el organizador del evento
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        organization: true,
        applications: {
          where: { id: params.applicationId },
          include: { volunteer: true }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    if (event.organization.userId !== user.id) {
      return NextResponse.json({ error: "No tienes permisos para modificar esta postulación" }, { status: 403 })
    }

    const application = event.applications[0]
    if (!application) {
      return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 })
    }

    // Actualizar el estado de la postulación
    const updatedApplication = await prisma.eventApplication.update({
      where: { id: params.applicationId },
      data: { 
        status,
        updatedAt: new Date()
      }
    })

    // Enviar notificación al voluntario
    await eventNotificationService.sendApplicationStatusChangeNotification(
      application.volunteer.userId,
      params.id,
      status
    )

    return NextResponse.json({
      success: true,
      message: `Postulación ${status === 'ACCEPTED' ? 'aceptada' : 'rechazada'} exitosamente`,
      application: updatedApplication
    })

  } catch (error) {
    console.error("Error actualizando estado de postulación:", error)
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 })
  }
}
