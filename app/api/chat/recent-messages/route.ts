import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/auth/actions'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Iniciando endpoint recent-messages')
    
    const user = await getCurrentUser()
    if (!user) {
      console.log('❌ Usuario no autenticado en recent-messages')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('✅ Usuario autenticado:', user.id, user.firstName, user.lastName)

    // Primero verificar que el usuario existe en la base de datos
    const userExists = await prisma.user.findUnique({
      where: { id: user.id }
    })
    
    if (!userExists) {
      console.log('❌ Usuario no encontrado en la base de datos')
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    console.log('✅ Usuario existe en la base de datos')

    // Obtener chats del usuario de forma más simple
    const userChats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: user.id
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5, // Reducir a 5 mensajes por chat
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    console.log('📋 Chats encontrados:', userChats.length)
    
    // Debug: mostrar información de cada chat
    userChats.forEach((chat, index) => {
      console.log(`📋 Chat ${index + 1}:`, {
        id: chat.id,
        type: chat.type,
        participants: chat.participants.length,
        messages: chat.messages.length
      })
      
      // Mostrar información de cada mensaje
      chat.messages.forEach((message, msgIndex) => {
        console.log(`  💬 Mensaje ${msgIndex + 1}:`, {
          id: message.id,
          senderId: message.senderId,
          senderName: `${message.sender.firstName} ${message.sender.lastName}`,
          content: message.content.substring(0, 50) + '...',
          createdAt: message.createdAt
        })
      })
    })

    // Extraer todos los mensajes y ordenarlos por fecha
    const allMessages = userChats
      .flatMap(chat => 
        chat.messages.map(message => ({
          id: message.id,
          chatId: chat.id,
          senderId: message.senderId,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
          sender: message.sender
        }))
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20) // Últimos 20 mensajes

    console.log('💬 Mensajes encontrados:', allMessages.length)
    
    // Debug: mostrar información de mensajes filtrados
    const otherUserMessages = allMessages.filter(msg => msg.senderId !== user.id)
    console.log('👥 Mensajes de otros usuarios:', otherUserMessages.length)
    otherUserMessages.forEach((msg, index) => {
      console.log(`  📨 Mensaje ${index + 1} de otros:`, {
        senderId: msg.senderId,
        senderName: `${msg.sender.firstName} ${msg.sender.lastName}`,
        content: msg.content.substring(0, 30) + '...'
      })
    })

    console.log('✅ Enviando respuesta exitosa')
    return NextResponse.json({ 
      messages: allMessages,
      success: true 
    })

  } catch (error) {
    console.error('❌ Error fetching recent messages:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}
