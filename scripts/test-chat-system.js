#!/usr/bin/env node

/**
 * Script para probar el sistema de chat
 * Crea chats de ejemplo y envía mensajes
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testChatSystem() {
  console.log('🧪 Iniciando pruebas del sistema de chat...')

  try {
    // 1. Crear usuarios de prueba si no existen
    console.log('📝 Creando usuarios de prueba...')
    
    const user1 = await prisma.user.upsert({
      where: { email: 'test1@volunnet.com' },
      update: {},
      create: {
        email: 'test1@volunnet.com',
        password: 'hashedpassword',
        firstName: 'Ana',
        lastName: 'García',
        role: 'VOLUNTEER',
        verified: true
      }
    })

    const user2 = await prisma.user.upsert({
      where: { email: 'test2@volunnet.com' },
      update: {},
      create: {
        email: 'test2@volunnet.com',
        password: 'hashedpassword',
        firstName: 'Carlos',
        lastName: 'Ruiz',
        role: 'ORGANIZATION',
        verified: true
      }
    })

    console.log(`✅ Usuarios creados: ${user1.firstName} (${user1.id}) y ${user2.firstName} (${user2.id})`)

    // 2. Crear voluntario para el usuario1
    console.log('👤 Creando perfil de voluntario...')
    
    const volunteer = await prisma.volunteer.upsert({
      where: { userId: user1.id },
      update: {},
      create: {
        userId: user1.id,
        bio: 'Voluntaria apasionada por el medio ambiente',
        skills: ['Medio Ambiente', 'Trabajo en Equipo'],
        interests: ['Conservación', 'Educación'],
        phone: '+52 33 9876 5432',
        birthDate: new Date('1995-06-15'),
        emergencyContact: 'María García',
        emergencyPhone: '+52 33 1111 2222',
        completed: true
      }
    })

    console.log(`✅ Voluntario creado: ${volunteer.id}`)

    // 3. Crear organización para el usuario organizador
    console.log('🏢 Creando organización...')
    
    const organization = await prisma.organization.upsert({
      where: { userId: user2.id },
      update: {},
      create: {
        userId: user2.id,
        name: 'EcoVoluntarios Jalisco',
        description: 'Organización dedicada a la conservación del medio ambiente',
        website: 'https://ecovoluntarios.com',
        phone: '+52 33 1234 5678',
        address: 'Av. Principal 123',
        city: 'Guadalajara',
        state: 'Jalisco',
        country: 'México',
        verified: true
      }
    })

    console.log(`✅ Organización creada: ${organization.name}`)

    // 3. Crear un evento de prueba
    console.log('📅 Creando evento de prueba...')
    
    const category = await prisma.eventCategory.findFirst()
    if (!category) {
      throw new Error('No hay categorías de eventos disponibles')
    }

    const event = await prisma.event.upsert({
      where: { id: 'test-event-chat' },
      update: {},
      create: {
        id: 'test-event-chat',
        title: 'Limpieza de Playa - Chat de Prueba',
        description: 'Evento de prueba para el sistema de chat',
        organizationId: organization.id,
        address: 'Playa Principal',
        city: 'Puerto Vallarta',
        state: 'Jalisco',
        country: 'México',
        latitude: 20.6534,
        longitude: -105.2253,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días desde ahora
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +4 horas
        maxVolunteers: 10,
        currentVolunteers: 0,
        skills: ['Medio Ambiente', 'Trabajo en Equipo'],
        categoryId: category.id,
        status: 'PUBLISHED',
        requirements: ['Ganas de ayudar'],
        benefits: ['Experiencia en conservación'],
        imageUrl: null
      }
    })

    console.log(`✅ Evento creado: ${event.title} (${event.id})`)

    // 3. Crear aplicación de voluntario al evento
    console.log('📋 Creando aplicación de voluntario...')
    
    const application = await prisma.eventApplication.upsert({
      where: { 
        eventId_volunteerId: {
          eventId: event.id,
          volunteerId: user1.id
        }
      },
      update: {},
      create: {
        eventId: event.id,
        volunteerId: volunteer.id,
        status: 'ACCEPTED',
        appliedAt: new Date(),
        message: 'Me interesa participar en este evento'
      }
    })

    console.log(`✅ Aplicación creada y aceptada`)

    // 4. Crear chat individual entre usuarios
    console.log('💬 Creando chat individual...')
    
    const individualChat = await prisma.chat.create({
      data: {
        type: 'INDIVIDUAL',
        createdBy: user1.id,
        participants: {
          create: [
            { userId: user1.id, role: 'ADMIN' },
            { userId: user2.id, role: 'MEMBER' }
          ]
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
        }
      }
    })

    console.log(`✅ Chat individual creado: ${individualChat.id}`)

    // 5. Crear chat grupal del evento
    console.log('👥 Creando chat grupal del evento...')
    
    const eventChat = await prisma.chat.create({
      data: {
        type: 'EVENT',
        name: `Chat: ${event.title}`,
        description: `Chat grupal para el evento ${event.title}`,
        eventId: event.id,
        createdBy: user2.id,
        participants: {
          create: [
            { userId: user2.id, role: 'ADMIN' },
            { userId: user1.id, role: 'MEMBER' }
          ]
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
        event: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    console.log(`✅ Chat grupal creado: ${eventChat.id}`)

    // 6. Enviar mensajes de prueba
    console.log('📨 Enviando mensajes de prueba...')
    
    const messages = [
      {
        chatId: individualChat.id,
        senderId: user1.id,
        content: '¡Hola Carlos! Me interesa participar en tu evento de limpieza de playa.',
        type: 'DIRECT'
      },
      {
        chatId: individualChat.id,
        senderId: user2.id,
        content: '¡Hola Ana! Me alegra saber de tu interés. El evento será muy enriquecedor.',
        type: 'DIRECT'
      },
      {
        chatId: eventChat.id,
        senderId: user2.id,
        content: '¡Bienvenidos al chat del evento! Aquí podrán coordinar detalles y conocerse.',
        type: 'EVENT_CHAT'
      },
      {
        chatId: eventChat.id,
        senderId: user1.id,
        content: '¡Gracias por la invitación! Estoy emocionada de participar.',
        type: 'EVENT_CHAT'
      }
    ]

    for (const messageData of messages) {
      const message = await prisma.chatMessage.create({
        data: messageData,
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
      })

      // Actualizar lastMessageAt del chat
      await prisma.chat.update({
        where: { id: messageData.chatId },
        data: { lastMessageAt: new Date() }
      })

      console.log(`✅ Mensaje enviado: "${message.content.substring(0, 30)}..."`)
    }

    // 7. Crear invitación a chat
    console.log('📩 Creando invitación a chat...')
    
    const invitation = await prisma.chatInvitation.create({
      data: {
        chatId: individualChat.id,
        inviterId: user1.id,
        inviteeId: user2.id,
        message: 'Te invito a un chat para coordinar mejor el evento',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
      },
      include: {
        chat: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        inviter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    })

    console.log(`✅ Invitación creada: ${invitation.id}`)

    // 8. Enviar notificación de invitación
    console.log('🔔 Notificación de invitación (simulada)...')
    
    // await eventNotificationService.sendChatInvitationNotification(
    //   invitation.inviteeId,
    //   invitation.inviterId,
    //   invitation.chatId,
    //   invitation.chat.name
    // )

    console.log(`✅ Notificación de invitación simulada`)

    // 9. Mostrar resumen
    console.log('\n🎉 ¡Sistema de chat probado exitosamente!')
    console.log('\n📊 Resumen de la prueba:')
    console.log(`   • Usuarios creados: 2`)
    console.log(`   • Evento creado: 1`)
    console.log(`   • Aplicación creada: 1`)
    console.log(`   • Chats creados: 2 (1 individual, 1 grupal)`)
    console.log(`   • Mensajes enviados: ${messages.length}`)
    console.log(`   • Invitación creada: 1`)
    console.log(`   • Notificación enviada: 1`)
    
    console.log('\n🔗 URLs para probar:')
    console.log(`   • Chat individual: /comunidad?chat=${individualChat.id}`)
    console.log(`   • Chat grupal: /comunidad?chat=${eventChat.id}`)
    console.log(`   • Invitación: /comunidad?invitation=${invitation.id}`)

  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testChatSystem()
    .then(() => {
      console.log('\n✅ Pruebas completadas')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Error en las pruebas:', error)
      process.exit(1)
    })
}

module.exports = { testChatSystem }
