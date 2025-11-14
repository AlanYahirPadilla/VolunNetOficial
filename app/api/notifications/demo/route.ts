import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { eventNotificationService } from "@/lib/services/EventNotificationService"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Crear notificaciones de ejemplo para demostrar el sistema
    const demoNotifications = [
      {
        userId: user.id,
        category: 'SYSTEM' as const,
        subcategory: 'WELCOME' as const,
        title: '¡Bienvenido a VolunNet! 🎉',
        message: 'Gracias por unirte a nuestra comunidad de voluntarios. Para obtener mejores recomendaciones de eventos, completa tu perfil con tus intereses y habilidades.',
        priority: 'HIGH' as const,
        actionText: 'Completar Perfil',
        actionUrl: '/perfil',
        expiresIn: 7
      },
      {
        userId: user.id,
        category: 'EVENT' as const,
        subcategory: 'APPLICATION_SUBMITTED' as const,
        title: 'Postulación Enviada ✅',
        message: 'Tu postulación al evento "Limpieza de Playa" ha sido enviada exitosamente. El organizador revisará tu solicitud pronto.',
        priority: 'NORMAL' as const,
        actionText: 'Ver Evento',
        actionUrl: '/eventos/1',
        expiresIn: 30
      },
      {
        userId: user.id,
        category: 'EVENT' as const,
        subcategory: 'APPLICATION_ACCEPTED' as const,
        title: '¡Felicidades! Tu postulación fue aceptada 🎉',
        message: 'Has sido aceptado para participar en "Taller de Reciclaje" el 28/09/2024. ¡Nos vemos pronto!',
        priority: 'HIGH' as const,
        actionText: 'Ver Detalles',
        actionUrl: '/eventos/2',
        expiresIn: 30
      },
      {
        userId: user.id,
        category: 'EVENT' as const,
        subcategory: 'EVENT_REMINDER' as const,
        title: 'Recordatorio: Tu evento es mañana ⏰',
        message: 'El evento "Limpieza de Playa" es mañana a las 09:00. ¡Prepárate para una gran experiencia!',
        priority: 'HIGH' as const,
        actionText: 'Ver Detalles',
        actionUrl: '/eventos/1',
        expiresIn: 1
      },
      {
        userId: user.id,
        category: 'EVENT' as const,
        subcategory: 'EVENT_COMPLETED' as const,
        title: '¡Evento completado! Gracias por participar 🌟',
        message: 'El evento "Taller de Reciclaje" ha finalizado. ¡Gracias por tu participación! Califica tu experiencia para ayudar a otros voluntarios.',
        priority: 'NORMAL' as const,
        actionText: 'Calificar Evento',
        actionUrl: '/eventos/2/calificar',
        expiresIn: 7
      }
    ];

    // Crear las notificaciones usando el servicio real
    for (const notificationData of demoNotifications) {
      try {
        await eventNotificationService.notificationService.createNotification(notificationData)
      } catch (error) {
        console.error('Error creando notificación demo:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Notificaciones de ejemplo creadas exitosamente",
      count: demoNotifications.length
    })

  } catch (error) {
    console.error('Error creando notificaciones demo:', error)
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
