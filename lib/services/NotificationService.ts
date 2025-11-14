import { prisma } from '@/lib/prisma'
import { NotificationCategory, NotificationPriority, NotificationStatus, NotificationSubcategory } from '@prisma/client'
import { Resend } from 'resend'

export interface NotificationData {
  userId: string
  category: NotificationCategory
  subcategory?: NotificationSubcategory
  title: string
  message: string
  actionText?: string
  actionUrl?: string
  actionData?: any
  priority?: NotificationPriority
  expiresIn?: number
  relatedEventId?: string
  groupId?: string
  template?: string
}

export interface NotificationOptions {
  priority?: NotificationPriority
  expiresIn?: number
  delay?: number
  groupId?: string
}

export class NotificationService {
  private static instance: NotificationService
  
  // Singleton pattern
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Crear notificación desde template
  async createFromTemplate(
    userId: string,
    templateName: string,
    variables: Record<string, any>,
    options?: NotificationOptions
  ): Promise<any> {
    try {
      const template = await this.getTemplate(templateName)
      if (!template) {
        throw new Error(`Template '${templateName}' not found`)
      }

      const processedContent = this.processTemplate(template, variables)
      
      return await this.createNotification(userId, {
        category: template.category,
        subcategory: template.subcategory,
        title: processedContent.title,
        message: processedContent.message,
        actionText: processedContent.actionText,
        priority: options?.priority || template.priority || 'NORMAL',
        expiresIn: options?.expiresIn || template.expiresIn || 30, // Default 30 days
        template: templateName,
        ...options
      })
    } catch (error) {
      console.error('Error creating notification from template:', error)
      throw error
    }
  }

