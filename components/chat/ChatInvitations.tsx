"use client"

import { useState, useEffect } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, Check, X, Clock, Users, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatInvitation {
  id: string
  chatId: string
  inviterId: string
  inviteeId: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  message?: string
  createdAt: string
  chat?: {
    id: string
    name?: string
    type: 'INDIVIDUAL' | 'GROUP' | 'EVENT' | 'COMMUNITY'
  }
  inviter?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

interface ChatInvitationsProps {
  onInvitationAccepted?: (invitationId: string, chatId: string) => void
  onInvitationDeclined?: (invitationId: string) => void
}

export function ChatInvitations({ onInvitationAccepted, onInvitationDeclined }: ChatInvitationsProps) {
  const [invitations, setInvitations] = useState<ChatInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)

  const { respondToInvitation } = useSocket()

  // Cargar invitaciones
  useEffect(() => {
    const loadInvitations = async () => {
      try {
        const response = await fetch('/api/chat/invitations')
        if (response.ok) {
          const data = await response.json()
          setInvitations(data.invitations || [])
        }
      } catch (error) {
        console.error('Error cargando invitaciones:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInvitations()
  }, [])

  // Responder a invitación
  const handleRespondToInvitation = async (invitationId: string, response: 'ACCEPTED' | 'DECLINED') => {
    setRespondingTo(invitationId)
    
    try {
      const apiResponse = await fetch(`/api/chat/invitations/${invitationId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response })
      })

      if (apiResponse.ok) {
        // Actualizar estado local
        setInvitations(prev => 
          prev.map(inv => 
            inv.id === invitationId 
              ? { ...inv, status: response }
              : inv
          )
        )

        // Notificar callbacks
        if (response === 'ACCEPTED') {
          const invitation = invitations.find(inv => inv.id === invitationId)
          if (invitation) {
            onInvitationAccepted?.(invitationId, invitation.chatId)
          }
        } else {
          onInvitationDeclined?.(invitationId)
        }

        // Enviar respuesta por socket
        respondToInvitation(invitationId, response)
      }
    } catch (error) {
      console.error('Error respondiendo a invitación:', error)
    } finally {
      setRespondingTo(null)
    }
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Hace un momento'
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} minutos`
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} horas`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  // Obtener ícono del tipo de chat
  const getChatIcon = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL':
        return <MessageCircle className="h-4 w-4" />
      case 'GROUP':
        return <Users className="h-4 w-4" />
      case 'EVENT':
        return <Calendar className="h-4 w-4" />
      default:
        return <MessageCircle className="h-4 w-4" />
    }
  }

  // Obtener nombre del chat
  const getChatName = (invitation: ChatInvitation) => {
    if (invitation.chat?.name) return invitation.chat.name
    if (invitation.chat?.type === 'INDIVIDUAL') {
      return `Chat con ${invitation.inviter?.firstName} ${invitation.inviter?.lastName}`
    }
    return 'Chat'
  }

  // Filtrar solo invitaciones pendientes
  const pendingInvitations = invitations.filter(inv => inv.status === 'PENDING')

  if (loading) {
    return (
      <Card className="w-full h-[400px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando invitaciones...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full h-[400px] flex flex-col">
      {/* Header */}
      <CardHeader className="flex-shrink-0 border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Invitaciones a Chat
          {pendingInvitations.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {pendingInvitations.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      {/* Lista de invitaciones */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          {pendingInvitations.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes invitaciones pendientes
                </h3>
                <p className="text-gray-500">
                  Cuando alguien te invite a un chat, aparecerá aquí
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <AnimatePresence>
                {pendingInvitations.map((invitation, index) => (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={invitation.inviter?.avatar} />
                        <AvatarFallback>
                          {invitation.inviter?.firstName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {invitation.inviter?.firstName} {invitation.inviter?.lastName}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {invitation.chat?.type === 'INDIVIDUAL' ? 'Individual' : 
                             invitation.chat?.type === 'EVENT' ? 'Evento' : 
                             invitation.chat?.type === 'GROUP' ? 'Grupal' : 'Comunidad'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          Te ha invitado a unirse al chat: <strong>{getChatName(invitation)}</strong>
                        </p>
                        
                        {invitation.message && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-gray-700 italic">
                              "{invitation.message}"
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatDate(invitation.createdAt)}
                          </span>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRespondToInvitation(invitation.id, 'DECLINED')}
                              disabled={respondingTo === invitation.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleRespondToInvitation(invitation.id, 'ACCEPTED')}
                              disabled={respondingTo === invitation.id}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aceptar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
