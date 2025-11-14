"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { X, MessageCircle, Bell } from 'lucide-react'

interface NotificationData {
  id: string
  title: string
  message: string
  senderName: string
  senderAvatar?: string
  timestamp: Date
  chatId?: string
}

interface NotificationToastProps {
  notification: NotificationData
  onClose: () => void
  onOpenChat?: (chatId: string) => void
}

export function NotificationToast({ notification, onClose, onOpenChat }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-close después de 5 segundos
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Delay para la animación
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const handleOpenChat = () => {
    if (notification.chatId && onOpenChat) {
      onOpenChat(notification.chatId)
    }
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 400, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 400, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.3 
          }}
          className="fixed top-4 right-4 z-50 max-w-sm w-full"
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 relative overflow-hidden">
            {/* Indicador de notificación */}
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
            
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded-full">
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Nuevo mensaje</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsVisible(false)
                  setTimeout(onClose, 300)
                }}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Contenido */}
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={notification.senderAvatar} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {notification.senderName[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {notification.senderName}
                </h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {notification.timestamp.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleOpenChat}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Responder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsVisible(false)
                  setTimeout(onClose, 300)
                }}
                className="px-3"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook para manejar notificaciones
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [permission, setPermission] = useState<NotificationPermission>('default')

  // Solicitar permisos de notificación
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
      
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission)
      }
    }
  }, [])

  // Reproducir sonido de notificación
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3')
      audio.volume = 0.3
      audio.play().catch(() => {
        // Fallback: crear un sonido simple
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      })
    } catch (error) {
      console.log('No se pudo reproducir el sonido de notificación')
    }
  }

  // Mostrar notificación del navegador
  const showBrowserNotification = (notification: NotificationData) => {
    if (permission === 'granted') {
      const browserNotification = new Notification(`${notification.senderName} te envió un mensaje`, {
        body: notification.message,
        icon: notification.senderAvatar || '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: false,
        silent: false
      })

      browserNotification.onclick = () => {
        window.focus()
        browserNotification.close()
        if (notification.chatId) {
          // Aquí podrías navegar al chat o abrir una función específica
          window.location.href = `/comunidad?chat=${notification.chatId}`
        }
      }

      // Auto-close después de 5 segundos
      setTimeout(() => {
        browserNotification.close()
      }, 5000)
    }
  }

  // Agregar nueva notificación
  const addNotification = (notification: Omit<NotificationData, 'id' | 'timestamp'>) => {
    const newNotification: NotificationData = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    }

    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]) // Máximo 5 notificaciones

    // Reproducir sonido
    playNotificationSound()

    // Mostrar notificación del navegador
    showBrowserNotification(newNotification)
  }

  // Remover notificación
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Limpiar todas las notificaciones
  const clearNotifications = () => {
    setNotifications([])
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    permission
  }
}
