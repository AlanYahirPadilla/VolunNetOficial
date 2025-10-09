"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Trash2, Calendar, MapPin, Users, AlertCircle, CheckCircle, Heart, Home, Bell, User, Settings, LogOut, MessageCircle, Edit3, Sparkles, Target, Zap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { getCurrentUser } from "@/app/auth/actions"

interface EventData {
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
  skills: string[]
  requirements: string[]
  benefits: string[]
  categoryId: string
  status: string
  organization_name?: string
  category_name?: string
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

function UserMenu({ userName, userEmail, userAvatar }: { userName: string, userEmail: string, userAvatar?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt="Avatar usuario" 
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement!;
                parent.innerHTML = userName?.[0] || 'U';
              }}
            />
          ) : (
            userName?.[0] || 'U'
          )}
        </div>
        <span className="text-sm font-medium text-gray-700">{userName}</span>
        <Settings className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <motion.div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userEmail}</p>
          </div>
          <Link href="/organizaciones/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Perfil
          </Link>
          <Link href="/notificaciones" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Notificaciones
          </Link>
          <Link href="/organizaciones/comunidad" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Comunidad
          </Link>
          <Link href="/organizaciones/configuracion" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Configuración
          </Link>
          <div className="border-t border-gray-100 mt-2 pt-2">
            <button 
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" })
                window.location.href = "/"
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function EditarEventoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userAvatar, setUserAvatar] = useState("")

  useEffect(() => {
    loadUser()
    loadEventData()
  }, [params.id])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        if (currentUser.firstName) setUserName(currentUser.firstName)
        if (currentUser.email) setUserEmail(currentUser.email)
        if ((currentUser as any)?.avatar) {
          setUserAvatar((currentUser as any).avatar)
        }
      }
    } catch (error) {
      console.error("Error loading user:", error)
    }
  }

  const loadEventData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar categorías
      const categoriesResponse = await fetch("/api/events/categories")
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        if (categoriesData?.categories) {
          setCategories(categoriesData.categories)
        }
      }

      // Cargar datos del evento
      const eventResponse = await fetch(`/api/events/${params.id}`)
      if (eventResponse.ok) {
        const eventData = await eventResponse.json()
        if (eventData?.event) {
          // Formatear fechas para input type="date"
          const formattedEvent = {
            ...eventData.event,
            startDate: eventData.event.startDate ? new Date(eventData.event.startDate).toISOString().split('T')[0] : '',
            endDate: eventData.event.endDate ? new Date(eventData.event.endDate).toISOString().split('T')[0] : ''
          }
          setEvent(formattedEvent)
        } else {
          setError("Evento no encontrado")
        }
      } else {
        setError("Error al cargar el evento")
      }
    } catch (error) {
      console.error("Error loading event data:", error)
      setError("Error al cargar los datos del evento")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!event) return
    
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Validaciones básicas
      if (!event.title.trim()) {
        setError("El título es obligatorio")
        return
      }
      if (!event.description.trim()) {
        setError("La descripción es obligatoria")
        return
      }
      if (!event.city.trim()) {
        setError("La ciudad es obligatoria")
        return
      }
      if (!event.startDate) {
        setError("La fecha de inicio es obligatoria")
        return
      }
      if (!event.endDate) {
        setError("La fecha de fin es obligatoria")
        return
      }
      if (new Date(event.startDate) >= new Date(event.endDate)) {
        setError("La fecha de fin debe ser posterior a la fecha de inicio")
        return
      }
      if (event.maxVolunteers <= 0) {
        setError("El número máximo de voluntarios debe ser mayor a 0")
        return
      }

      // Preparar datos para enviar
      const eventDataToSend = {
        ...event,
        startDate: new Date(event.startDate).toISOString(),
        endDate: new Date(event.endDate).toISOString(),
      }

      console.log("=== Enviando datos del evento ===")
      console.log("Event ID:", event.id)
      console.log("Category ID:", event.categoryId)
      console.log("Datos completos:", eventDataToSend)

      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventDataToSend),
      })

      if (response.ok) {
        setSuccess("Evento actualizado correctamente")
        setTimeout(() => {
          router.push('/organizaciones/dashboard')
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al guardar el evento')
      }
    } catch (error) {
      console.error("Error saving event:", error)
      setError('Error al guardar el evento')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!event || !confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) return
    
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess("Evento eliminado correctamente")
        setTimeout(() => {
          router.push('/organizaciones/dashboard')
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al eliminar el evento')
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      setError('Error al eliminar el evento')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando evento...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Evento no encontrado</h2>
          <p className="text-gray-600 mb-6">El evento que buscas no existe o no tienes permisos para editarlo.</p>
          <Link href="/organizaciones/dashboard">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Volver al Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header superior con navegación completa */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VolunNet</span>
          </div>
          
          {/* Navegación - Oculto en móviles pequeños */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-2 text-gray-600 text-sm font-medium">
              <Link 
                href="/organizaciones/dashboard" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg transition group relative hover:text-blue-700 hover:bg-blue-50"
              >
                <Home className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Inicio</span>
              </Link>
              <Link 
                href="/notificaciones" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative"
              >
                <Bell className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Notificaciones</span>
              </Link>
              <Link 
                href="/organizaciones/comunidad" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group"
              >
                <MessageCircle className="h-5 w-5 group-hover:text-blue-700 transition" />
                <span>Comunidad</span>
              </Link>
            </nav>
            {/* Separador visual */}
            <div className="w-px h-8 bg-gray-200 mx-2" />
            {/* Avatar usuario con menú */}
            <UserMenu userName={userName} userEmail={userEmail} userAvatar={userAvatar}/>
          </div>

          {/* Menú móvil - Solo avatar en pantallas pequeñas */}
          <div className="md:hidden">
            <UserMenu userName={userName} userEmail={userEmail} userAvatar={userAvatar}/>
          </div>
        </div>
      </div>

      {/* Header específico de la página */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/organizaciones/dashboard')} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Volver al Dashboard</span>
                <span className="sm:hidden">Volver</span>
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="h-6 w-6 text-blue-600" />
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Editar Evento</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDelete}
                disabled={saving}
                className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-red-800 transition-all duration-200 group"
              >
                <Trash2 className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <Save className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">{saving ? "Guardando..." : "Guardar"}</span>
                <span className="sm:hidden">{saving ? "..." : "✓"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Alertas */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-green-700">{success}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica mejorada */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl shadow-xl border border-blue-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Elementos decorativos de fondo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full translate-y-12 -translate-x-12"></div>
                
                <CardHeader className="relative z-10 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-blue-100/50">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                      <Edit3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent">Información del Evento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-8 space-y-8">
                  {/* Título */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100/50">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-3 block">Título del evento *</Label>
                    <Input
                      id="title"
                      value={event.title}
                      onChange={(e) => setEvent({ ...event, title: e.target.value })}
                      placeholder="Ej: Limpieza de Playa Vallarta"
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-lg"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100/50">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-3 block">Descripción *</Label>
                    <Textarea
                      id="description"
                      value={event.description}
                      onChange={(e) => setEvent({ ...event, description: e.target.value })}
                      placeholder="Describe detalladamente tu evento, qué harán los voluntarios, qué impacto tendrá..."
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>

                  {/* Ubicación */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100/50">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </div>
                      Ubicación
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-xs text-gray-600 mb-2 block">Ciudad *</Label>
                        <Input
                          id="city"
                          value={event.city}
                          onChange={(e) => setEvent({ ...event, city: e.target.value })}
                          placeholder="Guadalajara"
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-xs text-gray-600 mb-2 block">Estado *</Label>
                        <Input
                          id="state"
                          value={event.state}
                          onChange={(e) => setEvent({ ...event, state: e.target.value })}
                          placeholder="Jalisco"
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country" className="text-xs text-gray-600 mb-2 block">País</Label>
                        <Input
                          id="country"
                          value={event.country}
                          onChange={(e) => setEvent({ ...event, country: e.target.value })}
                          placeholder="México"
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fechas */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100/50">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      Fechas del Evento
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate" className="text-xs text-gray-600 mb-2 block">Fecha de inicio *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={event.startDate}
                          onChange={(e) => setEvent({ ...event, startDate: e.target.value })}
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate" className="text-xs text-gray-600 mb-2 block">Fecha de fin *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={event.endDate}
                          onChange={(e) => setEvent({ ...event, endDate: e.target.value })}
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Capacidad */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100/50">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Users className="h-4 w-4 text-emerald-600" />
                      </div>
                      Capacidad
                    </Label>
                    <div>
                      <Label htmlFor="maxVolunteers" className="text-xs text-gray-600 mb-2 block">Número máximo de voluntarios *</Label>
                      <Input
                        id="maxVolunteers"
                        type="number"
                        min="1"
                        value={event.maxVolunteers}
                        onChange={(e) => setEvent({ ...event, maxVolunteers: parseInt(e.target.value) || 0 })}
                        placeholder="10"
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Categoría y Estado */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100/50">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Sparkles className="h-4 w-4 text-amber-600" />
                      </div>
                      Configuración
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2 block">Categoría</Label>
                        <Select value={event.categoryId} onValueChange={(value) => setEvent({ ...event, categoryId: value })}>
                          <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                <div className="flex items-center gap-2">
                                  <span>{c.icon}</span>
                                  <span>{c.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">Estado</Label>
                        <Select value={event.status} onValueChange={(value) => setEvent({ ...event, status: value })}>
                          <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Selecciona el estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DRAFT">
                              <Badge variant="secondary">Borrador</Badge>
                            </SelectItem>
                            <SelectItem value="PUBLISHED">
                              <Badge className="bg-green-100 text-green-700">Publicado</Badge>
                            </SelectItem>
                            <SelectItem value="ONGOING">
                              <Badge className="bg-blue-100 text-blue-700">En Proceso</Badge>
                            </SelectItem>
                            <SelectItem value="COMPLETED">
                              <Badge className="bg-purple-100 text-purple-700">Completado</Badge>
                            </SelectItem>
                            <SelectItem value="ARCHIVED">
                              <Badge className="bg-gray-100 text-gray-700">Archivado</Badge>
                            </SelectItem>
                            <SelectItem value="CANCELLED">
                              <Badge variant="destructive">Cancelado</Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del evento mejorada */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="relative bg-gradient-to-br from-white via-indigo-50/30 to-blue-50/30 rounded-3xl shadow-xl border border-indigo-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Elementos decorativos */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-200/20 to-blue-200/20 rounded-full -translate-y-10 translate-x-10"></div>
                
                <CardHeader className="relative z-10 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 border-b border-indigo-100/50">
                  <CardTitle className="text-lg font-bold flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl">
                      <Target className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="bg-gradient-to-r from-indigo-800 to-blue-800 bg-clip-text text-transparent">Información del Evento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-6 space-y-4">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-indigo-100/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">ID del evento:</span>
                      <span className="text-sm font-mono text-gray-900">{event.id}</span>
                    </div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-indigo-100/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Organización:</span>
                      <span className="text-sm font-medium text-gray-900">{event.organization_name || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-indigo-100/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Categoría:</span>
                      <span className="text-sm font-medium text-gray-900">{event.category_name || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-indigo-100/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Estado actual:</span>
                      <Badge 
                        variant={event.status === 'PUBLISHED' ? 'default' : event.status === 'CANCELLED' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {event.status === 'PUBLISHED' ? 'Publicado' : event.status === 'CANCELLED' ? 'Cancelado' : 'Borrador'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Consejos mejorados */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="relative bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 rounded-3xl shadow-xl border border-amber-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Elementos decorativos */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full -translate-y-8 translate-x-8"></div>
                
                <CardHeader className="relative z-10 bg-gradient-to-r from-amber-50/50 to-orange-50/50 border-b border-amber-100/50">
                  <CardTitle className="text-lg font-bold flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                      <Zap className="h-5 w-5 text-amber-600" />
                    </div>
                    <span className="bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent">Consejos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-6 space-y-4">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-amber-100/50">
                    <div className="text-sm text-gray-700">
                      <strong className="text-amber-700">• Título claro:</strong> Usa un título descriptivo y atractivo
                    </div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-amber-100/50">
                    <div className="text-sm text-gray-700">
                      <strong className="text-amber-700">• Descripción detallada:</strong> Explica qué harán los voluntarios
                    </div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-amber-100/50">
                    <div className="text-sm text-gray-700">
                      <strong className="text-amber-700">• Fechas realistas:</strong> Asegúrate de que las fechas sean correctas
                    </div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-amber-100/50">
                    <div className="text-sm text-gray-700">
                      <strong className="text-amber-700">• Capacidad adecuada:</strong> Define un número razonable de voluntarios
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 