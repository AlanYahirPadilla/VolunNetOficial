const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function recalculateAllRatings() {
  try {
    console.log('🔄 RECALCULANDO TODOS LOS RATINGS...')
    console.log('=' .repeat(50))

    // 1. Recalcular ratings de voluntarios
    console.log('\n👥 RECALCULANDO RATINGS DE VOLUNTARIOS:')
    
    const volunteers = await prisma.volunteer.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    for (const volunteer of volunteers) {
      const ratings = await prisma.eventApplication.findMany({
        where: {
          volunteerId: volunteer.userId,
          status: 'COMPLETED',
          rating: { not: null }
        },
        select: {
          rating: true
        }
      })

      if (ratings.length > 0) {
        const totalRating = ratings.reduce((sum, app) => sum + (app.rating || 0), 0)
        const averageRating = totalRating / ratings.length
        const roundedRating = Math.round(averageRating * 10) / 10

        console.log(`   👤 ${volunteer.user.firstName} ${volunteer.user.lastName}:`)
        console.log(`      Ratings: ${ratings.map(r => r.rating).join(', ')}`)
        console.log(`      Promedio: ${roundedRating} (antes: ${volunteer.rating})`)

        await prisma.volunteer.update({
          where: { userId: volunteer.userId },
          data: { rating: roundedRating }
        })

        console.log(`      ✅ Actualizado a: ${roundedRating}`)
      } else {
        console.log(`   👤 ${volunteer.user.firstName} ${volunteer.user.lastName}: Sin ratings`)
        await prisma.volunteer.update({
          where: { userId: volunteer.userId },
          data: { rating: 0 }
        })
      }
    }

    // 2. Recalcular ratings de organizaciones
    console.log('\n🏢 RECALCULANDO RATINGS DE ORGANIZACIONES:')
    
    const organizations = await prisma.organization.findMany()

    for (const org of organizations) {
      const ratings = await prisma.eventApplication.findMany({
        where: {
          event: {
            organizationId: org.id
          },
          status: 'COMPLETED',
          rating: { not: null }
        },
        select: {
          rating: true
        }
      })

      if (ratings.length > 0) {
        const totalRating = ratings.reduce((sum, app) => sum + (app.rating || 0), 0)
        const averageRating = totalRating / ratings.length
        const roundedRating = Math.round(averageRating * 10) / 10

        console.log(`   🏢 ${org.name}:`)
        console.log(`      Ratings: ${ratings.map(r => r.rating).join(', ')}`)
        console.log(`      Promedio: ${roundedRating} (antes: ${org.rating})`)

        await prisma.organization.update({
          where: { id: org.id },
          data: { rating: roundedRating }
        })

        console.log(`      ✅ Actualizado a: ${roundedRating}`)
      } else {
        console.log(`   🏢 ${org.name}: Sin ratings`)
        await prisma.organization.update({
          where: { id: org.id },
          data: { rating: 0 }
        })
      }
    }

    console.log('\n✅ RECÁLCULO COMPLETADO')
    console.log('=' .repeat(50))

    // 3. Verificar resultados
    console.log('\n📊 VERIFICACIÓN FINAL:')
    
    const updatedVolunteers = await prisma.volunteer.findMany({
      where: { rating: { gt: 0 } },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    const updatedOrganizations = await prisma.organization.findMany({
      where: { rating: { gt: 0 } }
    })

    console.log(`👥 Voluntarios con rating: ${updatedVolunteers.length}`)
    updatedVolunteers.forEach(v => {
      console.log(`   ${v.user.firstName} ${v.user.lastName}: ${v.rating}/5`)
    })

    console.log(`🏢 Organizaciones con rating: ${updatedOrganizations.length}`)
    updatedOrganizations.forEach(o => {
      console.log(`   ${o.name}: ${o.rating}/5`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

recalculateAllRatings()







