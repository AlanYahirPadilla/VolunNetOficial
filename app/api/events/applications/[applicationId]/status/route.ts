import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { applicationId } = params
    const { status } = await request.json()

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ 
        error: "Estado inválido. Debe ser ACCEPTED o REJECTED" 
      }, { status: 400 })
    }

    // Verificar que la aplicación existe y pertenece a un evento de la organización del usuario
    const application = await prisma.eventApplication.findUnique({
      where: { id: applicationId },
      include: {
        event: {
          include: {
            organization: true
          }
        },
        volunteer: {
          include: {
            user: true
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json({ 
        error: "Aplicación no encontrada" 
      }, { status: 404 })
    }

    // Verificar que el usuario es el organizador del evento
    if (application.event.organization.userId !== user.id) {
      return NextResponse.json({ 
        error: "No tienes permisos para modificar esta aplicación" 
      }, { status: 403 })
    }

    // Actualizar el estado de la aplicación
    const updatedApplication = await prisma.eventApplication.update({
      where: { id: applicationId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        volunteer: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            organizationId: true
          }
        }
      }
    })

    // Si se acepta la aplicación, actualizar el contador de voluntarios del evento
    if (status === 'ACCEPTED') {
      await prisma.event.update({
        where: { id: application.eventId },
        data: {
          currentVolunteers: {
            increment: 1
          }
        }
      })
    }

    // Enviar notificación al voluntario
    try {
      const { eventNotificationService } = await import('@/lib/services/EventNotificationService')
      
      if (status === 'ACCEPTED') {
        await eventNotificationService.sendApplicationAcceptedNotification(
          application.volunteer.user.id,
          application.eventId,
          user.id
        )
      } else {
        await eventNotificationService.sendApplicationRejectedNotification(
          application.volunteer.user.id,
          application.eventId,
          user.id
        )
      }
    } catch (notificationError) {
      console.error('Error enviando notificación:', notificationError)
      // No fallar la operación por error en notificaciones
    }

    return NextResponse.json({
      success: true,
      application: {
        id: updatedApplication.id,
        status: updatedApplication.status,
        volunteer: {
          id: updatedApplication.volunteer.id,
          firstName: updatedApplication.volunteer.user.firstName,
          lastName: updatedApplication.volunteer.user.lastName,
          email: updatedApplication.volunteer.user.email,
          avatar: updatedApplication.volunteer.user.avatar
        },
        eventTitle: updatedApplication.event.title
      }
    })

  } catch (error) {
    console.error('Error actualizando aplicación:', error)
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 })
  }
}
