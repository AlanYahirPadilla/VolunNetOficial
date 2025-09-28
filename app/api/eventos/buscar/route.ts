import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

function escapeLiteralForSQL(input: string) {
  // Escapa comillas simples y backslashes para evitar romper la literal SQL.
  return input.replace(/\\/g, "\\\\").replace(/'/g, "''");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const rawQuery = searchParams.get("query") || "";
    const rawCity = searchParams.get("city") || "";
    const rawState = searchParams.get("state") || "";
    const rawCategory = searchParams.get("category") || "";
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10) || 50;

    const query = rawQuery.toLowerCase().trim();
    const city = rawCity.toLowerCase().trim();
    const state = rawState.toLowerCase().trim();
    const category = rawCategory.toLowerCase().trim();

    // WHERE base
    let where = "WHERE e.status IN ('PUBLISHED','ONGOING')";

    if (query) {
      const q = escapeLiteralForSQL(query);
      where += ` AND (
        LOWER(e.title) LIKE '%${q}%'
        OR LOWER(e.description) LIKE '%${q}%'
        OR LOWER(o.name) LIKE '%${q}%'
      )`;
    }

    if (city) {
      const c = escapeLiteralForSQL(city);
      where += ` AND LOWER(e.city) LIKE '%${c}%'`;
    }

    if (state) {
      const s = escapeLiteralForSQL(state);
      where += ` AND LOWER(e.state) LIKE '%${s}%'`;
    }

    if (category && category !== "all") {
      const cat = escapeLiteralForSQL(category);
      where += ` AND (LOWER(ec.name) = '${cat}' OR LOWER(ec.id) = '${cat}')`;
    }

    // Ejecutar la consulta usando tagged template y sql.unsafe para el WHERE
    const events = await sql`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.address,
        e.city,
        e.state,
        e.country,
        e."startDate",
        e."endDate",
        e."maxVolunteers",
        e."currentVolunteers",
        e.skills,
        e.requirements,
        e.benefits,
        e."imageUrl",
        e.status,
        e."createdAt",
        e."updatedAt",
        o.name as organization_name,
        o.verified as organization_verified,
        ec.id as categoryId,
        ec.name as category_name,
        ec.icon as category_icon,
        ec.color as category_color
      FROM events e
      JOIN organizations o ON e."organizationId" = o.id
      JOIN event_categories ec ON e."categoryId" = ec.id
      ${sql.unsafe(where)}
      ORDER BY e."startDate" ASC
      LIMIT ${limit}
    `;

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
