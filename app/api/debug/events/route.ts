import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

// Evitar inicializar conexión durante build si no hay credenciales
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      return NextResponse.json({
        error: "DATABASE_URL no configurado",
        hint: "Define DATABASE_URL en variables de entorno del proyecto (Vercel)"
      }, { status: 500 })
    }

    const sql = neon(connectionString)
    console.log("=== DEBUG: Checking database state ===")
    
    // Verificar si la tabla events existe y tiene datos
    const eventsCount = await sql`SELECT COUNT(*) as count FROM events`
    console.log("Total events in database:", eventsCount[0]?.count)
    
    // Verificar si hay eventos publicados
    const publishedEvents = await sql`SELECT COUNT(*) as count FROM events WHERE status = 'PUBLISHED'`
    console.log("Published events:", publishedEvents[0]?.count)
    
    // Verificar si hay eventos futuros
    const futureEvents = await sql`SELECT COUNT(*) as count FROM events WHERE "startDate" > NOW()`
    console.log("Future events:", futureEvents[0]?.count)
    
    // Obtener algunos eventos de ejemplo
    const sampleEvents = await sql`
      SELECT 
        e.id,
        e.title,
        e.status,
        e."startDate",
        e."endDate"
      FROM events e
      LIMIT 5
    `
    console.log("Sample events:", sampleEvents)
    
    // Verificar si las tablas relacionadas tienen datos
    const categoriesCount = await sql`SELECT COUNT(*) as count FROM event_categories`
    console.log("Event categories:", categoriesCount[0]?.count)
    
    const organizationsCount = await sql`SELECT COUNT(*) as count FROM organizations`
    console.log("Organizations:", organizationsCount[0]?.count)
    
    return NextResponse.json({
      debug: {
        totalEvents: eventsCount[0]?.count || 0,
        publishedEvents: publishedEvents[0]?.count || 0,
        futureEvents: futureEvents[0]?.count || 0,
        categories: categoriesCount[0]?.count || 0,
        organizations: organizationsCount[0]?.count || 0,
        sampleEvents: sampleEvents
      }
    })
    
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ 
      error: "Error checking database", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}






