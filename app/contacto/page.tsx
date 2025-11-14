"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Heart, Menu, X, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ContactoPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const team = [
    {
      name: "Mirella Gómez",
      role: "Frontend Developer",
      image: "/img/mirella.jpg",
      description:
        "Encargada del desarrollo visual y experiencia de usuario de la plataforma VolunNet, asegurando interfaces modernas y responsivas.",
      facebook: "https://www.facebook.com/share/1Gm7yoPxYB/",
    },
    {
      name: "Yahir Padilla",
      role: "Backend Developer",
      image: "/img/yahir.jpg",
      description:
        "Desarrolla la lógica del servidor, APIs y la integración con bases de datos para garantizar la escalabilidad y seguridad del sistema.",
      facebook: "https://www.facebook.com/yahir.venegas.353?mibextid=ZbWKwL",
    },
    {
      name: "Danae Torres",
      role: "Project Manager",
      image: "/img/dana.jpg",
      description:
        "Coordina las tareas, tiempos y recursos del proyecto, asegurando que el equipo cumpla con los objetivos y estándares de calidad.",
      facebook: "https://www.facebook.com/dana.torres.44995/?locale=es_LA",
    },
  ]

  const menuItems = ["Inicio", "Eventos", "Organizaciones", "Acerca de"] // Contacto removido

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden flex flex-col">
      {/* Header */}
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
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VolunNet
              </span>
            </button>
          </div>

          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link
                  href={`/${item.toLowerCase().replace(" ", "-") === "inicio" ? "" : item.toLowerCase().replace(" ", "-")}`}
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

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase().replace(" ", "-") === "inicio" ? "" : item.toLowerCase().replace(" ", "-")}`}
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

      {/* Hero */}
      <section className="relative pt-32 pb-20 text-center overflow-hidden">
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -30, rotate: -5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 1 }}
        >
          Nuestro Equipo
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Conoce a las personas que hacen posible VolunNet.
        </motion.p>
      </section>

      {/* Team Section */}
      <main className="container mx-auto px-4 py-16 relative flex-1">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-1/4 right-20 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <motion.div
          className="grid md:grid-cols-3 gap-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.3 } } }}
        >
          {team.map((member, index) => (
            <motion.div
              key={index}
              variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } }}
            >
              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl hover:shadow-4xl transition transform hover:-translate-y-2 flex flex-col items-center text-center group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 rounded-3xl transition-all duration-500 blur-2xl"></div>

                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-3xl opacity-60 group-hover:scale-105 transition-transform duration-500"></div>
                  <img
                  src={member.image}
                  alt={member.name}
                  className={`w-42 h-40 md:w-40 md:h-40 rounded-full border-4 border-white relative z-10 shadow-lg shadow-blue-300/50 transition-transform duration-500 group-hover:scale-105 
                  ${member.name === "Danae Torres" ? "object-top" : "object-cover"}`}
                  />
                </div>

                <h4 className="text-xl font-bold">{member.name}</h4>
                <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                <p className="text-gray-700 mb-4">{member.description}</p>

                <div className="flex space-x-4">
                  <a
                    href={member.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:scale-125 hover:text-blue-400 transition transform shadow-lg hover:shadow-blue-300/50 rounded-full p-2"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md py-6 text-center mt-auto shadow-inner">
        <p className="text-gray-700 font-medium">
          © 2025 VolunNet - CUCEI. Todos los derechos reservados. 💜
        </p>
      </footer>

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
  )
}
