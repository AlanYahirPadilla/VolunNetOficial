"use client"

import { ErrorPage } from "@/components/error/ErrorPage"
import { Search, MapPin, Users, Calendar } from "lucide-react"

export default function NotFound() {
  return (
    <ErrorPage
      code={404}
      title="¡Ups! Página no encontrada"
      description="Parece que te has perdido en el camino del voluntariado. No te preocupes, ¡hay muchas oportunidades esperándote!"
      errorType="404"
      showSearch={true}
    />
  )
}


