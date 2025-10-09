// Servicio para generar certificados en PDF
import jsPDF from 'jspdf';

interface CertificateData {
  volunteerName: string;
  organizationName: string;
  eventTitle: string;
  eventDate: Date;
  hoursCompleted: number;
  certificateCode: string;
}

export class CertificateService {
  static generateCertificate(data: CertificateData): jsPDF {
    // Crear documento PDF en orientación horizontal
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Fondo con gradiente (simulado con rectángulos)
    doc.setFillColor(240, 248, 255); // Azul muy claro
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Borde decorativo
    doc.setDrawColor(59, 130, 246); // Azul
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');
    
    doc.setDrawColor(147, 51, 234); // Púrpura
    doc.setLineWidth(1);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24, 'S');

    // Logo y título VolunNet
    doc.setFontSize(32);
    doc.setTextColor(59, 130, 246); // Azul
    doc.setFont('helvetica', 'bold');
    doc.text('VolunNet', pageWidth / 2, 30, { align: 'center' });

    // Subtítulo
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Certificado de Participación', pageWidth / 2, 40, { align: 'center' });

    // Línea decorativa
    doc.setDrawColor(147, 51, 234);
    doc.setLineWidth(0.5);
    doc.line(60, 45, pageWidth - 60, 45);

    // Texto principal
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text('Se otorga el presente certificado a:', pageWidth / 2, 60, { align: 'center' });

    // Nombre del voluntario
    doc.setFontSize(28);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.text(data.volunteerName, pageWidth / 2, 75, { align: 'center' });

    // Línea bajo el nombre
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    const nameWidth = doc.getTextWidth(data.volunteerName);
    const lineStart = (pageWidth - nameWidth - 20) / 2;
    const lineEnd = (pageWidth + nameWidth + 20) / 2;
    doc.line(lineStart, 78, lineEnd, 78);

    // Texto de reconocimiento
    doc.setFontSize(13);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    
    const recognitionText = `Por su valiosa participación y dedicación en el evento:`;
    doc.text(recognitionText, pageWidth / 2, 95, { align: 'center' });

    // Nombre del evento
    doc.setFontSize(18);
    doc.setTextColor(147, 51, 234); // Púrpura
    doc.setFont('helvetica', 'bold');
    
    // Dividir el título del evento si es muy largo
    const eventTitleLines = doc.splitTextToSize(data.eventTitle, pageWidth - 80);
    doc.text(eventTitleLines, pageWidth / 2, 110, { align: 'center' });

    // Organización
    doc.setFontSize(13);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    const yPosition = 110 + (eventTitleLines.length * 7);
    doc.text(`Organizado por: ${data.organizationName}`, pageWidth / 2, yPosition, { align: 'center' });

    // Fecha y horas
    const eventDateStr = new Date(data.eventDate).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`Fecha del evento: ${eventDateStr}`, pageWidth / 2, yPosition + 12, { align: 'center' });
    doc.text(`Horas completadas: ${data.hoursCompleted} horas`, pageWidth / 2, yPosition + 20, { align: 'center' });

    // Código de verificación
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.text(`Código de verificación: ${data.certificateCode}`, pageWidth / 2, pageHeight - 25, { align: 'center' });

    // Fecha de emisión
    const issuedDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Emitido el ${issuedDate}`, pageWidth / 2, pageHeight - 20, { align: 'center' });

    // Firma decorativa
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(40, pageHeight - 40, 90, pageHeight - 40);
    doc.line(pageWidth - 90, pageHeight - 40, pageWidth - 40, pageHeight - 40);

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text('VolunNet Platform', 65, pageHeight - 35, { align: 'center' });
    doc.text('Organización', pageWidth - 65, pageHeight - 35, { align: 'center' });

    // Sello/marca de agua
    doc.setFontSize(60);
    doc.setTextColor(59, 130, 246, 0.05); // Muy transparente
    doc.setFont('helvetica', 'bold');
    doc.text('VOLUNNET', pageWidth / 2, pageHeight / 2 + 10, { 
      align: 'center',
      angle: -30
    });

    return doc;
  }

  static generateCertificateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'VN-';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  static downloadCertificate(doc: jsPDF, fileName: string): void {
    doc.save(fileName);
  }

  static getCertificateBlob(doc: jsPDF): Blob {
    return doc.output('blob');
  }

  static getCertificateBase64(doc: jsPDF): string {
    return doc.output('dataurlstring');
  }
}


