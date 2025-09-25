import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { eventNotificationService } from "@/lib/services/EventNotificationService"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    let notifications
    if (unreadOnly) {
      notifications = await eventNotificationService.getUserNotifications(user.id, limit)
      // Filtrar solo las no leídas
      notifications = notifications.filter(n => n.status !== 'READ')
    } else {
      notifications = await eventNotificationService.getUserNotifications(user.id, limit)
    }

    const unreadCount = await eventNotificationService.getUnreadCount(user.id)

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      total: notifications.length
    })

  } catch (error) {
    console.error('Error obteniendo notificaciones:', error)
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { notificationId } = await request.json()
    
    if (!notificationId) {
      return NextResponse.json({ 
        error: "ID de notificación requerido" 
      }, { status: 400 })
    }

    await eventNotificationService.markNotificationAsRead(notificationId)

    return NextResponse.json({
      success: true,
      message: "Notificación marcada como leída"
    })

  } catch (error) {
    console.error('Error marcando notificación como leída:', error)
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 })
  }
}
