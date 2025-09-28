"use client"

import { createContext, useContext, ReactNode } from 'react'
import { NotificationToast, useNotifications, NotificationData } from './NotificationToast'

interface NotificationContextType {
  addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  permission: NotificationPermission
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
  onOpenChat?: (chatId: string) => void
}

export function NotificationProvider({ children, onOpenChat }: NotificationProviderProps) {
  const { notifications, addNotification, removeNotification, clearNotifications, permission } = useNotifications()

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification, clearNotifications, permission }}>
      {children}
      
      {/* Renderizar notificaciones */}
      <div className="fixed top-0 right-0 z-50 pointer-events-none">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationToast
              notification={notification}
              onClose={() => removeNotification(notification.id)}
              onOpenChat={onOpenChat}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

// Hook para usar las notificaciones
export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}
