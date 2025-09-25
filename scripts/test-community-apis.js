const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testCommunityAPIs() {
  console.log('🧪 Probando APIs de Comunidad...')

  try {
    // 1. Verificar que hay usuarios en la base de datos
    console.log('\n📊 Verificando usuarios en la base de datos...')
    const userCount = await prisma.user.count()
    console.log(`Total de usuarios: ${userCount}`)

    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    })
    console.log('Primeros 5 usuarios:', users)

    // 2. Verificar organizaciones
    console.log('\n🏢 Verificando organizaciones...')
    const orgCount = await prisma.organization.count()
    console.log(`Total de organizaciones: ${orgCount}`)

    const orgs = await prisma.organization.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        userId: true
      }
    })
    console.log('Primeras 3 organizaciones:', orgs)

    // 3. Verificar eventos
    console.log('\n📅 Verificando eventos...')
    const eventCount = await prisma.event.count()
    console.log(`Total de eventos: ${eventCount}`)

    const events = await prisma.event.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        organizationId: true,
        status: true
      }
    })
    console.log('Primeros 3 eventos:', events)

    // 4. Verificar aplicaciones
    console.log('\n📝 Verificando aplicaciones...')
    const appCount = await prisma.eventApplication.count()
    console.log(`Total de aplicaciones: ${appCount}`)

    const apps = await prisma.eventApplication.findMany({
      take: 3,
      select: {
        id: true,
        eventId: true,
        volunteerId: true,
        status: true
      }
    })
    console.log('Primeras 3 aplicaciones:', apps)

    // 5. Probar consulta específica para organizador
    if (orgs.length > 0) {
      const orgId = orgs[0].id
      console.log(`\n🔍 Probando consulta para organización ${orgId}...`)
      
      const orgEvents = await prisma.event.findMany({
        where: {
          organizationId: orgId
        },
        select: {
          id: true,
          title: true,
          status: true,
          currentVolunteers: true,
          maxVolunteers: true
        }
      })
      console.log(`Eventos de la organización ${orgId}:`, orgEvents)

      const orgApplications = await prisma.eventApplication.findMany({
        where: {
          event: {
            organizationId: orgId
          }
        },
        include: {
          volunteer: {
            select: {
              id: true,
              userId: true
            }
          },
          event: {
            select: {
              id: true,
              title: true
            }
          }
        }
      })
      console.log(`Aplicaciones para eventos de la organización ${orgId}:`, orgApplications.length)
    }

    console.log('\n✅ Pruebas completadas exitosamente!')

  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCommunityAPIs()
