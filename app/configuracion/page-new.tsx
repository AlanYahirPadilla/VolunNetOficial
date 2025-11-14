"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Heart, Home, Bell, User, Settings, LogOut,
  User as UserIcon, Shield, Bell as BellIcon,
  Palette, Globe, Smartphone, Mail, MapPin,
  Save, Eye, EyeOff, Lock, Unlock, Trash2, CheckCircle,
  Link as LinkIcon, Briefcase, Award, Calendar, ArrowLeft,
  AlertCircle, Edit3
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { getCurrentUser } from "@/app/auth/actions"
import { VerificationModal } from "@/components/ui/verification-modal"

// Forzar que esta página sea dinámica
export const dynamic = 'force-dynamic'

// --- Datos del Modal de Edición Integrados ---
const GENDERS = ["Masculino", "Femenino", "Otro", "Prefiero no decirlo"];
const SKILLS = [
  "Programación", "Diseño gráfico", "Comunicación", "Liderazgo", "Enseñanza",
  "Logística", "Fotografía", "Marketing", "Atención al cliente", "Redacción"
];
const LANGUAGES = [
  "Español", "Inglés", "Francés", "Alemán", "Italiano", "Portugués", "Chino", "Japonés"
];
const COUNTRIES = ["México", "España", "Argentina", "Colombia", "Estados Unidos", "Chile", "Perú", "Otro"];
const SOCIALS = [
  { label: "Facebook", icon: <LinkIcon className="h-4 w-4 text-blue-600" />, key: "facebook" },
  { label: "Instagram", icon: <LinkIcon className="h-4 w-4 text-pink-500" />, key: "instagram" },
  { label: "Twitter", icon: <LinkIcon className="h-4 w-4 text-blue-400" />, key: "twitter" },
];

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  city?: string
  state?: string
  country?: string
  bio?: string
  role: string
  avatar?: string
  emailVerified?: boolean
  phoneVerified?: boolean
  // Campos adicionales del perfil
  birthDate?: string
  gender?: string
  address?: string
  latitude?: number
  longitude?: number
  tagline?: string
  skills?: string[]
  languages?: string[]
  references?: string[]
  cvUrl?: string
  socialLinks?: string[]
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  eventReminders: boolean
  newEventAlerts: boolean
  applicationUpdates: boolean
  communityUpdates: boolean
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends'
  showEmail: boolean
  showPhone: boolean
  showLocation: boolean
  allowMessages: boolean
}

