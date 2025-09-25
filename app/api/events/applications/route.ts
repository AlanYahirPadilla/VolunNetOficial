import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    // Obtener la organización del usuario
    let userOrganizationId = null
    if (organizationId === 'me') {
      const organization = await prisma.organization.findUnique({
        where: { userId: user.id }
      })
      if (organization) {
        userOrganizationId = organization.id
      }
    } else if (organizationId) {
      userOrganizationId = organizationId
    }

    if (!userOrganizationId) {
      return NextResponse.json({ 
        error: "Organización no encontrada" 
      }, { status: 404 })
    }

    // Obtener aplicaciones a eventos de la organización
    const applications = await prisma.eventApplication.findMany({
      where: {
        event: {
          organizationId: userOrganizationId
        }
      },
      include: {
        volunteer: {
          select: {
            id: true,
            bio: true,
            skills: true,
            phone: true,
            userId: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            city: true,
            state: true,
            status: true
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      }
    })

    // Obtener información de usuarios por separado
    const userIds = applications.map(app => app.volunteer.userId).filter(Boolean)
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true
      }
    })

    const userMap = new Map(users.map(user => [user.id, user]))

    // Transformar los datos para el frontend
    const transformedApplications = applications.map(app => {
      const user = userMap.get(app.volunteer.userId)
      return {
        id: app.id,
        volunteer: {
          id: app.volunteer.id,
          firstName: user?.firstName || 'Usuario',
          lastName: user?.lastName || 'Desconocido',
          email: user?.email || '',
          bio: app.volunteer.bio,
          skills: app.volunteer.skills,
          phone: app.volunteer.phone,
          avatar: user?.avatar
        },
        eventId: app.eventId,
        eventTitle: app.event.title,
        status: app.status,
        appliedAt: app.appliedAt.toISOString(),
        message: app.message
      }
    })

    return NextResponse.json({
      success: true,
      applications: transformedApplications,
      total: transformedApplications.length
    })

  } catch (error) {
    console.error('Error obteniendo aplicaciones:', error)
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 })
  }
}
