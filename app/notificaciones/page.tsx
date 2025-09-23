"use client"; 

import { useState, useEffect, useRef } from "react";
import { getCurrentUser } from "../auth/actions";
import { Button } from "@/components/ui/button";
import { Home, Bell, Users, Calendar, Heart, LogOut, User, Settings } from "lucide-react";
import Link from "next/link";

// Forzar que esta página sea dinámica
export const dynamic = "force-dynamic";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "alert" | "done" | "pending" | "reminder";
  date: string;
}

const exampleNotifications: Notification[] = [
  { id: 1, title: "Bienvenida", message: "Has iniciado sesión correctamente.", type: "info", date: "31 Ago 2025" },
  { id: 2, title: "Tarea pendiente", message: "Recuerda enviar tu proyecto antes de las 5 PM.", type: "alert", date: "31 Ago 2025" },
  { id: 3, title: "Evento completado", message: "Tu asistencia al taller fue registrada correctamente.", type: "done", date: "30 Ago 2025" },
  { id: 4, title: "Actualización", message: "Se ha actualizado tu perfil de usuario.", type: "info", date: "29 Ago 2025" },
  { id: 5, title: "Tarea por hacer", message: "Tienes tareas pendientes para hoy.", type: "pending", date: "31 Ago 2025" },
  { id: 6, title: "Recordatorio", message: "No olvides asistir a la reunión de mañana.", type: "reminder", date: "31 Ago 2025" },
];

// === User Menu del Dashboard ===
function UserMenu({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 overflow-hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir menú de usuario"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          user?.firstName?.[0] || "M"
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-semibold text-gray-800 text-sm">{user?.firstName || "María"}</div>
            <div className="text-xs text-gray-500">{user?.email || "voluntario@volunnet.com"}</div>
          </div>
          <Link
            href="/perfil"
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
          >
            <User className="h-4 w-4 text-gray-500" />
            Perfil
          </Link>
          <Link
            href="/configuracion"
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
          >
            <Settings className="h-4 w-4 text-gray-500" />
            Configuración
          </Link>
          <div className="border-t border-gray-100 my-1" />
          <button
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-b-xl transition"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/";
            }}
          >
            <LogOut className="h-4 w-4 text-gray-500" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default function NotificacionesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-semibold">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-3xl shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-700 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para ver tus notificaciones</p>
          <Link href="/login">
            <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg">Iniciar Sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  const filters = [
    { label: "Todas", value: "all", color: "bg-gray-200 text-gray-800" },
    { label: "Informativas", value: "info", color: "bg-blue-100 text-blue-800" },
    { label: "Importantes", value: "alert", color: "bg-red-100 text-red-800" },
    { label: "Completadas", value: "done", color: "bg-green-100 text-green-800" },
    { label: "Pendientes", value: "pending", color: "bg-yellow-100 text-yellow-800" },
    { label: "Recordatorios", value: "reminder", color: "bg-purple-100 text-purple-800" },
  ];

  const filteredNotifications =
    filter === "all"
      ? exampleNotifications
      : exampleNotifications.filter((n) => n.type === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* === MENU DEL DASHBOARD === */}
      <header className="sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
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
          <div className="flex-1 mx-8 max-w-xl">
            <input
              type="text"
              placeholder="Buscar eventos, iglesias..."
              className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-700 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-6">
            <nav className="flex gap-2 text-gray-600 text-sm font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative"
              >
                <Home className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Inicio</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
              <Link
                href="/eventos/buscar"
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative"
              >
                <Calendar className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Eventos</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
              <Link
                href="/comunidad"
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative"
              >
                <Users className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Comunidad</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
              <Link
                href="/notificaciones"
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative"
              >
                <Bell className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Notificaciones</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
            </nav>
            <div className="w-px h-8 bg-gray-200 mx-2" />
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      {/* CONTENIDO NOTIFICACIONES */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filtros */}
        <aside className="space-y-3">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`w-full px-4 py-2 rounded-lg font-semibold text-sm text-left transition shadow-sm ${
                filter === f.value ? f.color + " shadow-md" : "bg-white text-gray-700 hover:" + f.color
              }`}
            >
              {f.label}
            </button>
          ))}
        </aside>

        {/* Lista de notificaciones con estilo mejorado */}
        <section className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotifications.map((n, idx) => (
            <div
              key={n.id}
              className="bg-white/95 backdrop-blur-md border border-gray-100 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-105 overflow-hidden flex flex-col animate-fadeIn"
              style={{ animationDelay: `${idx * 100}ms`, animationFillMode: "forwards" }}
            >
              {/* Header con ícono y tipo */}
              <div
                className={`flex items-center gap-3 px-5 py-3 border-b ${
                  n.type === "info"
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200"
                    : n.type === "alert"
                    ? "bg-gradient-to-r from-red-50 to-red-100 border-red-200"
                    : n.type === "done"
                    ? "bg-gradient-to-r from-green-50 to-green-100 border-green-200"
                    : n.type === "pending"
                    ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200"
                    : "bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200"
                }`}
              >
                <div
                  className={`h-10 w-10 flex items-center justify-center rounded-full shadow-inner text-lg ${
                    n.type === "info"
                      ? "bg-blue-100 text-blue-600"
                      : n.type === "alert"
                      ? "bg-red-100 text-red-600"
                      : n.type === "done"
                      ? "bg-green-100 text-green-600"
                      : n.type === "pending"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-purple-100 text-purple-600"
                  }`}
                >
                  {n.type === "info" && "ℹ️"}
                  {n.type === "alert" && "⚠️"}
                  {n.type === "done" && "✅"}
                  {n.type === "pending" && "⏳"}
                  {n.type === "reminder" && "🔔"}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900 text-sm">{n.title}</h2>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      n.type === "info"
                        ? "bg-blue-100 text-blue-700"
                        : n.type === "alert"
                        ? "bg-red-100 text-red-700"
                        : n.type === "done"
                        ? "bg-green-100 text-green-700"
                        : n.type === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {n.type === "info"
                      ? "Informativa"
                      : n.type === "alert"
                      ? "Importante"
                      : n.type === "done"
                      ? "Completada"
                      : n.type === "pending"
                      ? "Pendiente"
                      : "Recordatorio"}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <p className="text-gray-700 text-sm mb-4">{n.message}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{n.date}</span>
                  <button className="text-white bg-blue-600 hover:bg-blue-700 transition-colors px-3 py-1 rounded-full font-medium">
                    Ver más
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <p className="text-center text-gray-600 font-medium col-span-full">
              No hay notificaciones en esta categoría.
            </p>
          )}
        </section>
      </main>

      {/* Animación Fade In */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          opacity: 0;
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
}