  // Crear notificación directa
  async createNotification(userId: string, data: NotificationData): Promise<any> {
    try {
      // Validar datos requeridos
      if (!userId || !data.title || !data.message || !data.category) {
        throw new Error('Missing required notification data')
      }

      const expiresIn = data.expiresIn || 30 // Default 30 days
      const expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)

      const notification = await prisma.notification.create({
        data: {
          userId,
          category: data.category,
          subcategory: data.subcategory,
          title: data.title,
          message: data.message,
          template: data.template,
          priority: data.priority || 'NORMAL',
          status: 'PENDING',
          actionText: data.actionText,
          actionUrl: data.actionUrl,
          actionData: data.actionData,
          expiresAt,
          relatedEventId: data.relatedEventId,
          groupId: data.groupId
        }
      })

      // Enviar notificación inmediatamente (con manejo de errores)
      try {
        await this.sendNotification(notification)
      } catch (sendError) {
        console.error('Error sending notification, but notification was created:', sendError)
        // No lanzar error aquí, la notificación ya fue creada
      }
      
      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  // Obtener template por nombre
  private async getTemplate(templateName: string): Promise<any> {
    return await prisma.notificationTemplate.findFirst({
      where: {
        name: templateName,
        active: true
      },
      orderBy: { version: 'desc' }
    })
  }

  // Procesar template con variables
  private processTemplate(template: any, variables: Record<string, any>): any {
    let title = template.title
    let message = template.message
    let actionText = template.actionText

    // Reemplazar variables en el template
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`
      title = title.replace(new RegExp(placeholder, 'g'), String(value))
      message = message.replace(new RegExp(placeholder, 'g'), String(value))
      if (actionText) {
        actionText = actionText.replace(new RegExp(placeholder, 'g'), String(value))
      }
    }

    return { title, message, actionText }
  }

  // Enviar notificación
  private async sendNotification(notification: any): Promise<void> {
    try {
      // Obtener preferencias del usuario
      const userPrefs = await this.getUserPreferences(notification.userId)
      
      const promises: Promise<void>[] = []
      
      // Envío multicanal según preferencias
      if (userPrefs?.inAppNotifications !== false) {
        promises.push(this.sendInApp(notification))
      }
      
      if (userPrefs?.emailNotifications) {
        promises.push(this.sendEmail(notification))
      }
      
      if (userPrefs?.pushNotifications) {
        promises.push(this.sendPush(notification))
      }
      
      if (userPrefs?.smsNotifications) {
        promises.push(this.sendSMS(notification))
      }
      
      await Promise.allSettled(promises)
      
      // Actualizar estado
      await prisma.notification.update({
        where: { id: notification.id },
        data: { 
          status: 'SENT',
          sentAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error sending notification:', error)
      throw error
    }
  }

  // Obtener preferencias del usuario
  private async getUserPreferences(userId: string): Promise<any> {
    return await prisma.userNotificationPreferences.findUnique({
      where: { userId }
    })
  }

  // Envío en la aplicación
  private async sendInApp(notification: any): Promise<void> {
    // La notificación ya está en la base de datos
    // Solo actualizar el estado
    await prisma.notification.update({
      where: { id: notification.id },
      data: { 
        status: 'DELIVERED',
        deliveredAt: new Date()
      }
    })
  }

  // Envío por email (placeholder)
  private async sendEmail(notification: any): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.EMAIL_FROM || 'notificaciones@volunnet.dev'
    const to = await this.resolveUserEmail(notification.userId)

    if (!apiKey || !to) {
      console.log('Email not sent (missing RESEND_API_KEY or user email)')
      return
    }

    const resend = new Resend(apiKey)

    const subject = notification.title
    const html = this.renderEmailHtml(notification)

    try {
      await resend.emails.send({
        from,
        to,
        subject,
        html,
      })
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }

  // Envío push (placeholder)
  private async sendPush(notification: any): Promise<void> {
    // TODO: Implementar notificaciones push
    console.log('Sending push notification:', notification.id)
  }

  // Envío SMS (placeholder)
  private async sendSMS(notification: any): Promise<void> {
    // TODO: Implementar envío por SMS
    console.log('Sending SMS notification:', notification.id)
  }

  private async resolveUserEmail(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
    return user?.email || null
  }

  private renderEmailHtml(notification: any): string {
    const actionButton = notification.actionUrl && notification.actionText
      ? `<div style="margin-top:20px"><a href="${notification.actionUrl}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#2563EB;color:#fff;text-decoration:none">${notification.actionText}</a></div>`
      : ''
    return `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111827">
        <h2 style="margin:0 0 8px 0">${notification.title}</h2>
        <p style="margin:0 0 12px 0;color:#374151">${notification.message}</p>
        ${actionButton}
        <p style="margin-top:24px;color:#6B7280;font-size:12px">VolunNet · Notificaciones automáticas</p>
      </div>
    `
  }

  // Marcar notificación como leída
  async markAsRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { 
        status: 'READ',
        readAt: new Date()
      }
    })
  }

  // Marcar notificación como actuada
  async markAsActed(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { 
        status: 'ACTED',
        clickedAt: new Date()
      }
    })
  }

  // Obtener notificaciones del usuario
  async getUserNotifications(
    userId: string, 
    options: {
      status?: NotificationStatus
      category?: NotificationCategory
      limit?: number
      offset?: number
    } = {}
  ): Promise<any[]> {
    const { status, category, limit = 50, offset = 0 } = options
    
    const where: any = { userId }
    
    if (status) where.status = status
    if (category) where.category = category
    
    return await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })
  }

  // Obtener notificaciones no leídas
  async getUnreadNotifications(userId: string): Promise<any[]> {
    return await prisma.notification.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'SENT', 'DELIVERED'] }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Contar notificaciones no leídas
  async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        status: { in: ['PENDING', 'SENT', 'DELIVERED'] }
      }
    })
  }

  // Limpiar notificaciones expiradas
  async cleanupExpiredNotifications(): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        status: { not: 'EXPIRED' }
      },
      data: { status: 'EXPIRED' }
    })
  }

  // Crear preferencias por defecto para un usuario
  async createDefaultPreferences(userId: string): Promise<void> {
    const existing = await prisma.userNotificationPreferences.findUnique({
      where: { userId }
    })

    if (!existing) {
      await prisma.userNotificationPreferences.create({
        data: {
          userId,
          preferences: {
            EVENT: { email: true, push: true, inApp: true },
            RATING: { email: true, push: true, inApp: true },
            MESSAGE: { email: false, push: true, inApp: true },
            SYSTEM: { email: true, push: false, inApp: true }
          },
          emailNotifications: true,
          pushNotifications: true,
          inAppNotifications: true,
          smsNotifications: false,
          timezone: 'UTC',
          digestFrequency: 'DAILY'
        }
      })
    }
  }

  // Actualizar preferencias del usuario
  async updatePreferences(userId: string, preferences: any): Promise<void> {
    await prisma.userNotificationPreferences.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences
      }
    })
  }
}
