const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testChatVisibility() {
  try {
    console.log('=== Probando visibilidad de chats ===\n')

    // Obtener dos usuarios diferentes
    const users = await prisma.user.findMany({
      take: 2,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })

    if (users.length < 2) {
      console.log('❌ Se necesitan al menos 2 usuarios para probar')
      return
    }

    const [user1, user2] = users
    console.log(`👤 Usuario 1: ${user1.firstName} ${user1.lastName} (${user1.id})`)
    console.log(`👤 Usuario 2: ${user2.firstName} ${user2.lastName} (${user2.id})\n`)

    // Verificar chats existentes para ambos usuarios
    console.log('📋 Chats existentes antes de crear uno nuevo:')
    
    const user1Chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: { userId: user1.id }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    const user2Chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: { userId: user2.id }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    console.log(`   Usuario 1 tiene ${user1Chats.length} chats`)
    user1Chats.forEach(chat => {
      const participants = chat.participants.map(p => `${p.user.firstName} ${p.user.lastName}`).join(', ')
      console.log(`   - Chat ${chat.id} (${chat.type}): ${participants}`)
    })

    console.log(`   Usuario 2 tiene ${user2Chats.length} chats`)
    user2Chats.forEach(chat => {
      const participants = chat.participants.map(p => `${p.user.firstName} ${p.user.lastName}`).join(', ')
      console.log(`   - Chat ${chat.id} (${chat.type}): ${participants}`)
    })

    // Verificar si ya existe un chat entre estos dos usuarios
    const existingChat = await prisma.chat.findFirst({
      where: {
        type: 'INDIVIDUAL',
        AND: [
          {
            participants: {
              some: { userId: user1.id }
            }
          },
          {
            participants: {
              some: { userId: user2.id }
            }
          }
        ]
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    if (existingChat) {
      console.log(`\n✅ Ya existe un chat entre ${user1.firstName} y ${user2.firstName}`)
      console.log(`   Chat ID: ${existingChat.id}`)
      const participants = existingChat.participants.map(p => `${p.user.firstName} ${p.user.lastName}`).join(', ')
      console.log(`   Participantes: ${participants}`)
    } else {
      console.log(`\n❌ No existe chat entre ${user1.firstName} y ${user2.firstName}`)
      console.log('   Esto significa que cuando uno contacte al otro, debería crear un nuevo chat')
    }

    console.log('\n=== Prueba completada ===')

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testChatVisibility()
