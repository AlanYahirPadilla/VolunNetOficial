"use client"

import { useState, useCallback } from "react"

interface ErrorState {
  hasError: boolean
  error: Error | null
  errorInfo?: string
}

export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
  })

  const handleError = useCallback((error: Error, errorInfo?: string) => {
    console.error('Error caught by error handler:', error)
    setErrorState({
      hasError: true,
      error,
      errorInfo,
    })
  }, [])

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
    })
  }, [])

  const reset = useCallback(() => {
    clearError()
  }, [clearError])

  return {
    ...errorState,
    handleError,
    clearError,
    reset,
  }
}

// Hook para manejar errores de API
export function useApiError() {
  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const executeWithErrorHandling = useCallback(async <T>(
    apiCall: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      setIsLoading(true)
      setApiError(null)
      const result = await apiCall()
      return result
    } catch (error) {
      const message = errorMessage || 
        (error instanceof Error ? error.message : 'Ha ocurrido un error inesperado')
      setApiError(message)
      console.error('API Error:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setApiError(null)
  }, [])

  return {
    apiError,
    isLoading,
    executeWithErrorHandling,
    clearError,
  }
}



