"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MobileNavigation } from "@/components/ui/mobile-navigation";
import {
  Heart,
  Calendar,
  MapPin,
  Users,
  Building2,
  Info,
} from "lucide-react";
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

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  city: string;
  state: string;
  participantsCount: number;
  maxVolunteers: number;
  organization?: { name: string };
  emoji?: string;
  type?: string;
}

export default function EventosFinalizadosPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const menuItems = ["Inicio", "Eventos", "Organizaciones", "Acerca de"];

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/finalizados");
        if (!res.ok) throw new Error("Error al cargar eventos");
        const data = await res.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
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
      {/* Header */}
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
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
              title="Ir al inicio"
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
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
                  href={`/${
                    item.toLowerCase().replace(" ", "-") === "inicio"
                      ? ""
                      : item.toLowerCase().replace(" ", "-")
                  }`}
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

          {/* Professional Mobile Navigation */}
          <div className="md:hidden">
            <MobileNavigation currentPath="/eventos" />
          </div>
        </div>

      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 text-center overflow-hidden">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg"
          initial={{ opacity: 0, y: -30, rotate: -5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 1 }}
        >
          Eventos Finalizados
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Conoce todos los eventos que ya concluyeron y revive la magia de cada uno de ellos ✨
        </motion.p>
      </section>

      {/* Main content */}
      <main className="container mx-auto px-4 py-16 relative flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {events.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="transition-transform duration-300"
            >
              <Card className="overflow-hidden rounded-3xl border border-purple-200 shadow-xl bg-white/70 backdrop-blur-xl hover:shadow-2xl transition">
                {/* Fondo animado con emojis flotantes */}
                <div className="relative w-full h-52 flex items-center justify-center overflow-hidden bg-gradient-to-r from-purple-50 to-blue-50">
                  <motion.div
                    className="absolute inset-0 grid grid-cols-6 gap-6 opacity-15 text-4xl select-none pointer-events-none"
                    animate={{ y: [0, 20, -10, 0] }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {Array.from({ length: 36 }).map((_, i) => (
                      <span key={i} className="flex items-center justify-center">
                        {event.emoji}
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
                    {event.emoji}
                  </motion.span>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-bold text-black-700">
                        {event.title}
                      </CardTitle>
                      {event.type && (
                        <Badge className="bg-blue-100 text-blue-800 font-semibold mt-2">
                          {event.type}
                        </Badge>
                      )}
                    </div>
                    <Badge className="bg-purple-200 text-purple-900 font-semibold px-2 py-1 shadow-sm">
                      Finalizado
                    </Badge>
                  </div>

                  <p className="text-gray-600 leading-relaxed border-t pt-3 italic">
                    “{event.description}”
                  </p>

                  <div className="space-y-2 text-sm text-purple-700 border-t pt-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />{" "}
                      {event.organization?.name || "Organización desconocida"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />{" "}
                      {new Date(event.startDate).toLocaleDateString()} -{" "}
                      {new Date(event.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> {event.city}, {event.state}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> {event.participantsCount}/
                      {event.maxVolunteers} voluntarios
                    </div>
                  </div>

                  {/* Botón que abre modal */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="mt-4 w-full flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl">
                        <Info className="h-4 w-4" /> Ver más
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl rounded-2xl shadow-2xl bg-white/90 backdrop-blur-xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-purple-800 flex items-center gap-2">
                          {event.emoji} {event.title}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                          Detalles completos del evento finalizado
                        </DialogDescription>
                      </DialogHeader>

                      <div className="mt-6 space-y-6 text-sm text-gray-700">
                        {/* Descripción */}
                        <div>
                          <h3 className="font-semibold text-purple-700 mb-1">
                            Descripción
                          </h3>
                          <p className="italic">{event.description}</p>
                        </div>

                        {/* Organización */}
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-purple-600" />
                          <span>
                            <strong>Organización:</strong>{" "}
                            {event.organization?.name || "Desconocida"}
                          </span>
                        </div>

                        {/* Fechas */}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-purple-600" />
                          <span>
                            <strong>Duración:</strong>{" "}
                            {new Date(event.startDate).toLocaleDateString()} –{" "}
                            {new Date(event.endDate).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Ubicación */}
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-purple-600" />
                          <span>
                            <strong>Lugar:</strong> {event.city}, {event.state}
                          </span>
                        </div>

                        {/* Tipo de evento */}
                        {event.type && (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-100 text-blue-800 border border-blue-300">
                              {event.type}
                            </Badge>
                          </div>
                        )}

                        {/* Participación */}
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-purple-600" />
                          <span>
                            <strong>Voluntarios:</strong>{" "}
                            {event.participantsCount}/{event.maxVolunteers}
                          </span>
                        </div>

                        {/* Mensaje final */}
                        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 text-center">
                          🎉 ¡Gracias a todos los que participaron en este
                          evento y lo hicieron posible!
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
      <div className="border-t border-white-800 mt-8 pt-8 text-center text-black-400">
        <p>&copy; 2025 VolunNet - CUCEI. Todos los derechos reservados.💜 </p>
      </div>
    </div>
  );
}
