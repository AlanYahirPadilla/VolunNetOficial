require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function sendEventReminders() {
  try {
    console.log('🔔 Iniciando envío de recordatorios de eventos...');

    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

    // Eventos que empiezan en 24 horas (±1 hora de margen)
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
          include: { 
            volunteer: { 
              include: { user: true } 
            } 
          }
        }
      }
    })

    // Eventos que empiezan en 1 hora (±30 minutos de margen)
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
          include: { 
            volunteer: { 
              include: { user: true } 
            } 
          }
        }
      }
    })

    console.log(`📅 Eventos encontrados: ${events24h.length} (24h), ${events1h.length} (1h)`)

    // Crear notificaciones para recordatorios de 24h
    for (const event of events24h) {
      for (const application of event.applications) {
        await prisma.notification.create({
          data: {
            userId: application.volunteer.userId,
            category: 'EVENT',
            subcategory: 'EVENT_REMINDER',
            title: 'Recordatorio: Tu evento es mañana ⏰',
            message: `El evento "${event.title}" es mañana a las ${event.startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}. ¡Prepárate para una gran experiencia!`,
            priority: 'HIGH',
            actionText: 'Ver Detalles',
            actionUrl: `/eventos/${event.id}`,
            relatedEventId: event.id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expira en 24h
            status: 'PENDING'
          }
        })
        console.log(`✅ Recordatorio 24h creado para ${application.volunteer.user.firstName} - ${event.title}`)
      }
    }

    // Crear notificaciones para recordatorios de 1h
    for (const event of events1h) {
      for (const application of event.applications) {
        await prisma.notification.create({
          data: {
            userId: application.volunteer.userId,
            category: 'EVENT',
            subcategory: 'EVENT_REMINDER',
            title: 'Tu evento comienza en 1 hora ⏰',
            message: `El evento "${event.title}" comienza en 1 hora. ¡No olvides llegar puntual!`,
            priority: 'URGENT',
            actionText: 'Ver Ubicación',
            actionUrl: `/eventos/${event.id}`,
            relatedEventId: event.id,
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // Expira en 2h
            status: 'PENDING'
          }
        })
        console.log(`✅ Recordatorio 1h creado para ${application.volunteer.user.firstName} - ${event.title}`)
      }
    }

    console.log(`🎉 Recordatorios enviados: ${events24h.length} eventos (24h), ${events1h.length} eventos (1h)`)

  } catch (error) {
    console.error('❌ Error enviando recordatorios:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  sendEventReminders()
    .then(() => {
      console.log('✅ Script de recordatorios completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script de recordatorios:', error);
      process.exit(1);
    });
}

module.exports = { sendEventReminders };
