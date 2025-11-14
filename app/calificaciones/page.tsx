"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { getCurrentUser } from "../auth/actions"

// Forzar que esta página sea dinámica
export const dynamic = 'force-dynamic'
import { RatingModal } from "@/components/RatingModal/RatingModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Calendar, MapPin, Users, Heart, Home, Bell, LogOut, User, Settings } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { MobileNavigation } from "@/components/ui/mobile-navigation"
import { BottomNavigation } from "@/components/ui/bottom-navigation"

interface RatingPendingEvent {
  id: string
  event: {
    id: string
    title: string
    description: string
    city: string
    state: string
    startDate: string
    endDate?: string
    status: string
    organization: {
      id: string
      name: string
    }
  }
  status: string
  volunteerId: string
}

function UserMenu({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-600 font-bold shadow-md hover:scale-105 transition"
        onClick={() => setOpen((v) => !v)}
      >
        {user?.firstName?.[0] || 'M'}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="font-semibold text-gray-800 text-sm">{user?.firstName || 'María'} {user?.lastName || 'González'}</div>
            <div className="text-xs text-gray-500">{user?.email || 'voluntario@volunnet.com'}</div>
          </div>
          <Link href="/perfil" className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
            <User className="h-4 w-4 text-gray-500" /> Perfil
          </Link>
          <Link href="/configuracion" className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
            <Settings className="h-4 w-4 text-gray-500" /> Configuración
          </Link>
          <div className="border-t border-gray-100 my-1" />
          <button
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
            onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/"; }}
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </motion.div>
      )}
    </div>
  )
}

