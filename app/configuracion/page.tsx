"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Settings, 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Globe, 
  FileText, 
  Bell, 
  Shield, 
  Save, 
  ArrowLeft,
  Home,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Heart,
  Lock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCurrentUser } from "@/app/auth/actions"
import { VerificationModal } from "@/components/ui/verification-modal"
import { BottomNavigation } from "@/components/ui/bottom-navigation"
import { MobileNavigation } from "@/components/ui/mobile-navigation"

// Forzar que esta página sea dinámica
export const dynamic = 'force-dynamic'

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

function UserMenu({ userName, userEmail, userAvatar }: { 
  userName: string
  userEmail: string
  userAvatar?: string 
}) {
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
        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 border border-blue-200/50"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            userName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-gray-800">{userName}</div>
          <div className="text-xs text-gray-500">{userEmail}</div>
        </div>
        <Settings className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
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
  )
}

export default function ConfiguracionPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("perfil")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  
  // Estados del usuario
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userAvatar, setUserAvatar] = useState("")
  
  // Datos del usuario
  const [userData, setUserData] = useState<UserData>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    country: "México",
    bio: "",
    role: "VOLUNTEER",
    avatar: "",
    emailVerified: false,
    phoneVerified: false
  })
  
  // Configuraciones de notificaciones
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    newEventAlerts: true,
    applicationUpdates: true,
    communityUpdates: false
  })
  
  // Configuraciones de privacidad
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowMessages: true
  })
  
  // Estados de contraseña
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Estados para cambio de avatar
  const [selectedAvatar, setSelectedAvatar] = useState<string>("")
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Estados para verificación
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [verifyingPhone, setVerifyingPhone] = useState(false)

  // Avatares predefinidos para voluntarios
  const predefinedAvatars = [
    { id: "avatarV1", name: "Avatar 1", image: "/avatars/avatarV1.png" },
    { id: "avatarV2", name: "Avatar 2", image: "/avatars/avatarV2.png" },
    { id: "avatarV3", name: "Avatar 3", image: "/avatars/avatarV3.png" },
    { id: "avatarV4", name: "Avatar 4", image: "/avatars/avatarV4.png" },
    { id: "avatarV5", name: "Avatar 5", image: "/avatars/avatarV5.png" }
  ]

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await getCurrentUser()
        if (user?.firstName) setUserName(user.firstName)
        if (user?.email) setUserEmail(user.email)
        if ((user as any)?.avatar) {
          setUserAvatar((user as any).avatar)
          console.log("Avatar loaded:", (user as any).avatar)
        }
        
        // Cargar datos del usuario
        setUserData(prev => ({
          ...prev,
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
          phone: (user as any)?.phone || "",
          birthDate: (user as any)?.birthDate || "",
          gender: (user as any)?.gender || "",
          country: (user as any)?.country || "México",
          state: (user as any)?.state || "",
          city: (user as any)?.city || "",
          address: (user as any)?.address || "",
          latitude: (user as any)?.latitude || 0,
          longitude: (user as any)?.longitude || 0,
          tagline: (user as any)?.tagline || "",
          bio: (user as any)?.bio || "",
          skills: (user as any)?.skills || [],
          languages: (user as any)?.languages || [],
          references: (user as any)?.references || [],
          cvUrl: (user as any)?.cvUrl || "",
          avatar: (user as any)?.avatar || "",
          emailVerified: (user as any)?.emailVerified || false,
          phoneVerified: (user as any)?.phoneVerified || false,
          socialLinks: (user as any)?.socialLinks || []
        }))
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

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

  const handleSelectAvatar = (avatarId: string) => {
    setSelectedAvatar(avatarId)
  }

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return
    
    setUploadingAvatar(true)
    setError("")
    
    try {
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Actualizar el avatar en el estado
      setUserData(prev => ({ ...prev, avatar: selectedAvatar }))
      setUserAvatar(selectedAvatar)
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
      // Cerrar modal
      setShowAvatarModal(false)
      
    } catch (error) {
      setError("Error al guardar el avatar")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true)
    setError("")
    
    try {
      // Simulación
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Actualizar estados
      const emptyAvatar = ""
      setUserData(prev => ({ ...prev, avatar: emptyAvatar }))
      setUserAvatar(emptyAvatar)
      setSelectedAvatar("")
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
    } catch (error) {
      setError("Error al eliminar el avatar")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const tabs = [
    { id: "perfil", label: "Perfil", icon: User },
    { id: "notificaciones", label: "Notificaciones", icon: Bell },
    { id: "privacidad", label: "Privacidad", icon: Shield },
    { id: "seguridad", label: "Seguridad", icon: Lock }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col pb-nav-mobile">
      {/* Header superior - Desktop */}
      <div className="hidden md:block sticky top-0 z-30 bg-white shadow-sm border-b">
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
                <MessageCircle className="h-4 w-4" />
                Comunidad
              </Link>
            </nav>
            
            <UserMenu 
              userName={userName}
              userEmail={userEmail}
              userAvatar={userAvatar}
            />
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu - Esto debe ir antes del contenido principal para que funcione en móvil */}
      <div className="md:hidden sticky top-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <MobileNavigation user={{ firstName: userName.split(' ')[0], lastName: userData.lastName || '', email: userEmail, avatar: userAvatar }} currentPath="/configuracion" />
        </div>
      </div>

      {/* MODIFICADO: Header de la página mejorado - Fondo pastel AÚN MÁS CLARO (100) y Título Grande (6xl) */}
      <div className="relative bg-gradient-to-r from-teal-100 via-blue-100 to-purple-100 overflow-hidden">
        {/* Patrón de fondo - Opacidad pastel AÚN MÁS CLARO */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-100/90 via-blue-100/90 to-purple-100/90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8 md:py-12">
          {/* ELIMINADO: Botón Volver al Dashboard */}
          
          {/* Título principal con TAMAÑO BB y estilo oscuro */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4" 
          >
            {/* Ícono en fondo blanco/claro y color oscuro */}
            <div className="h-16 w-16 bg-white/50 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-md">
              <Settings className="h-8 w-8 text-gray-700" /> 
            </div>
            <div>
              <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent mb-2" style={{ textShadow: '0px 4px 6px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.05)' }}>
                Configuración de Perfil
              </h1>
              <p className="text-gray-700 text-lg">Gestiona tu perfil y preferencias de voluntariado</p> 
            </div>
          </motion.div>
        </div>
      </div>

        {/* Contenido */}
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">

          {/* Alertas compactas */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800">Configuración guardada</p>
            </div>
          )}
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Layout mejorado */}
          <div className="space-y-6">
            {/* Tabs compactos y responsive - Ajustado para ser más ancho en desktop */}
            <Card className="bg-white rounded-2xl shadow-md border">
              <CardContent className="p-2">
                <nav className="grid grid-cols-2 md:grid-cols-4 gap-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg text-center transition-all ${
                          activeTab === tab.id
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm"
                            : "text-gray-600 hover:bg-blue-50"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${activeTab === tab.id ? "text-white" : "text-gray-600"}`} />
                        <span className="font-medium text-sm">{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* Contenido tabs */}
            <div className="max-w-4xl mx-auto">
              {/* Tab: Perfil */}
              {activeTab === "perfil" && (
                <div className="space-y-4">
                  <Card className="bg-white rounded-2xl shadow-md border overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Información del Perfil
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {/* Avatar */}
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-3xl flex items-center justify-center text-white font-bold text-3xl overflow-hidden shadow-md">
                            {userData.avatar ? (
                              <img 
                                src={userData.avatar} 
                                alt={`${userData.firstName} ${userData.lastName}`} 
                                className="w-24 h-24 rounded-3xl object-cover"
                              />
                            ) : (
                              `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{userData.firstName} {userData.lastName}</h3>
                          <p className="text-gray-600 mb-3">{userData.email}</p>
                          
                          <div className="flex gap-3">
                            <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  disabled={uploadingAvatar}
                                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl"
                                >
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Cambiar Avatar
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Seleccionar Avatar
                                  </DialogTitle>
                                </DialogHeader>
                                
                                <div className="grid grid-cols-3 gap-4 py-4">
                                  {predefinedAvatars.map((avatar) => (
                                    <div
                                      key={avatar.id}
                                      onClick={() => handleSelectAvatar(avatar.id)}
                                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
                                        selectedAvatar === avatar.id 
                                          ? 'border-blue-500 bg-blue-50' 
                                          : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                                        {avatar.image ? (
                                          <img src={avatar.image} alt={avatar.name} className="w-16 h-16 rounded-full object-cover" />
                                        ) : (
                                          avatar.name.split(' ')[1]
                                        )}
                                      </div>
                                      <p className="text-sm font-medium text-center">{avatar.name}</p>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setShowAvatarModal(false)}>
                                    Cancelar
                                  </Button>
                                  <Button 
                                    onClick={handleSaveAvatar}
                                    disabled={!selectedAvatar || uploadingAvatar}
                                    className="bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white shadow-md rounded-xl"
                                  >
                                    {uploadingAvatar ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Guardando...
                                      </>
                                    ) : (
                                      'Guardar Avatar'
                                    )}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              variant="outline"
                              size="sm"
                              disabled={uploadingAvatar}
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
                            value={userData.firstName}
                            onChange={(e) => setUserData(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Tu nombre"
                            className="rounded-xl"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Apellido</Label>
                          <Input
                            id="lastName"
                            value={userData.lastName}
                            onChange={(e) => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Tu apellido"
                            className="rounded-xl"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={userData.email}
                            onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="tu@email.com"
                            className="rounded-xl"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input
                            id="phone"
                            value={userData.phone || ""}
                            onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+52 55 1234 5678"
                            className="rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Biografía</Label>
                        <Textarea
                          id="bio"
                          value={userData.bio || ""}
                          onChange={(e) => setUserData(prev => ({ ...prev, bio: e.target.value }))}
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
                </div>
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
                    <CardHeader className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 p-8 border-b border-blue-200">
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-200/50 rounded-2xl flex items-center justify-center">
                          <Bell className="h-5 w-5 text-purple-600" />
                        </div>
                        Configuración de Notificaciones
                      </CardTitle>
                      <p className="text-gray-600 mt-2">Personaliza cómo y cuándo recibir notificaciones</p>
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
                    <CardHeader className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 p-8 border-b border-blue-200">
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-200/50 rounded-2xl flex items-center justify-center">
                          <Shield className="h-5 w-5 text-green-600" />
                        </div>
                        Configuración de Privacidad
                      </CardTitle>
                      <p className="text-gray-600 mt-2">Controla qué información es visible para otros usuarios</p>
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
                    <CardHeader className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 p-8 border-b border-blue-200">
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-200/50 rounded-2xl flex items-center justify-center">
                          <Lock className="h-5 w-5 text-pink-600" />
                        </div>
                        Seguridad y Contraseñas
                      </CardTitle>
                      <p className="text-gray-600 mt-2">Gestiona la seguridad de tu cuenta</p>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Contraseña Actual</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              placeholder="Ingresa tu contraseña actual"
                              className="rounded-xl pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Nueva Contraseña</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                              placeholder="Ingresa tu nueva contraseña"
                              className="rounded-xl pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Confirma tu nueva contraseña"
                              className="rounded-xl pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

      {/* Modal de verificación */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerify={async (code: string) => {
          // Simular verificación
          await new Promise(resolve => setTimeout(resolve, 2000))
          setShowVerificationModal(false)
          setSuccess(true)
          setTimeout(() => setSuccess(false), 3000)
        }}
        type="email"
        isLoading={false}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}