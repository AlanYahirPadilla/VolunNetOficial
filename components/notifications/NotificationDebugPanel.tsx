"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Eye, EyeOff } from 'lucide-react'

interface DebugInfo {
  userId?: string
  isPageVisible: boolean
  hasFocus: boolean
  lastMessageId?: string
  isInitialized: boolean
  errorCount: number
  lastCheck: Date
}

export function NotificationDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    isPageVisible: true,
    hasFocus: true,
    isInitialized: false,
    errorCount: 0,
    lastCheck: new Date()
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo(prev => ({
        ...prev,
        isPageVisible: !document.hidden,
        hasFocus: document.hasFocus(),
        lastCheck: new Date()
      }))
    }

    const handleVisibilityChange = () => updateDebugInfo()
    const handleFocus = () => updateDebugInfo()
    const handleBlur = () => updateDebugInfo()

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    // Actualizar cada segundo
    const interval = setInterval(updateDebugInfo, 1000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      clearInterval(interval)
    }
  }, [])

  const testAPI = async () => {
    try {
      const response = await fetch('/api/chat/recent-messages', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json()
      console.log('🧪 Test API Response:', data)
      
      setDebugInfo(prev => ({
        ...prev,
        errorCount: response.ok ? 0 : prev.errorCount + 1
      }))
    } catch (error) {
      console.error('🧪 Test API Error:', error)
      setDebugInfo(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }))
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-white shadow-lg"
        >
          <Eye className="h-4 w-4 mr-1" />
          Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-white shadow-lg border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Debug Notificaciones</CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">Página Visible:</span>
              <Badge variant={debugInfo.isPageVisible ? "default" : "destructive"} className="ml-1">
                {debugInfo.isPageVisible ? "Sí" : "No"}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Con Foco:</span>
              <Badge variant={debugInfo.hasFocus ? "default" : "destructive"} className="ml-1">
                {debugInfo.hasFocus ? "Sí" : "No"}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Inicializado:</span>
              <Badge variant={debugInfo.isInitialized ? "default" : "secondary"} className="ml-1">
                {debugInfo.isInitialized ? "Sí" : "No"}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Errores:</span>
              <Badge variant={debugInfo.errorCount === 0 ? "default" : "destructive"} className="ml-1">
                {debugInfo.errorCount}
              </Badge>
            </div>
          </div>
          
          {debugInfo.lastMessageId && (
            <div className="text-xs">
              <span className="font-medium">Último Mensaje:</span>
              <div className="font-mono text-gray-600 truncate">
                {debugInfo.lastMessageId}
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            Última verificación: {debugInfo.lastCheck.toLocaleTimeString()}
          </div>
          
          <Button
            onClick={testAPI}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Probar API
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
