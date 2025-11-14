"use client"

import { ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog"
import { X } from "lucide-react"
import { Button } from "./button"

interface ResponsiveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  showClose?: boolean
  className?: string
}

export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "md",
  showClose = true,
  className = ""
}: ResponsiveModalProps) {
  
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    full: "max-w-7xl"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`
          ${sizeClasses[size]}
          max-w-[95vw]
          max-h-[90vh]
          overflow-y-auto
          p-0
          gap-0
          ${className}
        `}
      >
        {/* Header Sticky en Móvil */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <DialogHeader className="flex-1">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl text-left">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-sm sm:text-base text-left mt-1.5">
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>
            
            {showClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-full hover:bg-gray-100 touch-manipulation shrink-0"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content con padding */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Variante para modal de acción rápida (bottom sheet style en móvil)
interface QuickActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
}

export function QuickActionModal({
  open,
  onOpenChange,
  title,
  children
}: QuickActionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="
          max-w-md
          max-w-[100vw]
          md:max-w-md
          bottom-0
          top-auto
          translate-y-0
          md:top-1/2
          md:translate-y-[-50%]
          rounded-t-3xl
          md:rounded-2xl
          p-0
          gap-0
          max-h-[80vh]
          data-[state=open]:slide-in-from-bottom
          md:data-[state=open]:slide-in-from-top-1/2
        "
      >
        {/* Handle visual (solo móvil) */}
        <div className="md:hidden flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}


