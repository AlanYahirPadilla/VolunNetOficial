// /app/api/user/delete/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/app/auth/actions"

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    await prisma.user.delete({
      where: { id: user.id }
    })

    return NextResponse.json({ message: "Cuenta eliminada correctamente" })
  } catch (error: any) {
    console.error("Error eliminando cuenta:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    )
  }
}
