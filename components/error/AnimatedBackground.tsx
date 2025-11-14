"use client"

import { motion } from "framer-motion"
import { Heart, Users, Calendar, MapPin, Star, Sparkles, AlertTriangle, Wrench, RefreshCw, Search, Lock, Shield, WifiOff, Cloud } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnimatedBackgroundProps {
  errorType?: "404" | "500" | "403" | "offline" | "generic"
  className?: string
}

export function AnimatedBackground({ errorType = "generic", className }: AnimatedBackgroundProps) {
  const getThemeConfig = () => {
    switch (errorType) {
      case "404":
        return {
          primaryColor: "from-blue-400/20 to-purple-400/20",
          secondaryColor: "from-indigo-400/15 to-cyan-400/15",
          accentColor: "text-blue-500",
          icons: [Search, MapPin, Calendar]
        }
      case "500":
        return {
          primaryColor: "from-red-400/20 to-orange-400/20",
          secondaryColor: "from-pink-400/15 to-red-400/15",
          accentColor: "text-red-500",
          icons: [AlertTriangle, Wrench, RefreshCw]
        }
      case "403":
        return {
          primaryColor: "from-orange-400/20 to-yellow-400/20",
          secondaryColor: "from-amber-400/15 to-orange-400/15",
          accentColor: "text-orange-500",
          icons: [Lock, Shield, UserX]
        }
      case "offline":
        return {
          primaryColor: "from-gray-400/20 to-slate-400/20",
          secondaryColor: "from-zinc-400/15 to-gray-400/15",
          accentColor: "text-gray-500",
          icons: [WifiOff, Signal, RefreshCw]
        }
      default:
        return {
          primaryColor: "from-blue-400/20 to-purple-400/20",
          secondaryColor: "from-indigo-400/15 to-cyan-400/15",
          accentColor: "text-blue-500",
          icons: [Heart, Users, Star]
        }
    }
  }

  const config = getThemeConfig()

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Gradientes de fondo animados */}
      <div className={cn(
        "absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-gradient-shift",
        `bg-gradient-to-br ${config.primaryColor}`
      )}></div>
      
      <div className={cn(
        "absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-gradient-shift",
        `bg-gradient-to-br ${config.secondaryColor}`,
        "animation-delay-2000"
      )} style={{ animationDelay: "2s" }}></div>
      
      <div className={cn(
        "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl animate-gradient-shift",
        `bg-gradient-to-br from-green-400/20 to-emerald-400/20`,
        "animation-delay-4000"
      )} style={{ animationDelay: "4s" }}></div>

      {/* Iconos flotantes temáticos */}
      {config.icons.map((Icon, index) => (
        <motion.div
          key={index}
          className={cn(
            "absolute opacity-20",
            config.accentColor
          )}
          style={{
            left: `${20 + index * 30}%`,
            top: `${30 + index * 20}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6 + index,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5,
          }}
        >
          <Icon className="w-8 h-8 animate-floating-icons" />
        </motion.div>
      ))}

      {/* Partículas de error */}
      {Array.from({ length: 15 }).map((_, index) => (
        <motion.div
          key={index}
          className={cn(
            "absolute w-2 h-2 rounded-full opacity-30",
            config.accentColor,
            "bg-current"
          )}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Ondas de energía */}
      <div className="absolute inset-0">
        {Array.from({ length: 3 }).map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              "absolute inset-0 rounded-full border-2 opacity-20",
              `border-current ${config.accentColor}`
            )}
            style={{
              width: `${200 + index * 100}px`,
              height: `${200 + index * 100}px`,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              scale: [0.5, 2, 0.5],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + index,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5,
            }}
          />
        ))}
      </div>

      {/* Efectos de brillo */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl"
        animate={{
          scale: [1.5, 1, 1.5],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Líneas de conexión animadas */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        {Array.from({ length: 8 }).map((_, index) => (
          <motion.line
            key={index}
            x1={`${Math.random() * 100}%`}
            y1={`${Math.random() * 100}%`}
            x2={`${Math.random() * 100}%`}
            y2={`${Math.random() * 100}%`}
            stroke="currentColor"
            strokeWidth="2"
            className={config.accentColor}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
          />
        ))}
      </svg>
    </div>
  )
}
