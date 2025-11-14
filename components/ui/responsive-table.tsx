"use client"

import { ReactNode } from "react"
import { Card } from "./card"

interface ResponsiveTableProps {
  children: ReactNode
  className?: string
}

export function ResponsiveTable({ children, className = "" }: ResponsiveTableProps) {
  return (
    <div className="w-full">
      {/* Desktop: Tabla normal */}
      <div className="hidden md:block overflow-x-auto">
        <div className={className}>
          {children}
        </div>
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {children}
      </div>
    </div>
  )
}

interface ResponsiveTableWrapperProps {
  children: ReactNode
  className?: string
}

export function ResponsiveTableWrapper({ children, className = "" }: ResponsiveTableWrapperProps) {
  return (
    <div className="w-full overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
      <div className={`min-w-full ${className}`}>
        {children}
      </div>
    </div>
  )
}

// Componente alternativo: Lista de cards para móvil
interface TableCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function TableCard({ children, className = "", onClick }: TableCardProps) {
  return (
    <Card 
      className={`p-4 space-y-3 hover:shadow-md transition-shadow ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </Card>
  )
}

interface TableCardRowProps {
  label: string
  value: ReactNode
  className?: string
}

export function TableCardRow({ label, value, className = "" }: TableCardRowProps) {
  return (
    <div className={`flex justify-between items-start gap-3 ${className}`}>
      <span className="text-sm font-medium text-gray-600 min-w-[100px]">{label}:</span>
      <div className="text-sm text-gray-900 text-right flex-1">{value}</div>
    </div>
  )
}


