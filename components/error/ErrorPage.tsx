"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Home, RefreshCw, Search } from "lucide-react"
import { AnimatedBackground } from "./AnimatedBackground"
import { AnimatedErrorIcon } from "./AnimatedErrorIcon"
import { AnimatedErrorText } from "./AnimatedErrorText"
import type { ReactNode } from "react"

interface ErrorPageProps {
  code: number
  title: string
  description: string
  icon?: ReactNode
  actions?: ReactNode
  className?: string
  showSearch?: boolean
  errorType?: "404" | "500" | "403" | "offline" | "generic"
}

export function ErrorPage({
  code,
  title,
  description,
  icon,
  actions,
  className,
  showSearch = false,
  errorType = "generic",
}: ErrorPageProps) {
  return (
    <div className={cn("min-h-screen relative overflow-hidden", className)}>
      {/* Fondo animado único */}
      <AnimatedBackground errorType={errorType} />
      
      {/* Contenido principal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ 
            duration: 1, 
            ease: "easeOut",
            type: "spring",
            stiffness: 100
          }}
          className="w-full max-w-4xl"
        >
          <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border-0 shadow-2xl relative overflow-hidden">
            {/* Efectos de brillo en el card */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-gradient-shift"></div>
            
            <CardContent className="p-8 md:p-16 text-center relative z-10">
              {/* Icono animado único */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="mb-8 flex justify-center"
              >
                {icon ? (
                  <div className="relative">
                    {icon}
                    {/* Efectos adicionales para iconos personalizados */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                ) : (
                  <AnimatedErrorIcon errorType={errorType} size="xl" />
                )}
              </motion.div>

              {/* Texto animado único */}
              <AnimatedErrorText
                code={code}
                title={title}
                description={description}
                errorType={errorType}
              />

              {/* Botones de acción con animaciones mejoradas */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12"
              >
                {actions || (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button 
                        asChild 
                        size="lg" 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                      >
                        <Link href="/">
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "0%" }}
                            transition={{ duration: 0.3 }}
                          />
                          <span className="relative z-10 flex items-center">
                            <Home className="w-5 h-5 mr-2 animate-heart-beat" />
                            Volver al Inicio
                          </span>
                        </Link>
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={() => window.history.back()} 
                        className="border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 relative overflow-hidden group"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "0%" }}
                          transition={{ duration: 0.3 }}
                        />
                        <span className="relative z-10 flex items-center">
                          <ArrowLeft className="w-5 h-5 mr-2 animate-volunteer-wave" />
                          Regresar
                        </span>
                      </Button>
                    </motion.div>

                    {showSearch && (
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button 
                          variant="outline" 
                          size="lg" 
                          asChild 
                          className="border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 relative overflow-hidden group"
                        >
                          <Link href="/eventos/buscar">
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-green-100 to-emerald-200 dark:from-green-700 dark:to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              initial={{ x: "-100%" }}
                              whileHover={{ x: "0%" }}
                              transition={{ duration: 0.3 }}
                            />
                            <span className="relative z-10 flex items-center">
                              <Search className="w-5 h-5 mr-2 animate-floating-icons" />
                              Buscar Eventos
                            </span>
                          </Link>
                        </Button>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>

              {/* Elementos flotantes únicos */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-blue-400/20 rounded-full animate-error-bounce"></div>
              <div className="absolute -bottom-6 -right-6 w-8 h-8 bg-purple-400/20 rounded-full animate-error-bounce" style={{ animationDelay: "1s" }}></div>
              <div className="absolute top-1/2 -right-12 w-6 h-6 bg-green-400/20 rounded-full animate-error-bounce" style={{ animationDelay: "2s" }}></div>
              <div className="absolute top-1/4 -left-12 w-4 h-4 bg-yellow-400/20 rounded-full animate-sparkle"></div>
              <div className="absolute bottom-1/4 -left-8 w-5 h-5 bg-pink-400/20 rounded-full animate-sparkle" style={{ animationDelay: "1.5s" }}></div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}


