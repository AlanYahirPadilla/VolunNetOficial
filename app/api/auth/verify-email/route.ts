import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getCurrentUser } from "@/app/auth/actions";
import { Resend } from 'resend'; // Importa Resend
import { VerificationEmail } from '@/components/emails/VerificationEmail'; // Importa tu plantilla

const sql = neon(process.env.DATABASE_URL!);
const resend = new Resend(process.env.RESEND_API_KEY); // Inicializa Resend

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

      // --- ¡AQUÍ ESTÁ LA MAGIA! ---
      // Reemplazamos el console.log con la llamada a Resend
      try {
        await resend.emails.send({
          from: 'VolunNet <onboarding@resend.dev>', // Usa este para empezar. Luego cámbialo a tu dominio verificado.
          to: email, // El email del usuario
          subject: 'Tu código de verificación para VolunNet',
          react: VerificationEmail({ verificationCode: verificationCode }), // Usamos nuestra plantilla de React
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