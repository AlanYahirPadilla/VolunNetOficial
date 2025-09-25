import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { chatService } from "@/lib/services/ChatService"

export const dynamic = 'force-dynamic'

// POST /api/chat/invitations/[invitationId]/respond - Responder a invitación
export async function POST(
  request: NextRequest,
  { params }: { params: { invitationId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { response } = await request.json()

    if (!response || !['ACCEPTED', 'DECLINED'].includes(response)) {
      return NextResponse.json({ 
        error: "Respuesta debe ser 'ACCEPTED' o 'DECLINED'" 
      }, { status: 400 })
    }

    const result = await chatService.respondToInvitation(params.invitationId, response)

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error) {
    console.error('Error respondiendo a invitación:', error)
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
