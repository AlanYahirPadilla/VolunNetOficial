"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Menu, X, Info, Mail, MapPin, Layers } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Organizacion {
  id: number;
  nombre: string;
  descripcion: string;
  emoji: string;
  email?: string;
  address?: string;
  areas?: string;
}

export default function OrganizacionesPage() {
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = ["Inicio", "Eventos", "Organizaciones", "Acerca de"];

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/organizacionespublic")
      .then((res) => res.json())
      .then((data) => {
        setOrganizaciones(data.organizaciones || []);
      })
      .catch((err) => console.error("Error al cargar organizaciones:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden flex flex-col">
      {/* ===== HEADER ===== */}
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          mounted && scrolled
            ? "bg-white/90 backdrop-blur-md shadow-md"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 focus:outline-none"
              onClick={() => router.push("/")}
            >
              <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VolunNet
              </span>
            </button>
          </div>

          {/* Desktop Nav */}
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
                  href={`/${
                    item.toLowerCase().replace(" ", "-") === "inicio"
                      ? ""
                      : item.toLowerCase().replace(" ", "-")
                  }`}
                  className={`transition-colors relative group ${
                    pathname.includes(item.toLowerCase())
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex space-x-3">
            <Button variant="outline" className="rounded-full px-6" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button className="rounded-full px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
              <Link href="/registro">Registrarse</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item}
                  href={`/${
                    item.toLowerCase().replace(" ", "-") === "inicio"
                      ? ""
                      : item.toLowerCase().replace(" ", "-")
                  }`}
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

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-20 text-center overflow-hidden">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Organizaciones
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Descubre las organizaciones que forman parte de VolunNet 🌍
        </motion.p>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <main className="container mx-auto px-4 py-16 relative flex-1">
        {organizaciones.length === 0 ? (
          <p className="text-center text-gray-600">
            No hay organizaciones registradas.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {organizaciones.map((org, idx) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className="overflow-hidden rounded-3xl border border-purple-200 shadow-xl bg-white/70 backdrop-blur-xl hover:shadow-2xl transition">
                  {/* 🔹 Emoji animado */}
                  <div className="relative w-full h-40 flex items-center justify-center overflow-hidden bg-gradient-to-r from-purple-50 to-blue-50">
                    <motion.div
                      className="absolute inset-0 grid grid-cols-6 gap-6 opacity-20 text-4xl select-none pointer-events-none"
                      animate={{ y: [0, 20, -10, 0] }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {Array.from({ length: 36 }).map((_, i) => (
                        <span key={i} className="flex items-center justify-center">
                          {org.emoji}
                        </span>
                      ))}
                    </motion.div>
                    <motion.span
                      className="relative text-7xl z-10"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {org.emoji}
                    </motion.span>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-2xl font-bold text-gray-800">
                        {org.nombre}
                      </CardTitle>
                      <Badge className="bg-blue-100 text-blue-800 font-semibold">
                        Activa
                      </Badge>
                    </div>

                    <p className="text-gray-600 leading-relaxed border-t pt-3">
                      {org.descripcion}
                    </p>

                    {/* Modal con más información */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="mt-4 w-full flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl">
                          <Info className="h-4 w-4" /> Ver más
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl rounded-2xl shadow-2xl bg-white/90 backdrop-blur-xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-purple-800 flex items-center gap-2">
                            {org.emoji} {org.nombre}
                          </DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Detalles de la organización
                          </DialogDescription>
                        </DialogHeader>

                        <div className="mt-6 space-y-4 text-sm text-gray-700">
                          {org.descripcion && (
                            <div>
                              <h3 className="font-semibold text-purple-700 mb-1">
                                Descripción
                              </h3>
                              <p>{org.descripcion}</p>
                            </div>
                          )}
                          {org.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-5 w-5 text-purple-600" />
                              <span>{org.email}</span>
                            </div>
                          )}
                          {org.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-purple-600" />
                              <span>{org.address}</span>
                            </div>
                          )}
                          {org.areas && (
                            <div className="flex items-center gap-2">
                              <Layers className="h-5 w-5 text-purple-600" />
                              <span>{org.areas}</span>
                            </div>
                          )}

                          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 text-center">
                            💡 ¡Súmate a las iniciativas de esta organización y sé parte del cambio!
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* ===== FOOTER ===== */}
        <div className="border-t border-white-800 mt-8 pt-8 text-center text-black-400">
        <p>&copy; 2025 VolunNet - CUCEI. Todos los derechos reservados.💜 </p>
      </div>
    </div>
  );
}
