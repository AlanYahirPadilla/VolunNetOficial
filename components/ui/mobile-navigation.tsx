"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Home, Calendar, Users, Bell, User, Settings, LogOut, Heart, Search, Bug, FileText } from "lucide-react"
import Link from "next/link"
import { Button } from "./button"
import { useRouter } from "next/navigation"

interface MobileNavigationProps {
  user?: any
  unreadCount?: number
  currentPath?: string
}

export function MobileNavigation({ user, unreadCount = 0, currentPath = "" }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Función para obtener la URL de configuración basada en el rol del usuario
  const getConfigUrl = () => {
    if (user?.role === 'ORGANIZATION') {
      return '/organizaciones/configuracion';
    }
    return '/configuracion';
  };

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsOpen(false)
  }, [currentPath])

  // Cerrar menú al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isOpen])

  const navigationItems = [
    { href: "/dashboard", label: "Inicio", icon: Home },
    { href: "/eventos/buscar", label: "Eventos", icon: Calendar },
    { href: "/certificados", label: "Certificados", icon: FileText },
    { href: "/comunidad", label: "Comunidad", icon: Users },
    { href: "/notificaciones", label: "Notificaciones", icon: Bell, badge: unreadCount },
  ]

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const menuContent = (
    <AnimatePresence>
      {isOpen && mounted && (
          <>
            {/* Fondo oscuro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[99999] md:hidden"
              onClick={() => setIsOpen(false)}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Panel del menú lateral */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl z-[99999] md:hidden overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'fixed' }}
            >
              <div className="flex flex-col h-full min-h-screen">
                {/* Header del menú mejorado */}
                <div className="relative p-6 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 text-white flex-shrink-0">
                  {/* Patrón de fondo */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.2)_1px,transparent_0)] bg-[length:20px_20px]"></div>
                  </div>
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Heart className="h-6 w-6 text-white fill-white/30" />
                      </div>
                      <div>
                        <span className="text-xl font-bold text-white">
                          VolunNet
                        </span>
                        <p className="text-blue-100 text-sm">Tu plataforma de voluntariado</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 touch-manipulation text-white hover:bg-white/20 rounded-xl"
                      aria-label="Cerrar menú"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Navegación principal mejorada */}
                <div className="flex-1 overflow-y-auto bg-gray-50/50 pb-20">
                  <nav className="p-4 space-y-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                      Navegación
                    </div>
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      const isActive = currentPath === item.href
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 touch-manipulation min-h-touch group ${
                            isActive 
                              ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-md" 
                              : "text-gray-700 hover:bg-white hover:shadow-md hover:shadow-gray-200/50"
                          }`}
                        >
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                            isActive 
                              ? "bg-white/20" 
                              : "bg-gray-100 group-hover:bg-blue-100"
                          }`}>
                            <Icon className={`h-5 w-5 transition-colors duration-200 ${
                              isActive ? "text-white" : "text-gray-600 group-hover:text-blue-600"
                            }`} />
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-sm">{item.label}</span>
                            {item.badge && item.badge > 0 && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                  {item.badge > 9 ? '9+' : item.badge}
                                </span>
                                <span className="text-xs text-gray-500">notificaciones</span>
                              </div>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </nav>

                  {/* Sección de usuario mejorada */}
                  {user && (
                    <div className="border-t border-gray-200/50 p-4 bg-white">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                        Mi Cuenta
                      </div>
                      
                      {/* Información del usuario */}
                      <div className="flex items-center gap-4 px-4 py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl mb-4 border border-blue-100">
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-lg">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.role === 'VOLUNTEER' ? 'Voluntario' : 'Organización'}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600 font-medium">En línea</span>
                          </div>
                        </div>
                      </div>

                      {/* Enlaces de usuario */}
                      <div className="space-y-2">
                        <Link
                          href="/perfil"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 touch-manipulation min-h-touch group"
                        >
                          <div className="h-10 w-10 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors duration-200">
                            <User className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                          </div>
                          <span className="font-semibold text-sm">Mi Perfil</span>
                        </Link>
                        <Link
                          href={getConfigUrl()}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 touch-manipulation min-h-touch group"
                        >
                          <div className="h-10 w-10 rounded-xl bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors duration-200">
                            <Settings className="h-5 w-5 text-gray-600 group-hover:text-purple-600" />
                          </div>
                          <span className="font-semibold text-sm">Configuración</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 touch-manipulation min-h-touch w-full group"
                        >
                          <div className="h-10 w-10 rounded-xl bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-colors duration-200">
                            <LogOut className="h-5 w-5 text-gray-600 group-hover:text-red-600" />
                          </div>
                          <span className="font-semibold text-sm">Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Botones de autenticación para usuarios no logueados mejorados */}
                  {!user && (
                    <div className="border-t border-gray-200/50 p-4 bg-white">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                        Acceso
                      </div>
                      <div className="space-y-3">
                        <Link
                          href="/login"
                          onClick={() => setIsOpen(false)}
                          className="block w-full"
                        >
                          <Button
                            variant="outline"
                            className="w-full touch-manipulation min-h-touch border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 rounded-xl"
                          >
                            Iniciar Sesión
                          </Button>
                        </Link>
                        <Link
                          href="/registro"
                          onClick={() => setIsOpen(false)}
                          className="block w-full"
                        >
                          <Button
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 touch-manipulation min-h-touch rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            Registrarse
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
  )

  return (
    <>
      {/* Botón del menú hamburguesa */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="md:hidden h-10 w-10 touch-manipulation"
        aria-label="Abrir menú de navegación"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Renderizar el menú en un portal */}
      {mounted && typeof document !== 'undefined' && createPortal(menuContent, document.body)}
    </>
  )
}