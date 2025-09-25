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

    // Obtener todos los usuarios con sus perfiles
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: user.id // Excluir al usuario actual
        }
      },
      include: {
        volunteer: true,
        organization: true
      },
      orderBy: {
        firstName: 'asc'
      }
    })

    // Transformar los datos para el frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      verified: user.verified,
      volunteer: user.volunteer,
      organization: user.organization,
      createdAt: user.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      total: transformedUsers.length
    })

  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 })
  }
}
