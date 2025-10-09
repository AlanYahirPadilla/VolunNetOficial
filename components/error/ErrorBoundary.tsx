"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface ErrorBoundaryProps {
  title?: string
  description?: string
  icon?: ReactNode
  onRetry?: () => void
  onGoBack?: () => void
  className?: string
  variant?: "default" | "compact" | "fullscreen"
}

export function ErrorBoundary({
  title = "Algo salió mal",
  description = "Ha ocurrido un error inesperado. Por favor, intenta de nuevo.",
  icon,
  onRetry,
  onGoBack,
  className,
  variant = "default",
}: ErrorBoundaryProps) {
  const isFullscreen = variant === "fullscreen"
  const isCompact = variant === "compact"

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-center justify-center",
        isFullscreen && "min-h-screen p-4",
        isCompact && "p-4",
        !isFullscreen && !isCompact && "p-8"
      )}
    >
      <Card className={cn(
        "backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-0 shadow-lg",
        isCompact && "max-w-md",
        !isCompact && "max-w-lg"
      )}>
        <CardContent className={cn(
          "text-center",
          isCompact ? "p-6" : "p-8"
        )}>
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 flex justify-center"
          >
            {icon || (
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/50">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            )}
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "font-semibold text-gray-900 dark:text-white mb-2",
              isCompact ? "text-lg" : "text-xl"
            )}
          >
            {title}
          </motion.h3>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "text-gray-600 dark:text-gray-300 mb-6",
              isCompact ? "text-sm" : "text-base"
            )}
          >
            {description}
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            {onRetry && (
              <Button
                onClick={onRetry}
                size={isCompact ? "sm" : "default"}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            )}
            
            {onGoBack && (
              <Button
                onClick={onGoBack}
                variant="outline"
                size={isCompact ? "sm" : "default"}
                className="border-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Regresar
              </Button>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (isFullscreen) {
    return (
      <div className={cn("min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900", className)}>
        {content}
      </div>
    )
  }

  return <div className={className}>{content}</div>
}



