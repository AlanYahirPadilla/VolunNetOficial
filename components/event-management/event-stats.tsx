"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Calendar,
  MapPin,
  Star,
  Award
} from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  organization_name: string
  city: string
  state: string
  country: string
  startDate: string
  endDate: string
  maxVolunteers: number
  currentVolunteers: number
  status: string
}

interface Participant {
  application_id: string
  application_status: string
  appliedAt: string
  message?: string
  rating?: number
  feedback?: string
  user_id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  user_created_at: string
  skills?: string[]
  interests?: string[]
  bio?: string
  volunteer_rating?: number
  hoursCompleted?: number
  eventsParticipated?: number
  city?: string
  state?: string
  country?: string
}

interface EventStatsProps {
  event: Event
  participants: Participant[]
}

export function EventStats({ event, participants }: EventStatsProps) {
  const acceptedCount = participants.filter(p => p.application_status === 'ACCEPTED').length
  const pendingCount = participants.filter(p => p.application_status === 'PENDING').length
  const rejectedCount = participants.filter(p => p.application_status === 'REJECTED').length
  
  const totalApplications = participants.length
  const acceptanceRate = totalApplications > 0 ? (acceptedCount / totalApplications * 100).toFixed(1) : 0
  
  const avgRating = participants
    .filter(p => p.volunteer_rating && p.volunteer_rating > 0)
    .reduce((acc, p) => acc + (p.volunteer_rating || 0), 0) / 
    participants.filter(p => p.volunteer_rating && p.volunteer_rating > 0).length || 0

  const totalHours = participants
    .filter(p => p.hoursCompleted)
    .reduce((acc, p) => acc + (p.hoursCompleted || 0), 0)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: 'Borrador', variant: 'secondary' as const },
      'PUBLISHED': { label: 'Publicado', variant: 'default' as const },
      'ONGOING': { label: 'En Curso', variant: 'default' as const },
      'COMPLETED': { label: 'Completado', variant: 'default' as const },
      'CANCELLED': { label: 'Cancelado', variant: 'destructive' as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Capacidad del evento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Capacidad</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {event.currentVolunteers}/{event.maxVolunteers}
          </div>
          <p className="text-xs text-muted-foreground">
            {((event.currentVolunteers / event.maxVolunteers) * 100).toFixed(0)}% ocupado
          </p>
        </CardContent>
      </Card>

      {/* Aplicaciones totales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aplicaciones</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {totalApplications}
          </div>
          <p className="text-xs text-muted-foreground">
            {acceptanceRate}% tasa de aceptación
          </p>
        </CardContent>
      </Card>

      {/* Estado de aplicaciones */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estado</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span className="text-sm font-medium">{acceptedCount}</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-600">
              <Clock className="h-3 w-3" />
              <span className="text-sm font-medium">{pendingCount}</span>
            </div>
            <div className="flex items-center gap-1 text-red-600">
              <XCircle className="h-3 w-3" />
              <span className="text-sm font-medium">{rejectedCount}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Aceptados • Pendientes • Rechazados
          </p>
        </CardContent>
      </Card>

      {/* Calificación promedio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Calificación</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {totalHours > 0 ? `${totalHours}h totales` : 'Sin horas registradas'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