function CalificacionesContent() {
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<RatingPendingEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<RatingPendingEvent | null>(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [eventIdFromUrl, setEventIdFromUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    const eventId = searchParams.get('eventId')
    if (eventId) {
      setEventIdFromUrl(eventId)
    }
  }, [searchParams])

  useEffect(() => {
    if (user) {
      loadRatingPendingEvents()
    }
  }, [user])

  const loadRatingPendingEvents = async () => {
    try {
      console.log("🔄 Cargando eventos para calificar...")
      const response = await fetch('/api/events/apply', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        console.log("📋 Datos recibidos:", JSON.stringify(data, null, 2))
        
        if (data.applications && data.applications.length > 0) {
          // Filtrar solo eventos completados que no han sido calificados
          const completedApplications = data.applications.filter((app: any) => {
            const isCompleted = app.status === 'COMPLETED'
            const notRated = app.rating === null || app.rating === undefined
            console.log(`📋 App: ${app.event?.title} | Status: ${app.status} | Rating: ${app.rating} | Incluir: ${isCompleted && notRated}`)
            return isCompleted && notRated
          })
          
          console.log(`✅ Aplicaciones completadas sin calificar: ${completedApplications.length}`)
          
          const eventsData = completedApplications.map((app: any) => ({
            id: app.id,
            event: {
              id: app.event?.id || 'unknown',
              title: app.event?.title || 'Evento sin título',
              description: app.event?.description || 'Sin descripción',
              city: 'Guadalajara', // Por defecto hasta tener más datos
              state: 'Jalisco',
              startDate: app.event?.startDate || new Date().toISOString(),
              endDate: app.event?.endDate || new Date().toISOString(),
              status: app.status,
              organization: {
                id: app.event?.organization?.id || 'org_unknown',
                name: app.event?.organization?.name || 'Organización no especificada'
              }
            },
            status: 'COMPLETED',
            volunteerId: user?.id || ''
          }))

          console.log("🎯 Eventos para calificar:", eventsData.map(e => e.event.title))
          setEvents(eventsData)

          if (eventIdFromUrl) {
            const eventToRate = eventsData.find((e: RatingPendingEvent) => e.event.id === eventIdFromUrl)
            if (eventToRate) {
              setSelectedEvent(eventToRate)
              setShowRatingModal(true)
              setEventIdFromUrl(null)
            }
          }
        } else {
          console.log("📋 No hay aplicaciones")
          setEvents([])
        }
      } else {
        console.error("❌ Error en la respuesta de la API:", response.status)
        setEvents([])
      }
    } catch (error) {
      console.error("❌ Error loading rating pending events:", error)
      setEvents([])
    }
  }

  const handleRateEvent = (event: RatingPendingEvent) => {
    setSelectedEvent(event)
    setShowRatingModal(true)
  }

  const handleRatingComplete = () => {
    setShowRatingModal(false)
    setSelectedEvent(null)
    loadRatingPendingEvents()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50"><div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">Debes iniciar sesión para continuar</p>
          <Link href="/login"><Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">Iniciar Sesión</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col pb-nav-mobile">
      {/* HEADER SUPERIOR */}
      <div className="sticky top-0 z-30 bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Heart className="h-6 w-6 md:h-8 md:w-8 text-blue-600 fill-blue-200" />
            <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VolunNet</span>
          </Link>
          
          {/* Buscador - Solo desktop */}
          <div className="hidden lg:flex flex-1 mx-8 max-w-xl">
            <input type="text" placeholder="Buscar eventos, iglesias..." className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-blue-200 bg-gray-50 shadow-sm" />
          </div>
          
          {/* Navegación desktop */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-2 text-gray-600 text-sm font-medium">
              <Link href="/dashboard" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50">
                <Home className="h-5 w-5" /> Inicio
              </Link>
              <Link href="/eventos/buscar" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50">
                <Calendar className="h-5 w-5" /> Eventos
              </Link>
              <Link href="/comunidad" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-blue-50 hover:text-blue-700">
                <Users className="h-5 w-5" /> Comunidad
              </Link>
              <Link href="/notificaciones" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-blue-50 hover:text-blue-700">
                <Bell className="h-5 w-5" /> Notificaciones
              </Link>
            </nav>
            <UserMenu user={user} />
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <MobileNavigation user={user} currentPath="/calificaciones" />
          </div>
        </div>
      </div>

      {/* CONTENIDO CENTRADO */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-5xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center justify-center gap-2 md:gap-3 text-gray-900"
          >
            <Star className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" /> Calificaciones
          </motion.h2>

          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100 mx-auto max-w-xl"
            >
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay eventos pendientes de calificación</h3>
              <p className="text-gray-600 mb-6">Los eventos completados aparecerán aquí para calificarlos</p>
              <Link href="/dashboard"><Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">Volver al Dashboard</Button></Link>
            </motion.div>
          ) : (
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center">
              {events.map((eventItem, idx) => (
                <motion.div
                  key={eventItem.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white border border-gray-100 rounded-3xl shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col"
                >
                  {/* Header con gradiente y patrón */}
                  <div className="relative h-32 sm:h-40 flex items-center justify-center" style={{ background: `linear-gradient(90deg, #fef3c7, #fed7aa, #fecaca)` }}>
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow">
                      Calificación Pendiente
                    </span>
                    
                    {/* Patrón de estrellas */}
                    <div className="absolute inset-0 overflow-hidden">
                      {Array.from({length:36}).map((_,i)=>{ 
                        const r=(s:number)=>{let x=Math.sin(s)*10000;return x-Math.floor(x)}; 
                        const r1=r(i+1), r2=r((i+1)*2), r3=r((i+1)*3); 
                        const size=16+Math.floor(r1*44); 
                        const left=Math.floor(r2*100); 
                        const top=Math.floor(r3*100); 
                        const opacity=0.05 + r1*0.15; 
                        const rotate=Math.floor((r2-0.5)*30); 
                        return (
                          <span key={i} className="absolute select-none" style={{left:`${left}%`, top:`${top}%`, fontSize:`${size}px`, opacity, transform:`translate(-50%, -50%) rotate(${rotate}deg)`}}>⭐</span>
                        )
                      })}
                    </div>
                    
                    {/* Ícono central */}
                    <div className="relative text-4xl sm:text-6xl animate-pulse">⭐</div>
                  </div>

                  <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                        <span className="line-clamp-2">{eventItem.event.title}</span>
                        <span className="px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-medium self-start sm:self-auto whitespace-nowrap">
                          ⭐ Pendiente
                        </span>
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3">
                        Evento completado - {eventItem.event.organization.name}
                      </p>

                      <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3">
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{new Date(eventItem.event.startDate).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </span>
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                          <span className="truncate">{eventItem.event.organization.name}</span>
                        </span>
                        <span className="flex items-center gap-0.5 sm:gap-1">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
                          <span className="truncate">{eventItem.event.city}, {eventItem.event.state}</span>
                        </span>
                      </div>

                      {/* Barra de progreso de calificación */}
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-3">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all animate-pulse" style={{ width: '100%' }} />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <Button 
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm" 
                        onClick={() => handleRateEvent(eventItem)}
                      >
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-pulse" /> Calificar Evento
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline" 
                        className="rounded-full px-4 sm:px-5 py-2 font-semibold border-gray-300 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
                        onClick={() => window.location.href = `/eventos/${eventItem.event.id}`}
                      >
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation - Solo móvil */}
      <BottomNavigation currentPath="/calificaciones" />

      {/* MODAL DE CALIFICACIÓN */}
      {showRatingModal && selectedEvent && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          event={{
            id: selectedEvent.event.id,
            title: selectedEvent.event.title,
            startDate: selectedEvent.event.startDate,
            endDate: selectedEvent.event.endDate || selectedEvent.event.startDate
          }}
          userToRate={{
            id: selectedEvent.event.organization.id,
            name: selectedEvent.event.organization.name,
            role: 'ORGANIZATION'
          }}
          onSubmit={async (rating, feedback) => {
            try {
              const response = await fetch(`/api/events/${selectedEvent.event.id}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  volunteerId: user.id,
                  rating,
                  comment: feedback,
                  type: 'VOLUNTEER_TO_ORGANIZATION'
                })
              })
              if (response.ok) {
                handleRatingComplete()
              } else {
                const errorText = await response.text()
                console.error('❌ Error submitting rating:', response.status, errorText)
              }
            } catch (error) {
              console.error('❌ Error submitting rating:', error)
            }
          }}
        />
      )}
    </div>
  )
}

export default function CalificacionesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <CalificacionesContent />
    </Suspense>
  )
}
