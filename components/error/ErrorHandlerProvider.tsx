"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { GlobalErrorBoundary } from "@/components/error/GlobalErrorBoundary"
import { useNetworkErrorHandler } from "@/hooks/use-network-error-handler"

interface ErrorHandlerProviderProps {
  children: React.ReactNode
}

export function ErrorHandlerProvider({ children }: ErrorHandlerProviderProps) {
  const router = useRouter()
  const { isOnline, hasNetworkError } = useNetworkErrorHandler()

  useEffect(() => {
    // Manejar errores de JavaScript no capturados
    const handleUnhandledError = (event: ErrorEvent) => {
      console.error('Error no manejado:', event.error)
      
      // Redirigir a página de error 500 para errores críticos
      if (event.error?.name === 'ChunkLoadError' || 
          event.error?.message?.includes('Loading chunk')) {
        router.push('/error')
      }
    }

    // Manejar promesas rechazadas no manejadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Promesa rechazada no manejada:', event.reason)
      
      // Si es un error de red, manejar apropiadamente
      if (event.reason?.message?.includes('fetch') || 
          event.reason?.message?.includes('network')) {
        // No redirigir inmediatamente, dejar que el hook de red maneje
        return
      }
    }

    window.addEventListener('error', handleUnhandledError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleUnhandledError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [router])

  return (
    <GlobalErrorBoundary>
      {children}
    </GlobalErrorBoundary>
  )
}

