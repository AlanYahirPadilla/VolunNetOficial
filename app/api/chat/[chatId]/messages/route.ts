import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { chatService } from "@/lib/services/ChatService"

export const dynamic = 'force-dynamic'

// GET /api/chat/[chatId]/messages - Obtener mensajes de un chat
export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const messages = await chatService.getChatMessages(params.chatId, limit, offset)

    return NextResponse.json({
      success: true,
      messages
    })

  } catch (error) {
    console.error('Error obteniendo mensajes:', error)
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 })
  }
}

// POST /api/chat/[chatId]/messages - Enviar mensaje
export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { content, type } = await request.json()

    if (!content) {
      return NextResponse.json({ 
        error: "Contenido del mensaje requerido" 
      }, { status: 400 })
    }

    const message = await chatService.sendMessage(
      params.chatId, 
      user.id, 
      content, 
      type || 'DIRECT'
    )

    return NextResponse.json({
      success: true,
      message
    })

  } catch (error) {
    console.error('Error enviando mensaje:', error)
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
