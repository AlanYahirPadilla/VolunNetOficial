"use client"

import { ErrorPage } from "@/components/error/ErrorPage"
import { Lock, Shield, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Unauthorized() {
  return (
    <ErrorPage
      code={403}
      title="Acceso Restringido"
      description="No tienes permisos para acceder a esta página. Si crees que esto es un error, contacta con el administrador o inicia sesión con una cuenta diferente."
      errorType="403"
      actions={
        <>
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <Link href="/login">
              <UserX className="w-5 h-5 mr-2" />
              Iniciar Sesión
            </Link>
          </Button>
        </>
      }
    />
  )
}


