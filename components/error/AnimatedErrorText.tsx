"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedErrorTextProps {
  code: number | string
  title: string
  description: string
  errorType?: "404" | "500" | "403" | "offline" | "generic"
  className?: string
}

export function AnimatedErrorText({
  code,
  title,
  description,
  errorType = "generic",
  className
}: AnimatedErrorTextProps) {
  const getTextConfig = () => {
    switch (errorType) {
      case "404":
        return {
          codeColor: "from-blue-600 to-purple-600",
          titleColor: "text-gray-900 dark:text-white",
          descColor: "text-gray-600 dark:text-gray-300",
          glowColor: "text-blue-500"
        }
      case "500":
        return {
          codeColor: "from-red-600 to-orange-600",
          titleColor: "text-gray-900 dark:text-white",
          descColor: "text-gray-600 dark:text-gray-300",
          glowColor: "text-red-500"
        }
      case "403":
        return {
          codeColor: "from-orange-600 to-yellow-600",
          titleColor: "text-gray-900 dark:text-white",
          descColor: "text-gray-600 dark:text-gray-300",
          glowColor: "text-orange-500"
        }
      case "offline":
        return {
          codeColor: "from-gray-600 to-slate-600",
          titleColor: "text-gray-900 dark:text-white",
          descColor: "text-gray-600 dark:text-gray-300",
          glowColor: "text-gray-500"
        }
      default:
        return {
          codeColor: "from-purple-600 to-pink-600",
          titleColor: "text-gray-900 dark:text-white",
          descColor: "text-gray-600 dark:text-gray-300",
          glowColor: "text-purple-500"
        }
    }
  }

  const config = getTextConfig()

  // Dividir el código en dígitos para animación individual
  const codeDigits = code.toString().split('')

  return (
    <div className={cn("text-center space-y-6", className)}>
      {/* Código de error animado */}
      <motion.div
        className="flex justify-center items-center space-x-2"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {codeDigits.map((digit, index) => (
          <motion.div
            key={index}
            className={cn(
              "text-8xl md:text-9xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
              config.codeColor,
              "animate-text-glow"
            )}
            initial={{ opacity: 0, y: -50, rotateX: -90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              duration: 0.6,
              delay: index * 0.1,
              ease: "easeOut"
            }}
            whileHover={{
              scale: 1.1,
              rotateY: 10,
              transition: { duration: 0.3 }
            }}
          >
            {digit}
          </motion.div>
        ))}
      </motion.div>

      {/* Título animado */}
      <motion.h1
        className={cn(
          "text-3xl md:text-4xl font-bold",
          config.titleColor
        )}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.3 }
        }}
      >
        {title.split(' ').map((word, index) => (
          <motion.span
            key={index}
            className="inline-block mr-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.7 + index * 0.1,
              duration: 0.5
            }}
            whileHover={{
              color: config.glowColor,
              transition: { duration: 0.3 }
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.h1>

      {/* Descripción animada */}
      <motion.p
        className={cn(
          "text-lg leading-relaxed max-w-2xl mx-auto",
          config.descColor
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        {description.split(' ').map((word, index) => (
          <motion.span
            key={index}
            className="inline-block mr-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 1.1 + index * 0.02,
              duration: 0.3
            }}
            whileHover={{
              scale: 1.1,
              color: config.glowColor,
              transition: { duration: 0.2 }
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.p>

      {/* Efectos de texto adicionales */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        {/* Efectos de brillo en el texto */}
        <motion.div
          className={cn(
            "absolute top-1/2 left-1/4 w-32 h-32 rounded-full blur-3xl opacity-20",
            `bg-current ${config.glowColor}`
          )}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className={cn(
            "absolute top-1/3 right-1/4 w-24 h-24 rounded-full blur-3xl opacity-20",
            `bg-current ${config.glowColor}`
          )}
          animate={{
            scale: [1.5, 1, 1.5],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </motion.div>
    </div>
  )
}

