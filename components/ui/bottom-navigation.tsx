"use client"

import { motion } from "framer-motion"
import { Home, Calendar, Users, Bell, User, Heart } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "./badge"

interface BottomNavigationProps {
  unreadCount?: number
}

export function BottomNavigation({ unreadCount = 0 }: BottomNavigationProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Inicio", icon: Home },
    { href: "/eventos/buscar", label: "Eventos", icon: Calendar },
    { href: "/comunidad", label: "Comunidad", icon: Users },
    { href: "/notificaciones", label: "Alertas", icon: Bell, badge: unreadCount },
    { href: "/perfil", label: "Perfil", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full touch-manipulation group"
            >
              {/* Indicador activo */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* Contenedor del ícono */}
              <div className="relative">
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`
                    flex items-center justify-center w-12 h-8 rounded-2xl transition-colors duration-200
                    ${isActive 
                      ? "bg-gradient-to-r from-blue-50 to-purple-50" 
                      : "group-hover:bg-gray-50"
                    }
                  `}
                >
                  <Icon 
                    className={`
                      h-5 w-5 transition-colors duration-200
                      ${isActive 
                        ? "text-blue-600" 
                        : "text-gray-600 group-hover:text-blue-500"
                      }
                    `}
                  />
                </motion.div>

                {/* Badge de notificaciones */}
                {item.badge && item.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg"
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </motion.div>
                )}
              </div>

              {/* Label */}
              <span 
                className={`
                  text-[10px] font-medium mt-1 transition-colors duration-200
                  ${isActive 
                    ? "text-blue-600" 
                    : "text-gray-600 group-hover:text-blue-500"
                  }
                `}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}


