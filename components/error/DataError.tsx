"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, RefreshCw, AlertCircle, Wifi } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface DataErrorProps {
  title?: string
  description?: string
  errorType?: "network" | "server" | "not-found" | "permission" | "timeout"
  onRetry?: () => void
  className?: string
  showDetails?: boolean
  errorDetails?: string
}

export function DataError({
  title,
  description,
  errorType = "server",
  onRetry,
  className,
  showDetails = false,
  errorDetails,
}: DataErrorProps) {
  const getErrorConfig = () => {
    switch (errorType) {
      case "network":
        return {
          icon: <Wifi className="w-8 h-8 text-orange-500" />,
          bgColor: "bg-orange-100 dark:bg-orange-900/50",
          title: title || "Error de Conexión",
          description: description || "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
        }
      case "not-found":
        return {
          icon: <Database className="w-8 h-8 text-blue-500" />,
          bgColor: "bg-blue-100 dark:bg-blue-900/50",
          title: title || "Datos No Encontrados",
          description: description || "No se encontraron los datos solicitados. Puede que hayan sido eliminados o movidos.",
        }
      case "permission":
        return {
          icon: <AlertCircle className="w-8 h-8 text-red-500" />,
          bgColor: "bg-red-100 dark:bg-red-900/50",
          title: title || "Sin Permisos",
          description: description || "No tienes permisos para acceder a estos datos.",
        }
      case "timeout":
        return {
          icon: <RefreshCw className="w-8 h-8 text-yellow-500" />,
          bgColor: "bg-yellow-100 dark:bg-yellow-900/50",
          title: title || "Tiempo de Espera Agotado",
          description: description || "La operación tardó demasiado tiempo en completarse.",
        }
      default:
        return {
          icon: <Database className="w-8 h-8 text-red-500" />,
          bgColor: "bg-red-100 dark:bg-red-900/50",
          title: title || "Error del Servidor",
          description: description || "Ha ocurrido un error en el servidor. Por favor, intenta de nuevo.",
        }
    }
  }

  const config = getErrorConfig()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full", className)}
    >
      <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className={cn("p-3 rounded-full", config.bgColor)}
            >
              {config.icon}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <motion.h3
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
              >
                {config.title}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 dark:text-gray-300 mb-4"
              >
                {config.description}
              </motion.p>

              {/* Error Details */}
              {showDetails && errorDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 0.4 }}
                  className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {errorDetails}
                  </p>
                </motion.div>
              )}

              {/* Actions */}
              {onRetry && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    onClick={onRetry}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reintentar
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}



