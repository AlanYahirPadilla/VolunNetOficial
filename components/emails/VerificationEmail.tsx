import * as React from "react";

interface VerificationEmailProps {
  verificationCode?: string;
}

export const VerificationEmail = ({ verificationCode }: VerificationEmailProps) => {
  return React.createElement('html', null,
    React.createElement('head', null),
    React.createElement('body', { style: main },
      React.createElement('div', { style: container },
        React.createElement('h1', { style: heading }, 'Verifica tu dirección de correo'),
        React.createElement('p', { style: paragraph },
          'Gracias por unirte a VolunNet. Para completar tu registro, por favor usa el siguiente código de verificación:'
        ),
        React.createElement('p', { style: codeStyle }, verificationCode),
        React.createElement('p', { style: paragraph },
          'Este código expirará en 10 minutos. Si no solicitaste esta verificación, puedes ignorar este correo.'
        ),
        React.createElement('a', { 
          style: button, 
          href: "https://tu-sitio-web.com/configuracion" 
        }, 'Ir a tu configuración')
      )
    )
  );
};

export default VerificationEmail;

// --- Estilos para el correo ---
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  border: "1px solid #eaeaea",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  color: "#333",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "center" as const,
  color: "#555",
  padding: "0 20px",
};

const codeStyle = {
  fontSize: "32px",
  fontWeight: "bold",
  textAlign: "center" as const,
  color: "#1e88e5",
  letterSpacing: "4px",
  margin: "24px 0",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "200px",
  padding: "12px",
  margin: "0 auto",
};