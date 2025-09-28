"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useNotificationContext } from '@/components/notifications/NotificationProvider'
import { MessageCircle, Bell, RefreshCw } from 'lucide-react'

export function MessageSimulator() {
  const { addNotification } = useNotificationContext()
  const [simulationCount, setSimulationCount] = useState(0)

  const simulateNewMessage = () => {
    setSimulationCount(prev => prev + 1)
    
    // Simular diferentes tipos de mensajes
    const messages = [
      "¡Hola! ¿Cómo estás?",
      "¿Podrías ayudarme con el evento?",
      "Gracias por tu participación",
      "¿Cuándo es la próxima reunión?",
      "Excelente trabajo en el proyecto"
    ]
    
    const senders = [
      { name: "María García", avatar: "/placeholder-user.jpg" },
      { name: "Juan Pérez", avatar: "/placeholder-user.jpg" },
      { name: "Ana López", avatar: "/placeholder-user.jpg" },
      { name: "Carlos Ruiz", avatar: "/placeholder-user.jpg" },
      { name: "Laura Martínez", avatar: "/placeholder-user.jpg" }
    ]
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    const randomSender = senders[Math.floor(Math.random() * senders.length)]
    
    addNotification({
      title: 'Mensaje simulado',
      message: randomMessage,
      senderName: randomSender.name,
      senderAvatar: randomSender.avatar,
      chatId: `simulated-chat-${simulationCount}`
    })
  }

  const resetNotifications = () => {
    // Esto simularía reiniciar el sistema de notificaciones
    window.location.reload()
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-xs">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Simulador de Mensajes</span>
        </div>
        
        <div className="space-y-2">
          <Button
            onClick={simulateNewMessage}
            size="sm"
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Simular Mensaje Nuevo
          </Button>
          
          <Button
            onClick={resetNotifications}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reiniciar Sistema
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Simulaciones: {simulationCount}
        </p>
      </div>
    </div>
  )
}
