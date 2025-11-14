"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, Calendar, Users, Filter, Grid, List, Star, Clock, Building2, AlertTriangle, Heart, Home, Bell, ArrowLeft, X } from "lucide-react"
import { MobileNavigation } from "@/components/ui/mobile-navigation"
import { BottomNavigation } from "@/components/ui/bottom-navigation"
import { getCurrentUser } from "@/app/auth/actions"
import Link from "next/link"
import { ApplicationStatusBadge } from "@/components/ui/application-status-badge"

// Funciones auxiliares
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

const getTimeUntilEvent = (dateString: string) => {
  const now = new Date()
  const eventDate = new Date(dateString)
  const diffTime = eventDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return "Evento pasado"
  if (diffDays === 0) return "Hoy"
  if (diffDays === 1) return "Mañana"
  return `En ${diffDays} días`
}

const getAvailabilityStatus = (event: Event) => {
  if (event.currentVolunteers >= event.maxVolunteers) {
    return { text: "Completo", color: "bg-red-100 text-red-700" }
  }
  if (event.currentVolunteers >= event.maxVolunteers * 0.8) {
    return { text: "Casi completo", color: "bg-yellow-100 text-yellow-700" }
  }
  return { text: "Disponible", color: "bg-green-100 text-green-700" }
}

interface Event {
  id: string
  title: string
  description: string
  address: string
  city: string
  state: string
  country: string
  startDate: string
  endDate: string
  maxVolunteers: number
  currentVolunteers: number
  skills: string[]
  requirements: string[]
  benefits: string[]
  imageUrl: string | null
  status: string
  createdAt: string
  updatedAt: string
  organization_name: string
  organization_verified: boolean
  category_name: string
  category_icon: string
  category_color: string
  alreadyRegistered?: boolean
  hasApplied?: boolean
  applicationStatus?: string
}

interface Filters {
  query: string
  city: string
  state: string
  category: string | "all"
  skills: string[]
  maxDistance: number
  onlyVerified: boolean
  onlyAvailable: boolean
}

// Lista de estados mexicanos
const MEXICAN_STATES = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", 
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima", 
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo", 
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", 
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", 
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
]

// Lista de ciudades principales por estado
const CITIES_BY_STATE: { [key: string]: string[] } = {
  "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Puerto Vallarta", "Tepatitlán", "Lagos de Moreno", "Ocotlán"],
  "Ciudad de México": ["Ciudad de México", "Álvaro Obregón", "Azcapotzalco", "Benito Juárez", "Coyoacán", "Cuajimalpa", "Cuauhtémoc", "Gustavo A. Madero", "Iztacalco", "Iztapalapa", "La Magdalena Contreras", "Miguel Hidalgo", "Milpa Alta", "Tláhuac", "Tlalpan", "Venustiano Carranza", "Xochimilco"],
  "Nuevo León": ["Monterrey", "Guadalupe", "San Nicolás de los Garza", "Apodaca", "Escobedo", "Santa Catarina", "San Pedro Garza García"],
  "Estado de México": ["Toluca", "Ecatepec", "Nezahualcóyotl", "Naucalpan", "Tlalnepantla", "Chimalhuacán", "Atizapán de Zaragoza", "Tultitlán"],
  "Puebla": ["Puebla", "Tehuacán", "San Martín Texmelucan", "Atlixco", "San Pedro Cholula"],
  "Guanajuato": ["León", "Irapuato", "Celaya", "Salamanca", "Guanajuato", "San Miguel de Allende"],
  "Veracruz": ["Veracruz", "Xalapa", "Coatzacoalcos", "Córdoba", "Poza Rica", "Minatitlán"],
  "Yucatán": ["Mérida", "Valladolid", "Tizimín", "Progreso", "Motul"],
  "Quintana Roo": ["Cancún", "Playa del Carmen", "Chetumal", "Cozumel", "Tulum"],
  "Baja California": ["Tijuana", "Mexicali", "Ensenada", "Rosarito", "Tecate"],
  "Sonora": ["Hermosillo", "Ciudad Obregón", "Nogales", "Guaymas", "San Luis Río Colorado"],
  "Chihuahua": ["Chihuahua", "Ciudad Juárez", "Delicias", "Parral", "Cuauhtémoc"],
  "Coahuila": ["Saltillo", "Torreón", "Monclova", "Piedras Negras", "Acuña"],
  "Sinaloa": ["Culiacán", "Mazatlán", "Los Mochis", "Guasave", "Navolato"],
  "Michoacán": ["Morelia", "Uruapan", "Zamora", "Apatzingán", "Lázaro Cárdenas"],
  "Oaxaca": ["Oaxaca", "Salina Cruz", "Juchitán", "Tuxtepec", "Puerto Escondido"],
  "Chiapas": ["Tuxtla Gutiérrez", "Tapachula", "San Cristóbal de las Casas", "Palenque", "Comitán"],
  "Tabasco": ["Villahermosa", "Cárdenas", "Comalcalco", "Paraíso", "Cunduacán"],
  "Tamaulipas": ["Tampico", "Reynosa", "Matamoros", "Nuevo Laredo", "Ciudad Victoria"],
  "San Luis Potosí": ["San Luis Potosí", "Soledad de Graciano Sánchez", "Ciudad Valles", "Matehuala", "Rioverde"],
  "Zacatecas": ["Zacatecas", "Fresnillo", "Guadalupe", "Jerez", "Calera"],
  "Durango": ["Durango", "Gómez Palacio", "Lerdo", "Ciudad Lerdo", "Vicente Guerrero"],
  "Aguascalientes": ["Aguascalientes", "Jesús María", "Calvillo", "Rincón de Romos", "San Francisco de los Romo"],
  "Querétaro": ["Querétaro", "San Juan del Río", "Corregidora", "El Marqués", "Pedro Escobedo"],
  "Hidalgo": ["Pachuca", "Tulancingo", "Tizayuca", "Tepeji del Río", "Ixmiquilpan"],
  "Tlaxcala": ["Tlaxcala", "Apizaco", "Huamantla", "Calpulalpan", "Chiautempan"],
  "Morelos": ["Cuernavaca", "Jiutepec", "Temixco", "Cuautla", "Yautepec"],
  "Colima": ["Colima", "Villa de Álvarez", "Manzanillo", "Tecomán", "Coquimatlán"],
  "Nayarit": ["Tepic", "Ixtlán del Río", "Santiago Ixcuintla", "Compostela", "Acaponeta"],
  "Campeche": ["Campeche", "Ciudad del Carmen", "Champotón", "Escárcega", "Calkiní"],
  "Baja California Sur": ["La Paz", "Cabo San Lucas", "San José del Cabo", "Loreto", "Santa Rosalía"]
}

