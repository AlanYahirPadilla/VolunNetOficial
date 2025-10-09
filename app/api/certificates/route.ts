import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/auth/actions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('📋 GET /api/certificates - Iniciando...');
    
    // Verificar autenticación
    let currentUser;
    try {
      currentUser = await getCurrentUser();
      console.log('👤 Usuario actual:', currentUser?.id);
    } catch (authError) {
      console.error('❌ Error en getCurrentUser:', authError);
      return NextResponse.json({ certificates: [] });
    }
    
    if (!currentUser) {
      console.log('⚠️ Usuario no autenticado, devolviendo lista vacía');
      return NextResponse.json({ certificates: [] });
    }

    // Obtener el perfil de voluntario
    let volunteer;
    try {
      console.log('🔍 Buscando perfil de voluntario para userId:', currentUser.id);
      volunteer = await prisma.volunteer.findUnique({
        where: { userId: currentUser.id }
      });
      console.log('👤 Voluntario encontrado:', volunteer?.id || 'ninguno');
    } catch (dbError) {
      console.error('❌ Error buscando voluntario:', dbError);
      return NextResponse.json({ certificates: [] });
    }

    // Si no hay perfil de voluntario, devolver lista vacía
    if (!volunteer) {
      console.log('⚠️ No hay perfil de voluntario, devolviendo lista vacía');
      return NextResponse.json({ certificates: [] });
    }

    // Obtener todos los certificados del voluntario
    let certificates;
    try {
      console.log('🔍 Buscando certificados para volunteerId:', volunteer.id);
      certificates = await prisma.certificate.findMany({
        where: {
          volunteerId: volunteer.id
        },
        orderBy: {
          issuedAt: 'desc'
        }
      });
      console.log(`✅ ${certificates.length} certificados encontrados`);
    } catch (certError) {
      console.error('❌ Error buscando certificados:', certError);
      return NextResponse.json({ certificates: [] });
    }

    return NextResponse.json({ certificates });
  } catch (error: any) {
    console.error('❌ Error crítico obteniendo certificados:', error);
    console.error('❌ Stack:', error?.stack);
    console.error('❌ Message:', error?.message);
    
    // En caso de error, devolver lista vacía en lugar de 500
    return NextResponse.json({ certificates: [] });
  }
}

