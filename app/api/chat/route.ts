import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { chatService } from "@/lib/services/ChatService"

export const dynamic = 'force-dynamic'

// GET /api/chat - Obtener chats del usuario
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const chats = await chatService.getUserChats(user.id)

    return NextResponse.json({
      success: true,
      chats
    })

  } catch (error) {
    console.error('Error obteniendo chats:', error)
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 })
  }
}

// POST /api/chat - Crear nuevo chat
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    console.log('POST /api/chat - Body recibido:', body)
    
    const { type, userId, participantIds, eventId, name, description } = body

    let chat
    if (type === 'INDIVIDUAL') {
      // Si viene userId (formato antiguo) o participantIds (formato nuevo)
      const targetUserId = userId || (participantIds && participantIds[0])
      console.log('Chat individual - targetUserId:', targetUserId)
      
      if (!targetUserId) {
        return NextResponse.json({ 
          error: "ID de usuario requerido para chat individual" 
        }, { status: 400 })
      }
      chat = await chatService.createIndividualChat(user.id, targetUserId)
    } else if (type === 'EVENT' && eventId) {
      chat = await chatService.createEventChat(eventId, user.id)
    } else {
      return NextResponse.json({ 
        error: "Tipo de chat no válido o parámetros faltantes" 
      }, { status: 400 })
    }

    console.log('Chat creado exitosamente:', chat.id)
    
    return NextResponse.json({
      success: true,
      chat
    })

  } catch (error) {
    console.error('Error creando chat:', error)
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
