"use client"

import { Component, ReactNode } from "react"
import { ErrorPage } from "@/components/error/ErrorPage"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo)
    
    // Aquí podrías enviar el error a un servicio de monitoreo
    // como Sentry, LogRocket, etc.
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorPage
          code={500}
          title="¡Algo salió mal!"
          description="Ha ocurrido un error inesperado en la aplicación. Por favor, recarga la página para continuar."
          errorType="500"
        />
      )
    }

    return this.props.children
  }
}

