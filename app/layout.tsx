import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { PreloadProvider } from "@/components/ui/preload-provider"
import { NotificationProvider } from "@/components/notifications/NotificationProvider"
import { ErrorHandlerProvider } from "@/components/error/ErrorHandlerProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VolunNet - Plataforma de Voluntariado",
  description: "Conecta con oportunidades de voluntariado en tu comunidad",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <PreloadProvider>
            <ErrorHandlerProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </ErrorHandlerProvider>
          </PreloadProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
