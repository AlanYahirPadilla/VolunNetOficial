// Simulación de base de datos en memoria para desarrollo
// Esto permite probar el sistema de notificaciones sin necesidad de una base de datos real

export interface MockNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  subcategory?: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status: "PENDING" | "SENT" | "DELIVERED" | "READ" | "ACTED" | "EXPIRED" | "ARCHIVED";
  actionText?: string;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
  relatedEventId?: string;
}

// Almacenamiento en memoria
let notifications: MockNotification[] = [
  {
    id: "notif_1",
    title: "¡Bienvenido a VolunNet! 🎉",
    message: "Gracias por unirte a nuestra comunidad de voluntarios. Para obtener mejores recomendaciones de eventos, completa tu perfil con tus intereses y habilidades.",
    category: "SYSTEM",
    subcategory: "WELCOME",
    priority: "HIGH",
    status: "PENDING",
    actionText: "Completar Perfil",
    actionUrl: "/perfil",
    createdAt: new Date().toISOString(),
    relatedEventId: null
  },
  {
    id: "notif_2",
    title: "Postulación Enviada ✅",
    message: "Tu postulación al evento \"Limpieza de Playa\" ha sido enviada exitosamente. El organizador revisará tu solicitud pronto.",
    category: "EVENT",
    subcategory: "APPLICATION_SUBMITTED",
    priority: "NORMAL",
    status: "READ",
    actionText: "Ver Evento",
    actionUrl: "/eventos/1",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    relatedEventId: "event_1"
  },
  {
    id: "notif_3",
    title: "¡Felicidades! Tu postulación fue aceptada 🎉",
    message: "Has sido aceptado para participar en \"Taller de Reciclaje\" el 28/09/2024. ¡Nos vemos pronto!",
    category: "EVENT",
    subcategory: "APPLICATION_ACCEPTED",
    priority: "HIGH",
    status: "PENDING",
    actionText: "Ver Detalles",
    actionUrl: "/eventos/2",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    relatedEventId: "event_2"
  },
  {
    id: "notif_4",
    title: "Recordatorio: Tu evento es mañana ⏰",
    message: "El evento \"Limpieza de Playa\" es mañana a las 09:00. ¡Prepárate para una gran experiencia!",
    category: "EVENT",
    subcategory: "EVENT_REMINDER",
    priority: "HIGH",
    status: "PENDING",
    actionText: "Ver Detalles",
    actionUrl: "/eventos/1",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    relatedEventId: "event_1"
  },
  {
    id: "notif_5",
    title: "¡Evento completado! Gracias por participar 🌟",
    message: "El evento \"Taller de Reciclaje\" ha finalizado. ¡Gracias por tu participación! Califica tu experiencia para ayudar a otros voluntarios.",
    category: "EVENT",
    subcategory: "EVENT_COMPLETED",
    priority: "NORMAL",
    status: "READ",
    actionText: "Calificar Evento",
    actionUrl: "/eventos/2/calificar",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    relatedEventId: "event_2"
  }
];

export class MockNotificationService {
  static getNotifications(limit = 20, unreadOnly = false): MockNotification[] {
    let filtered = notifications;
    
    if (unreadOnly) {
      filtered = notifications.filter(n => n.status !== 'READ');
    }
    
    return filtered.slice(0, limit);
  }

  static getUnreadCount(): number {
    return notifications.filter(n => n.status !== 'READ').length;
  }

  static markAsRead(notificationId: string): boolean {
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifications[index] = {
        ...notifications[index],
        status: 'READ',
        readAt: new Date().toISOString()
      };
      return true;
    }
    return false;
  }

  static addNotification(notification: Omit<MockNotification, 'id' | 'createdAt'>): MockNotification {
    const newNotification: MockNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    notifications.unshift(newNotification); // Agregar al inicio
    return newNotification;
  }

  static addDemoNotifications(): MockNotification[] {
    const demoNotifications = [
      {
        title: '¡Bienvenido a VolunNet! 🎉',
        message: 'Gracias por unirte a nuestra comunidad de voluntarios. Para obtener mejores recomendaciones de eventos, completa tu perfil con tus intereses y habilidades.',
        category: 'SYSTEM',
        subcategory: 'WELCOME',
        priority: 'HIGH' as const,
        status: 'PENDING' as const,
        actionText: 'Completar Perfil',
        actionUrl: '/perfil',
        relatedEventId: null
      },
      {
        title: 'Postulación Enviada ✅',
        message: 'Tu postulación al evento "Limpieza de Playa" ha sido enviada exitosamente. El organizador revisará tu solicitud pronto.',
        category: 'EVENT',
        subcategory: 'APPLICATION_SUBMITTED',
        priority: 'NORMAL' as const,
        status: 'PENDING' as const,
        actionText: 'Ver Evento',
        actionUrl: '/eventos/1',
        relatedEventId: 'event_1'
      },
      {
        title: '¡Felicidades! Tu postulación fue aceptada 🎉',
        message: 'Has sido aceptado para participar en "Taller de Reciclaje" el 28/09/2024. ¡Nos vemos pronto!',
        category: 'EVENT',
        subcategory: 'APPLICATION_ACCEPTED',
        priority: 'HIGH' as const,
        status: 'PENDING' as const,
        actionText: 'Ver Detalles',
        actionUrl: '/eventos/2',
        relatedEventId: 'event_2'
      },
      {
        title: 'Recordatorio: Tu evento es mañana ⏰',
        message: 'El evento "Limpieza de Playa" es mañana a las 09:00. ¡Prepárate para una gran experiencia!',
        category: 'EVENT',
        subcategory: 'EVENT_REMINDER',
        priority: 'HIGH' as const,
        status: 'PENDING' as const,
        actionText: 'Ver Detalles',
        actionUrl: '/eventos/1',
        relatedEventId: 'event_1'
      },
      {
        title: '¡Evento completado! Gracias por participar 🌟',
        message: 'El evento "Taller de Reciclaje" ha finalizado. ¡Gracias por tu participación! Califica tu experiencia para ayudar a otros voluntarios.',
        category: 'EVENT',
        subcategory: 'EVENT_COMPLETED',
        priority: 'NORMAL' as const,
        status: 'PENDING' as const,
        actionText: 'Calificar Evento',
        actionUrl: '/eventos/2/calificar',
        relatedEventId: 'event_2'
      }
    ];

    const createdNotifications = demoNotifications.map(notification => 
      this.addNotification(notification)
    );

    return createdNotifications;
  }
}
