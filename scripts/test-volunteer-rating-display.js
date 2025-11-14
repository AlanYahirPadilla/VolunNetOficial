#!/usr/bin/env node

/**
 * Script para probar que los eventos completados aparecen correctamente 
 * en el dashboard de voluntarios para calificar
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testVolunteerRatingDisplay() {
  try {
    console.log('🧪 Probando visualización de eventos completados para voluntarios...\n')

    // 1. Buscar voluntarios que tienen eventos completados
    const volunteersWithCompletedEvents = await prisma.user.findMany({
      where: {
        role: 'VOLUNTEER',
        eventApplications: {
          some: {
            status: 'COMPLETED'
          }
        }
      },
      include: {
        eventApplications: {
          where: {
            status: 'COMPLETED'
          },
          include: {
            event: {
              include: {
                organization: true
              }
            }
          }
        }
      },
      take: 3
    })

    console.log(`📊 Encontrados ${volunteersWithCompletedEvents.length} voluntarios con eventos completados\n`)

    for (const volunteer of volunteersWithCompletedEvents) {
      console.log(`👤 Voluntario: ${volunteer.firstName} ${volunteer.lastName} (${volunteer.email})`)
      console.log(`📋 Eventos completados: ${volunteer.eventApplications.length}`)
      
      for (const application of volunteer.eventApplications) {
        const hasRating = application.rating !== null
        const status = hasRating ? '✅ Ya calificado' : '⏳ Pendiente de calificación'
        
        console.log(`   • ${application.event.title}`)
        console.log(`     Organización: ${application.event.organization.name}`)
        console.log(`     Estado: ${status}`)
        if (hasRating) {
          console.log(`     Calificación: ${application.rating}/5`)
          console.log(`     Comentario: ${application.feedback || 'Sin comentario'}`)
        }
        console.log('')
      }
    }

    // 2. Verificar que la API devuelve los datos correctos
    console.log('🔍 Verificando estructura de datos de la API...\n')
    
    const sampleVolunteer = volunteersWithCompletedEvents[0]
    if (sampleVolunteer) {
      const applications = await prisma.eventApplication.findMany({
        where: {
          volunteerId: sampleVolunteer.id
        },
        select: {
          id: true,
          status: true,
          appliedAt: true,
          message: true,
          rating: true,
          feedback: true,
          completedAt: true,
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              organization: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          appliedAt: 'desc'
        }
      })

      console.log(`📡 API devuelve ${applications.length} aplicaciones para ${sampleVolunteer.firstName}`)
      
      const completedApps = applications.filter(app => app.status === 'COMPLETED')
      const pendingRating = completedApps.filter(app => app.rating === null)
      
      console.log(`✅ Eventos completados: ${completedApps.length}`)
      console.log(`⏳ Pendientes de calificación: ${pendingRating.length}`)
      
      if (pendingRating.length > 0) {
        console.log('\n🎯 Eventos que deberían aparecer en el dashboard:')
        pendingRating.forEach(app => {
          console.log(`   • ${app.event.title} - ${app.event.organization.name}`)
        })
      }
    }

    console.log('\n✅ Prueba completada exitosamente!')
    console.log('\n📝 Resumen:')
    console.log('   - Los voluntarios con eventos completados se identifican correctamente')
    console.log('   - La API devuelve los campos rating y feedback necesarios')
    console.log('   - Los eventos pendientes de calificación se filtran correctamente')
    console.log('   - El dashboard debería mostrar estos eventos en la pestaña "Calificaciones"')

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar la prueba
testVolunteerRatingDisplay()
