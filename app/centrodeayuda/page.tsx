"use client" 

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation";
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
  Download,
  ExternalLink,
  X,
  Menu,
  ArrowRight // Se mantiene ArrowRight por si se usa en el footer/contacto
} from "lucide-react"
import Link from "next/link"

// Componentes de UI 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function GuiasTutorialesPage() {
  // 1. Estados y Hooks 
  const [activeCategory, setActiveCategory] = useState("voluntarios")
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter(); // Hook de navegación

  // 2. Efecto para controlar el scroll y montar el componente
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. Definición de Datos y Funciones Auxiliares
  const categories = [
    { id: "voluntarios", name: "Para Voluntarios", icon: Users, color: "blue" },
    { id: "organizaciones", name: "Para Organizaciones", icon: Building, color: "purple" },
    { id: "general", name: "General", icon: BookOpen, color: "green" }
  ]

  const guias = {
    voluntarios: [
      { id: 1, title: "Cómo registrarte como voluntario", description: "Guía paso a paso para crear tu cuenta y configurar tu perfil", type: "tutorial", duration: "5 min", difficulty: "Fácil", steps: 4, icon: Users },
      { id: 2, title: "Buscar y aplicar a eventos", description: "Aprende a encontrar oportunidades que se alineen con tus intereses", type: "guia", duration: "8 min", difficulty: "Fácil", steps: 6, icon: Search },
      { id: 3, title: "Gestionar tu perfil y preferencias", description: "Personaliza tu experiencia y configura tus notificaciones", type: "tutorial", duration: "6 min", difficulty: "Fácil", steps: 5, icon: Heart },
      { id: 4, title: "Sistema de calificaciones y reconocimientos", description: "Entiende cómo funciona el sistema de puntos y medallas", type: "guia", duration: "7 min", difficulty: "Intermedio", steps: 8, icon: Star }
    ],
    organizaciones: [
      { id: 5, title: "Registro de organizaciones", description: "Cómo crear y verificar tu cuenta de organización", type: "tutorial", duration: "10 min", difficulty: "Intermedio", steps: 7, icon: Building },
      { id: 6, title: "Crear y gestionar eventos", description: "Publica eventos atractivos y gestiona las postulaciones", type: "guia", duration: "12 min", difficulty: "Intermedio", steps: 9, icon: Calendar },
      { id: 7, title: "Evaluar y calificar voluntarios", description: "Cómo usar el sistema de calificaciones para reconocer el buen trabajo", type: "tutorial", duration: "6 min", difficulty: "Fácil", steps: 4, icon: CheckCircle },
      { id: 8, title: "Analytics y reportes", description: "Utiliza las métricas para mejorar tus eventos", type: "guia", duration: "9 min", difficulty: "Intermedio", steps: 6, icon: Star }
    ],
    general: [
      { id: 9, title: "Primeros pasos en VolunNet", description: "Introducción completa a la plataforma", type: "tutorial", duration: "15 min", difficulty: "Fácil", steps: 10, icon: BookOpen },
      { id: 10, title: "Políticas de la comunidad", description: "Normas y mejores prácticas para todos los usuarios", type: "guia", duration: "8 min", difficulty: "Fácil", steps: 5, icon: CheckCircle },
      { id: 11, title: "Resolución de problemas comunes", description: "Soluciones a los problemas más frecuentes", type: "guia", duration: "12 min", difficulty: "Intermedio", steps: 8, icon: ExternalLink }
    ]
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil": return "bg-green-100 text-green-800 border border-green-300"
      case "Intermedio": return "bg-yellow-100 text-yellow-800 border border-yellow-300"
      case "Avanzado": return "bg-red-100 text-red-800 border border-red-300"
      default: return "bg-gray-100 text-gray-800 border border-gray-300"
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "tutorial" ? PlayCircle : BookOpen
  }

  const getTypeColor = (type: string) => {
    return type === "tutorial" ? "bg-blue-100 text-blue-800 border border-blue-300" : "bg-purple-100 text-purple-800 border border-purple-300"
  }

  const getCategoryClasses = (id: string, color: string, isActive: boolean) => {
    const baseClasses = "flex items-center space-x-2 px-6 py-3 rounded-full border-2 transition-all duration-300 shadow-sm"
    
    if (isActive) {
      switch (color) {
        case 'blue': return `${baseClasses} border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-lg shadow-blue-200/50`
        case 'purple': return `${baseClasses} border-purple-500 bg-purple-50 text-purple-700 font-bold shadow-lg shadow-purple-200/50`
        case 'green': return `${baseClasses} border-green-500 bg-green-50 text-green-700 font-bold shadow-lg shadow-green-200/50`
        default: return `${baseClasses} border-gray-500 bg-gray-50 text-gray-700 font-bold`
      }
    } else {
      return `${baseClasses} border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600`
    }
  }

  const menuItems = ["Inicio", "Eventos", "Organizaciones", "Acerca de"];


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      
      {/* HEADER con el menú de navegación completo y fijo */}
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          mounted && scrolled ? "bg-white/90 backdrop-blur-md shadow-md" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 focus:outline-none"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
              title="Ir al inicio"
              onClick={() => router.push("/")}
            >
              <Heart className="h-8 w-8 text-blue-600 fill-blue-200" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VolunNet
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <motion.div key={item} whileHover={{ scale: 1.05 }}>
                <Link
                  href={item === "Inicio" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`}
                  className="text-gray-700 hover:text-blue-600 transition-colors relative group font-medium"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="hidden md:flex space-x-3">
            <Button variant="outline" className="rounded-full px-6" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button
              className="rounded-full px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0"
              asChild
            >
              <Link href="/registro">Registrarse</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item}
                  href={item === "Inicio" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`}
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-2 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600" asChild>
                  <Link href="/registro">Registrarse</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section para el Título Grande */}
      <div className="container mx-auto px-4 pt-32 md:pt-40 pb-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            {/* TÍTULO */}
            <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 leading-tight">
              Centro de Ayuda y Aprendizaje
            </h1>
            <p className="text-xl text-gray-600 mt-3 max-w-2xl mx-auto">
              Aprende a dominar VolunNet paso a paso, con guías y tutoriales diseñados para ti.
            </p>
          </motion.div>
      </div>


      <div className="container mx-auto px-4 py-8">
        
        {/* Categorías */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-5">Encuentra tu ruta de aprendizaje</h2>
          <div className="flex flex-wrap gap-3 md:gap-4 justify-center md:justify-start">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = activeCategory === category.id
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={getCategoryClasses(category.id, category.color, isActive)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-base">{category.name}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Lista de guías */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Guías para {categories.find(c => c.id === activeCategory)?.name}
        </h2>
        
        <motion.div
          key={activeCategory} 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
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
                transition={{ delay: index * 0.1 + 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.08)" }}
                className="h-full"
              >
                <Card className="h-full border-gray-200 transition-all duration-300 cursor-pointer group rounded-xl overflow-hidden">
                  <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-full bg-white border border-gray-100 shadow-md group-hover:scale-105 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="mt-1">
                          <CardTitle className="text-xl font-semibold group-hover:text-purple-600 transition-colors">
                            {guia.title}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-5">
                    <p className="text-gray-600 mb-4 text-sm leading-snug">
                      {guia.description}
                    </p>
                    
                    {/* Metadatos */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <Badge variant="outline" className={`font-medium ${getTypeColor(guia.type)}`}>
                        <TypeIcon className="w-3.5 h-3.5 mr-1" />
                        {guia.type === "tutorial" ? "Tutorial" : "Guía"}
                      </Badge>
                      <Badge variant="outline" className={`font-medium ${getDifficultyColor(guia.difficulty)}`}>
                        {guia.difficulty}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <PlayCircle className="w-4 h-4" />
                        <span>{guia.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4" />
                        <span>{guia.steps} pasos</span>
                      </div>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex items-center justify-between mt-auto">
                      <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold group-hover:shadow-lg group-hover:shadow-indigo-300/50 transition-all duration-300 transform group-hover:scale-[1.01]">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Comenzar
                      </Button>
                      <Button variant="outline" size="icon" className="ml-2 border-gray-300 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <Card className="bg-white p-6 border-2 border-blue-200 shadow-2xl shadow-blue-100/50 rounded-2xl">
            <CardContent className="p-2 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-400/50">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-2">¿Necesitas ayuda adicional? 💬</h3>
              <p className="text-gray-600 mb-6 max-w-3xl mx-auto text-lg">
                Si no encuentras lo que buscas o tienes preguntas específicas, nuestro equipo de soporte está listo para ayudarte a que tu experiencia sea perfecta.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="h-12 px-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl shadow-indigo-300/50 transition-all duration-300 transform hover:scale-[1.02]">
                  <Link href="/contacto">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Contactar Soporte
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 px-8 text-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                  <Link href="/acerca-de">
                    <BookOpen className="w-5 h-5 mr-2" />
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
        <p className="text-gray-700 font-medium text-sm">
          © 2025 VolunNet - CUCEI. Todos los derechos reservados. 💜
        </p>
      </footer>
    </div>
  )
}