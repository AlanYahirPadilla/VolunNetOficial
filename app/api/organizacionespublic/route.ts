import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// 🔹 Función para asignar emojis según el nombre
function getEmoji(nombre: string): string {
  const lower = nombre.toLowerCase();
  if (lower.includes("salud")) return "🏥";
  if (lower.includes("educ")) return "📚";
  if (lower.includes("medio ambiente")) return "🌱";
  if (lower.includes("animales")) return "🐾";
  if (lower.includes("deporte")) return "⚽";
  if (lower.includes("tecnología")) return "💻";
  if (lower.includes("arte") || lower.includes("cultura")) return "🎨";
  return "🏢"; // default
}

export async function GET() {
  try {
    const organizaciones = await sql`
      SELECT 
        id,
        name AS nombre,
        description AS descripcion,
        "userId",
        verified,
        "eventsCreated",
        "createdAt",
        "updatedAt"
      FROM organizations
      ORDER BY "createdAt" DESC
    `;

    // 🔹 Agregar campo `emoji`
    const organizacionesConEmoji = organizaciones.map((org: any) => ({
      ...org,
      emoji: getEmoji(org.nombre),
    }));

    // 🔹 Devolver JSON con charset UTF-8
    return new NextResponse(
      JSON.stringify({ organizaciones: organizacionesConEmoji }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  } catch (error) {
    console.error("Error en /api/organizacionespublic:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
