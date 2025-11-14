"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Star, 
  Clock, 
  Award,
  Users,
  Heart,
  Briefcase,
  Globe,
  Phone,
  FileText,
  CheckCircle,
  X,
  Settings,
  Home,
  Bell,
  MessageCircle
} from "lucide-react"
import { getCurrentUser } from "@/app/auth/actions"
import { BottomNavigation } from "@/components/ui/bottom-navigation"

interface VolunteerProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  bio?: string
  city?: string
  state?: string
  country?: string
  rating?: number
  hoursCompleted?: number
  eventsParticipated?: number
  skills?: string[]
  interests?: string[]
  experience?: string[]
  languages?: string[]
  gender?: string
  birthDate?: string
  tagline?: string
  verified?: boolean
  avatar?: string
  participatedEvents?: any[]
  stats?: {
    totalApplications: number
    acceptedApplications: number
    rejectedApplications: number
    completedEvents: number
    averageRating: number
  }
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
          <Link href="/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Perfil
          </Link>
          <Link href="/notificaciones" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Notificaciones
          </Link>
          <Link href="/comunidad" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Comunidad
          </Link>
          <Link href="/configuracion" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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

export default function VolunteerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const volunteerId = params?.id as string
  
  const [profile, setProfile] = useState<VolunteerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userAvatar, setUserAvatar] = useState("")

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user && volunteerId) {
      loadVolunteerProfile()
    }
  }, [user, volunteerId])

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
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error("Error loading user:", error)
      router.push('/login')
    }
  }

  const loadVolunteerProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/volunteers/${volunteerId}`)
      if (!response.ok) {
        throw new Error('Error al cargar el perfil del voluntario')
      }
      
      const data = await response.json()
      setProfile(data.profile)
      
    } catch (error) {
      console.error("Error loading volunteer profile:", error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil del voluntario...</p>
        </div>
      </div>
    )
  }

  // Evitar renderizado hasta que tengamos datos
  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleBack}>
            Volver
          </Button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Voluntario no encontrado</h2>
          <p className="text-gray-600 mb-4">El perfil del voluntario no existe o no está disponible.</p>
          <Button onClick={handleBack}>
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col pb-nav-mobile">
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
                href="/dashboard" 
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
                href="/comunidad" 
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
              <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Volver</span>
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-blue-600" />
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Perfil del Voluntario</h1>
              </div>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Mejorado */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-3xl shadow-xl border border-blue-100/50 p-8 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Elementos decorativos de fondo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  {/* Avatar y nombre centrados */}
                  <div className="text-center mb-8">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center overflow-hidden shadow-2xl ring-4 ring-white/50 mx-auto">
                        {profile.avatar ? (
                          <img 
                            src={profile.avatar} 
                            alt={`Avatar de ${profile.firstName} ${profile.lastName}`}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement!;
                              parent.innerHTML = '<svg class="h-16 w-16 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>';
                            }}
                          />
                        ) : (
                          <User className="h-16 w-16 text-blue-600" />
                        )}
                      </div>
                      {/* Indicador de estado */}
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <div className="flex items-center justify-center space-x-4 mb-3">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                          {profile.firstName} {profile.lastName}
                        </h2>
                        {profile.verified && (
                          <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 shadow-md">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        )}
                      </div>
                      
                      {profile.tagline && (
                        <p className="text-lg text-gray-600 italic font-medium">"{profile.tagline}"</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Información personal en grid más espacioso */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-4 p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Mail className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <p className="font-medium text-gray-900 break-all">{profile.email}</p>
                      </div>
                    </div>
                    
                    {profile.city && (
                      <div className="flex items-center space-x-4 p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <MapPin className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-1">Ubicación</p>
                          <p className="font-medium text-gray-900">{profile.city}, {profile.state}</p>
                        </div>
                      </div>
                    )}
                    
                    {profile.birthDate && (
                      <div className="flex items-center space-x-4 p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-1">Fecha de nacimiento</p>
                          <p className="font-medium text-gray-900">{formatDate(profile.birthDate)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Bio Mejorada */}
            {profile.bio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card className="relative bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-3xl shadow-xl border border-purple-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Elementos decorativos */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full -translate-y-12 translate-x-12"></div>
                  
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center space-x-3 text-xl">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                        <User className="h-6 w-6 text-purple-600" />
                      </div>
                      <span className="bg-gradient-to-r from-purple-800 to-pink-800 bg-clip-text text-transparent">Biografía</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                      <p className="text-gray-700 leading-relaxed text-lg">{profile.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Skills Mejoradas */}
            {profile.skills && profile.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card className="relative bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-3xl shadow-xl border border-blue-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Elementos decorativos */}
                  <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full -translate-y-10 -translate-x-10"></div>
                  
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center space-x-3 text-xl">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">Habilidades</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                      <div className="flex flex-wrap gap-3">
                        {profile.skills.map((skill, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <Badge className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 hover:shadow-md transition-shadow">
                              {skill}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Interests Mejorados */}
            {profile.interests && profile.interests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Card className="relative bg-gradient-to-br from-white via-pink-50/30 to-rose-50/30 rounded-3xl shadow-xl border border-pink-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Elementos decorativos */}
                  <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tr from-pink-200/20 to-rose-200/20 rounded-full translate-y-14 translate-x-14"></div>
                  
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center space-x-3 text-xl">
                      <div className="p-2 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl">
                        <Heart className="h-6 w-6 text-pink-600" />
                      </div>
                      <span className="bg-gradient-to-r from-pink-800 to-rose-800 bg-clip-text text-transparent">Intereses</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-100">
                      <div className="flex flex-wrap gap-3">
                        {profile.interests.map((interest, index) => {
                          // Mapear categorías de intereses a nombres más legibles
                          const interestCategories: { [key: string]: string } = {
                            'cat_1': 'Medio Ambiente',
                            'cat_2': 'Educación',
                            'cat_3': 'Salud',
                            'cat_4': 'Arte y Cultura',
                            'cat_5': 'Deportes',
                            'cat_6': 'Tecnología',
                            'cat_7': 'Comunidad',
                            'cat_8': 'Animales',
                            'cat_9': 'Derechos Humanos',
                            'cat_10': 'Desarrollo Social',
                            'cat_11': 'Emergencias',
                            'cat_12': 'Religión',
                            'cat_13': 'Ciencia',
                            'cat_14': 'Turismo',
                            'cat_15': 'Otros'
                          };
                          
                          const displayName = interestCategories[interest] || interest;
                          
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 * index }}
                            >
                              <Badge className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border border-pink-200 hover:shadow-md transition-shadow">
                                {displayName}
                              </Badge>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Experience Mejorada */}
            {profile.experience && profile.experience.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Card className="relative bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 rounded-3xl shadow-xl border border-emerald-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Elementos decorativos */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full -translate-y-16 translate-x-16"></div>
                  
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center space-x-3 text-xl">
                      <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                        <Award className="h-6 w-6 text-emerald-600" />
                      </div>
                      <span className="bg-gradient-to-r from-emerald-800 to-teal-800 bg-clip-text text-transparent">Experiencia</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100">
                      <ul className="space-y-4">
                        {profile.experience.map((exp, index) => (
                          <motion.li 
                            key={index} 
                            className="flex items-start space-x-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                            <span className="text-gray-700 font-medium">{exp}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Languages Mejorados */}
            {profile.languages && profile.languages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Card className="relative bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 rounded-3xl shadow-xl border border-amber-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Elementos decorativos */}
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-200/20 to-orange-200/20 rounded-full translate-y-12 -translate-x-12"></div>
                  
                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center space-x-3 text-xl">
                      <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                        <Globe className="h-6 w-6 text-amber-600" />
                      </div>
                      <span className="bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent">Idiomas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
                      <div className="flex flex-wrap gap-3">
                        {profile.languages.map((language, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <Badge className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200 hover:shadow-md transition-shadow">
                              {language}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar Mejorado */}
          <div className="space-y-6">
            {/* Stats Mejoradas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="relative bg-gradient-to-br from-white via-indigo-50/30 to-blue-50/30 rounded-3xl shadow-xl border border-indigo-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Elementos decorativos */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-200/20 to-blue-200/20 rounded-full -translate-y-10 translate-x-10"></div>
                
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl bg-gradient-to-r from-indigo-800 to-blue-800 bg-clip-text text-transparent">Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  <div className="bg-white rounded-2xl p-4 shadow-lg border border-indigo-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600 font-medium">Eventos Participados</span>
                      <span className="text-2xl font-bold text-indigo-600">{profile.eventsParticipated || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min((profile.eventsParticipated || 0) * 10, 100)}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-4 shadow-lg border border-indigo-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600 font-medium">Horas Completadas</span>
                      <span className="text-2xl font-bold text-emerald-600">{profile.hoursCompleted || 0}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min((profile.hoursCompleted || 0) * 2, 100)}%` }}></div>
                    </div>
                  </div>
                  
                  {profile.rating && (
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-indigo-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-600 font-medium">Calificación</span>
                        <div className="flex items-center space-x-1">
                          {getRatingStars(profile.rating)}
                          <span className="ml-2 text-lg font-bold text-yellow-600">({profile.rating})</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {profile.stats && (
                    <>
                      <div className="bg-white rounded-2xl p-4 shadow-lg border border-indigo-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600 font-medium">Aplicaciones Totales</span>
                          <span className="text-xl font-bold text-purple-600">{profile.stats.totalApplications}</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl p-4 shadow-lg border border-indigo-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600 font-medium">Eventos Completados</span>
                          <span className="text-xl font-bold text-green-600">{profile.stats.completedEvents}</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Events Mejorados */}
            {profile.participatedEvents && profile.participatedEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Card className="relative bg-gradient-to-br from-white via-rose-50/30 to-pink-50/30 rounded-3xl shadow-xl border border-rose-100/50 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* Elementos decorativos */}
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-200/20 to-pink-200/20 rounded-full translate-y-12 -translate-x-12"></div>
                  
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-xl bg-gradient-to-r from-rose-800 to-pink-800 bg-clip-text text-transparent">Eventos Recientes</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="space-y-4">
                      {profile.participatedEvents.slice(0, 3).map((event: any, index: number) => (
                        <motion.div 
                          key={index} 
                          className="bg-white rounded-2xl p-4 shadow-lg border border-rose-100 hover:shadow-xl transition-all duration-300"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <div className="border-l-4 border-rose-500 pl-4">
                            <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{event.organization_name}</p>
                            <p className="text-xs text-gray-500 mb-2">
                              {formatDate(event.startDate)} - {formatDate(event.endDate)}
                            </p>
                            {event.rating && (
                              <div className="flex items-center space-x-1">
                                {getRatingStars(event.rating)}
                                <span className="ml-1 text-xs text-gray-500">({event.rating})</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
