"use client"

import { useEffect } from "react"
import { ErrorBoundary } from "@/components/error/ErrorBoundary"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <ErrorBoundary
          title="Error Crítico de la Aplicación"
          description="Ha ocurrido un error crítico que ha afectado toda la aplicación. Por favor, recarga la página para continuar."
          icon={
            <div className="relative">
              <AlertTriangle className="w-16 h-16 text-red-500" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                <RefreshCw className="w-4 h-4 text-white" />
              </div>
            </div>
          }
          onRetry={reset}
          variant="fullscreen"
        />
      </body>
    </html>
  )
}



