// Servicio específico para notificaciones de eventos
// Maneja todos los tipos de notificaciones relacionadas con eventos

import { NotificationService } from './NotificationService'
import { prisma } from '@/lib/prisma'

export class EventNotificationService {
  private static instance: EventNotificationService
  private notificationService: NotificationService

  private constructor() {
    this.notificationService = NotificationService.getInstance()
  }

  static getInstance(): EventNotificationService {
    if (!EventNotificationService.instance) {
      EventNotificationService.instance = new EventNotificationService()
    }
    return EventNotificationService.instance
  }

  // =================== NOTIFICACIONES DE BIENVENIDA ===================

  async sendWelcomeNotification(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, email: true }
      })

      if (!user) return

      // Crear preferencias por defecto
      await this.notificationService.createDefaultPreferences(userId)

      // Notificación de bienvenida
      await this.notificationService.createFromTemplate(
        userId,
        'welcome_new_user',
        {
          firstName: user.firstName || 'Usuario'
        },
        {
          priority: 'HIGH',
          expiresIn: 7
        }
      )

      // Notificación para completar perfil (si es voluntario)
      const volunteer = await prisma.volunteer.findUnique({
        where: { userId },
        select: { interests: true, skills: true }
      })

      if (volunteer && (!volunteer.interests?.length || !volunteer.skills?.length)) {
        await this.notificationService.createFromTemplate(
          userId,
          'profile_incomplete',
          {
            firstName: user.firstName || 'Usuario'
          },
          {
            priority: 'NORMAL',
            expiresIn: 3
          }
        )
      }

      console.log(`✅ Notificaciones de bienvenida enviadas a ${userId}`)
    } catch (error) {
      console.error('Error enviando notificaciones de bienvenida:', error)
    }
  }

  // =================== NOTIFICACIONES DE POSTULACIÓN ===================

  async sendApplicationSubmittedNotification(
    volunteerId: string,
    eventId: string,
    organizationUserId: string
  ): Promise<void> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organization: {
            include: { user: true }
          }
        }
      })

      const volunteer = await prisma.volunteer.findUnique({
        where: { userId: volunteerId },
        include: { user: true }
      })

      if (!event || !volunteer) return

      // Notificación para el voluntario
      await this.notificationService.createFromTemplate(
        volunteerId,
        'application_submitted',
        {
          eventTitle: event.title,
          eventDate: event.startDate.toLocaleDateString('es-ES'),
          organizationName: event.organization.name
        },
        {
          priority: 'NORMAL',
          expiresIn: 30,
          relatedEventId: eventId
        }
      )

      // Notificación para el organizador
      await this.notificationService.createFromTemplate(
        organizationUserId,
        'new_application_received',
        {
          volunteerName: `${volunteer.user.firstName} ${volunteer.user.lastName}`,
          eventTitle: event.title
        },
        {
          priority: 'NORMAL',
          expiresIn: 7,
          relatedEventId: eventId
        }
      )

      console.log(`✅ Notificaciones de postulación enviadas para evento ${eventId}`)
    } catch (error) {
      console.error('Error enviando notificaciones de postulación:', error)
    }
  }

  async sendApplicationStatusChangeNotification(
    volunteerId: string,
    eventId: string,
    status: 'ACCEPTED' | 'REJECTED'
  ): Promise<void> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organization: true
        }
      })

      if (!event) return

      const templateName = status === 'ACCEPTED' ? 'application_accepted' : 'application_rejected'
      const priority = status === 'ACCEPTED' ? 'HIGH' : 'NORMAL'

      await this.notificationService.createFromTemplate(
        volunteerId,
        templateName,
        {
          eventTitle: event.title,
          eventDate: event.startDate.toLocaleDateString('es-ES'),
          organizationName: event.organization.name
        },
        {
          priority,
          expiresIn: 30,
          relatedEventId: eventId
        }
      )

      console.log(`✅ Notificación de ${status.toLowerCase()} enviada a ${volunteerId}`)
    } catch (error) {
      console.error(`Error enviando notificación de ${status.toLowerCase()}:`, error)
    }
  }

  // =================== NOTIFICACIONES DE CAMBIO DE ESTADO DE EVENTO ===================

  async sendEventStatusChangeNotification(
    eventId: string,
    newStatus: string
  ): Promise<void> {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organization: true,
          applications: {
            where: { status: 'ACCEPTED' },
            include: { volunteer: { include: { user: true } } }
          }
        }
      })

      if (!event) return

      // Notificar a todos los voluntarios aceptados
      for (const application of event.applications) {
        const volunteerId = application.volunteer.userId

        if (newStatus === 'IN_PROGRESS') {
          await this.notificationService.createFromTemplate(
            volunteerId,
            'event_started',
            {
              eventTitle: event.title,
              eventLocation: `${event.city}, ${event.state}`
            },
            {
              priority: 'HIGH',
              expiresIn: 1,
              relatedEventId: eventId
            }
          )
        } else if (newStatus === 'COMPLETED') {
          await this.notificationService.createFromTemplate(
            volunteerId,
            'event_completed',
            {
              eventTitle: event.title,
              organizationName: event.organization.name
            },
            {
              priority: 'NORMAL',
              expiresIn: 7,
              relatedEventId: eventId
            }
          )
        }
      }

      console.log(`✅ Notificaciones de cambio de estado enviadas para evento ${eventId}`)
    } catch (error) {
      console.error('Error enviando notificaciones de cambio de estado:', error)
    }
  }

  // =================== RECORDATORIOS AUTOMÁTICOS ===================

  async sendEventReminders(): Promise<void> {
    try {
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

      // Eventos que empiezan en 24 horas
      const events24h = await prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
          startDate: {
            gte: new Date(tomorrow.getTime() - 60 * 60 * 1000), // 23-25 horas
            lte: new Date(tomorrow.getTime() + 60 * 60 * 1000)   // 23-25 horas
          }
        },
        include: {
          applications: {
            where: { status: 'ACCEPTED' },
            include: { volunteer: { include: { user: true } } }
          }
        }
      })

      // Eventos que empiezan en 1 hora
      const events1h = await prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
          startDate: {
            gte: new Date(oneHourFromNow.getTime() - 30 * 60 * 1000), // 30-90 minutos
            lte: new Date(oneHourFromNow.getTime() + 30 * 60 * 1000)   // 30-90 minutos
          }
        },
        include: {
          applications: {
            where: { status: 'ACCEPTED' },
            include: { volunteer: { include: { user: true } } }
          }
        }
      })

      // Enviar recordatorios de 24h
      for (const event of events24h) {
        for (const application of event.applications) {
          await this.notificationService.createFromTemplate(
            application.volunteer.userId,
            'event_reminder_24h',
            {
              eventTitle: event.title,
              eventTime: event.startDate.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              eventLocation: `${event.city}, ${event.state}`
            },
            {
              priority: 'HIGH',
              expiresIn: 1,
              relatedEventId: event.id
            }
          )
        }
      }

      // Enviar recordatorios de 1h
      for (const event of events1h) {
        for (const application of event.applications) {
          await this.notificationService.createFromTemplate(
            application.volunteer.userId,
            'event_reminder_1h',
            {
              eventTitle: event.title,
              eventLocation: `${event.city}, ${event.state}`
            },
            {
              priority: 'URGENT',
              expiresIn: 1,
              relatedEventId: event.id
            }
          )
        }
      }

      console.log(`✅ Recordatorios enviados: ${events24h.length} eventos (24h), ${events1h.length} eventos (1h)`)
    } catch (error) {
      console.error('Error enviando recordatorios:', error)
    }
  }

  // =================== MÉTODOS AUXILIARES ===================

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.notificationService.markAsRead(notificationId)
  }

  async getUserNotifications(userId: string, limit = 20): Promise<any[]> {
    return await this.notificationService.getUserNotifications(userId, { limit })
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationService.getUnreadCount(userId)
  }

  // =================== NOTIFICACIONES DE CHAT ===================

  // Enviar notificación de invitación a chat
  async sendChatInvitationNotification(inviteeId: string, inviterId: string, chatId: string, chatName?: string) {
    try {
      const inviter = await this.getUserInfo(inviterId)
      
      if (inviter) {
        await this.notificationService.createNotification({
          userId: inviteeId,
          category: 'MESSAGE',
          subcategory: 'NEW_APPLICATION', // Reutilizamos este subcategory para invitaciones
          title: 'Invitación a chat',
          message: `${inviter.firstName} ${inviter.lastName} te ha invitado a un chat${chatName ? `: ${chatName}` : ''}`,
          priority: 'NORMAL',
          actionText: 'Ver invitación',
          actionUrl: `/comunidad?invitation=${chatId}`,
          expiresIn: 7
        })
      }
    } catch (error) {
      console.error('Error enviando notificación de invitación a chat:', error)
    }
  }

  // Enviar notificación de mensaje nuevo en chat
  async sendNewMessageNotification(chatId: string, senderId: string, message: string, recipientIds: string[]) {
    try {
      const sender = await this.getUserInfo(senderId)
      
      if (sender) {
        const shortMessage = message.length > 50 ? message.substring(0, 50) + '...' : message
        
        for (const recipientId of recipientIds) {
          await this.notificationService.createNotification({
            userId: recipientId,
            category: 'MESSAGE',
            subcategory: 'NEW_APPLICATION', // Reutilizamos este subcategory para mensajes
            title: `Nuevo mensaje de ${sender.firstName}`,
            message: shortMessage,
            priority: 'NORMAL',
            actionText: 'Ver chat',
            actionUrl: `/comunidad?chat=${chatId}`,
            expiresIn: 1
          })
        }
      }
    } catch (error) {
      console.error('Error enviando notificación de mensaje nuevo:', error)
    }
  }

  // =================== NOTIFICACIONES DE APLICACIONES ===================

  async sendApplicationAcceptedNotification(volunteerId: string, eventId: string, organizerId: string): Promise<void> {
    try {
      const event = await this.getEventInfo(eventId)
      const organizer = await this.getUserInfo(organizerId)
      
      if (event && organizer) {
        await this.notificationService.createNotification({
          userId: volunteerId,
          category: 'APPLICATION',
          subcategory: 'APPLICATION_ACCEPTED',
          title: '¡Aplicación Aceptada! 🎉',
          message: `Tu aplicación para "${event.title}" ha sido aceptada por ${organizer.firstName} ${organizer.lastName}. ¡Nos vemos en el evento!`,
          priority: 'HIGH',
          actionText: 'Ver Evento',
          actionUrl: `/eventos/${eventId}`,
          relatedEventId: eventId,
          expiresIn: 7
        })
      }
    } catch (error) {
      console.error('Error enviando notificación de aplicación aceptada:', error)
    }
  }

  async sendApplicationRejectedNotification(volunteerId: string, eventId: string, organizerId: string): Promise<void> {
    try {
      const event = await this.getEventInfo(eventId)
      const organizer = await this.getUserInfo(organizerId)
      
      if (event && organizer) {
        await this.notificationService.createNotification({
          userId: volunteerId,
          category: 'APPLICATION',
          subcategory: 'APPLICATION_REJECTED',
          title: 'Aplicación No Aceptada',
          message: `Tu aplicación para "${event.title}" no fue aceptada esta vez. No te desanimes, ¡hay muchas otras oportunidades esperándote!`,
          priority: 'NORMAL',
          actionText: 'Buscar Otros Eventos',
          actionUrl: '/eventos/buscar',
          relatedEventId: eventId,
          expiresIn: 3
        })
      }
    } catch (error) {
      console.error('Error enviando notificación de aplicación rechazada:', error)
    }
  }
}

export const eventNotificationService = EventNotificationService.getInstance()