export default function ConfiguracionPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("perfil")
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [verifyingPhone, setVerifyingPhone] = useState(false)

  // Estados de configuración
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    newEventAlerts: true,
    applicationUpdates: true,
    communityUpdates: false
  })

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowMessages: true
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  useEffect(() => {
    setMounted(true)
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const userData = await getCurrentUser()
      if (userData) {
        setUser(userData as UserData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError("")
    
    try {
      // Aquí iría la lógica para guardar los datos del perfil
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      setError("Error al guardar los datos")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setSaving(true)
    setError("")
    
    try {
      // Aquí iría la lógica para guardar las configuraciones de notificaciones
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      setError("Error al guardar las configuraciones")
    } finally {
      setSaving(false)
    }
  }

  const handleSavePrivacy = async () => {
    setSaving(true)
    setError("")
    
    try {
      // Aquí iría la lógica para guardar las configuraciones de privacidad
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      setError("Error al guardar las configuraciones")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }
    
    setSaving(true)
    setError("")
    
    try {
      // Aquí iría la lógica para cambiar la contraseña
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
      setSuccess(true)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      setError("Error al cambiar la contraseña")
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: "perfil", label: "Perfil", icon: User },
    { id: "notificaciones", label: "Notificaciones", icon: Bell },
    { id: "privacidad", label: "Privacidad", icon: Shield },
    { id: "seguridad", label: "Seguridad", icon: Lock }
  ]

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header superior */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VolunNet</span>
          </div>
          
          {/* Navegación */}
          <div className="flex items-center gap-6">
            <nav className="flex gap-2 text-gray-600 text-sm font-medium">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg transition hover:bg-blue-50"
              >
                <Home className="h-4 w-4" />
                Inicio
              </Link>
              <Link 
                href="/notificaciones" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg transition hover:bg-blue-50"
              >
                <Bell className="h-4 w-4" />
                Notificaciones
              </Link>
              <Link 
                href="/comunidad" 
                className="flex items-center gap-1 px-3 py-1 rounded-lg transition hover:bg-blue-50"
              >
                <User className="h-4 w-4" />
                Comunidad
              </Link>
            </nav>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 border border-blue-200/50"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.firstName} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-sm">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-800">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <Settings className="h-4 w-4 text-gray-500" />
              </button>

              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                >
                  <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Dashboard
                  </Link>
                  <Link href="/configuracion" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Configuración
                  </Link>
                  <Separator className="my-2" />
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" })
                      window.location.href = "/"
                    }}
                  >
                    Cerrar Sesión
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal mejorado */}
      <div className="flex-1 w-full">
        {/* Header de la página mejorado */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
          {/* Patrón de fondo */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al Dashboard
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Configuración de Voluntario
                </h1>
                <p className="text-blue-100 text-lg">Gestiona tu perfil y preferencias personales</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Contenido principal con layout mejorado */}
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Alertas mejoradas */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4 shadow-lg"
            >
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-green-800 font-semibold">¡Configuración guardada!</h3>
                <p className="text-green-700 text-sm">Los cambios se han aplicado correctamente</p>
              </div>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4 shadow-lg"
            >
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-red-800 font-semibold">Error al guardar</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Layout principal mejorado */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Sidebar de navegación mejorado */}
            <div className="xl:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-6">
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                      <div className="h-8 w-8 bg-white/20 rounded-xl flex items-center justify-center">
                        <Settings className="h-4 w-4" />
                      </div>
                      Configuración
                    </CardTitle>
                    <p className="text-blue-100 text-sm">Selecciona una sección para configurar</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <nav className="space-y-3">
                      {tabs.map((tab, index) => {
                        const Icon = tab.icon
                        return (
                          <motion.button
                            key={tab.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all duration-200 group ${
                              activeTab === tab.id
                                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                                : "text-gray-600 hover:bg-gray-50 hover:shadow-md"
                            }`}
                          >
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                              activeTab === tab.id
                                ? "bg-white/20"
                                : "bg-gray-100 group-hover:bg-blue-100"
                            }`}>
                              <Icon className={`h-5 w-5 transition-colors duration-200 ${
                                activeTab === tab.id ? "text-white" : "text-gray-600 group-hover:text-blue-600"
                              }`} />
                            </div>
                            <div className="flex-1">
                              <span className="font-semibold text-sm">{tab.label}</span>
                              <p className="text-xs opacity-70 mt-1">
                                {tab.id === 'perfil' && 'Información personal y perfil'}
                                {tab.id === 'notificaciones' && 'Preferencias de notificaciones'}
                                {tab.id === 'privacidad' && 'Configuración de privacidad'}
                                {tab.id === 'seguridad' && 'Seguridad y contraseñas'}
                              </p>
                            </div>
                          </motion.button>
                        )
                      })}
                    </nav>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Contenido principal mejorado */}
            <div className="xl:col-span-3">
              {/* Tab: Perfil */}
              {activeTab === "perfil" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-6"
                >
                  <Card className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-8">
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        Información del Perfil
                      </CardTitle>
                      <p className="text-blue-100 mt-2">Actualiza tu información personal</p>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                      {/* Avatar mejorado */}
                      <div className="flex items-center gap-8">
                        <div className="relative">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center text-white font-bold text-3xl overflow-hidden shadow-lg">
                            <Avatar className="w-24 h-24">
                              <AvatarImage src={user?.avatar} alt={`${user?.firstName} ${user?.lastName}`} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-3xl">
                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{user?.firstName} {user?.lastName}</h3>
                          <p className="text-gray-600 mb-3">{user?.email}</p>
                          
                          <div className="flex gap-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl"
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Cambiar Avatar
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 rounded-xl"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Información básica */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Nombre</Label>
                          <Input
                            id="firstName"
                            value={user?.firstName || ""}
                            placeholder="Tu nombre"
                            className="rounded-xl"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Apellido</Label>
                          <Input
                            id="lastName"
                            value={user?.lastName || ""}
                            placeholder="Tu apellido"
                            className="rounded-xl"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={user?.email || ""}
                            placeholder="tu@email.com"
                            className="rounded-xl"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input
                            id="phone"
                            value={user?.phone || ""}
                            placeholder="+52 55 1234 5678"
                            className="rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Biografía</Label>
                        <Textarea
                          id="bio"
                          value={user?.bio || ""}
                          placeholder="Cuéntanos sobre ti..."
                          rows={4}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-8"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Guardar Cambios
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Tab: Notificaciones */}
              {activeTab === "notificaciones" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-6"
                >
                  <Card className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-8">
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center">
                          <Bell className="h-5 w-5" />
                        </div>
                        Configuración de Notificaciones
                      </CardTitle>
                      <p className="text-blue-100 mt-2">Personaliza cómo y cuándo recibir notificaciones</p>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h3 className="font-semibold text-gray-800">Notificaciones por Email</h3>
                            <p className="text-sm text-gray-600">Recibir notificaciones importantes por correo electrónico</p>
                          </div>
                          <Switch
                            checked={notifications.emailNotifications}
                            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h3 className="font-semibold text-gray-800">Notificaciones Push</h3>
                            <p className="text-sm text-gray-600">Recibir notificaciones en tiempo real en tu dispositivo</p>
                          </div>
                          <Switch
                            checked={notifications.pushNotifications}
                            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h3 className="font-semibold text-gray-800">Recordatorios de Eventos</h3>
                            <p className="text-sm text-gray-600">Notificaciones antes de que comiencen los eventos</p>
                          </div>
                          <Switch
                            checked={notifications.eventReminders}
                            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, eventReminders: checked }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h3 className="font-semibold text-gray-800">Alertas de Nuevos Eventos</h3>
                            <p className="text-sm text-gray-600">Notificaciones cuando se publiquen nuevos eventos</p>
                          </div>
                          <Switch
                            checked={notifications.newEventAlerts}
                            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newEventAlerts: checked }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h3 className="font-semibold text-gray-800">Actualizaciones de Aplicaciones</h3>
                            <p className="text-sm text-gray-600">Notificaciones sobre el estado de tus aplicaciones</p>
                          </div>
                          <Switch
                            checked={notifications.applicationUpdates}
                            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, applicationUpdates: checked }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h3 className="font-semibold text-gray-800">Actualizaciones de la Comunidad</h3>
                            <p className="text-sm text-gray-600">Notificaciones sobre actividades de la comunidad</p>
                          </div>
                          <Switch
                            checked={notifications.communityUpdates}
                            onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, communityUpdates: checked }))}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          onClick={handleSaveNotifications}
                          disabled={saving}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-8"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Guardar Configuración
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Tab: Privacidad */}
              {activeTab === "privacidad" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-6"
                >
                  <Card className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-8">
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center">
                          <Shield className="h-5 w-5" />
                        </div>
                        Configuración de Privacidad
                      </CardTitle>
                      <p className="text-blue-100 mt-2">Controla qué información es visible para otros usuarios</p>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="profileVisibility">Visibilidad del Perfil</Label>
                          <Select value={privacy.profileVisibility} onValueChange={(value: 'public' | 'private' | 'friends') => setPrivacy(prev => ({ ...prev, profileVisibility: value }))}>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Público</SelectItem>
                              <SelectItem value="friends">Solo Amigos</SelectItem>
                              <SelectItem value="private">Privado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h3 className="font-semibold text-gray-800">Mostrar Email</h3>
                            <p className="text-sm text-gray-600">Permitir que otros usuarios vean tu email</p>
                          </div>
                          <Switch
                            checked={privacy.showEmail}
                            onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showEmail: checked }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h3 className="font-semibold text-gray-800">Mostrar Teléfono</h3>
                            <p className="text-sm text-gray-600">Permitir que otros usuarios vean tu teléfono</p>
                          </div>
                          <Switch
                            checked={privacy.showPhone}
                            onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showPhone: checked }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h3 className="font-semibold text-gray-800">Mostrar Ubicación</h3>
                            <p className="text-sm text-gray-600">Permitir que otros usuarios vean tu ubicación</p>
                          </div>
                          <Switch
                            checked={privacy.showLocation}
                            onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showLocation: checked }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h3 className="font-semibold text-gray-800">Permitir Mensajes</h3>
                            <p className="text-sm text-gray-600">Permitir que otros usuarios te envíen mensajes</p>
                          </div>
                          <Switch
                            checked={privacy.allowMessages}
                            onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, allowMessages: checked }))}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          onClick={handleSavePrivacy}
                          disabled={saving}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-8"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Guardar Configuración
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Tab: Seguridad */}
              {activeTab === "seguridad" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-6"
                >
                  <Card className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-8">
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center">
                          <Lock className="h-5 w-5" />
                        </div>
                        Seguridad y Contraseñas
                      </CardTitle>
                      <p className="text-blue-100 mt-2">Gestiona la seguridad de tu cuenta</p>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Contraseña Actual</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              placeholder="Ingresa tu contraseña actual"
                              className="rounded-xl pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Nueva Contraseña</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                              placeholder="Ingresa tu nueva contraseña"
                              className="rounded-xl pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showPassword ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Confirma tu nueva contraseña"
                              className="rounded-xl pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          onClick={handleChangePassword}
                          disabled={saving}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-8"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Cambiando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Cambiar Contraseña
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de verificación */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerify={async (type: 'email' | 'phone') => {
          if (type === 'email') {
            setVerifyingEmail(true)
            // Simular verificación
            await new Promise(resolve => setTimeout(resolve, 2000))
            setVerifyingEmail(false)
            setShowVerificationModal(false)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
          } else {
            setVerifyingPhone(true)
            // Simular verificación
            await new Promise(resolve => setTimeout(resolve, 2000))
            setVerifyingPhone(false)
            setShowVerificationModal(false)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
          }
        }}
        verifyingEmail={verifyingEmail}
        verifyingPhone={verifyingPhone}
      />
    </div>
  )
}
