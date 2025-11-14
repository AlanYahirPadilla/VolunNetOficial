import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Forzar que la ruta sea dinámica (importante para datos actualizados)
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("=== GET /api/eventos/finalizados - Starting ===");

    // Obtener TODOS los eventos completados (sin importar usuario/sesión)
    const events = await prisma.event.findMany({
      where: {
        status: "COMPLETED" as any,
      },
      include: {
        category: {
          select: {
            name: true,
            icon: true,   // 👈 aquí guardas el emoji
            color: true,
          },
        },
        applications: {
          where: {
            status: "COMPLETED" as any,
          },
          select: {
            id: true,
          },
        },
        organization: {   // 👈 para que también traiga el nombre de la organización
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log("Eventos finalizados encontrados:", events.length);

    // Transformar los datos para mostrar en frontend
    const transformedEvents = events.map((event) => {
      const participantsCount = event.applications?.length || 0;

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        city: event.city,
        state: event.state,
        startDate: event.startDate,
        endDate: event.endDate,
        maxVolunteers: event.maxVolunteers,
        currentVolunteers: event.currentVolunteers,
        status: event.status,

        // 👇 Ajuste clave: ahora devolvemos el emoji como "emoji"
        emoji: event.category?.icon || "📋",
        type: event.category?.name || "Sin categoría",
        category_color: event.category?.color || "bg-gray-100 text-gray-700",

        completedAt: event.updatedAt,
        participantsCount,
        organization: event.organization, // 👈 ya puedes usar event.organization?.name en frontend
      };
    });

    return NextResponse.json({
      events: transformedEvents,
      total: transformedEvents.length,
    });
  } catch (error) {
    console.error("Error fetching completed events (public):", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
