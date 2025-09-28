import { PrismaClient } from '@prisma/client'
import { eventNotificationService } from './EventNotificationService'

const prisma = new PrismaClient()

export class ChatService {
  // Crear un chat individual entre dos usuarios
  async createIndividualChat(userId1: string, userId2: string) {
    try {
      // Verificar si ya existe un chat entre estos usuarios
      const existingChat = await prisma.chat.findFirst({
        where: {
          type: 'INDIVIDUAL',
          AND: [
            {
              participants: {
                some: {
                  userId: userId1
                }
              }
            },
            {
              participants: {
                some: {
                  userId: userId2
                }
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
                  lastName: true,
                  avatar: true
                }
              }
            }
          }
        }
      })

      if (existingChat) {
        console.log('Chat existente encontrado:', existingChat.id)
        return existingChat
      }

      // Crear nuevo chat individual
      console.log('Creando nuevo chat individual entre:', userId1, 'y', userId2)
      const chat = await prisma.chat.create({
        data: {
          type: 'INDIVIDUAL',
          createdBy: userId1,
          participants: {
            create: [
              { userId: userId1, role: 'ADMIN' },
              { userId: userId2, role: 'MEMBER' }
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
      
      console.log('Chat creado con participantes:', chat.participants.map(p => p.user.firstName + ' ' + p.user.lastName))

      return chat
    } catch (error) {
      console.error('Error creating individual chat:', error)
      throw error
    }
  }

  // Crear un chat grupal para un evento
  async createEventChat(eventId: string, organizerId: string) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          applications: {
            where: { status: 'ACCEPTED' },
            include: { volunteer: true }
          }
        }
      })

      if (!event) {
        throw new Error('Event not found')
      }

      // Crear chat del evento
      const chat = await prisma.chat.create({
        data: {
          type: 'EVENT',
          name: `Chat: ${event.title}`,
          description: `Chat grupal para el evento ${event.title}`,
          eventId: eventId,
          createdBy: organizerId,
          participants: {
            create: [
              // Organizador como admin
              { userId: organizerId, role: 'ADMIN' },
              // Voluntarios aceptados como miembros
              ...event.applications.map(app => ({
                userId: app.volunteerId,
                role: 'MEMBER' as const
              }))
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

      return chat
    } catch (error) {
      console.error('Error creating event chat:', error)
      throw error
    }
  }

  // Enviar mensaje
  async sendMessage(chatId: string, senderId: string, content: string, type: 'DIRECT' | 'EVENT_CHAT' | 'SYSTEM' = 'DIRECT') {
    try {
      // Verificar que el usuario es participante del chat
      const participant = await prisma.chatParticipant.findUnique({
        where: {
          chatId_userId: {
            chatId,
            userId: senderId
          }
        }
      })

      if (!participant) {
        throw new Error('User is not a participant of this chat')
      }

      // Crear el mensaje
      const message = await prisma.chatMessage.create({
        data: {
          chatId,
          senderId,
          content,
          type
        },
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
        where: { id: chatId },
        data: { lastMessageAt: new Date() }
      })

      // Enviar notificación a otros participantes del chat
      await this.sendNewMessageNotification(chatId, senderId, content)

      return message
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  // Enviar notificación de mensaje nuevo
  async sendNewMessageNotification(chatId: string, senderId: string, message: string) {
    try {
      // Obtener participantes del chat (excluyendo al remitente)
      const participants = await prisma.chatParticipant.findMany({
        where: {
          chatId,
          userId: {
            not: senderId
          }
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })

      // Obtener información del remitente
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: {
          firstName: true,
          lastName: true
        }
      })

      if (!sender) return

      // Enviar notificación a cada participante
      for (const participant of participants) {
        await eventNotificationService.sendNewMessageNotification(
          chatId,
          senderId,
          message,
          [participant.userId]
        )
      }
    } catch (error) {
      console.error('Error sending new message notification:', error)
    }
  }

  // Obtener mensajes de un chat
  async getChatMessages(chatId: string, limit: number = 50, offset: number = 0) {
    try {
      console.log('🔍 Obteniendo mensajes para chat:', chatId)
      
      const messages = await prisma.chatMessage.findMany({
        where: {
          chatId,
          deletedAt: null
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      })

      console.log('📨 Mensajes encontrados:', messages.length)
      
      // Procesar mensajes para incluir reacciones de metadata si no hay campo reactions
      const processedMessages = messages.map(msg => {
        let reactions = {}
        
        // Intentar obtener reacciones del campo reactions (si existe)
        if (msg.reactions && typeof msg.reactions === 'object') {
          reactions = msg.reactions as { [emoji: string]: string[] }
          console.log('📊 Reacciones del campo reactions:', reactions)
        }
        // Si no hay reactions, intentar obtener de metadata
        else if (msg.metadata && typeof msg.metadata === 'object') {
          const metadata = msg.metadata as any
          if (metadata.reactions) {
            reactions = metadata.reactions
            console.log('📊 Reacciones del campo metadata:', reactions)
          }
        }
        
        return {
          ...msg,
          reactions: reactions
        }
      })

      console.log('✅ Mensajes procesados:', processedMessages.length)
      return processedMessages.reverse() // Ordenar de más antiguo a más reciente
    } catch (error) {
      console.error('❌ Error getting chat messages:', error)
      console.error('❌ Error details:', error instanceof Error ? error.message : String(error))
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      throw error
    }
  }

  // Obtener chats de un usuario
  async getUserChats(userId: string) {
    try {
      console.log('Obteniendo chats para usuario:', userId)
      const chats = await prisma.chat.findMany({
        where: {
          participants: {
            some: {
              userId
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
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
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
        },
        orderBy: { lastMessageAt: 'desc' }
      })

      console.log(`Usuario ${userId} tiene ${chats.length} chats:`, chats.map(c => ({
        id: c.id,
        type: c.type,
        participants: c.participants.map(p => p.user.firstName + ' ' + p.user.lastName)
      })))

      return chats
    } catch (error) {
      console.error('Error getting user chats:', error)
      throw error
    }
  }

  // Invitar usuario a chat
  async inviteToChat(chatId: string, inviterId: string, inviteeId: string, message?: string) {
    try {
      // Verificar que el invitador es participante del chat
      const inviterParticipant = await prisma.chatParticipant.findUnique({
        where: {
          chatId_userId: {
            chatId,
            userId: inviterId
          }
        }
      })

      if (!inviterParticipant) {
        throw new Error('Inviter is not a participant of this chat')
      }

      // Verificar que el invitado no es ya participante
      const existingParticipant = await prisma.chatParticipant.findUnique({
        where: {
          chatId_userId: {
            chatId,
            userId: inviteeId
          }
        }
      })

      if (existingParticipant) {
        throw new Error('User is already a participant of this chat')
      }

      // Crear invitación
      const invitation = await prisma.chatInvitation.create({
        data: {
          chatId,
          inviterId,
          inviteeId,
          message,
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

      // Enviar notificación usando el servicio especializado
      await eventNotificationService.sendChatInvitationNotification(
        inviteeId,
        inviterId,
        invitation.chatId,
        invitation.chat.name
      )

      return invitation
    } catch (error) {
      console.error('Error inviting to chat:', error)
      throw error
    }
  }

  // Responder a invitación
  async respondToInvitation(invitationId: string, response: 'ACCEPTED' | 'DECLINED') {
    try {
      const invitation = await prisma.chatInvitation.findUnique({
        where: { id: invitationId },
        include: {
          chat: true,
          inviter: true
        }
      })

      if (!invitation) {
        throw new Error('Invitation not found')
      }

      if (invitation.status !== 'PENDING') {
        throw new Error('Invitation has already been responded to')
      }

      // Actualizar estado de la invitación
      await prisma.chatInvitation.update({
        where: { id: invitationId },
        data: {
          status: response,
          respondedAt: new Date()
        }
      })

      if (response === 'ACCEPTED') {
        // Agregar usuario al chat
        await prisma.chatParticipant.create({
          data: {
            chatId: invitation.chatId,
            userId: invitation.inviteeId,
            role: 'MEMBER'
          }
        })

        // Enviar notificación al organizador
        await eventNotificationService.notificationService.createNotification({
          userId: invitation.inviterId,
          category: 'MESSAGE',
          subcategory: 'NEW_APPLICATION',
          title: 'Invitación aceptada',
          message: `${invitation.invitee.firstName} ${invitation.invitee.lastName} ha aceptado tu invitación al chat`,
          priority: 'NORMAL',
          actionText: 'Ver chat',
          actionUrl: `/comunidad?chat=${invitation.chatId}`,
          expiresIn: 1
        })
      }

      return { success: true, response }
    } catch (error) {
      console.error('Error responding to invitation:', error)
      throw error
    }
  }

  // Obtener invitaciones pendientes de un usuario
  async getUserInvitations(userId: string) {
    try {
      const invitations = await prisma.chatInvitation.findMany({
        where: {
          inviteeId: userId,
          status: 'PENDING',
          expiresAt: {
            gt: new Date()
          }
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
        },
        orderBy: { createdAt: 'desc' }
      })

      return invitations
    } catch (error) {
      console.error('Error getting user invitations:', error)
      throw error
    }
  }

  // Marcar mensajes como leídos
  async markMessagesAsRead(chatId: string, userId: string) {
    try {
      await prisma.chatParticipant.update({
        where: {
          chatId_userId: {
            chatId,
            userId
          }
        },
        data: {
          lastReadAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error marking messages as read:', error)
      throw error
    }
  }
}

export const chatService = new ChatService()
