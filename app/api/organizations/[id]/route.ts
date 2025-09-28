// /app/api/organizations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Asegúrate de que la ruta a tu cliente de Prisma sea correcta

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("=== GET /api/organizations/[id] (Prisma FINAL) - Starting ===");
  console.log("Organization ID:", params.id);

  try {
    if (!params.id || params.id.trim() === '') {
      return NextResponse.json({ error: "ID de organización inválido" }, { status: 400 });
    }

    // 1. Obtener la organización y sus relaciones directas
    const organization = await prisma.organization.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { email: true } },
        events: { select: { status: true } } // Incluimos los eventos para contarlos
      }
    });

    if (!organization) {
      console.log("Organization not found - returning 404");
      return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });
    }

    console.log("✅ Organization found:", organization.name);

    // 2. Calcular estadísticas simples a partir de los datos ya obtenidos
    const totalEvents = organization.events.length;
    const completedEvents = organization.events.filter(e => e.status === 'COMPLETED').length;
    const activeEvents = organization.events.filter(e => e.status === 'ONGOING' || e.status === 'PUBLISHED').length;

    // 3. CORRECCIÓN CLAVE AQUÍ: Usamos "EventApplication" y el campo "volunteerId"
    // Obtenemos un conteo de los voluntarios ÚNICOS que han sido aceptados o han completado un evento.
    const uniqueApplications = await prisma.EventApplication.findMany({
        where: {
          event: {
            organizationId: params.id
          },
          // (Mejora) Contamos solo aplicaciones aceptadas o completadas para una estadística más real
          status: {
            in: ['ACCEPTED', 'COMPLETED']
          }
        },
        distinct: ['volunteerId'] // Contamos de forma distinta por el ID del voluntario
    });
    const totalUniqueVolunteers = uniqueApplications.length;


    // 4. Construir el objeto de respuesta final
    const organizationWithStats = {
      id: organization.id,
      name: organization.name,
      description: organization.description,
      email: organization.user?.email || null,
      verified: organization.verified,
      
      // Estadísticas
      totalEvents,
      activeEvents,
      completedEvents,
      totalVolunteers: totalUniqueVolunteers,
      
      // Otros campos del modelo
      website: organization.website,
      address: organization.address,
      city: organization.city,
      state: organization.state,
      country: organization.country,
      rating: organization.rating,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };

    console.log("✅ Successfully built response. Returning 200 OK.");
    return NextResponse.json(organizationWithStats);

  } catch (error) {
    console.error("🔥 ERROR in GET /api/organizations/[id]:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: "Error interno del servidor", details: errorMessage }, { status: 500 });
  }
}