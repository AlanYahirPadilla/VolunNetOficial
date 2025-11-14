import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/auth/actions'
import { prisma } from '@/lib/prisma'

// Agregar reacción a un mensaje (usando metadata como fallback)
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando endpoint de reacciones')
    
    const user = await getCurrentUser()
    if (!user) {
      console.log('❌ Usuario no autenticado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('✅ Usuario autenticado:', user.id)

    const { messageId, emoji } = await request.json()
    console.log('📨 Datos recibidos:', { messageId, emoji })

    if (!messageId || !emoji) {
      console.log('❌ Faltan parámetros requeridos')
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 })
    }

    // Verificar que el mensaje existe y el usuario tiene acceso
    const message = await prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        chat: {
          participants: {
            some: {
              userId: user.id
            }
          }
        }
      },
      include: {
        chat: true
      }
    })

    if (!message) {
      console.log('❌ Mensaje no encontrado o sin acceso')
      return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 })
    }

    console.log('✅ Mensaje encontrado:', message.id)

    // Intentar obtener reacciones del campo reactions, si no existe usar metadata
    let existingReactions = {}
    
    if (message.reactions) {
      existingReactions = (message.reactions as { [emoji: string]: string[] }) || {}
    } else if (message.metadata) {
      const metadata = message.metadata as any
      existingReactions = metadata.reactions || {}
    }
    
    console.log('📊 Reacciones existentes:', existingReactions)

    // Si el usuario ya reaccionó con este emoji, remover la reacción
    if (existingReactions[emoji]?.includes(user.id)) {
      console.log('🔄 Removiendo reacción existente')
      const updatedReactions = { ...existingReactions }
      updatedReactions[emoji] = updatedReactions[emoji].filter(id => id !== user.id)
      
      // Si no quedan reacciones para este emoji, eliminar la entrada
      if (updatedReactions[emoji].length === 0) {
        delete updatedReactions[emoji]
      }

      // Actualizar el mensaje - intentar usar reactions, si falla usar metadata
      try {
        await prisma.chatMessage.update({
          where: { id: messageId },
          data: { reactions: updatedReactions }
        })
      } catch (error) {
        console.log('⚠️ Campo reactions no existe, usando metadata')
        const currentMetadata = (message.metadata as any) || {}
        await prisma.chatMessage.update({
          where: { id: messageId },
          data: { 
            metadata: {
              ...currentMetadata,
              reactions: updatedReactions
            }
          }
        })
      }

      console.log('✅ Reacción removida exitosamente')
      return NextResponse.json({ 
        success: true, 
        action: 'removed',
        reactions: updatedReactions 
      })
    } else {
      console.log('➕ Agregando nueva reacción')
      // Agregar la reacción
      const updatedReactions = { ...existingReactions }
      if (!updatedReactions[emoji]) {
        updatedReactions[emoji] = []
      }
      updatedReactions[emoji].push(user.id)

      // Actualizar el mensaje - intentar usar reactions, si falla usar metadata
      try {
        await prisma.chatMessage.update({
          where: { id: messageId },
          data: { reactions: updatedReactions }
        })
      } catch (error) {
        console.log('⚠️ Campo reactions no existe, usando metadata')
        const currentMetadata = (message.metadata as any) || {}
        await prisma.chatMessage.update({
          where: { id: messageId },
          data: { 
            metadata: {
              ...currentMetadata,
              reactions: updatedReactions
            }
          }
        })
      }

      console.log('✅ Reacción agregada exitosamente')
      return NextResponse.json({ 
        success: true, 
        action: 'added',
        reactions: updatedReactions 
      })
    }

  } catch (error) {
    console.error('❌ Error managing reaction:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}

// Obtener reacciones de un mensaje
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')

    if (!messageId) {
      return NextResponse.json({ error: 'ID de mensaje requerido' }, { status: 400 })
    }

    const message = await prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        chat: {
          participants: {
            some: {
              userId: user.id
            }
          }
        }
      },
      select: {
        id: true,
        reactions: true,
        metadata: true
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 })
    }

    // Intentar obtener reacciones del campo reactions, si no existe usar metadata
    let reactions = {}
    
    if (message.reactions) {
      reactions = (message.reactions as { [emoji: string]: string[] }) || {}
    } else if (message.metadata) {
      const metadata = message.metadata as any
      reactions = metadata.reactions || {}
    }

    return NextResponse.json({ 
      success: true,
      reactions: reactions
    })

  } catch (error) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}