"use client"

import { ErrorPage } from "@/components/error/ErrorPage"
import { WifiOff, RefreshCw, Signal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function Offline() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <ErrorPage
      code={0}
      title="Sin Conexión a Internet"
      description="Parece que has perdido la conexión a internet. Verifica tu conexión y vuelve a intentar. ¡No te preocupes, tus datos están seguros!"
      errorType="offline"
      actions={
        <>
          <Button 
            onClick={handleRefresh} 
            size="lg" 
            disabled={!isOnline}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            {isOnline ? 'Reintentar' : 'Sin Conexión'}
          </Button>
        </>
      }
    />
  )
}


