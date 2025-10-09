"use client"

import { motion } from "framer-motion"
import { 
  Search, 
  AlertTriangle, 
  Lock, 
  WifiOff, 
  Heart, 
  Users, 
  Calendar, 
  MapPin,
  Star,
  Sparkles,
  Zap,
  Shield,
  RefreshCw,
  Database,
  Bug
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AnimatedErrorIconProps {
  errorType: "404" | "500" | "403" | "offline" | "generic"
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function AnimatedErrorIcon({ 
  errorType, 
  size = "lg", 
  className 
}: AnimatedErrorIconProps) {
  const getIconConfig = () => {
    const sizeClasses = {
      sm: "w-8 h-8",
      md: "w-12 h-12", 
      lg: "w-16 h-16",
      xl: "w-20 h-20"
    }

    switch (errorType) {
      case "404":
        return {
          mainIcon: Search,
          accentIcon: MapPin,
          color: "text-blue-600",
          bgColor: "bg-blue-100 dark:bg-blue-900/50",
          accentColor: "text-blue-500",
          accentBg: "bg-blue-500",
          size: sizeClasses[size]
        }
      case "500":
        return {
          mainIcon: AlertTriangle,
          accentIcon: Zap,
          color: "text-red-600",
          bgColor: "bg-red-100 dark:bg-red-900/50",
          accentColor: "text-red-500",
          accentBg: "bg-red-500",
          size: sizeClasses[size]
        }
      case "403":
        return {
          mainIcon: Lock,
          accentIcon: Shield,
          color: "text-orange-600",
          bgColor: "bg-orange-100 dark:bg-orange-900/50",
          accentColor: "text-orange-500",
          accentBg: "bg-orange-500",
          size: sizeClasses[size]
        }
      case "offline":
        return {
          mainIcon: WifiOff,
          accentIcon: RefreshCw,
          color: "text-gray-600",
          bgColor: "bg-gray-100 dark:bg-gray-900/50",
          accentColor: "text-gray-500",
          accentBg: "bg-gray-500",
          size: sizeClasses[size]
        }
      default:
        return {
          mainIcon: Heart,
          accentIcon: Users,
          color: "text-purple-600",
          bgColor: "bg-purple-100 dark:bg-purple-900/50",
          accentColor: "text-purple-500",
          accentBg: "bg-purple-500",
          size: sizeClasses[size]
        }
    }
  }

  const config = getIconConfig()
  const MainIcon = config.mainIcon
  const AccentIcon = config.accentIcon

  return (
    <div className={cn("relative", className)}>
      {/* Icono principal con animaciones */}
      <motion.div
        className={cn(
          "relative p-6 rounded-full",
          config.bgColor
        )}
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Efecto de pulso de fondo */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full opacity-20",
            config.accentBg
          )}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Icono principal */}
        <motion.div
          className={cn("relative z-10", config.color)}
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <MainIcon className={config.size} />
        </motion.div>

        {/* Icono de acento flotante */}
        <motion.div
          className={cn(
            "absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center",
            config.accentBg,
            "text-white"
          )}
          animate={{
            y: [0, -10, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <AccentIcon className="w-4 h-4" />
        </motion.div>

        {/* Partículas alrededor del icono */}
        {Array.from({ length: 6 }).map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              "absolute w-2 h-2 rounded-full",
              config.accentBg
            )}
            style={{
              left: `${50 + 30 * Math.cos((index * 60 * Math.PI) / 180)}%`,
              top: `${50 + 30 * Math.sin((index * 60 * Math.PI) / 180)}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.3,
            }}
          />
        ))}

        {/* Efecto de ondas */}
        {Array.from({ length: 3 }).map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              "absolute inset-0 rounded-full border-2 opacity-30",
              `border-current ${config.color}`
            )}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5,
            }}
          />
        ))}
      </motion.div>

      {/* Efectos de brillo adicionales */}
      <motion.div
        className={cn(
          "absolute -top-4 -left-4 w-6 h-6 rounded-full opacity-60",
          config.accentBg
        )}
        animate={{
          scale: [0.5, 1.5, 0.5],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      <motion.div
        className={cn(
          "absolute -bottom-4 -right-4 w-4 h-4 rounded-full opacity-60",
          config.accentBg
        )}
        animate={{
          scale: [1.5, 0.5, 1.5],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  )
}

