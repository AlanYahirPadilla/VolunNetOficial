"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function AcercaDePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden relative">
      {/* Blobs de fondo */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/4 right-20 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* HEADER */}
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          mounted && scrolled ? "bg-white/90 backdrop-blur-md shadow-md" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 focus:outline-none"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
              title="Ir al inicio"
              onClick={() => router.push("/")}
            >
              <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VolunNet
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {["Inicio", "Eventos", "Organizaciones", "Acerca de"].map((item) => (
              <motion.div key={item} whileHover={{ scale: 1.05 }}>
                <Link
                  href={item === "Inicio" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`}
                  className="text-gray-700 hover:text-blue-600 transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="hidden md:flex space-x-3">
            <Button variant="outline" className="rounded-full px-6" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button
              className="rounded-full px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0"
              asChild
            >
              <Link href="/registro">Registrarse</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {["Inicio", "Eventos", "Organizaciones", "Acerca de"].map((item) => (
                <Link
                  key={item}
                  href={item === "Inicio" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`}
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-2 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600" asChild>
                  <Link href="/registro">Registrarse</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* HERO */}
      <section className="text-center pt-36 pb-12">
        <h1 className="text-5xl font-extrabold text-purple-700 mb-4 animate-gradient">
          Acerca de VolunNet
        </h1>
        <p className="text-gray-700 text-lg max-w-2xl mx-auto">
          VolunNet es una plataforma dedicada a conectar personas con oportunidades de voluntariado, promoviendo la participación activa en proyectos sociales y comunitarios. Nuestra misión es fomentar la colaboración, el compromiso social y la creación de comunidades más solidarias.
        </p>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-[#7B61FF] mb-4">Nuestra Misión</h2>
          <p className="text-gray-700 mb-4">
            En <strong>VolunNet</strong>, creemos en el poder de la solidaridad.
            Nuestra misión es ser un puente entre quienes desean aportar su
            tiempo, talento y pasión por ayudar, y las organizaciones que
            trabajan incansablemente por causas que impactan a nuestra sociedad.
          </p>
          <p className="text-gray-700 mb-4">
            Buscamos fomentar una cultura de voluntariado accesible, incluyente
            y significativa. Soñamos con una comunidad activa que no solo
            observe los problemas sociales, sino que participe activamente en la
            construcción de soluciones sostenibles.
          </p>
          <p className="text-gray-700 mb-6">
            Cada acción cuenta. Ya sea plantando un árbol, ayudando a un niño a
            leer o rescatando un animal, cada voluntario forma parte del cambio
            que el mundo necesita.
          </p>

          <h2 className="text-2xl font-bold text-[#7B61FF] mb-4">¿Qué hacemos?</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-3">
            <li><strong>Difusión de causas:</strong> Promovemos campañas y actividades de organizaciones sin fines de lucro.</li>
            <li><strong>Conexión con voluntarios:</strong> Creamos un espacio donde voluntarios pueden explorar oportunidades alineadas con sus intereses.</li>
            <li><strong>Plataforma de registro:</strong> Herramientas para que las organizaciones publiquen eventos y gestionen voluntarios.</li>
            <li><strong>Educación y sensibilización:</strong> Compartimos contenido sobre problemáticas sociales, ambientales y educativas.</li>
            <li><strong>Reconocimiento:</strong> Medallas digitales, certificados y estadísticas para motivar a los voluntarios.</li>
          </ul>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-2xl">
          <Image
            src="/img/acercade.jpg"
            alt="Personas voluntariando"
            width={800}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>
      </main>

      <div className="border-t border-white-800 mt-7 pt-8 text-center text-black-400">
        <p>&copy; 2025 VolunNet - CUCEI. Todos los derechos reservados.💜 </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 8s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background: linear-gradient(90deg, #7e22ce, #3b82f6, #ec4899);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientMove 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
