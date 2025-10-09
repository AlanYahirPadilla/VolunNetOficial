const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testRatingSystem() {
  try {
    console.log('🔍 Testing Rating System...')
    console.log('=' .repeat(50))

    // 1. Verificar voluntarios con ratings
    console.log('\n📊 VOLUNTARIOS CON RATINGS:')
    const volunteersWithRatings = await prisma.volunteer.findMany({
      where: {
        rating: { gt: 0 }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    console.log(`✅ Voluntarios con rating: ${volunteersWithRatings.length}`)
    volunteersWithRatings.forEach(volunteer => {
      console.log(`   👤 ${volunteer.user.firstName} ${volunteer.user.lastName}: ${volunteer.rating}/5`)
    })

    // 2. Verificar organizaciones con ratings
    console.log('\n📊 ORGANIZACIONES CON RATINGS:')
    const organizationsWithRatings = await prisma.organization.findMany({
      where: {
        rating: { gt: 0 }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    console.log(`✅ Organizaciones con rating: ${organizationsWithRatings.length}`)
    organizationsWithRatings.forEach(org => {
      console.log(`   🏢 ${org.name}: ${org.rating}/5`)
    })

    // 3. Verificar aplicaciones con ratings
    console.log('\n📊 APLICACIONES CON RATINGS:')
    const applicationsWithRatings = await prisma.eventApplication.findMany({
      where: {
        rating: { not: null },
        status: 'COMPLETED'
      },
      include: {
        volunteer: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        event: {
          select: {
            title: true,
            organization: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    console.log(`✅ Aplicaciones con rating: ${applicationsWithRatings.length}`)
    applicationsWithRatings.forEach(app => {
      console.log(`   📋 ${app.volunteer.firstName} ${app.volunteer.lastName} → ${app.event.organization.name}: ${app.rating}/5`)
    })

    // 4. Simular cálculo de rating promedio para un voluntario
    if (volunteersWithRatings.length > 0) {
      const testVolunteer = volunteersWithRatings[0]
      console.log(`\n🧮 SIMULANDO CÁLCULO DE RATING PARA: ${testVolunteer.user.firstName} ${testVolunteer.user.lastName}`)
      
      const volunteerRatings = await prisma.eventApplication.findMany({
        where: {
          volunteerId: testVolunteer.userId,
          status: 'COMPLETED',
          rating: { not: null }
        },
        select: {
          rating: true
        }
      })

      if (volunteerRatings.length > 0) {
        const totalRating = volunteerRatings.reduce((sum, app) => sum + (app.rating || 0), 0)
        const averageRating = totalRating / volunteerRatings.length
        const roundedRating = Math.round(averageRating * 10) / 10

        console.log(`   📊 Ratings individuales: ${volunteerRatings.map(r => r.rating).join(', ')}`)
        console.log(`   📊 Promedio calculado: ${roundedRating}`)
        console.log(`   📊 Rating actual en BD: ${testVolunteer.rating}`)
        
        if (Math.abs(roundedRating - testVolunteer.rating) < 0.1) {
          console.log('   ✅ Los ratings coinciden correctamente')
        } else {
          console.log('   ⚠️ Los ratings NO coinciden - necesita actualización')
        }
      }
    }

    // 5. Verificar eventos completados
    console.log('\n📊 EVENTOS COMPLETADOS:')
    const completedEvents = await prisma.event.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        organization: {
          select: {
            name: true
          }
        },
        applications: {
          where: {
            status: 'COMPLETED'
          },
          include: {
            volunteer: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    console.log(`✅ Eventos completados: ${completedEvents.length}`)
    completedEvents.forEach(event => {
      const ratedApplications = event.applications.filter(app => app.rating !== null)
      console.log(`   📅 ${event.title} (${event.organization.name}): ${ratedApplications.length}/${event.applications.length} calificados`)
    })

    console.log('\n🎯 RESUMEN:')
    console.log(`   👥 Voluntarios con rating: ${volunteersWithRatings.length}`)
    console.log(`   🏢 Organizaciones con rating: ${organizationsWithRatings.length}`)
    console.log(`   📋 Aplicaciones calificadas: ${applicationsWithRatings.length}`)
    console.log(`   📅 Eventos completados: ${completedEvents.length}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRatingSystem()