export default function EventSearchPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    query: "",
    city: "",
    state: "",
    category: "all",
    skills: [],
    maxDistance: 50,
    onlyVerified: false,
    onlyAvailable: false
  })
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("date")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // Función para obtener ciudades basadas en el estado seleccionado
  const getCitiesForState = (state: string): string[] => {
    return CITIES_BY_STATE[state] || []
  }

  // Función para manejar cambios en el estado y limpiar ciudad
  const handleStateChange = (newState: string) => {
    setFilters(prev => ({ 
      ...prev, 
      state: newState === "all" ? "" : newState,
      city: "" // Limpiar ciudad cuando cambie el estado
    }))
  }

  useEffect(() => {
    loadUser()
    fetchEvents()
  }, [])

  // Limpiar timeout al desmontar componente
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  // Función mejorada para buscar eventos con debounce
  const handleSearch = (newQuery: string) => {
    setFilters(prev => ({ ...prev, query: newQuery }))
    
    // Limpiar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Crear nuevo timeout para búsqueda
    const timeout = setTimeout(() => {
      fetchEvents()
    }, 500) // Esperar 500ms después del último cambio
    
    setSearchTimeout(timeout)
  }

  // Función para aplicar filtros inmediatamente
  const applyFilters = () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    fetchEvents()
  }

  const loadUser = async () => {
    try {
      setUserLoading(true)
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      setUser(null)
    } finally {
      setUserLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      
      // Filtros mejorados
      if (filters.query && filters.query.trim()) {
        params.append("query", filters.query.trim())
      }
      if (filters.city && filters.city.trim()) {
        params.append("city", filters.city.trim())
      }
      if (filters.state && filters.state.trim()) {
        params.append("state", filters.state.trim())
      }
      if (filters.category && filters.category !== "all") {
        params.append("category", filters.category)
      }
      if (filters.onlyVerified) {
        params.append("onlyVerified", "1")
      }
      if (filters.onlyAvailable) {
        params.append("onlyAvailable", "1")
      }

    // Timeout para evitar espera indefinida
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos

    const response = await fetch(`/api/eventos/buscar?${params.toString()}`, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.error("Response not OK:", response.status, response.statusText)
      throw new Error("Error al cargar eventos")
    }
    
    let data = await response.json()

    // Asegurar que sea un array
    if (!Array.isArray(data)) {
      data = data.events || data.data || []
    }

    // Ordenamiento
    data.sort((a: Event, b: Event) => {
      switch (sortBy) {
        case "date": return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        case "volunteers": return b.currentVolunteers - a.currentVolunteers
        case "title": return a.title.localeCompare(b.title)
        default: return 0
      }
    })

    // Verificar si ya aplicó el usuario (solo si hay usuario)
    let eventsWithApplicationStatus = data
    
    if (user) {
      try {
        eventsWithApplicationStatus = await Promise.all(
          data.map(async (event: Event) => {
            try {
              const checkResponse = await fetch(`/api/events/apply?eventId=${event.id}`)
              if (checkResponse.ok) {
                const checkData = await checkResponse.json()
                return {
                  ...event,
                  hasApplied: checkData.hasApplied,
                  applicationStatus: checkData.application?.status
                }
              }
            } catch (error) {
              console.error("Error checking application status:", error)
            }
            return event
          })
        )
      } catch (error) {
        console.error("Error checking applications:", error)
      }
    }

    setEvents(eventsWithApplicationStatus)
  } catch (error: any) {
    console.error("Error fetching events:", error)
    if (error.name === 'AbortError') {
      console.error("Request timeout - la API no respondió a tiempo")
      setError("La búsqueda está tardando demasiado. Por favor, intenta de nuevo.")
    } else {
      setError("Error al cargar los eventos. Por favor, intenta de nuevo más tarde.")
    }
    setEvents([])
  } finally {
    setLoading(false)
  }
}


  const handleApply = async (event: Event) => {
    if (!user) {
      alert("Debes iniciar sesión para postularte a eventos")
      return
    }
    setSelectedEvent({ ...event, alreadyRegistered: false })
    setShowConfirmModal(true)
  }

  const confirmApplication = async () => {
    if (!selectedEvent) return

    try {
      const response = await fetch("/api/events/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selectedEvent.id }),
      })

      const data = await response.json()

      if (response.ok) {
        setEvents(prev => prev.map(e =>
          e.id === selectedEvent.id
            ? { 
                ...e, 
                currentVolunteers: e.currentVolunteers + 1,
                hasApplied: true,
                applicationStatus: 'PENDING'
              }
            : e
        ))
        if (data.status === 'ACCEPTED') {
          alert("¡Felicidades! Has sido aceptado al evento")
        } else {
          alert("Postulación enviada exitosamente. Estás en lista de espera.")
        }
        setShowConfirmModal(false)
        setSelectedEvent(null)
      } else {
        if (response.status === 400 && data.error === "Ya te has postulado a este evento") {
          alert("Ya te has postulado a este evento anteriormente")
        } else {
          alert(data.error || "Error al postularse al evento")
        }
        setShowConfirmModal(false)
        setSelectedEvent(null)
      }
    } catch (error) {
      console.error("Error applying to event:", error)
      alert("Error al postularse al evento")
      setShowConfirmModal(false)
      setSelectedEvent(null)
    }
  }

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando eventos...</p>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
                <p className="text-red-600">{error}</p>
                <Button 
                  onClick={() => fetchEvents()} 
                  className="mt-2 bg-red-600 hover:bg-red-700"
                >
                  Reintentar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-nav-mobile">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VolunNet
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Inicio</span>
              </Link>
              <Link href="/eventos/buscar" className="text-blue-600 font-medium flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Eventos</span>
              </Link>
              <Link href="/comunidad" className="text-gray-600 hover:text-blue-600 transition flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Comunidad</span>
              </Link>
            </nav>

            {/* Mobile Controls */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-1 bg-white/50 hover:bg-white/80 border-blue-200 h-8 px-2 text-xs touch-manipulation"
              >
                <Filter className="h-3 w-3" />
                <span className="hidden xs:inline">Filtros</span>
              </Button>
              <MobileNavigation user={user} currentPath="/eventos/buscar" />
            </div>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center space-x-4">

              <div className="flex items-center space-x-2 border border-blue-200 rounded-lg p-1 bg-white/50">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-blue-600"}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-blue-600"}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {userLoading ? (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <Link href="/notificaciones" className="relative p-2 text-gray-600 hover:text-blue-600 transition">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  </Link>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                      {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <Link href="/login" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">Iniciar Sesión</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Buscar Eventos</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra oportunidades de voluntariado que se ajusten a tus intereses y habilidades
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-8">
          <div className="relative max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
              <Input
                placeholder="Buscar eventos por título, descripción o habilidades..."
                value={filters.query}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 pr-32 py-4 text-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl shadow-lg"
              />
             <Button 
             onClick={fetchEvents}
             className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg"
             size="sm"
             >
              Buscar
              </Button>

            </div>

            <div className="mt-4 text-center">
              <span className="text-gray-600 font-medium">{events.length} eventos encontrados</span>
            </div>
          </div>
        </div>

        {/* Layout principal */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filters Modal */}
          {showFilters && (
            <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="state-mobile">Estado</Label>
                      <Select value={filters.state || "all"} onValueChange={handleStateChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          {MEXICAN_STATES.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="city-mobile">Ciudad</Label>
                      <Select 
                        value={filters.city || "all"} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, city: value === "all" ? "" : value }))}
                        disabled={!filters.state}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={filters.state ? "Seleccionar ciudad" : "Primero selecciona un estado"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las ciudades</SelectItem>
                          {getCitiesForState(filters.state).map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category-mobile">Categoría</Label>
                      <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          <SelectItem value="Medio Ambiente">Medio Ambiente</SelectItem>
                          <SelectItem value="Educación">Educación</SelectItem>
                          <SelectItem value="Salud">Salud</SelectItem>
                          <SelectItem value="Alimentación">Alimentación</SelectItem>
                          <SelectItem value="Arte y Cultura">Arte y Cultura</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="verified-mobile"
                          checked={filters.onlyVerified}
                          onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onlyVerified: !!checked }))}
                        />
                        <Label htmlFor="verified-mobile">Solo organizaciones verificadas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="available-mobile"
                          checked={filters.onlyAvailable}
                          onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onlyAvailable: !!checked }))}
                        />
                        <Label htmlFor="available-mobile">Solo eventos con espacios disponibles</Label>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={() => setShowFilters(false)}
                        variant="outline" 
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={() => {
                          fetchEvents()
                          setShowFilters(false)
                        }} 
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar filtros */}
          <aside className={`lg:w-1/4 ${showFilters ? "block" : "hidden"} md:block`}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100/50 p-6 mb-6 lg:mb-0 sticky top-24"
            >
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Select value={filters.state || "all"} onValueChange={handleStateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      {MEXICAN_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">Ciudad</Label>
                  <Select 
                    value={filters.city || "all"} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, city: value === "all" ? "" : value }))}
                    disabled={!filters.state}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={filters.state ? "Seleccionar ciudad" : "Primero selecciona un estado"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las ciudades</SelectItem>
                      {getCitiesForState(filters.state).map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      <SelectItem value="Medio Ambiente">Medio Ambiente</SelectItem>
                      <SelectItem value="Educación">Educación</SelectItem>
                      <SelectItem value="Salud">Salud</SelectItem>
                      <SelectItem value="Alimentación">Alimentación</SelectItem>
                      <SelectItem value="Arte y Cultura">Arte y Cultura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={filters.onlyVerified}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onlyVerified: !!checked }))}
                  />
                  <Label htmlFor="verified">Solo organizaciones verificadas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="available"
                    checked={filters.onlyAvailable}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, onlyAvailable: !!checked }))}
                  />
                  <Label htmlFor="available">Solo eventos con espacios disponibles</Label>
                </div>

                <div className="mt-4">
                  <Button 
                    onClick={applyFilters} 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            </motion.div>
          </aside>

          {/* Contenido eventos */}
          <main className="flex-1">
            {events.length === 0 && !loading ? (
              <div className="text-center py-20">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron eventos</h3>
                <p className="text-gray-600">Intenta ajustar tus filtros de búsqueda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {events.map(event => (
  <motion.div
    key={event.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="group"
  >
    <Card className="overflow-hidden shadow-lg md:shadow-2xl rounded-2xl md:rounded-3xl flex flex-col h-full hover:scale-105 transform transition-transform duration-300 bg-white">
      {/* Imagen con overlay y zoom */}
      <div className="relative h-56 w-full overflow-hidden rounded-t-3xl">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          (() => {
            const normalize = (t?: string) => (t || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
            const name = normalize(event.category_name)
            const gradient = name.includes('ambiente') || name.includes('ecologia') || name.includes('naturaleza')
              ? { from: '#E6F4EA', to: '#D1F1DC' }
              : name.includes('tecnolog')
              ? { from: '#E8EEFF', to: '#EDE6FF' }
              : name.includes('salud')
              ? { from: '#FFE8EC', to: '#FFEDEF' }
              : name.includes('educacion')
              ? { from: '#FFF5E6', to: '#FFEFD6' }
              : name.includes('comunidad') || name.includes('social')
              ? { from: '#E6F0FF', to: '#E6FFF7' }
              : name.includes('arte') || name.includes('cultura')
              ? { from: '#FFE9F2', to: '#FFE6F5' }
              : name.includes('alimentacion') || name.includes('nutricion')
              ? { from: '#FFF4E5', to: '#FFE9CC' }
              : name.includes('deporte')
              ? { from: '#FFF9E6', to: '#FFF1B8' }
              : name.includes('construccion')
              ? { from: '#F2F4F7', to: '#E9EEF5' }
              : name.includes('animal')
              ? { from: '#F0FAE6', to: '#E6F7D6' }
              : { from: '#EAF0FF', to: '#F2E9FF' }

            const icon = name.includes('ambiente') || name.includes('ecologia') || name.includes('naturaleza') ? '🌱'
              : name.includes('tecnolog') ? '💻'
              : name.includes('salud') ? '❤️'
              : name.includes('educacion') ? '🎓'
              : name.includes('comunidad') || name.includes('social') ? '👥'
              : name.includes('arte') || name.includes('cultura') ? '🎨'
              : name.includes('alimentacion') || name.includes('nutricion') ? '🍽️'
              : name.includes('deporte') ? '🏆'
              : name.includes('construccion') ? '🔨'
              : name.includes('animal') ? '🐾' : '📅'

            return (
              <div className="w-full h-full relative overflow-hidden rounded-t-3xl"
                   style={{ background: `linear-gradient(90deg, ${gradient.from}, ${gradient.to})` }}>
                {/* Mosaico */}
                <div className="absolute inset-0 overflow-hidden">
                  {Array.from({length:36}).map((_,i)=>{ const r=(s:number)=>{let x=Math.sin(s)*10000;return x-Math.floor(x)}; const r1=r(i+1), r2=r((i+1)*2), r3=r((i+1)*3); const size=16+Math.floor(r1*44); const left=Math.floor(r2*100); const top=Math.floor(r3*100); const opacity=0.05 + r1*0.15; const rotate=Math.floor((r2-0.5)*30); return (
                    <span key={i} className="absolute select-none" style={{left:`${left}%`, top:`${top}%`, fontSize:`${size}px`, opacity, transform:`translate(-50%, -50%) rotate(${rotate}deg)`}}>{icon}</span>
                  )})}
                </div>
                {/* Ícono central */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl">{icon}</div>
                </div>
              </div>
            )
          })()
        )}

        {/* Badges flotantes */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="px-3 py-1 rounded-full text-white text-xs font-semibold shadow" style={{ backgroundColor: event.category_color }}>
            {event.category_name}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${getAvailabilityStatus(event).color}`}>
            {getAvailabilityStatus(event).text}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <Badge variant="secondary">{event.city}</Badge>
          <Badge variant="secondary">{event.state}</Badge>
        </div>

        {/* Overlay con info adicional al hover */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <p className="text-white font-bold">{event.organization_name}</p>
          <p className="text-gray-200 text-sm">{formatDate(event.startDate)}</p>
        </div>
      </div>

      {/* Contenido */}
      <CardContent className="flex flex-col flex-1 p-4 md:p-6">
        <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">{event.description}</p>

        {/* Barra de progreso de plazas */}
        <div className="mb-3 md:mb-4">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
              style={{ width: `${Math.min(100, (event.currentVolunteers / event.maxVolunteers) * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {event.currentVolunteers} de {event.maxVolunteers} plazas ocupadas
          </p>
        </div>

        <div className="mt-auto flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.location.href = `/eventos/${event.id}`}
            className="flex-1 py-3 md:py-2 font-semibold rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 text-sm md:text-base transition-all duration-200"
          >
            Ver detalles
          </Button>
          <Button
            onClick={() => handleApply(event)}
            disabled={event.hasApplied || getAvailabilityStatus(event).text === "Completo"}
            className={`flex-1 py-3 md:py-2 font-semibold rounded-xl shadow-lg text-sm md:text-base
              ${event.hasApplied 
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"}`
            }
          >
            {event.hasApplied ? "Postulado" : "Aplicar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-8 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Confirmar aplicación</h3>
            <p className="mb-6">¿Deseas postularte al evento <strong>{selectedEvent.title}</strong>?</p>
            <div className="flex justify-end space-x-4">
              <Button onClick={() => { setShowConfirmModal(false); setSelectedEvent(null); }}>Cancelar</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={confirmApplication}>Confirmar</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}