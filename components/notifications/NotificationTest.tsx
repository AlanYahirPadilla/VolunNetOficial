"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useNotificationContext } from '@/components/notifications/NotificationProvider'
import { MessageCircle, Bell } from 'lucide-react'

export function NotificationTest() {
  const { addNotification } = useNotificationContext()
  const [testCount, setTestCount] = useState(0)

  const sendTestNotification = () => {
    setTestCount(prev => prev + 1)
    addNotification({
      title: 'Mensaje de prueba',
      message: `Este es un mensaje de prueba #${testCount + 1}. ¡Las notificaciones están funcionando!`,
      senderName: 'Usuario de Prueba',
      senderAvatar: '/placeholder-user.jpg',
      chatId: 'test-chat'
    })
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Prueba de Notificaciones</span>
        </div>
        
        <Button
          onClick={sendTestNotification}
          size="sm"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          <MessageCircle className="h-3 w-3 mr-1" />
          Enviar Notificación de Prueba
        </Button>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Contador: {testCount}
        </p>
      </div>
    </div>
  )
}
