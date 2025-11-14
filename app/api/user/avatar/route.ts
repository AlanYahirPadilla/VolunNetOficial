// Archivo: app/api/user/avatar/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/auth/actions";
import { PrismaClient } from "@prisma/client";

// Forzar que esta ruta sea dinámica
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  console.log("--- API /api/user/avatar INVOCADA ---");
  
  const user = await getCurrentUser();
  
  if (!user?.id) {
    console.error("AVATAR_API: No se pudo obtener el usuario de la sesión.");
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }
  console.log(`AVATAR_API: Usuario encontrado - ID: ${user.id}`);

  try {
    const { avatar } = await request.json();
    console.log(`AVATAR_API: Ruta de avatar recibida: ${avatar}`);

    // --- VALIDACIÓN CORREGIDA ---
    // Ahora verificamos que sea un string y que comience con '/'
    if (typeof avatar !== 'string' || !avatar.startsWith('/')) {
      console.error("AVATAR_API: La ruta del avatar es inválida. Debe ser un string que comience con '/'. Recibido:", avatar);
      return NextResponse.json({ message: 'Ruta de avatar inválida' }, { status: 400 });
    }

    console.log(`AVATAR_API: Intentando actualizar la BD para el usuario ${user.id}...`);
    
    // Ejecutamos la actualización
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatar: avatar }, // Guardamos la ruta local, ej: "/img/avatars/avatar1.png"
    });

    console.log("AVATAR_API: ¡Éxito! La base de datos fue actualizada.", updatedUser);
    return NextResponse.json({ message: 'Avatar actualizado exitosamente', user: updatedUser });

  } catch (error) {
    console.error('AVATAR_API: ERROR CATCH - Falló la actualización en la base de datos:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al actualizar el avatar' },
      { status: 500 }
    );
  }
}