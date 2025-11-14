import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/auth/actions"

// Forzar que esta ruta sea dinámica
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error getting current user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
