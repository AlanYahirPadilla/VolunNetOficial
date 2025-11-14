import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/auth/actions';
import { CertificateService } from '@/lib/services/CertificateService';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { eventId, volunteerId } = await req.json();

    // Verificar que el evento esté completado
    const application = await prisma.eventApplication.findFirst({
      where: {
        eventId,
        volunteerId,
        status: 'COMPLETED'
      },
      include: {
        event: {
          include: {
            organization: {
              include: {
                user: true
              }
            }
          }
        },
        volunteer: {
          include: {
            user: true
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'No se encontró una participación completada en este evento' },
        { status: 404 }
      );
    }

    // Verificar si ya existe un certificado
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        eventId,
        volunteerId
      }
    });

    if (existingCertificate) {
      return NextResponse.json({ certificate: existingCertificate });
    }

    // Calcular horas completadas (diferencia entre fecha de inicio y fin del evento)
    const eventStart = new Date(application.event.startDate);
    const eventEnd = new Date(application.event.endDate);
    const hoursCompleted = Math.round(
      (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60)
    );

    // Generar código único
    const certificateCode = CertificateService.generateCertificateCode();

    // Crear certificado en la base de datos
    const certificate = await prisma.certificate.create({
      data: {
        volunteerId,
        eventId,
        organizationName: application.event.organization.user.firstName,
        eventTitle: application.event.title,
        eventDate: application.event.startDate,
        hoursCompleted,
        certificateCode
      }
    });

    return NextResponse.json({ certificate });
  } catch (error: any) {
    console.error('Error generando certificado:', error);
    return NextResponse.json(
      { error: 'Error al generar certificado' },
      { status: 500 }
    );
  }
}

