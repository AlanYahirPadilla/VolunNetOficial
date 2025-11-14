import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { chatService } from "@/lib/services/ChatService"

export const dynamic = 'force-dynamic'

// GET /api/chat/invitations - Obtener invitaciones pendientes
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const invitations = await chatService.getUserInvitations(user.id)

    return NextResponse.json({
      success: true,
      invitations
    })

  } catch (error) {
    console.error('Error obteniendo invitaciones:', error)
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 })
  }
}

// POST /api/chat/invitations - Invitar usuario a chat
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { chatId, inviteeId, message } = await request.json()

    if (!chatId || !inviteeId) {
      return NextResponse.json({ 
        error: "chatId e inviteeId son requeridos" 
      }, { status: 400 })
    }

    const invitation = await chatService.inviteToChat(chatId, user.id, inviteeId, message)

    return NextResponse.json({
      success: true,
      invitation
    })

  } catch (error) {
    console.error('Error enviando invitación:', error)
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
