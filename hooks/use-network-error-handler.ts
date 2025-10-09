"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function useNetworkErrorHandler() {
  const [isOnline, setIsOnline] = useState(true)
  const [hasNetworkError, setHasNetworkError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setHasNetworkError(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setHasNetworkError(true)
    }

    // Detectar cambios de conexión
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Verificar estado inicial
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    // Si hay error de red, redirigir a página offline después de un delay
    if (hasNetworkError && !isOnline) {
      const timer = setTimeout(() => {
        router.push('/offline')
      }, 2000) // Esperar 2 segundos antes de redirigir

      return () => clearTimeout(timer)
    }
  }, [hasNetworkError, isOnline, router])

  return {
    isOnline,
    hasNetworkError,
    setHasNetworkError
  }
}

