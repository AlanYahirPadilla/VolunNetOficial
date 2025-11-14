"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { 
  MoreVertical, 
  Settings, 
  LogOut, 
  User, 
  Bell, 
  HelpCircle,
  MessageCircle,
  Users,
  Calendar,
  Home,
  ChevronDown,
  Heart
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MobileNavigation } from '@/components/ui/mobile-navigation'

interface WhatsAppStyleMenuProps {
  user: any
  currentPage?: string
}

export function WhatsAppStyleMenu({ user, currentPage = 'chat' }: WhatsAppStyleMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 focus:outline-none"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            title="Ir al inicio"
            onClick={() => router.push('/dashboard')}
          >
            <Heart className="h-6 w-6 md:h-8 md:w-8 text-blue-600 fill-blue-200" />
            <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VolunNet</span>
          </button>
        </div>
        
        {/* Navegación Desktop - Oculta en móvil */}
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
            <Link href="/comunidad" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative bg-blue-50 text-blue-700">
              <Users className="h-5 w-5 text-blue-700" />
              <span>Comunidad</span>
              <span className="absolute left-0 -bottom-0.5 w-full h-0.5 bg-blue-600 rounded-full"></span>
            </Link>
            <Link href="/notificaciones" className="flex items-center gap-1 px-3 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition group relative">
              <Bell className="h-5 w-5 group-hover:text-blue-700 transition" />
              <span>Notificaciones</span>
              <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
            </Link>
          </nav>

          {/* Separador */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* Notificaciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative bg-white hover:bg-gray-50">
                <Bell className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <div className="text-center py-4 text-gray-500">No hay notificaciones</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-medium text-sm">
                    {user?.firstName?.[0] || 'U'}
                    {user?.lastName?.[0] || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.role || 'Usuario'}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/perfil')}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/configuracion')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/centrodeayuda')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Centro de Ayuda</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNavigation user={user} currentPath="/comunidad" />
        </div>
      </div>
    </div>
  )
}