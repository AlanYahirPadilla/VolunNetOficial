"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { TopHeader } from "@/components/dashboard/top-header"
import { EnhancedSidebar } from "@/components/dashboard/enhanced-sidebar"
import { CustomWidgets } from "@/components/dashboard/custom-widgets"
import { EventCard } from "@/components/dashboard/event-card"
import { CalendarView } from "@/components/dashboard/calendar-view"
import { Star, Heart, Home, Calendar, Users, Bell, LogOut, User, Settings, Search, FileText } from "lucide-react"
import Link from "next/link"
import { getPersonalizedRecommendations, getUserStats, getRecentNotifications, getRecentCompletedEvents } from "./actions"
import { getCurrentUser } from "../auth/actions"
import { AdaptiveLoading } from "@/components/ui/adaptive-loading"
import { safeAsync, logError, safeStateUpdate, safeFetch } from "@/lib/error-utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ApplicationStatusBadge } from "@/components/ui/application-status-badge"
import { SimpleRecommendations } from "@/components/dashboard/SimpleRecommendations"
import { AIEnhancedRecommendations } from "@/components/dashboard/AIEnhancedRecommendations"
import { DebugRecommendations } from "@/components/dashboard/DebugRecommendations"
import { ChatNotificationManager } from "@/components/notifications/ChatNotificationManager"
import { NotificationTest } from "@/components/notifications/NotificationTest"
import { NotificationDebugPanel } from "@/components/notifications/NotificationDebugPanel"
import { MessageSimulator } from "@/components/notifications/MessageSimulator"
import { MobileNavigation } from "@/components/ui/mobile-navigation"
import { BottomNavigation } from "@/components/ui/bottom-navigation"

interface Event {
  id: string
  title: string
  description: string
  organization_name: string
  city: string
  state: string
  start_date: string
  end_date?: string
  max_volunteers: number
  current_volunteers: number
  category_name: string
  skills: string[]
  recommendation_score?: number
  recommendation_reasons?: string[]
  hasApplied?: boolean
  applicationStatus?: string
  rating?: number | null
  feedback?: string | null
  applicationId?: string
  formattedDate?: string
}

interface UserStats {
  total_applications: number
  accepted_applications: number
  completed_events: number
  total_hours: number
  favorite_categories: string[]
  averageRating?: number;
  eventsParticipated?: number;
  hoursCompleted?: number;
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  created_at: string
  read: boolean
}

// Agrega el tipo explícito para los pasos de carga
type LoadingStepStatus = "loading" | "pending" | "completed" | "error";
interface LoadingStep {
  id: string;
  label: string;
  status: LoadingStepStatus;
}

// Dashboard Error Boundary Component
function DashboardErrorBoundary({ children }: { children: any }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

export default function Dashboard() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [completedEvents, setCompletedEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [voluntario, setVoluntario] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    { id: "user", label: "Cargando información del usuario", status: "loading" },
    { id: "stats", label: "Obteniendo estadísticas", status: "pending" },
    { id: "events", label: "Buscando eventos recomendados", status: "pending" },
    { id: "notifications", label: "Cargando notificaciones", status: "pending" },
  ])
// Estados para el modal de postulación
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [applicationStatus, setApplicationStatus] = useState<'checking' | 'already-applied' | 'can-apply' | 'applying' | 'success' | 'error'>('checking')
  const [modalMessage, setModalMessage] = useState('')

  // Use refs to prevent double effect execution
  const isInitialized = useRef(false)
  const abortController = useRef<AbortController | null>(null)

  const updateLoadingStep = useCallback((stepId: string, status: "loading" | "completed" | "error") => {
    setLoadingSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status } : step)))
  }, [])

 const loadMyEvents = useCallback(async () => {
  try {
    console.log("🔄 Cargando MIS EVENTOS (aceptados y completados)...")
    const response = await safeFetch("/api/events/apply", { 
      credentials: "include",
      signal: abortController.current?.signal
    }, 8000)
    
    if (response.ok) {
      const data = await response.json()
      console.log("📋 DATOS PARA MIS EVENTOS:", JSON.stringify(data, null, 2))
      
      if (data.applications && data.applications.length > 0) {
        const acceptedApplications = data.applications.filter((app: any) => {
          const isAccepted = app.status === 'ACCEPTED'
          console.log(`📋 MIS EVENTOS - App: ${app.event?.title} | Status: ${app.status} | Incluir: ${isAccepted}`)
          return isAccepted
        })
        
        const completedApplications = data.applications.filter((app: any) => {
          const isCompleted = app.status === 'COMPLETED'
          console.log(`📋 EVENTOS COMPLETADOS - App: ${app.event?.title} | Status: ${app.status} | Incluir: ${isCompleted}`)
          return isCompleted
        })
        
        console.log(`✅ APLICACIONES ACEPTADAS ENCONTRADAS: ${acceptedApplications.length}`)
        console.log(`✅ APLICACIONES COMPLETADAS ENCONTRADAS: ${completedApplications.length}`)
        
        // Procesar eventos aceptados (no completados)
        if (acceptedApplications.length > 0) {
          const acceptedEvents = acceptedApplications.map((app: any) => {
            const eventDate = new Date(app.event?.startDate || new Date())
            const formattedDate = eventDate.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit"
            })
            
            return {
              id: app.event?.id || 'unknown',
              title: app.event?.title || "Evento sin título",
              description: "Descripción del evento",
              organization_name: app.event?.organization?.name || "Organización no especificada",
              city: "Guadalajara",
              state: "Jalisco",
              start_date: app.event?.startDate || new Date().toISOString(),
              end_date: app.event?.endDate || new Date().toISOString(),
              max_volunteers: 10,
              current_volunteers: 5,
              category_name: "Sin categoría",
              skills: [],
              applicationStatus: app.status,
              applicationId: app.id,
              formattedDate: formattedDate
            }
          })
          
          console.log("🎯 EVENTOS PARA 'MIS EVENTOS':", acceptedEvents.map((e: Event) => e.title))
          safeStateUpdate(setMyEvents, acceptedEvents)
        } else {
          console.log("📋 No hay eventos aceptados para mostrar")
          safeStateUpdate(setMyEvents, [])
        }

        // Procesar eventos completados para calificaciones
        if (completedApplications.length > 0) {
          const completedEvents = completedApplications.map((app: any) => {
            const eventDate = new Date(app.event?.startDate || new Date())
            const formattedDate = eventDate.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit"
            })
            
            return {
              id: app.event?.id || 'unknown',
              title: app.event?.title || "Evento sin título",
              description: "Descripción del evento",
              organization_name: app.event?.organization?.name || "Organización no especificada",
              city: "Guadalajara",
              state: "Jalisco",
              start_date: app.event?.startDate || new Date().toISOString(),
              end_date: app.event?.endDate || new Date().toISOString(),
              max_volunteers: 10,
              current_volunteers: 5,
              category_name: "Sin categoría",
              skills: [],
              applicationStatus: app.status, // Será 'COMPLETED'
              applicationId: app.id,
              formattedDate: formattedDate,
              rating: app.rating || null, // Incluir si ya fue calificado
              feedback: app.feedback || null
            }
          })
          
          console.log("🎯 EVENTOS COMPLETADOS PARA CALIFICAR:", completedEvents.map((e: Event) => e.title))
          safeStateUpdate(setCompletedEvents, completedEvents)
        } else {
          console.log("📋 No hay eventos completados para calificar")
          safeStateUpdate(setCompletedEvents, [])
        }
      } else {
        console.log("📋 No hay aplicaciones")
        safeStateUpdate(setMyEvents, [])
        safeStateUpdate(setCompletedEvents, [])
      }
    }
  } catch (error) {
    console.error("Error loading accepted events:", error)
    safeStateUpdate(setMyEvents, [])
    safeStateUpdate(setCompletedEvents, [])
  }
}, [])


  // Separate data loading functions to prevent race conditions
  const loadUserData = useCallback(async () => {
    try {
      updateLoadingStep("user", "loading")
      const currentUser = await getCurrentUser()
      if (currentUser) {
        // We fetch the full profile which includes the updated user object
        const res = await fetch("/api/perfil/voluntario", { 
          credentials: "include",
          signal: abortController.current?.signal
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user); // This user object is fresh from the DB
          setVoluntario(data.voluntario)
        } else {
          // Fallback if profile fetch fails
          setUser(currentUser)
        }
        updateLoadingStep("user", "completed")
      } else {
        updateLoadingStep("user", "error")
        setUser({ firstName: "Alan Padilla", lastName: "Venegas", role: "VOLUNTEER" })
      }
    } catch (userError) {
      console.error("Error cargando usuario:", userError)
      updateLoadingStep("user", "error")
      setUser({ firstName: "Alan Padilla", lastName: "Venegas", role: "VOLUNTEER" })
    }
  }, [updateLoadingStep])

  const loadStatsData = useCallback(async () => {
    try {
      updateLoadingStep("stats", "loading")
      const statsResponse = await getUserStats()
      const statsData = statsResponse?.stats ||
        statsResponse || {
          total_applications: 12,
          accepted_applications: 8,
          completed_events: 5,
          total_hours: 24,
          favorite_categories: ["Educación", "Medio Ambiente"],
          averageRating: 4.5,
          eventsParticipated: 24,
          hoursCompleted: 156,
        }
      setStats(statsData)
      updateLoadingStep("stats", "completed")
    } catch (statsError) {
      console.error("Error cargando estadísticas:", statsError)
      updateLoadingStep("stats", "error")
      setStats({
        total_applications: 12,
        accepted_applications: 8,
        completed_events: 5,
        total_hours: 24,
        favorite_categories: ["Educación", "Medio Ambiente"],
        averageRating: 4.5,
        eventsParticipated: 24,
        hoursCompleted: 156,
      })
    }
  }, [updateLoadingStep])

  // DEBUGGING: Agrega estos console.log para entender qué está pasando

