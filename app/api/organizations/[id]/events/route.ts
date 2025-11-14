// /app/api/organizations/[id]/events/route.ts
import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const dynamic = 'force-dynamic'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("=== GET /api/organizations/[id]/events - Starting ===")
  console.log("Organization ID:", params.id)
  
  try {
    // Verificar que la organización existe
    const orgCheck = await sql`
      SELECT id FROM organizations WHERE id = ${params.id}
    `

    if (orgCheck.length === 0) {
      return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 })
    }

    // Obtener los eventos de la organización
    const events = await sql`
      SELECT 
        e.id,
        e.title,
        e.description,
        e."startDate",
        e."endDate",
        e.city,
        e.state,
        e.status,
        e."maxVolunteers",
        e."organizationId" as "organization_id",
        c.name as "category_name",
        COALESCE(
          (SELECT COUNT(*) FROM event_participants ep WHERE ep."eventId" = e.id),
          0
        ) as "currentVolunteers"
      FROM events e
      LEFT JOIN categories c ON e."categoryId" = c.id
      WHERE e."organizationId" = ${params.id}
      ORDER BY e."startDate" DESC
      LIMIT 10
    `
    
    console.log("Events found:", events.length)

    // Formatear las fechas para el frontend
    const formattedEvents = events.map(event => ({
      ...event,
      currentVolunteers: parseInt(event.currentVolunteers || '0'),
      maxVolunteers: parseInt(event.maxVolunteers || '0'),
      startDate: event.startDate ? new Date(event.startDate).toISOString() : null,
      endDate: event.endDate ? new Date(event.endDate).toISOString() : null
    }))

    return NextResponse.json(formattedEvents)

  } catch (error) {
    console.error("=== ERROR in GET /api/organizations/[id]/events ===")
    console.error("Error:", error)
    return NextResponse.json([], { status: 200 }) // Retorna array vacío en caso de error
  }
}