import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getCurrentUser } from "@/app/auth/actions";
import { Resend } from 'resend'; // Importa Resend

// Forzar que esta ruta sea dinámica
export const dynamic = 'force-dynamic'

const sql = neon(process.env.DATABASE_URL!);
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null; // Inicializa Resend

export async function POST(request: NextRequest) {
  try {
    console.log("=== POST /api/auth/verify-email - Starting ===");

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { action, email, code } = await request.json();

    if (action === "send") {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

      await sql`
        INSERT INTO email_verification_codes ("userId", email, code, "expiresAt")
        VALUES (${currentUser.id}, ${email}, ${verificationCode}, ${expiresAt.toISOString()})
        ON CONFLICT ("userId") 
        DO UPDATE SET 
          code = ${verificationCode},
          "expiresAt" = ${expiresAt.toISOString()},
          "createdAt" = NOW()
      `;

      // Envío de correo con Resend (si está configurado)
      if (resend) {
        try {
          await resend.emails.send({
            from: 'VolunNet <onboarding@resend.dev>', 
            
            // IMPORTANTE: La dirección 'to' DEBE SER el correo con el que te registraste en Resend.
            to: email, 
            
            subject: 'Tu código de verificación para VolunNet',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #333; text-align: center;">Verifica tu dirección de correo</h1>
                <p style="color: #555; text-align: center;">
                  Gracias por unirte a VolunNet. Para completar tu registro, por favor usa el siguiente código de verificación:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <span style="font-size: 32px; font-weight: bold; color: #1e88e5; letter-spacing: 4px; background: #f0f8ff; padding: 20px; border-radius: 8px; display: inline-block;">
                    ${verificationCode}
                  </span>
                </div>
                <p style="color: #555; text-align: center;">
                  Este código expirará en 10 minutos. Si no solicitaste esta verificación, puedes ignorar este correo.
                </p>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://tu-sitio-web.com/configuracion" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Ir a tu configuración
                  </a>
                </div>
              </div>
            `,
          });

          console.log(`Correo de verificación enviado a ${email}`);
          return NextResponse.json({ 
            success: true, 
            message: "Código de verificación enviado"
          });

        } catch (emailError) {
          console.error("Error al enviar el correo:", emailError);
          return NextResponse.json({ error: "No se pudo enviar el correo de verificación" }, { status: 500 });
        }
      } else {
        // Si no hay Resend configurado, solo loguear el código
        console.log(`Código de verificación para ${email}: ${verificationCode}`);
        return NextResponse.json({ 
          success: true, 
          message: "Código de verificación generado (consulta la consola del servidor)",
          code: verificationCode // Solo para desarrollo
        });
      }
      
    } else if (action === "verify") {
      if (!code) {
        return NextResponse.json({ error: "Código requerido" }, { status: 400 });
      }

      const verificationResult = await sql`
        SELECT * FROM email_verification_codes 
        WHERE "userId" = ${currentUser.id} 
        AND code = ${code}
        AND "expiresAt" > NOW()
        ORDER BY "createdAt" DESC
        LIMIT 1
      `;

      if (verificationResult.length === 0) {
        return NextResponse.json({ error: "Código inválido o expirado" }, { status: 400 });
      }

      await sql`
        UPDATE users 
        SET email_verified = true, 
            email_verified_at = NOW()
        WHERE id = ${currentUser.id}
      `;

      await sql`
        DELETE FROM email_verification_codes 
        WHERE "userId" = ${currentUser.id}
      `;

      return NextResponse.json({ 
        success: true, 
        message: "Email verificado correctamente" 
      });

    } else {
      return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    }

  } catch (error: unknown) {
    console.error("Error in email verification:", (error as Error).message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}