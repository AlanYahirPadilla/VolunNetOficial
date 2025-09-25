const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugChatParticipants() {
  try {
    console.log('=== Debug de participantes de chat ===\n')

    // Obtener el chat individual que vimos en la prueba anterior
    const chatId = 'cmfypjwjr001obo9ge67o3n90'
    
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!chat) {
      console.log('❌ Chat no encontrado')
      return
    }

    console.log(`📋 Chat ${chat.id} (${chat.type}):`)
    console.log(`   Creado por: ${chat.createdBy}`)
    console.log(`   Participantes:`)
    
    chat.participants.forEach((participant, index) => {
      console.log(`   ${index + 1}. ${participant.user.firstName} ${participant.user.lastName} (${participant.user.id})`)
      console.log(`      Role: ${participant.role}`)
      console.log(`      Joined: ${participant.joinedAt}`)
    })

    // Verificar si cada participante puede ver este chat
    console.log('\n🔍 Verificando visibilidad del chat:')
    
    for (const participant of chat.participants) {
      const userChats = await prisma.chat.findMany({
        where: {
          participants: {
            some: { userId: participant.user.id }
          }
        },
        select: {
          id: true,
          type: true
        }
      })
      
      const canSeeThisChat = userChats.some(c => c.id === chat.id)
      console.log(`   ${participant.user.firstName} ${participant.user.lastName}: ${canSeeThisChat ? '✅ Puede ver' : '❌ NO puede ver'} este chat`)
      console.log(`   Total chats visibles: ${userChats.length}`)
    }

    // Verificar todos los usuarios y sus chats
    console.log('\n👥 Todos los usuarios y sus chats:')
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    })

    for (const user of allUsers) {
      const userChats = await prisma.chat.findMany({
        where: {
          participants: {
            some: { userId: user.id }
          }
        },
        select: {
          id: true,
          type: true
        }
      })
      
      console.log(`   ${user.firstName} ${user.lastName}: ${userChats.length} chats`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugChatParticipants()
