const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testVolunteerAvatars() {
  try {
    console.log('🔍 Testing volunteer avatars...')
    
    // Buscar un evento con aplicaciones completadas
    const eventWithApplications = await prisma.event.findFirst({
      where: {
        applications: {
          some: {
            status: 'COMPLETED'
          }
        }
      },
      include: {
        applications: {
          where: {
            status: 'COMPLETED'
          },
          include: {
            volunteer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    if (!eventWithApplications) {
      console.log('❌ No se encontraron eventos con aplicaciones completadas')
      return
    }

    console.log(`📅 Evento encontrado: ${eventWithApplications.title}`)
    console.log(`👥 Aplicaciones completadas: ${eventWithApplications.applications.length}`)

    // Los datos ya están disponibles directamente
    console.log(`👤 Voluntarios encontrados: ${eventWithApplications.applications.length}`)
    
    eventWithApplications.applications.forEach((app, index) => {
      console.log(`\n👤 Voluntario ${index + 1}:`)
      console.log(`   ID: ${app.volunteer.id}`)
      console.log(`   Nombre: ${app.volunteer.firstName} ${app.volunteer.lastName}`)
      console.log(`   Email: ${app.volunteer.email}`)
      console.log(`   Avatar: ${app.volunteer.avatar || 'NO TIENE AVATAR'}`)
    })

    // Simular el mapeo que hace el API
    const mappedApplications = eventWithApplications.applications.map(app => ({
      id: app.id,
      volunteer: {
        id: app.volunteer.id,
        firstName: app.volunteer.firstName,
        lastName: app.volunteer.lastName,
        email: app.volunteer.email,
        avatar: app.volunteer.avatar
      }
    }))

    console.log('\n📊 Aplicaciones mapeadas:')
    mappedApplications.forEach((app, index) => {
      console.log(`\n📋 Aplicación ${index + 1}:`)
      console.log(`   Voluntario: ${app.volunteer.firstName} ${app.volunteer.lastName}`)
      console.log(`   Email: ${app.volunteer.email}`)
      console.log(`   Avatar: ${app.volunteer.avatar || 'NO TIENE AVATAR'}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testVolunteerAvatars()
