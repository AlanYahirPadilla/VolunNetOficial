import { NextRequest, NextResponse } from "next/server"
import { eventNotificationService } from "@/lib/services/EventNotificationService"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verificar que es una llamada autorizada (desde Vercel Cron)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log('🔔 Ejecutando recordatorios automáticos...')
    
    await eventNotificationService.sendEventReminders()

    return NextResponse.json({
      success: true,
      message: "Recordatorios enviados exitosamente",
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error ejecutando recordatorios:', error)
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