const loadEventsData = useCallback(async () => {
  try {
    updateLoadingStep("events", "loading")
    console.log("🔄 Iniciando carga de eventos disponibles...")
    
    // Primero obtenemos los eventos aceptados del usuario
    let acceptedEventIds: string[] = []
    try {
      const acceptedResponse = await fetch('/api/events/apply', {
        credentials: 'include'
      })
      if (acceptedResponse.ok) {
        const acceptedData = await acceptedResponse.json()
        
        if (acceptedData.applications) {
          acceptedEventIds = acceptedData.applications
            .filter((app: any) => {
              const isAccepted = app.status === 'ACCEPTED'
              console.log(`📋 App: ${app.event?.title} | Status: ${app.status} | Es Aceptado: ${isAccepted}`)
              return isAccepted
            })
            .map((app: any) => {
              // CORRECCIÓN: Usar app.event.id en lugar de app.eventId
              const eventId = app.event?.id
              console.log(`✅ EVENTO ACEPTADO ID: ${eventId} | Título: ${app.event?.title}`)
              return eventId
            })
            .filter((id: string | undefined) => id !== undefined) // Filtrar IDs undefined
          
          console.log("🚫 IDs de eventos donde fue ACEPTADO:", acceptedEventIds)
        }
      }
    } catch (error) {
      console.warn("Error obteniendo eventos aceptados:", error)
    }
    
    // Obtener todos los eventos publicados
    const response = await fetch('/api/eventos?limit=10')
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.events && Array.isArray(data.events)) {
      console.log(`✅ Total eventos encontrados: ${data.events.length}`)
      
      // MOSTRAR CADA EVENTO Y SU DECISIÓN DE FILTRADO
      data.events.forEach((event: any) => {
        const shouldBeExcluded = acceptedEventIds.includes(event.id)
        console.log(`🎯 EVENTO: "${event.title}" | ID: ${event.id} | ¿Excluir?: ${shouldBeExcluded}`)
      })
      
      // FILTRAR eventos donde NO ha sido aceptado
      const availableEvents = data.events.filter((e: any) => {
        const isAccepted = acceptedEventIds.includes(e.id)
        if (isAccepted) {
          console.log(`🚫 EXCLUYENDO "${e.title}" porque fue aceptado`)
        } else {
          console.log(`✅ INCLUYENDO "${e.title}" en eventos disponibles`)
        }
        return !isAccepted
      })
      
      console.log(`🎯 Eventos que pasaron el filtro: ${availableEvents.length}`)
      console.log("📝 Títulos de eventos disponibles:", availableEvents.map((e: any) => e.title))
      
      const processedEvents = availableEvents.map((e: any): Event => ({
        id: e.id,
        title: e.title,
        description: e.description,
        organization_name: e.organization_name,
        city: e.city,
        state: e.state,
        start_date: e.startDate || e.start_date,
        end_date: e.endDate || e.end_date,
        max_volunteers: e.maxVolunteers || e.max_volunteers || 10,
        current_volunteers: e.currentVolunteers || e.current_volunteers || 0,
        category_name: e.category_name,
        skills: e.skills || [],
        hasApplied: false,
        applicationStatus: undefined,
      }))
      
      console.log("🎯 EVENTOS FINALES PARA 'DISPONIBLES':", processedEvents.map((e: Event) => e.title))
      safeStateUpdate(setEvents, processedEvents)
      
      updateLoadingStep("events", "completed")
    }
  } catch (eventsError) {
    console.error("❌ Error cargando eventos:", eventsError)
    updateLoadingStep("events", "error")
  }
}, [updateLoadingStep])

  const loadNotificationsData = useCallback(async () => {
    try {
      updateLoadingStep("notifications", "loading")
      
      const response = await fetch('/api/notifications/user?limit=5', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const notificationsData = data.notifications || []
        setNotifications(notificationsData)
        setUnreadCount(data.unreadCount || 0)
      } else {
        const notificationsData = [
          { id: "1", title: "Nuevo evento disponible", message: "Se ha publicado un nuevo evento de limpieza de playa", type: "info", created_at: new Date().toISOString(), read: false },
          { id: "2", title: "Aplicación aceptada", message: "Tu aplicación para el taller de programación ha sido aceptada", type: "success", created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: false },
          { id: "3", title: "Recordatorio de evento", message: "Tu evento de mañana comienza a las 9:00 AM", type: "reminder", created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: true },
        ]
        setNotifications(notificationsData)
        setUnreadCount(notificationsData.filter(n => !n.read).length)
      }
      
      updateLoadingStep("notifications", "completed")
    } catch (notificationsError) {
      console.error("Error cargando notificaciones:", notificationsError)
      updateLoadingStep("notifications", "error")
      setNotifications([])
    }
  }, [updateLoadingStep])

  const updateUnreadCount = useCallback((newCount: number) => {
    setUnreadCount(newCount)
  }, [])

  useEffect(() => {
  if (isInitialized.current) {
    return
  }
  isInitialized.current = true
  async function loadData() {
    const startTime = Date.now()
    console.log("🚀 Iniciando carga optimizada del dashboard...")

    try {
      await loadUserData()
      await loadMyEvents() // Cargar eventos aceptados primero
      await Promise.allSettled([
        loadStatsData(),
        loadEventsData(), // Luego cargar eventos disponibles (excluirá los aceptados)
        loadNotificationsData(),
      ])
      const totalTime = Date.now() - startTime
      console.log(`✅ Carga completa del dashboard en ${totalTime}ms`)
    } catch (error) {
      console.error("Error general en carga de datos:", error)
      setError("Error cargando el dashboard. Por favor, recarga la página.")
      setLoadingSteps((prev) =>
        prev.map((step) =>
          step.status === "loading" || step.status === "pending" ? { ...step, status: "error" } : step,
        ),
      )
    } finally {
      const minLoadingTime = 800
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, minLoadingTime - elapsed)

      setTimeout(() => {
        setLoading(false)
      }, remainingTime)
    }
  }

  loadData()
  return () => {
    if (abortController.current) {
      abortController.current.abort()
    }
  }
}, [loadUserData, loadMyEvents, loadStatsData, loadEventsData, loadNotificationsData])


  const sidebarStats = {
    completedEvents: stats?.completed_events || 5,
    totalHours: stats?.total_hours || 24,
    profileCompletion: 75,
  }

  const upcomingEvents = events.slice(0, 3).map((event) => ({
    id: event.id,
    title: event.title,
    date: new Date(event.start_date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    location: `${event.city}, ${event.state}`,
  }))

const handleEventClick = async (event: Event) => {
    if (!user) {
      router.push("/login")
      return
    }

    setSelectedEvent(event)
    setShowApplicationModal(true)
    setApplicationStatus('checking')
    setModalMessage('Verificando estado de postulación...')

    try {
      const checkResponse = await fetch(`/api/events/apply?eventId=${event.id}&volunteerId=${user.id}`)
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json()
        
        if (checkData.applications && checkData.applications.length > 0) {
          setApplicationStatus('already-applied')
          setModalMessage('Ya te has postulado a este evento anteriormente')
          return
        }
      }

      setApplicationStatus('can-apply')
      setModalMessage('¿Estás seguro de que quieres postularte a este evento?')
    } catch (error) {
      console.error("Error checking application status:", error)
      setApplicationStatus('error')
      setModalMessage('Error al verificar el estado de la postulación')
    }
  }

  const refreshEventsAfterApplication = useCallback(async () => {
  console.log("🔄 Refrescando eventos después de aplicación...")
  await loadMyEvents() // Recargar eventos aceptados
  await loadEventsData() // Recargar eventos disponibles (excluirá el nuevo aceptado)
}, [loadMyEvents, loadEventsData])

  const confirmApplication = async () => {
  if (!selectedEvent) return

  setApplicationStatus('applying')
  setModalMessage('Enviando postulación...')

  try {
    const response = await fetch("/api/events/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventId: selectedEvent.id }),
    })

    if (response.ok) {
      setEvents(prev => prev.map(e => 
        e.id === selectedEvent.id 
          ? { 
              ...e, 
              current_volunteers: e.current_volunteers + 1,
              hasApplied: true,
              applicationStatus: 'PENDING'
            }
          : e
      ))
      
      setApplicationStatus('success')
      setModalMessage('¡Postulación enviada exitosamente!')
      
      // Refrescar eventos después de 2 segundos
      setTimeout(async () => {
        setShowApplicationModal(false)
        setSelectedEvent(null)
        setApplicationStatus('checking')
        setModalMessage('')
        await refreshEventsAfterApplication()
      }, 2000)
    } else {
      const errorData = await response.json()
      if (response.status === 400 && errorData.error === "Ya te has postulado a este evento") {
        setApplicationStatus('already-applied')
        setModalMessage('Ya te has postulado a este evento anteriormente')
      } else {
        setApplicationStatus('error')
        setModalMessage(errorData.error || "Error al postularse al evento")
      }
    }
  } catch (error) {
    console.error("Error applying to event:", error)
    setApplicationStatus('error')
    setModalMessage('Error al postularse al evento')
  }
}

  const closeModal = () => {
    setShowApplicationModal(false)
    setSelectedEvent(null)
    setApplicationStatus('checking')
    setModalMessage('')
  }

  const CATEGORY_ICONS: Record<string, string> = {
    "Educación": "🎓",
    "Medio Ambiente": "🌱",
    "Salud": "❤️",
    "Alimentación": "🍽️",
    "Tecnología": "💻",
    "Deportes": "🏆",
    "Arte y Cultura": "🎨",
    "Construcción": "🔨",
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error de Carga</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              Recargar Página
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
      <AdaptiveLoading type="dashboard" isLoading={loading} loadingSteps={loadingSteps}>
        <ChatNotificationManager />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col pb-nav-mobile">
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 focus:outline-none"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                title="Ir al inicio"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <Heart className="h-6 w-6 md:h-8 md:w-8 text-blue-600 fill-blue-200" />
                <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VolunNet</span>
              </button>
            </div>
            
            {/* Desktop Search */}
              
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <nav className="flex gap-2 text-gray-600 text-sm font-medium">
                <Link href="/dashboard" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                  <Home className="h-5 w-5 group-hover:text-blue-700 transition" />
                  <span>Inicio</span>
                  <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
            <Link href="/eventos/buscar" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
              <Calendar className="h-5 w-5 group-hover:text-blue-700 transition" />
              <span>Eventos</span>
              <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>
                <Link href="/comunidad" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                  <Users className="h-5 w-5 group-hover:text-blue-700 transition" />
                  <span>Comunidad</span>
                  <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
                <Link href="/certificados" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                  <FileText className="h-5 w-5 group-hover:text-blue-700 transition" />
                  <span>Certificados</span>
                  <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
                <Link href="/notificaciones" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
                  <Bell className="h-5 w-5 group-hover:text-blue-700 transition" />
                  <span>Notificaciones</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
              </nav>
              <div className="w-px h-8 bg-gray-200 mx-2" />
              <UserMenu user={user} unreadCount={unreadCount} />
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-3">
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 touch-manipulation"
                onClick={() => {
                  window.location.href = '/eventos/buscar'
                }}
                aria-label="Buscar"
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Mobile Notifications */}
              <Link href="/notificaciones" className="relative p-2 text-gray-600 hover:text-blue-600 transition touch-manipulation">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </Link>

              {/* Professional Mobile Navigation */}
              <MobileNavigation user={user} unreadCount={unreadCount} currentPath="/dashboard" />
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 py-4 md:py-6">
          {/* Mobile Layout */}
          <div className="block md:hidden space-y-4">
            {/* Mobile Profile Card */}
            <motion.div
              className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 border-2 border-white shadow-md flex items-center justify-center text-lg text-blue-500 font-bold overflow-hidden">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    user?.firstName?.[0] || 'M'
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-white text-xs px-1.5 py-0.5 rounded-full shadow font-semibold border border-white">★</span>
              </div>
              <div className="flex-1">
                <div className="text-base font-bold text-gray-900">{user?.firstName || 'María'} {user?.lastName || 'González'}</div>
                <div className="text-xs text-blue-700 font-medium mb-1">{user?.role === 'VOLUNTEER' ? 'Voluntario' : user?.role || ''}</div>
                <div className="flex gap-1 items-center">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const rating = voluntario?.rating ?? stats?.averageRating ?? 0;
                    const isFull = i + 1 <= Math.floor(rating);
                    const isHalf = !isFull && i < rating;
                    return (
                      <span key={i} className="relative">
                        <Star className={`h-3 w-3 ${isFull ? 'text-yellow-400 fill-yellow-300' : isHalf ? 'text-yellow-400' : 'text-gray-200'}`} />
                        {isHalf && (
                          <span className="absolute left-0 top-0 overflow-hidden" style={{ width: '50%' }}>
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-300" />
                          </span>
                        )}
                      </span>
                    );
                  })}
                  <span className="ml-1 text-yellow-600 font-semibold text-xs">{(voluntario?.rating ?? stats?.averageRating ?? 0).toFixed(1)}</span>
                </div>
                <div className="flex gap-3 text-xs mt-1">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-blue-700">{voluntario?.eventsParticipated ?? stats?.eventsParticipated ?? 0}</span>
                    <span className="text-gray-500">eventos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-green-700">{voluntario?.hoursCompleted ?? stats?.hoursCompleted ?? 0}h</span>
                    <span className="text-gray-500">horas</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mobile Tabs */}
            <Tabs defaultValue="recomendados" className="w-full">
              <TabsList className="w-full bg-gray-50 border rounded-xl mb-6 grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 min-h-[3rem]">
                <TabsTrigger value="recomendados" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white flex flex-col items-center justify-center gap-0.5 text-[10px] sm:text-xs py-1.5 px-1 rounded-lg touch-manipulation">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="font-semibold">IA</span>
                </TabsTrigger>
                <TabsTrigger value="disponibles" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex flex-col items-center justify-center text-[10px] sm:text-xs py-1.5 px-1 rounded-lg touch-manipulation font-semibold">
                  Disponibles
                </TabsTrigger>
                <TabsTrigger value="mis-eventos" className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex flex-col items-center justify-center text-[10px] sm:text-xs py-1.5 px-1 rounded-lg touch-manipulation font-semibold whitespace-nowrap">
                  Mis Eventos
                </TabsTrigger>
                <TabsTrigger value="calificaciones" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white relative flex flex-col items-center justify-center text-[10px] sm:text-xs py-1.5 px-1 rounded-lg touch-manipulation font-semibold">
                  Calificaciones
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recomendados" className="pt-8">
                <AIEnhancedRecommendations 
                  limit={3}
                  className="w-full"
                />
              </TabsContent>

              <TabsContent value="disponibles" className="pt-8">
                <div className="space-y-4">
                  {events.slice(0, 3).map((event, idx) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden"
                    >
                      <div className="p-4">
                        <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {event.description}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-blue-400" />
                            {new Date(event.start_date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-green-500" />
                            {event.current_volunteers}/{event.max_volunteers}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 rounded-full px-4 py-2 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600"
                            onClick={() => handleEventClick(event)}
                          >
                            Postular
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-full px-4 py-2 font-semibold border-gray-300 text-blue-700 hover:bg-blue-50"
                            onClick={() => window.location.href = `/eventos/${event.id}`}
                          >
                            Ver
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="mis-eventos" className="pt-8">
                <div className="space-y-4">
                  {myEvents.length === 0 ? (
                    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 rounded-2xl shadow-inner text-center py-8 px-4">
                      <Calendar className="h-12 w-12 text-blue-400 mx-auto mb-3 animate-pulse" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        No tienes eventos inscritos
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm">
                        Postúlate a eventos para verlos aquí
                      </p>
                      <Link href="/eventos/buscar">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-6 py-2 shadow-lg">
                          <Search className="h-4 w-4 mr-2" />
                          Buscar Eventos
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    myEvents.slice(0, 3).map((event, idx) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-xl transition-all p-4"
                      >
                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            event.applicationStatus === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : event.applicationStatus === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {event.applicationStatus || "Pendiente"}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full px-4 py-2 border-gray-300 text-blue-700 hover:bg-blue-50"
                            onClick={() => window.location.href = `/eventos/${event.id}`}
                          >
                            Ver detalles
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="calificaciones" className="pt-8">
                <div className="space-y-3">
                  {completedEvents.length > 0 ? (
                    completedEvents.slice(0, 3).map((event, idx) => (
                      <motion.div
                        key={event.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                              {event.title}
                            </h4>
                            <p className="text-gray-600 text-xs mb-2">
                              {event.organization_name}
                            </p>
                            {event.rating ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3 w-3 ${
                                        star <= (event.rating || 0)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {event.rating.toFixed(1)}
                                </span>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs rounded-full mt-1"
                                onClick={() => {
                                  router.push(`/calificaciones?eventId=${event.id}`)
                                }}
                              >
                                Calificar evento
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos completados</h3>
                      <p className="text-gray-600 text-sm">Tus eventos completados aparecerán aquí</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:grid grid-cols-[minmax(0,320px)_1fr_minmax(0,320px)] gap-6">
          <div className="space-y-6 w-full max-w-xs mx-auto">
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-blue-50 relative overflow-visible"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.025, boxShadow: "0 8px 32px 0 rgba(80, 112, 255, 0.10)" }}
            >
              <div className="relative mb-3">
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 border-4 border-white shadow-lg flex items-center justify-center text-4xl text-blue-500 font-bold overflow-hidden">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    user?.firstName?.[0] || 'M'
                  )}
                </div>
                <span className="absolute -bottom-2 right-0 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full shadow font-semibold border-2 border-white">★ Oro</span>
              </div>
              <div className="text-lg font-bold text-gray-900 text-center">{user?.firstName || 'María'} {user?.lastName || 'González'}</div>
              <div className="text-xs text-blue-700 font-semibold mb-1">{user?.role === 'VOLUNTEER' ? 'Voluntario' : user?.role || ''}</div>
              <div className="flex gap-1 mb-2 mt-1 items-center">
                {Array.from({ length: 5 }).map((_, i) => {
                  const rating = voluntario?.rating ?? stats?.averageRating ?? 0;
                  const isFull = i + 1 <= Math.floor(rating);
                  const isHalf = !isFull && i < rating;
                  return (
                    <span key={i} className="relative">
                      <Star className={`h-5 w-5 ${isFull ? 'text-yellow-400 fill-yellow-300' : isHalf ? 'text-yellow-400' : 'text-gray-200'}`} />
                      {isHalf && (
                        <span className="absolute left-0 top-0 overflow-hidden" style={{ width: '50%' }}>
                          <Star className="h-5 w-5 text-yellow-400 fill-yellow-300" />
                        </span>
                      )}
                    </span>
                  );
                })}
                <span className="ml-2 text-yellow-600 font-semibold text-sm">{(voluntario?.rating ?? stats?.averageRating ?? 0).toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Home className="h-4 w-4 text-blue-400" />
                <span>{voluntario?.city && voluntario?.country ? `${voluntario.city}, ${voluntario.country}` : 'Ubicación no registrada'}</span>
              </div>
              <div className="flex gap-6 mt-2 mb-1">
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-blue-700">{voluntario?.eventsParticipated ?? stats?.eventsParticipated ?? 0}</span>
                  <span className="text-xs text-gray-500">Eventos</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-green-700">{voluntario?.hoursCompleted ?? stats?.hoursCompleted ?? 0}</span>
                  <span className="text-xs text-gray-500">Horas</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-5 border border-blue-50"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              whileHover={{ scale: 1.025, boxShadow: "0 8px 32px 0 rgba(80, 112, 255, 0.10)" }}
            >
              <div className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="4"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                Próximos Eventos
              </div>
              <ul className="space-y-3">
                {upcomingEvents.map(ev => (
                  <li key={ev.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-blue-50 transition">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-blue-700 text-xs leading-tight truncate">{ev.title}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1">
                        <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3M16 7V3M4 11h16M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/></svg>
                        {ev.date}
                        <svg className="h-3 w-3 text-gray-400 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 12.414a2 2 0 1 0-2.828 2.828l4.243 4.243a8 8 0 1 1 2.828-2.828z"/></svg>
                        {ev.location}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="space-y-6 col-span-1">
            <Tabs defaultValue="recomendados" className="w-full">
              <TabsList className="w-full bg-gray-50 border rounded-lg mb-4">
                <TabsTrigger value="recomendados" className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Recomendados por IA
                </TabsTrigger>
                <TabsTrigger value="disponibles" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Eventos Disponibles</TabsTrigger>
                <TabsTrigger value="mis-eventos" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Mis Eventos</TabsTrigger>
                
                <TabsTrigger value="calificaciones" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Calificaciones</TabsTrigger>
              </TabsList>

              <TabsContent value="recomendados">
                <AIEnhancedRecommendations 
                  limit={6}
                  className="w-full"
                />
              </TabsContent>

              {/* Utilidades visuales para placeholders por categoría */}
              {(() => {
                const normalize = (text?: string) => (text || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
                const getCategoryGradient = (name?: string) => {
                  const n = normalize(name)
                  if (n.includes('ambiente') || n.includes('ecologia') || n.includes('naturaleza')) return { from: '#E6F4EA', to: '#D1F1DC' }
                  if (n.includes('tecnolog')) return { from: '#E8EEFF', to: '#EDE6FF' }
                  if (n.includes('salud')) return { from: '#FFE8EC', to: '#FFEDEF' }
                  if (n.includes('educacion')) return { from: '#FFF5E6', to: '#FFEFD6' }
                  if (n.includes('comunidad') || n.includes('social')) return { from: '#E6F0FF', to: '#E6FFF7' }
                  if (n.includes('arte') || n.includes('cultura')) return { from: '#FFE9F2', to: '#FFE6F5' }
                  if (n.includes('alimentacion') || n.includes('nutricion')) return { from: '#FFF4E5', to: '#FFE9CC' }
                  if (n.includes('deporte')) return { from: '#FFF9E6', to: '#FFF1B8' }
                  if (n.includes('construccion')) return { from: '#F2F4F7', to: '#E9EEF5' }
                  if (n.includes('animal')) return { from: '#F0FAE6', to: '#E6F7D6' }
                  return { from: '#EAF0FF', to: '#F2E9FF' }
                }
                const getIconForCategory = (name?: string) => {
                  const n = normalize(name)
                  if (n.includes('ambiente') || n.includes('ecologia') || n.includes('naturaleza')) return '🌱'
                  if (n.includes('tecnolog')) return '💻'
                  if (n.includes('salud')) return '❤️'
                  if (n.includes('educacion')) return '🎓'
                  if (n.includes('comunidad') || n.includes('social')) return '👥'
                  if (n.includes('arte') || n.includes('cultura')) return '🎨'
                  if (n.includes('alimentacion') || n.includes('nutricion')) return '🍽️'
                  if (n.includes('deporte')) return '🏆'
                  if (n.includes('construccion')) return '🔨'
                  if (n.includes('animal')) return '🐾'
                  return '📅'
                }
                const EmojiMosaicBackground = ({ icon }: { icon: string }) => {
                  const items = Array.from({ length: 40 })
                  const rng = (seed: number) => { let x = Math.sin(seed) * 10000; return x - Math.floor(x) }
                  return (
                    <div className="absolute inset-0 overflow-hidden">
                      {items.map((_, i) => {
                        const r1 = rng(i + 1), r2 = rng((i + 1) * 2), r3 = rng((i + 1) * 3)
                        const size = 18 + Math.floor(r1 * 46)
                        const left = Math.floor(r2 * 100)
                        const top = Math.floor(r3 * 100)
                        const opacity = 0.05 + r1 * 0.15
                        const rotate = Math.floor((r2 - 0.5) * 30)
                        return (
                          <span key={i} className="absolute select-none" style={{ left: `${left}%`, top: `${top}%`, fontSize: `${size}px`, opacity, transform: `translate(-50%, -50%) rotate(${rotate}deg)` }}>{icon}</span>
                        )
                      })}
                    </div>
                  )
                }
                return null
              })()}

              <TabsContent value="disponibles">
  <div className="grid md:grid-cols-2 gap-6">
    {events.map((event, idx) => (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: idx * 0.1 }}
        whileHover={{ scale: 1.02 }}
        className="bg-white border border-gray-100 rounded-3xl shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col"
      >
                  {(() => { const g = (function(){
                      const t = (text?: string) => (text || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
                      const n = t(event.category_name)
                      if (n.includes('ambiente') || n.includes('ecologia') || n.includes('naturaleza')) return { from: '#E6F4EA', to: '#D1F1DC' }
                      if (n.includes('tecnolog')) return { from: '#E8EEFF', to: '#EDE6FF' }
                      if (n.includes('salud')) return { from: '#FFE8EC', to: '#FFEDEF' }
                      if (n.includes('educacion')) return { from: '#FFF5E6', to: '#FFEFD6' }
                      if (n.includes('comunidad') || n.includes('social')) return { from: '#E6F0FF', to: '#E6FFF7' }
                      if (n.includes('arte') || n.includes('cultura')) return { from: '#FFE9F2', to: '#FFE6F5' }
                      if (n.includes('alimentacion') || n.includes('nutricion')) return { from: '#FFF4E5', to: '#FFE9CC' }
                      if (n.includes('deporte')) return { from: '#FFF9E6', to: '#FFF1B8' }
                      if (n.includes('construccion')) return { from: '#F2F4F7', to: '#E9EEF5' }
                      if (n.includes('animal')) return { from: '#F0FAE6', to: '#E6F7D6' }
                      return { from: '#EAF0FF', to: '#F2E9FF' }
                    })();
                    const icon = (function(){
                      const n = (event.category_name || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
                      if (n.includes('ambiente') || n.includes('ecologia') || n.includes('naturaleza')) return '🌱'
                      if (n.includes('tecnolog')) return '💻'
                      if (n.includes('salud')) return '❤️'
                      if (n.includes('educacion')) return '🎓'
                      if (n.includes('comunidad') || n.includes('social')) return '👥'
                      if (n.includes('arte') || n.includes('cultura')) return '🎨'
                      if (n.includes('alimentacion') || n.includes('nutricion')) return '🍽️'
                      if (n.includes('deporte')) return '🏆'
                      if (n.includes('construccion')) return '🔨'
                      if (n.includes('animal')) return '🐾'
                      return '📅'
                    })();
                    return (
                      <div className="relative h-40 flex items-center justify-center" style={{ background: `linear-gradient(90deg, ${g.from}, ${g.to})` }}>
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white shadow">
                          {event.category_name}
                        </span>
                        <div className="absolute inset-0"><span style={{display:'none'}}></span></div>
                        <div className="absolute inset-0"><span style={{display:'none'}}></span></div>
                        <div className="absolute inset-0"><span style={{display:'none'}}></span></div>
                        {/* Mosaico */}
                        <div className="absolute inset-0 overflow-hidden">
                          {Array.from({length:36}).map((_,i)=>{ const r=(s:number)=>{let x=Math.sin(s)*10000;return x-Math.floor(x)}; const r1=r(i+1), r2=r((i+1)*2), r3=r((i+1)*3); const size=16+Math.floor(r1*44); const left=Math.floor(r2*100); const top=Math.floor(r3*100); const opacity=0.05 + r1*0.15; const rotate=Math.floor((r2-0.5)*30); return (
                            <span key={i} className="absolute select-none" style={{left:`${left}%`, top:`${top}%`, fontSize:`${size}px`, opacity, transform:`translate(-50%, -50%) rotate(${rotate}deg)`}}>{icon}</span>
                          )})}
                        </div>
                        {/* Ícono central */}
                        <div className="relative text-6xl">{icon}</div>
                      </div>
                    )})()}

        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
              {event.title}
              {event.recommendation_score && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                  ⭐ {event.recommendation_score.toFixed(1)}
                </span>
              )}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {event.description}
            </p>

            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-blue-400" />
                {new Date(event.start_date).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4 text-green-500" />
                {event.current_volunteers}/{event.max_volunteers} voluntarios
              </span>
              <span className="flex items-center gap-1">
                <Home className="h-4 w-4 text-purple-500" />
                {event.city}, {event.state}
              </span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${(event.current_volunteers / event.max_volunteers) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <ApplicationStatusBadge 
              hasApplied={event.hasApplied}
              status={event.applicationStatus}
            />
            <div className="flex gap-2">
              {!event.hasApplied && (
                <Button 
                  size="sm" 
                  className="rounded-full px-5 py-2 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow hover:from-blue-700 hover:to-purple-700"
                  onClick={() => handleEventClick(event)}
                >
                  Postular
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-full px-5 py-2 font-semibold border-gray-300 text-blue-700 hover:bg-blue-50"
                onClick={() => window.location.href = `/eventos/${event.id}`}
              >
                Ver detalles
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
</TabsContent>

              <TabsContent value="mis-eventos">
  <div className="flex justify-between items-center mb-6">
    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
      <Calendar className="h-6 w-6 text-blue-600" />
      Mis Eventos Inscritos
    </h3>
   {/* <Button 
      onClick={loadMyEvents}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 rounded-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition shadow-sm"
    >
      <Calendar className="h-4 w-4" />
      Actualizar
    </Button>*/}
  </div>

  <div className="space-y-6">
    {myEvents.length === 0 ? (
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 rounded-3xl shadow-inner text-center py-14 px-6">
        <Calendar className="h-20 w-20 text-blue-400 mx-auto mb-4 animate-pulse" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No tienes eventos inscritos
        </h3>
        <p className="text-gray-600 mb-6">
          Postúlate a eventos para verlos aquí
        </p>
        <Link href="/eventos/buscar">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-3 shadow-lg">
            <Search className="h-4 w-4 mr-2" />
            Buscar Eventos
          </Button>
        </Link>
      </div>
    ) : (
      myEvents.map((event, idx) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white border border-gray-100 rounded-3xl shadow-md hover:shadow-xl transition-all p-6 flex flex-col sm:flex-row gap-6"
        >
          {(() => { const t=(s?:string)=>(s||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,''); const n=t(event.category_name as any); const gradient= n.includes('ambiente')||n.includes('ecologia')||n.includes('naturaleza')?{from:'#E6F4EA',to:'#D1F1DC'}: n.includes('tecnolog')?{from:'#E8EEFF',to:'#EDE6FF'}: n.includes('salud')?{from:'#FFE8EC',to:'#FFEDEF'}: n.includes('educacion')?{from:'#FFF5E6',to:'#FFEFD6'}: n.includes('comunidad')||n.includes('social')?{from:'#E6F0FF',to:'#E6FFF7'}: n.includes('arte')||n.includes('cultura')?{from:'#FFE9F2',to:'#FFE6F5'}: n.includes('alimentacion')||n.includes('nutricion')?{from:'#FFF4E5',to:'#FFE9CC'}: n.includes('deporte')?{from:'#FFF9E6',to:'#FFF1B8'}: n.includes('construccion')?{from:'#F2F4F7',to:'#E9EEF5'}: n.includes('animal')?{from:'#F0FAE6',to:'#E6F7D6'}:{from:'#EAF0FF',to:'#F2E9FF'}; const icon = n.includes('ambiente')||n.includes('ecologia')||n.includes('naturaleza')?'🌱': n.includes('tecnolog')?'💻': n.includes('salud')?'❤️': n.includes('educacion')?'🎓': n.includes('comunidad')||n.includes('social')?'👥': n.includes('arte')||n.includes('cultura')?'🎨': n.includes('alimentacion')||n.includes('nutricion')?'🍽️': n.includes('deporte')?'🏆': n.includes('construccion')?'🔨': n.includes('animal')?'🐾':'📅'; return (
            <div className="flex-shrink-0 w-full sm:w-40 h-32 sm:h-auto rounded-2xl relative overflow-hidden" style={{background:`linear-gradient(135deg, ${gradient.from}, ${gradient.to})`}}>
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({length:28}).map((_,i)=>{ const r=(s:number)=>{let x=Math.sin(s)*10000;return x-Math.floor(x)}; const r1=r(i+1), r2=r((i+1)*2), r3=r((i+1)*3); const size=14+Math.floor(r1*36); const left=Math.floor(r2*100); const top=Math.floor(r3*100); const opacity=0.06+r1*0.14; const rotate=Math.floor((r2-0.5)*30); return (
                  <span key={i} className="absolute select-none" style={{left:`${left}%`, top:`${top}%`, fontSize:`${size}px`, opacity, transform:`translate(-50%, -50%) rotate(${rotate}deg)`}}>{icon}</span>
                )})}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-5xl">{icon}</div>
              </div>
            </div>
          )})()}

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {event.title}
                <span
                  className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    event.applicationStatus === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : event.applicationStatus === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {event.applicationStatus || "Pendiente"}
                </span>
              </h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {event.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  {new Date(event.start_date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-green-500" />
                  {event.current_volunteers}/{event.max_volunteers} voluntarios
                </span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${(event.current_volunteers / event.max_volunteers) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                className="rounded-full px-5 py-2 border-gray-300 text-blue-700 hover:bg-blue-50"
                onClick={() => window.location.href = `/eventos/${event.id}`}
              >
                Ver detalles
              </Button>
            </div>
          </div>
        </motion.div>
      ))
    )}
  </div>
</TabsContent>

              
              <TabsContent value="notificaciones">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
                    <Button 
                      onClick={() => window.location.href = '/notificaciones'}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Bell className="h-4 w-4" />
                      Ver Todas
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification, idx) => (
                        <motion.div
                          key={notification.id}
                          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-gray-600 text-xs line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500">
                                  {new Date(notification.created_at).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                            </div>
                            {!notification.read && (
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await fetch('/api/notifications/user', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      credentials: 'include',
                                      body: JSON.stringify({ notificationId: notification.id })
                                    })
                                    if (response.ok) {
                                      // Actualizar el estado local
                                      setNotifications(prev => 
                                        prev.map(n => 
                                          n.id === notification.id ? { ...n, read: true } : n
                                        )
                                      )
                                      // Actualizar contador
                                      setUnreadCount(prev => Math.max(0, prev - 1))
                                    }
                                  } catch (error) {
                                    console.error('Error marcando notificación como leída:', error)
                                  }
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                Marcar leída
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
                        <p className="text-gray-600">Todas tus notificaciones aparecerán aquí</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="calificaciones">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Calificaciones Pendientes</h3>
                    <Button 
                      onClick={() => window.location.href = '/calificaciones'}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Star className="h-4 w-4" />
                      Ver Todas
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {completedEvents.filter(event => event.applicationStatus === 'COMPLETED' && !event.rating).length > 0 ? (
                      completedEvents
                        .filter(event => event.applicationStatus === 'COMPLETED' && !event.rating)
                        .slice(0, 4)
                        .map((event, idx) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white border border-gray-100 rounded-3xl shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col"
                          >
                            {/* Header con gradiente y patrón */}
                            <div className="relative h-40 flex items-center justify-center" style={{ background: `linear-gradient(90deg, #fef3c7, #fed7aa, #fecaca)` }}>
                              <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow">
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
                              <div className="relative text-6xl animate-pulse">⭐</div>
                            </div>

                            <div className="flex-1 p-6 flex flex-col justify-between">
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                                  {event.title}
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-medium">
                                    ⭐ Pendiente
                                  </span>
                                </h4>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                  Evento completado - {event.organization_name}
                                </p>

                                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-blue-400" />
                                    {new Date(event.start_date).toLocaleDateString('es-ES', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4 text-green-500" />
                                    {event.organization_name}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Home className="h-4 w-4 text-purple-500" />
                                    Guadalajara, Jalisco
                                  </span>
                                </div>

                                {/* Barra de progreso de calificación */}
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-3">
                                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all animate-pulse" style={{ width: '100%' }} />
                                </div>
                              </div>

                              <div className="flex justify-between items-center mt-4">
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    className="rounded-full px-5 py-2 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow hover:from-blue-700 hover:to-purple-700"
                                    onClick={() => window.location.href = `/calificaciones?eventId=${event.id}`}
                                  >
                                    <Star className="h-4 w-4 mr-1" />
                                    Calificar
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="rounded-full px-5 py-2 font-semibold border-gray-300 text-blue-700 hover:bg-blue-50"
                                    onClick={() => window.location.href = `/eventos/${event.id}`}
                                  >
                                    Ver detalles
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                    ) : (
                      <div className="col-span-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 rounded-3xl shadow-inner text-center py-14 px-6">
                        <Star className="h-20 w-20 text-blue-400 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          No hay calificaciones pendientes
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Los eventos completados aparecerán aquí para calificar
                        </p>
                        <Link href="/eventos/buscar">
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-3 shadow-lg">
                            <Search className="h-4 w-4 mr-2" />
                            Buscar Eventos
                          </Button>
                        </Link>
                      </div>
                      )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6 w-full max-w-xs mx-auto">
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6 border border-blue-50"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.13 }}
              whileHover={{ scale: 1.025, boxShadow: "0 8px 32px 0 rgba(80, 112, 255, 0.10)" }}
            >
              <div className="font-semibold text-gray-800 mb-4 text-sm flex items-center gap-2">
                <svg className="h-5 w-5 text-violet-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20.5V3.5"/><path d="M5 12h14"/></svg>
                Estadísticas del Mes
              </div>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-2 text-blue-700 font-medium">
                    <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                    Eventos completados
                  </span>
                  <span className="font-bold text-blue-700 bg-blue-100 rounded px-2 py-0.5">{stats?.completed_events ?? 0}</span>
                </div>
                <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-2 text-green-700 font-medium">
                    <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                    Horas servidas
                  </span>
                  <span className="font-bold text-green-700 bg-green-100 rounded px-2 py-0.5">{voluntario?.hoursCompleted ?? stats?.hoursCompleted ?? 0}</span>
                </div>
                <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-2 text-violet-700 font-medium">
                    <svg className="h-4 w-4 text-violet-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 15l4-4 4 4"/></svg>
                    Nuevos amigos
                  </span>
                  <span className="font-bold text-violet-700 bg-purple-100 rounded px-2 py-0.5"> </span>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6 border border-blue-50"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              whileHover={{ scale: 1.025, boxShadow: "0 8px 32px 0 rgba(80, 112, 255, 0.10)" }}
            >
              <div className="font-semibold text-gray-800 mb-4 text-sm flex items-center gap-2">
                <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                Voluntarios Destacados
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 bg-yellow-50 rounded-lg px-3 py-2 shadow-sm">
                  <span className="bg-yellow-400 text-white rounded-full px-2 py-1 text-xs font-bold">AM</span>
                  <span className="flex-1 font-medium text-gray-800">Ana Martínez</span>
                  <span className="text-yellow-500 font-bold">#1</span>
                </li>
                <li className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="bg-gray-300 text-gray-700 rounded-full px-2 py-1 text-xs font-bold">CR</span>
                  <span className="flex-1 font-medium text-gray-800">Carlos Ruiz</span>
                  <span className="text-gray-400 font-bold">#2</span>
                </li>
                <li className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="bg-gray-300 text-gray-700 rounded-full px-2 py-1 text-xs font-bold">LT</span>
                  <span className="flex-1 font-medium text-gray-800">Lucía Torres</span>
                  <span className="text-gray-400 font-bold">#3</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
      {showApplicationModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                {applicationStatus === 'checking' && (
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {applicationStatus === 'already-applied' && (
                  <span className="text-white text-2xl">⚠️</span>
                )}
                {applicationStatus === 'can-apply' && (
                  <span className="text-white text-2xl">🎯</span>
                )}
                {applicationStatus === 'applying' && (
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {applicationStatus === 'success' && (
                  <span className="text-white text-2xl">✅</span>
                )}
                {applicationStatus === 'error' && (
                  <span className="text-white text-2xl">❌</span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {applicationStatus === 'checking' && 'Verificando...'}
                {applicationStatus === 'already-applied' && 'Ya te has postulado'}
                {applicationStatus === 'can-apply' && 'Confirmar Postulación'}
                {applicationStatus === 'applying' && 'Enviando...'}
                {applicationStatus === 'success' && '¡Éxito!'}
                {applicationStatus === 'error' && 'Error'}
              </h3>
              
              <p className="text-gray-600 text-sm">
                {modalMessage}
              </p>
            </div>

            {selectedEvent && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedEvent.title}</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">📅</span>
                    <span>{new Date(selectedEvent.start_date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">📍</span>
                    <span>{selectedEvent.city}, {selectedEvent.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">👥</span>
                    <span>{selectedEvent.current_volunteers}/{selectedEvent.max_volunteers} voluntarios</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {applicationStatus === 'already-applied' && (
                <button
                  onClick={closeModal}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                >
                  Entendido
                </button>
              )}
              
              {applicationStatus === 'can-apply' && (
                <>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmApplication}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                  >
                    Confirmar
                  </button>
                </>
              )}
              
              {applicationStatus === 'success' && (
                <button
                  onClick={closeModal}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                >
                  ¡Perfecto!
                </button>
              )}
              
              {applicationStatus === 'error' && (
                <>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-semibold transition"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setApplicationStatus('can-apply')
                      setModalMessage('¿Estás seguro de que quieres postularte a este evento?')
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition"
                  >
                    Reintentar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
        </div>

    </AdaptiveLoading>
  )
}

function UserMenu({ user, unreadCount = 0 }: { user: any; unreadCount?: number }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Función para obtener la URL de configuración basada en el rol del usuario
  const getConfigUrl = () => {
    if (user?.role === 'ORGANIZATION') {
      return '/organizaciones/configuracion';
    }
    return '/configuracion';
  };

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
          <img 
            src={user.avatar} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          user?.firstName?.[0] || 'Y'
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-semibold text-gray-800 text-sm">{user?.firstName || 'María'}</div>
            <div className="text-xs text-gray-500">{user?.email || 'voluntario@volunnet.com'}</div>
          </div>
          <Link
            href="/perfil"
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
          >
            <User className="h-4 w-4 text-gray-500" />
            Perfil
          </Link>
          <Link
            href={getConfigUrl()}
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
              router.push("/");
            }}
          >
            <LogOut className="h-4 w-4 text-gray-500" />
            Cerrar sesión
          </button>
        </div>
      )}

      {/* Bottom Navigation para móvil */}
      <BottomNavigation unreadCount={unreadCount} />
    </div>
  );
}
