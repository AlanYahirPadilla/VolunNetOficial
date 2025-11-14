"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface LoadingWithErrorProps {
  isLoading: boolean
  error: string | null
  onRetry?: () => void
  loadingText?: string
  errorTitle?: string
  errorDescription?: string
  className?: string
  timeout?: number // Timeout en milisegundos
  showTimeoutError?: boolean
}

export function LoadingWithError({
  isLoading,
  error,
  onRetry,
  loadingText = "Cargando...",
  errorTitle = "Error al cargar",
  errorDescription,
  className,
  timeout = 10000, // 10 segundos por defecto
  showTimeoutError = true,
}: LoadingWithErrorProps) {
  const [hasTimedOut, setHasTimedOut] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false)
      return
    }

    const timer = setTimeout(() => {
      if (isLoading && showTimeoutError) {
        setHasTimedOut(true)
      }
    }, timeout)

    return () => clearTimeout(timer)
  }, [isLoading, timeout, showTimeoutError])

  // Si hay error, mostrar componente de error
  if (error) {
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
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/50">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {errorTitle}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {errorDescription || error}
                </p>
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reintentar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Si ha pasado el timeout, mostrar mensaje de timeout
  if (hasTimedOut) {
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
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Carga Lenta
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  La carga está tardando más de lo esperado. ¿Quieres intentar de nuevo?
                </p>
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reintentar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn("w-full", className)}
      >
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-8 h-8 text-blue-600" />
              </motion.div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {loadingText}
                </p>
                <div className="flex space-x-1 mt-2">
                  <motion.div
                    className="w-2 h-2 bg-blue-600 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-blue-600 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-blue-600 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return null
}



