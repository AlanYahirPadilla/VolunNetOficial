"use client"

import { useEffect, useRef } from 'react'
import { useNotificationContext } from '@/components/notifications/NotificationProvider'

interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  content: string
  createdAt: string
  sender?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

interface UseChatNotificationsProps {
  userId?: string
  isPageVisible?: boolean
}

export function useChatNotifications({ userId, isPageVisible = true }: UseChatNotificationsProps) {
  const { addNotification } = useNotificationContext()
  const lastMessageIdRef = useRef<string | null>(null)
  const isInitializedRef = useRef(false)
  const errorCountRef = useRef(0)
  const maxErrors = 3

  useEffect(() => {
    if (!userId) return

    // Función para cargar mensajes y detectar nuevos
    const checkForNewMessages = async () => {
      try {
        const response = await fetch('/api/chat/recent-messages', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (response.status === 401) {
          console.log('🔒 Usuario no autenticado, deteniendo notificaciones')
          errorCountRef.current = maxErrors
          return
        }
        
        if (!response.ok) {
          console.log('❌ Error en API de mensajes:', response.status)
          errorCountRef.current++
          if (errorCountRef.current >= maxErrors) {
            console.log('🛑 Demasiados errores, deteniendo notificaciones')
            return
          }
          return
        }

        // Reset error count on success
        errorCountRef.current = 0
        
        const data = await response.json()
        const messages: ChatMessage[] = data.messages || []
        
        console.log('📨 Total mensajes recibidos:', messages.length)
        console.log('👤 Mi ID de usuario:', userId)
        
        // Filtrar solo mensajes de otros usuarios
        const otherUserMessages = messages.filter(msg => msg.senderId !== userId)
        
        console.log('👥 Mensajes de otros usuarios:', otherUserMessages.length)
        otherUserMessages.forEach((msg, index) => {
          console.log(`  📨 Mensaje ${index + 1}:`, {
            id: msg.id,
            senderId: msg.senderId,
            senderName: `${msg.sender?.firstName} ${msg.sender?.lastName}`,
            content: msg.content.substring(0, 30) + '...'
          })
        })
        
        if (otherUserMessages.length > 0) {
          const latestMessage = otherUserMessages[0]
          
          // Si es la primera carga, solo guardar el último mensaje
          if (!isInitializedRef.current) {
            lastMessageIdRef.current = latestMessage.id
            isInitializedRef.current = true
            console.log('🎯 Inicializando notificaciones con mensaje:', latestMessage.id)
            return
          }
          
          // Si hay un nuevo mensaje
          if (lastMessageIdRef.current && latestMessage.id !== lastMessageIdRef.current) {
            console.log('🆕 Nuevo mensaje detectado!')
            console.log('  📝 Último mensaje conocido:', lastMessageIdRef.current)
            console.log('  📝 Nuevo mensaje:', latestMessage.id)
            
            // Encontrar el mensaje más reciente que no hemos visto
            const newMessages = otherUserMessages.filter(msg => 
              lastMessageIdRef.current && msg.id !== lastMessageIdRef.current
            )
            
            console.log('📨 Mensajes nuevos encontrados:', newMessages.length)
            
            if (newMessages.length > 0) {
              const newestMessage = newMessages[0]
              
              console.log('🔍 Evaluando notificación:')
              console.log('  👁️ Página visible:', isPageVisible)
              console.log('  🎯 Documento con foco:', document.hasFocus())
              console.log('  📱 Debería notificar:', !isPageVisible || !document.hasFocus())
              
              // TEMPORAL: Mostrar notificación siempre para testing
              console.log('🔔 MOSTRANDO NOTIFICACIÓN (MODO TEST)')
              addNotification({
                title: 'Nuevo mensaje',
                message: newestMessage.content,
                senderName: `${newestMessage.sender?.firstName} ${newestMessage.sender?.lastName}`,
                senderAvatar: newestMessage.sender?.avatar,
                chatId: newestMessage.chatId
              })
              
              lastMessageIdRef.current = newestMessage.id
            }
          } else {
            console.log('✅ No hay mensajes nuevos')
          }
        } else {
          console.log('📭 No hay mensajes de otros usuarios')
        }
      } catch (error) {
        console.error('❌ Error checking for new messages:', error)
        errorCountRef.current++
        if (errorCountRef.current >= maxErrors) {
          console.log('🛑 Demasiados errores, deteniendo notificaciones')
        }
      }
    }

    // Solo iniciar polling si no hay demasiados errores
    if (errorCountRef.current < maxErrors) {
      // Verificar mensajes cada 3 segundos para testing
      const interval = setInterval(checkForNewMessages, 3000)
      
      // Verificación inicial
      checkForNewMessages()

      return () => clearInterval(interval)
    }
  }, [userId, isPageVisible, addNotification])

  // Detectar cuando la página pierde/gana foco
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // La página está oculta, activar notificaciones más agresivas
        isPageVisible = false
      } else {
        // La página está visible, reducir notificaciones
        isPageVisible = true
      }
    }

    const handleFocus = () => {
      isPageVisible = true
    }

    const handleBlur = () => {
      isPageVisible = false
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])
}
