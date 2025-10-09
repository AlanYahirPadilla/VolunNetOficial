"use client"

import { ErrorPage } from "@/components/error/ErrorPage"
import { AlertTriangle, RefreshCw, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ServerError() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <ErrorPage
      code={500}
      title="¡Algo salió mal!"
      description="Nuestros servidores están trabajando duro para solucionar este problema. Mientras tanto, puedes intentar refrescar la página o volver más tarde."
      errorType="500"
      actions={
        <>
          <Button onClick={handleRefresh} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <RefreshCw className="w-5 h-5 mr-2" />
            Intentar de Nuevo
          </Button>
        </>
      }
    />
  )
}


