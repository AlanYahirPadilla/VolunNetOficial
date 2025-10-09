// Archivo: app/api/perfil/voluntario/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/auth/actions";
import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// ==================================================================
// FUNCIÓN GET CORREGIDA
// ==================================================================
export async function GET(req: NextRequest) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    // Hacemos UNA SOLA consulta a la BD que incluye los datos del usuario y disponibilidad.
    const volunteerProfile = await prisma.volunteer.findUnique({
      where: { userId: sessionUser.id },
      include: {
        user: true, // ¡Esta es la clave! Trae los datos frescos del usuario.
        availability: true, // Incluir disponibilidad
      },
    });

    if (!volunteerProfile) {
      return NextResponse.json({ error: "Perfil de voluntario no encontrado" }, { status: 404 });
    }

    // Separamos los datos del usuario (actualizados) y los del perfil del voluntario.
    const { user, ...voluntarioData } = volunteerProfile;

    // Enviamos ambos objetos al frontend con la información 100% actualizada.
    return NextResponse.json({ user, voluntario: voluntarioData });

  } catch (error) {
    console.error("Error al obtener el perfil del voluntario:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// ==================================================================
// TU FUNCIÓN PUT SE QUEDA IGUAL (NO NECESITA CAMBIOS)
// ==================================================================
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const data = await req.json();
  // Validar y transformar socialLinks si es necesario
  let socialLinks = data.socialLinks;
  if (Array.isArray(socialLinks)) {
    // Si es array de objetos, extraer solo las URLs
    if (socialLinks.length > 0 && typeof socialLinks[0] === 'object' && socialLinks[0] !== null) {
      socialLinks = socialLinks.map((l: any) => l.url || l);
    }
  } else {
    socialLinks = [];
  }
  console.log('PUT /api/perfil/voluntario data:', JSON.stringify(data, null, 2));
  console.log('PUT /api/perfil/voluntario socialLinks:', socialLinks);
  try {
    // Actualizar User
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email, // solo si permites editar email
        avatar: data.profileImage || data.avatar,
      },
    });

    // Actualizar Volunteer
    const updated = await prisma.volunteer.update({
      where: { userId: user.id },
      data: {
        bio: data.bio,
        interests: data.interests,
        skills: data.skills,
        cvUrl: data.cvUrl,
        experience: data.experience,
        gender: data.gender,
        languages: data.languages,
        city: data.city,
        state: data.state,
        address: data.address,
        tagline: data.tagline,
        references: data.references,
        socialLinks,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });

    // Manejar disponibilidad
    if (data.availability && Array.isArray(data.availability)) {
      // Eliminar disponibilidad existente
      await prisma.availability.deleteMany({
        where: { volunteerId: updated.id }
      });

      // Crear nueva disponibilidad
      if (data.availability.length > 0) {
        await prisma.availability.createMany({
          data: data.availability.map((slot: any) => ({
            volunteerId: updated.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }))
        });
      }
    }

    // Obtener el perfil actualizado con disponibilidad
    const volunteerWithAvailability = await prisma.volunteer.findUnique({
      where: { userId: user.id },
      include: {
        user: true,
        availability: true,
      },
    });

    const { user: userData, ...voluntarioData } = volunteerWithAvailability!;
    return NextResponse.json({ user: userData, voluntario: voluntarioData });
  } catch (error: any) {
    console.error('Error actualizando voluntario:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}