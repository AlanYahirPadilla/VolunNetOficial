"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = ["Inicio", "Eventos", "Organizaciones", "Acerca de"];

  const termsSections = [
    {
      title: "Bienvenida",
      content: `Términos y Condiciones de VolunNet

Última actualización: septiembre 2025

Bienvenido/a a VolunNet, una plataforma desarrollada como proyecto modular de la Universidad de Guadalajara (CUCEI), cuyo propósito es conectar voluntarios con organizadores de actividades y eventos sociales, culturales, ambientales y comunitarios.

Al registrarte y utilizar esta plataforma, aceptas los presentes Términos y Condiciones. Te pedimos que los leas atentamente antes de continuar.`
    },
    {
      title: "1. Aceptación de los Términos",
      content: `El acceso y uso de VolunNet implica la aceptación plena de estos Términos y Condiciones. Si no estás de acuerdo con alguno de los puntos aquí establecidos, deberás abstenerte de usar la plataforma.`
    },
    {
      title: "2. Objeto de la Plataforma",
      content: `VolunNet tiene como finalidad:

• Facilitar la conexión entre voluntarios y organizadores de actividades.
• Brindar un espacio digital para publicar, consultar y participar en oportunidades de voluntariado.
• VolunNet no garantiza la realización de los eventos ni se hace responsable de los acuerdos entre usuarios.`
    },
    {
      title: "3. Registro de Usuarios",
      content: `Para usar los servicios, los usuarios deben registrarse proporcionando información veraz y actualizada.

Voluntarios: deben comprometerse a asistir puntualmente a las actividades en las que se inscriban.
Organizadores: deben garantizar que las actividades publicadas son reales, legales y seguras para los participantes.`
    },
    {
      title: "4. Responsabilidades del Usuario",
      content: `El usuario se compromete a:

• No usar la plataforma para actividades ilícitas o fraudulentas.
• Respetar la integridad de la comunidad de VolunNet.
• Proporcionar información veraz y actualizada.
Cualquier incumplimiento puede derivar en la suspensión o eliminación de la cuenta.`
    },
    {
      title: "5. Limitación de Responsabilidad",
      content: `VolunNet es una herramienta de enlace. Por lo tanto:

• No es responsable de accidentes, incidentes o incumplimientos ocurridos durante las actividades.
• No garantiza la disponibilidad continua del servicio, aunque se hará todo lo posible para mantenerlo en funcionamiento.`
    },
    {
      title: "6. Transacciones Económicas",
      content: `VolunNet no gestiona, procesa ni permite transacciones de dinero dentro de la plataforma.

La participación en actividades es completamente gratuita.
Cualquier solicitud de dinero, pago o donación entre usuarios queda fuera de la responsabilidad de VolunNet.
Se recomienda a los usuarios reportar inmediatamente cualquier intento de cobro indebido dentro de la plataforma.`
    },
    {
      title: "7. Propiedad Intelectual",
      content: `El contenido de la plataforma, incluyendo diseño, logotipo y código fuente, pertenece a VolunNet. Está prohibida su reproducción total o parcial sin autorización expresa.`
    },
    {
      title: "8. Modificaciones",
      content: `VolunNet se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios serán notificados en la plataforma y entrarán en vigor a partir de su publicación.`
    },
    {
      title: "9. Legislación Aplicable",
      content: `Estos Términos y Condiciones se rigen por las leyes mexicanas. Cualquier controversia será resuelta conforme a la jurisdicción aplicable en Guadalajara, Jalisco.`
    },
    {
      title: "10. Contacto",
      content: `Para cualquier duda, comentario o aclaración respecto a estos Términos y Condiciones, puedes comunicarte al correo oficial:

📧 volunnetoficial@gmail.com`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative flex flex-col">
      {/* Header */}
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-md shadow-md" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => router.push("/")}
          >
            <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VolunNet
            </span>
          </button>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(" ", "-") === "inicio" ? "" : item.toLowerCase().replace(" ", "-")}`}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex space-x-3">
            <Button variant="outline" className="rounded-full px-6" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button className="rounded-full px-6 bg-gradient-to-r from-blue-600 to-purple-600" asChild>
              <Link href="/registro">Registrarse</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t z-50">
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase().replace(" ", "-") === "inicio" ? "" : item.toLowerCase().replace(" ", "-")}`}
                  className="text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-2 border-t">
                <Button variant="outline" asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600" asChild>
                  <Link href="/registro">Registrarse</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Title */}
      <section className="pt-32 pb-12 text-center relative overflow-visible">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-blob will-change-transform"></div>
        <div className="absolute top-1/4 right-20 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-blob animation-delay-2000 will-change-transform"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl animate-blob animation-delay-4000 will-change-transform"></div>

        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -30, rotate: -5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 1 }}
        >
          Términos y Condiciones
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Bienvenido a VolunNet. Por favor, lee atentamente nuestros términos.
        </motion.p>
      </section>

      {/* Terms Sections */}
      <main className="container mx-auto px-4 max-w-4xl space-y-6 pb-24 relative z-20">
        {termsSections.map((section, index) => (
          <motion.div
            key={index}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b-2 border-gradient-to-r from-blue-600 to-purple-600 inline-block pb-1">
              {section.title}
            </h2>
            <p className="text-gray-700 whitespace-pre-line">{section.content}</p>
          </motion.div>
        ))}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md py-6 text-center mt-auto shadow-inner relative z-20">
        <p className="text-gray-700 font-medium">
          © 2025 VolunNet - CUCEI. Todos los derechos reservados. 💜
        </p>
      </footer>

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
