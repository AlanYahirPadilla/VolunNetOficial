"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/app/auth/actions"

export default function ConfiguracionOrganizacion() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await getCurrentUser()
        console.log("User loaded:", user)
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800">Configuración de Organización</h1>
        <p className="text-gray-600 mt-2">Página de configuración temporal</p>
      </div>
    </div>
  )
}
