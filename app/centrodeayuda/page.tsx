"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  PlayCircle, 
  Users, 
  Building, 
  Calendar, 
  Search,
  Heart,
  Star,
  CheckCircle,
  ArrowRight,
  Download,
  ExternalLink
} from "lucide-react"
import Link from "next/link"

export default function GuiasTutorialesPage() {
  const [activeCategory, setActiveCategory] = useState("voluntarios")

  const categories = [
    { id: "voluntarios", name: "Para Voluntarios", icon: Users, color: "blue" },
    { id: "organizaciones", name: "Para Organizaciones", icon: Building, color: "purple" },
    { id: "general", name: "General", icon: BookOpen, color: "green" }
  ]

  const guias = {
    voluntarios: [
      {
        id: 1,
        title: "Cómo registrarte como voluntario",
        description: "Guía paso a paso para crear tu cuenta y configurar tu perfil",
        type: "tutorial",
        duration: "5 min",
        difficulty: "Fácil",
        steps: 4,
        icon: Users
      },
      {
        id: 2,
        title: "Buscar y aplicar a eventos",
        description: "Aprende a encontrar oportunidades que se alineen con tus intereses",
        type: "guia",
        duration: "8 min",
        difficulty: "Fácil",
        steps: 6,
        icon: Search
      },
      {
        id: 3,
        title: "Gestionar tu perfil y preferencias",
        description: "Personaliza tu experiencia y configura tus notificaciones",
        type: "tutorial",
        duration: "6 min",
        difficulty: "Fácil",
        steps: 5,
        icon: Heart
      },
      {
        id: 4,
        title: "Sistema de calificaciones y reconocimientos",
        description: "Entiende cómo funciona el sistema de puntos y medallas",
        type: "guia",
        duration: "7 min",
        difficulty: "Intermedio",
        steps: 8,
        icon: Star
      }
    ],
    organizaciones: [
      {
        id: 5,
        title: "Registro de organizaciones",
        description: "Cómo crear y verificar tu cuenta de organización",
        type: "tutorial",
        duration: "10 min",
        difficulty: "Intermedio",
        steps: 7,
        icon: Building
      },
      {
        id: 6,
        title: "Crear y gestionar eventos",
        description: "Publica eventos atractivos y gestiona las postulaciones",
        type: "guia",
        duration: "12 min",
        difficulty: "Intermedio",
        steps: 9,
        icon: Calendar
      },
      {
        id: 7,
        title: "Evaluar y calificar voluntarios",
        description: "Cómo usar el sistema de calificaciones para reconocer el buen trabajo",
        type: "tutorial",
        duration: "6 min",
        difficulty: "Fácil",
        steps: 4,
        icon: CheckCircle
      },
      {
        id: 8,
        title: "Analytics y reportes",
        description: "Utiliza las métricas para mejorar tus eventos",
        type: "guia",
        duration: "9 min",
        difficulty: "Intermedio",
        steps: 6,
        icon: Star
      }
    ],
    general: [
      {
        id: 9,
        title: "Primeros pasos en VolunNet",
        description: "Introducción completa a la plataforma",
        type: "tutorial",
        duration: "15 min",
        difficulty: "Fácil",
        steps: 10,
        icon: BookOpen
      },
      {
        id: 10,
        title: "Políticas de la comunidad",
        description: "Normas y mejores prácticas para todos los usuarios",
        type: "guia",
        duration: "8 min",
        difficulty: "Fácil",
        steps: 5,
        icon: CheckCircle
      },
      {
        id: 11,
        title: "Resolución de problemas comunes",
        description: "Soluciones a los problemas más frecuentes",
        type: "guia",
        duration: "12 min",
        difficulty: "Intermedio",
        steps: 8,
        icon: ExternalLink
      }
    ]
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil": return "bg-green-100 text-green-800"
      case "Intermedio": return "bg-yellow-100 text-yellow-800"
      case "Avanzado": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "tutorial" ? PlayCircle : BookOpen
  }

  const getTypeColor = (type: string) => {
    return type === "tutorial" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Guías y Tutoriales
                </h1>
                <p className="text-gray-600">Aprende a usar VolunNet paso a paso</p>
              </div>
            </div>
            <Button asChild variant="outline" className="border-2 hover:bg-gray-50">
              <Link href="/">
                <ArrowRight className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Categorías */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Selecciona una categoría</h2>
          <div className="flex flex-wrap gap-4">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full border-2 transition-all duration-300 ${
                    activeCategory === category.id
                      ? `border-${category.color}-500 bg-${category.color}-50 text-${category.color}-700`
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{category.name}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Lista de guías */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {guias[activeCategory as keyof typeof guias].map((guia, index) => {
            const Icon = guia.icon
            const TypeIcon = getTypeIcon(guia.type)
            return (
              <motion.div
                key={guia.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                            {guia.title}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(guia.type)}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {guia.type === "tutorial" ? "Tutorial" : "Guía"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {guia.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <PlayCircle className="w-4 h-4" />
                          <span>{guia.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>{guia.steps} pasos</span>
                        </div>
                      </div>
                      <Badge className={getDifficultyColor(guia.difficulty)}>
                        {guia.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white group-hover:shadow-lg transition-all duration-300">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Comenzar
                      </Button>
                      <Button variant="outline" size="sm" className="ml-2">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Sección de ayuda adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Necesitas ayuda adicional?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Si no encuentras lo que buscas o tienes preguntas específicas, nuestro equipo de soporte está aquí para ayudarte.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Link href="/contacto">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Contactar Soporte
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-2 hover:bg-gray-50">
                  <Link href="/acerca-de">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Acerca de VolunNet
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md py-6 text-center mt-12 border-t border-gray-200">
        <p className="text-gray-700 font-medium">
          © 2025 VolunNet - CUCEI. Todos los derechos reservados. 💜
        </p>
      </footer>
    </div>
  )
}