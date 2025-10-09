// Script para generar certificados para eventos ya finalizados
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Función para generar código único
function generateCertificateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'VN-';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function generateHistoricalCertificates() {
  try {
    console.log('🎓 Iniciando generación de certificados históricos...\n');

    // Obtener todos los eventos completados
    const completedEvents = await prisma.event.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        applications: {
          where: {
            status: 'COMPLETED'
          },
          include: {
            volunteer: true // volunteer es un User
          }
        },
        organization: {
          include: {
            user: true
          }
        }
      }
    });

    console.log(`📋 Se encontraron ${completedEvents.length} eventos completados\n`);

    let totalCertificatesGenerated = 0;
    let totalCertificatesSkipped = 0;

    for (const event of completedEvents) {
      console.log(`\n📅 Evento: "${event.title}"`);
      console.log(`   Organización: ${event.organization.user.firstName} ${event.organization.user.lastName}`);
      console.log(`   Voluntarios completados: ${event.applications.length}`);

      for (const application of event.applications) {
        // Obtener el perfil de voluntario
        const volunteerProfile = await prisma.volunteer.findUnique({
          where: { userId: application.volunteerId }
        });

        if (!volunteerProfile) {
          console.log(`   ⚠️  No se encontró perfil de voluntario para ${application.volunteer.firstName} ${application.volunteer.lastName}`);
          continue;
        }

        // Verificar si ya existe un certificado
        const existingCertificate = await prisma.certificate.findFirst({
          where: {
            volunteerId: volunteerProfile.id,
            eventId: event.id
          }
        });

        if (existingCertificate) {
          console.log(`   ⏭️  Certificado ya existe para ${application.volunteer.firstName} ${application.volunteer.lastName}`);
          totalCertificatesSkipped++;
          continue;
        }

        // Calcular horas completadas
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        const hoursCompleted = Math.max(1, Math.round(
          (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60)
        ));

        // Generar código único
        const certificateCode = generateCertificateCode();

        // Crear certificado
        await prisma.certificate.create({
          data: {
            volunteerId: volunteerProfile.id,
            eventId: event.id,
            organizationName: `${event.organization.user.firstName} ${event.organization.user.lastName}`,
            eventTitle: event.title,
            eventDate: event.startDate,
            hoursCompleted,
            certificateCode,
            issuedAt: new Date() // Fecha actual de emisión
          }
        });

        console.log(`   ✅ Certificado generado para ${application.volunteer.firstName} ${application.volunteer.lastName} (${hoursCompleted}h) - ${certificateCode}`);
        totalCertificatesGenerated++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✨ Resumen de Generación de Certificados:');
    console.log('='.repeat(70));
    console.log(`✅ Certificados generados: ${totalCertificatesGenerated}`);
    console.log(`⏭️  Certificados omitidos (ya existían): ${totalCertificatesSkipped}`);
    console.log(`📊 Total de eventos procesados: ${completedEvents.length}`);
    console.log('='.repeat(70) + '\n');

    // Mostrar estadísticas por voluntario
    if (totalCertificatesGenerated > 0) {
      console.log('\n📊 Certificados generados por voluntario:\n');
      
      const certificatesByVolunteer = await prisma.certificate.groupBy({
        by: ['volunteerId'],
        _count: {
          id: true
        }
      });

      for (const stat of certificatesByVolunteer) {
        const volunteer = await prisma.volunteer.findUnique({
          where: { id: stat.volunteerId },
          include: { user: true }
        });

        if (volunteer) {
          console.log(`   👤 ${volunteer.user.firstName} ${volunteer.user.lastName}: ${stat._count.id} certificado(s)`);
        }
      }
    }

    console.log('\n✅ Proceso completado exitosamente!\n');

  } catch (error) {
    console.error('❌ Error al generar certificados históricos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar script
generateHistoricalCertificates()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });

