require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupNotifications() {
  try {
    console.log('🔧 Configurando sistema de notificaciones...');

    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos');

    // Crear plantillas de notificaciones
    const templates = [
      {
        name: 'welcome_new_user',
        category: 'SYSTEM',
        subcategory: 'WELCOME',
        title: '¡Bienvenido a VolunNet! 🎉',
        message: 'Gracias por unirte a nuestra comunidad de voluntarios. Para obtener mejores recomendaciones de eventos, completa tu perfil con tus intereses y habilidades.',
        actionText: 'Completar Perfil',
        variables: ['firstName'],
        priority: 'HIGH',
        expiresIn: 7,
        language: 'es',
        active: true,
        version: 1
      },
      {
        name: 'profile_incomplete',
        category: 'SYSTEM',
        subcategory: 'PROFILE_REMINDER',
        title: 'Mejora tus recomendaciones 📈',
        message: 'Completa tu perfil para recibir recomendaciones más precisas de eventos que coincidan con tus intereses y habilidades.',
        actionText: 'Completar Perfil',
        variables: ['firstName'],
        priority: 'NORMAL',
        expiresIn: 3,
        language: 'es',
        active: true,
        version: 1
      },
      {
        name: 'application_submitted',
        category: 'EVENT',
        subcategory: 'APPLICATION_SUBMITTED',
        title: 'Postulación Enviada ✅',
        message: 'Tu postulación al evento "{eventTitle}" ha sido enviada exitosamente. El organizador revisará tu solicitud pronto.',
        actionText: 'Ver Evento',
        variables: ['eventTitle', 'eventDate', 'organizationName'],
        priority: 'NORMAL',
        expiresIn: 30,
        language: 'es',
        active: true,
        version: 1
      },
      {
        name: 'application_accepted',
        category: 'EVENT',
        subcategory: 'APPLICATION_ACCEPTED',
        title: '¡Felicidades! Tu postulación fue aceptada 🎉',
        message: 'Has sido aceptado para participar en "{eventTitle}" el {eventDate}. ¡Nos vemos pronto!',
        actionText: 'Ver Detalles',
        variables: ['eventTitle', 'eventDate', 'organizationName'],
        priority: 'HIGH',
        expiresIn: 30,
        language: 'es',
        active: true,
        version: 1
      },
      {
        name: 'application_rejected',
        category: 'EVENT',
        subcategory: 'APPLICATION_REJECTED',
        title: 'Postulación no aceptada',
        message: 'Lamentamos informarte que tu postulación al evento "{eventTitle}" no fue aceptada esta vez. ¡No te desanimes! Hay muchos otros eventos esperándote.',
        actionText: 'Buscar Eventos',
        variables: ['eventTitle', 'organizationName'],
        priority: 'NORMAL',
        expiresIn: 7,
        language: 'es',
        active: true,
        version: 1
      },
      {
        name: 'event_started',
        category: 'EVENT',
        subcategory: 'EVENT_STARTED',
        title: 'Tu evento ha comenzado 🚀',
        message: 'El evento "{eventTitle}" ha comenzado. ¡Es hora de hacer la diferencia!',
        actionText: 'Ver Evento',
        variables: ['eventTitle', 'eventLocation'],
        priority: 'HIGH',
        expiresIn: 1,
        language: 'es',
        active: true,
        version: 1
      },
      {
        name: 'event_completed',
        category: 'EVENT',
        subcategory: 'EVENT_COMPLETED',
        title: '¡Evento completado! Gracias por participar 🌟',
        message: 'El evento "{eventTitle}" ha finalizado. ¡Gracias por tu participación! Califica tu experiencia para ayudar a otros voluntarios.',
        actionText: 'Calificar Evento',
        variables: ['eventTitle', 'organizationName'],
        priority: 'NORMAL',
        expiresIn: 7,
        language: 'es',
        active: true,
        version: 1
      },
      {
        name: 'event_reminder_24h',
        category: 'EVENT',
        subcategory: 'EVENT_REMINDER',
        title: 'Recordatorio: Tu evento es mañana ⏰',
        message: 'El evento "{eventTitle}" es mañana a las {eventTime}. ¡Prepárate para una gran experiencia!',
        actionText: 'Ver Detalles',
        variables: ['eventTitle', 'eventTime', 'eventLocation'],
        priority: 'HIGH',
        expiresIn: 1,
        language: 'es',
        active: true,
        version: 1
      },
      {
        name: 'event_reminder_1h',
        category: 'EVENT',
        subcategory: 'EVENT_REMINDER',
        title: 'Tu evento comienza en 1 hora ⏰',
        message: 'El evento "{eventTitle}" comienza en 1 hora. ¡No olvides llegar puntual!',
        actionText: 'Ver Ubicación',
        variables: ['eventTitle', 'eventLocation'],
        priority: 'URGENT',
        expiresIn: 1,
        language: 'es',
        active: true,
        version: 1
      },
      {
        name: 'new_application_received',
        category: 'EVENT',
        subcategory: 'NEW_APPLICATION',
        title: 'Nueva postulación recibida 📝',
        message: '{volunteerName} se ha postulado a tu evento "{eventTitle}". Revisa su perfil y decide.',
        actionText: 'Revisar Postulación',
        variables: ['volunteerName', 'eventTitle'],
        priority: 'NORMAL',
        expiresIn: 7,
        language: 'es',
        active: true,
        version: 1
      }
    ];

    console.log('📝 Creando plantillas de notificaciones...');
    for (const template of templates) {
      try {
        await prisma.notificationTemplate.upsert({
          where: { name: template.name },
          update: template,
          create: template
        });
        console.log(`✅ Plantilla creada/actualizada: ${template.name}`);
      } catch (error) {
        console.error(`❌ Error creando plantilla ${template.name}:`, error.message);
      }
    }

    console.log('🎉 Sistema de notificaciones configurado exitosamente!');

  } catch (error) {
    console.error('❌ Error configurando sistema de notificaciones:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupNotifications()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { setupNotifications };
