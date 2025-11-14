"use client"

import { useEffect, useState } from 'react'
import { useChatNotifications } from '@/hooks/useChatNotifications'
import { getCurrentUser } from '@/app/auth/actions'

export function ChatNotificationManager() {
  const [user, setUser] = useState<any>(null)
  const [isPageVisible, setIsPageVisible] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  // Detectar visibilidad de la página
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Activar notificaciones de chat
  useChatNotifications({ 
    userId: user?.id, 
    isPageVisible 
  })

  return null // Este componente no renderiza nada visual
}
