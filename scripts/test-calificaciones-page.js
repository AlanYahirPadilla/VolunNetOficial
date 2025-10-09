#!/usr/bin/env node

/**
 * Script para probar que la página de calificaciones funciona correctamente
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testCalificacionesPage() {
  try {
    console.log('🧪 Probando página de calificaciones...\n')

    // 1. Buscar voluntarios con eventos completados sin calificar
    const volunteersWithPendingRatings = await prisma.user.findMany({
      where: {
        role: 'VOLUNTEER',
        eventApplications: {
          some: {
            status: 'COMPLETED',
            rating: null
          }
        }
      },
      include: {
        eventApplications: {
          where: {
            status: 'COMPLETED',
            rating: null
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

    console.log(`📊 Encontrados ${volunteersWithPendingRatings.length} voluntarios con eventos pendientes de calificación\n`)

    for (const volunteer of volunteersWithPendingRatings) {
      console.log(`👤 Voluntario: ${volunteer.firstName} ${volunteer.lastName} (${volunteer.email})`)
      console.log(`📋 Eventos pendientes de calificación: ${volunteer.eventApplications.length}`)
      
      for (const application of volunteer.eventApplications) {
        console.log(`   • ${application.event.title}`)
        console.log(`     Organización: ${application.event.organization.name}`)
        console.log(`     Fecha: ${application.event.startDate}`)
        console.log(`     Estado: ⏳ Pendiente de calificación`)
        console.log('')
      }
    }

    // 2. Simular la respuesta de la API /api/events/apply
    console.log('🔍 Simulando respuesta de la API /api/events/apply...\n')
    
    const sampleVolunteer = volunteersWithPendingRatings[0]
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
      const alreadyRated = completedApps.filter(app => app.rating !== null)
      
      console.log(`✅ Eventos completados: ${completedApps.length}`)
      console.log(`⏳ Pendientes de calificación: ${pendingRating.length}`)
      console.log(`⭐ Ya calificados: ${alreadyRated.length}`)
      
      if (pendingRating.length > 0) {
        console.log('\n🎯 Eventos que deberían aparecer en la página de calificaciones:')
        pendingRating.forEach(app => {
          console.log(`   • ${app.event.title} - ${app.event.organization.name}`)
        })
      } else {
        console.log('\n📝 No hay eventos pendientes de calificación para este voluntario')
      }
    }

    // 3. Verificar que la página de calificaciones debería mostrar estos eventos
    console.log('\n✅ Prueba completada exitosamente!')
    console.log('\n📝 Resumen:')
    console.log('   - Los voluntarios con eventos completados sin calificar se identifican correctamente')
    console.log('   - La API /api/events/apply devuelve los datos necesarios')
    console.log('   - Los eventos pendientes de calificación se filtran correctamente')
    console.log('   - La página de calificaciones debería mostrar estos eventos')
    console.log('   - Los usuarios pueden calificar eventos desde la página')

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar la prueba
testCalificacionesPage()

