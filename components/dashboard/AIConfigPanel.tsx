// Panel de Configuración de IA para Personalizar Recomendaciones
// Permite a los usuarios ajustar sus preferencias de recomendación

"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  Brain, 
  MapPin, 
  Clock, 
  Target, 
  Save, 
  RotateCcw,
  Info,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRecommendations } from '@/hooks/useRecommendations'

// =================== TIPOS ===================

interface AIConfigPanelProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: AIConfig) => void
}

interface AIConfig {
  // Ponderación de factores (0-1, deben sumar 1.0)
  weights: {
    location: number
    interests: number
    skills: number
    availability: number
    experience: number
  }
  
  // Configuración geográfica
  radius: {
    default: number
    max: number
  }
  
  // Filtros automáticos
  filters: {
    minCompatibilityScore: number
    excludePastEvents: boolean
    prioritizeVerifiedOrgs: boolean
    requireLocationMatch: boolean
  }
  
  // Preferencias de usuario
  preferences: {
    preferredTimeSlots: string[]
    preferredDays: number[]
    maxTravelDistance: number
    difficultyPreference: 'beginner' | 'intermediate' | 'advanced' | 'any'
    timeCommitmentPreference: 'low' | 'medium' | 'high' | 'any'
  }
}

// =================== CONFIGURACIONES PREDEFINIDAS ===================

const PRESET_CONFIGS = {
  'location_focused': {
    name: 'Enfoque en Ubicación',
    description: 'Prioriza eventos cercanos a ti',
    icon: '📍',
    config: {
      weights: { location: 0.5, interests: 0.2, skills: 0.15, availability: 0.1, experience: 0.05 },
      radius: { default: 5, max: 50 },
      filters: { minCompatibilityScore: 30, excludePastEvents: true, prioritizeVerifiedOrgs: true, requireLocationMatch: false },
      preferences: { preferredTimeSlots: ['morning', 'afternoon'], preferredDays: [1,2,3,4,5], maxTravelDistance: 5, difficultyPreference: 'any', timeCommitmentPreference: 'any' }
    }
  },
  'interest_focused': {
    name: 'Enfoque en Intereses',
    description: 'Prioriza eventos que coincidan con tus intereses',
    icon: '🎯',
    config: {
      weights: { location: 0.2, interests: 0.4, skills: 0.2, availability: 0.15, experience: 0.05 },
      radius: { default: 25, max: 200 },
      filters: { minCompatibilityScore: 40, excludePastEvents: true, prioritizeVerifiedOrgs: true, requireLocationMatch: false },
      preferences: { preferredTimeSlots: ['morning', 'afternoon', 'evening'], preferredDays: [1,2,3,4,5,6], maxTravelDistance: 25, difficultyPreference: 'any', timeCommitmentPreference: 'any' }
    }
  },
  'skill_focused': {
    name: 'Enfoque en Habilidades',
    description: 'Prioriza eventos que usen tus habilidades',
    icon: '🛠️',
    config: {
      weights: { location: 0.2, interests: 0.2, skills: 0.4, availability: 0.15, experience: 0.05 },
      radius: { default: 15, max: 100 },
      filters: { minCompatibilityScore: 50, excludePastEvents: true, prioritizeVerifiedOrgs: true, requireLocationMatch: false },
      preferences: { preferredTimeSlots: ['morning', 'afternoon'], preferredDays: [1,2,3,4,5], maxTravelDistance: 15, difficultyPreference: 'intermediate', timeCommitmentPreference: 'medium' }
    }
  },
  'beginner_friendly': {
    name: 'Amigable para Principiantes',
    description: 'Eventos fáciles para empezar',
    icon: '🌱',
    config: {
      weights: { location: 0.25, interests: 0.25, skills: 0.1, availability: 0.25, experience: 0.15 },
      radius: { default: 10, max: 50 },
      filters: { minCompatibilityScore: 20, excludePastEvents: true, prioritizeVerifiedOrgs: true, requireLocationMatch: false },
      preferences: { preferredTimeSlots: ['morning', 'afternoon'], preferredDays: [1,2,3,4,5,6], maxTravelDistance: 10, difficultyPreference: 'beginner', timeCommitmentPreference: 'low' }
    }
  },
  'expert_mode': {
    name: 'Modo Experto',
    description: 'Eventos desafiantes para voluntarios experimentados',
    icon: '🚀',
    config: {
      weights: { location: 0.15, interests: 0.2, skills: 0.3, availability: 0.2, experience: 0.15 },
      radius: { default: 20, max: 150 },
      filters: { minCompatibilityScore: 60, excludePastEvents: true, prioritizeVerifiedOrgs: true, requireLocationMatch: false },
      preferences: { preferredTimeSlots: ['morning', 'afternoon', 'evening'], preferredDays: [1,2,3,4,5,6,0], maxTravelDistance: 20, difficultyPreference: 'advanced', timeCommitmentPreference: 'high' }
    }
  }
}

// =================== COMPONENTE PRINCIPAL ===================

export function AIConfigPanel({ isOpen, onClose, onSave }: AIConfigPanelProps) {
  const [config, setConfig] = useState<AIConfig>({
    weights: { location: 0.3, interests: 0.25, skills: 0.2, availability: 0.15, experience: 0.1 },
    radius: { default: 10, max: 100 },
    filters: { minCompatibilityScore: 30, excludePastEvents: true, prioritizeVerifiedOrgs: true, requireLocationMatch: false },
    preferences: { preferredTimeSlots: ['morning', 'afternoon'], preferredDays: [1,2,3,4,5], maxTravelDistance: 10, difficultyPreference: 'any', timeCommitmentPreference: 'any' }
  })
  
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [isCheckingApis, setIsCheckingApis] = useState(false)

  const { updatePreferences } = useRecommendations()

  // =================== MANEJADORES ===================

  const handleWeightChange = (factor: keyof AIConfig['weights'], value: number[]) => {
    const newWeights = { ...config.weights, [factor]: value[0] / 100 }
    
    // Normalizar para que sumen 1.0
    const total = Object.values(newWeights).reduce((sum, weight) => sum + weight, 0)
    const normalizedWeights = Object.fromEntries(
      Object.entries(newWeights).map(([key, val]) => [key, val / total])
    ) as AIConfig['weights']
    
    setConfig(prev => ({ ...prev, weights: normalizedWeights }))
    setHasChanges(true)
  }

  const handlePresetSelect = (presetKey: string) => {
    const preset = PRESET_CONFIGS[presetKey as keyof typeof PRESET_CONFIGS]
    if (preset) {
      setConfig(preset.config)
      setSelectedPreset(presetKey)
      setHasChanges(true)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updatePreferences(config)
      onSave(config)
      setHasChanges(false)
    } catch (error) {
      console.error('Error guardando configuración:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setConfig({
      weights: { location: 0.3, interests: 0.25, skills: 0.2, availability: 0.15, experience: 0.1 },
      radius: { default: 10, max: 100 },
      filters: { minCompatibilityScore: 30, excludePastEvents: true, prioritizeVerifiedOrgs: true, requireLocationMatch: false },
      preferences: { preferredTimeSlots: ['morning', 'afternoon'], preferredDays: [1,2,3,4,5], maxTravelDistance: 10, difficultyPreference: 'any', timeCommitmentPreference: 'any' }
    })
    setSelectedPreset(null)
    setHasChanges(true)
  }

  const checkApiStatus = async () => {
    setIsCheckingApis(true)
    try {
      const response = await fetch('/api/debug/ai-status')
      const data = await response.json()
      setApiStatus(data)
    } catch (error) {
      console.error('Error checking API status:', error)
      setApiStatus({ error: 'Failed to check API status' })
    } finally {
      setIsCheckingApis(false)
    }
  }

  // =================== RENDER ===================

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6" />
                <h2 className="text-xl font-bold">Configuración de IA</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                ✕
              </Button>
            </div>
            <p className="text-purple-100 mt-2">
              Personaliza cómo la IA genera tus recomendaciones
            </p>
          </div>

          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            
            {/* Estado de APIs */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-blue-500" />
                    Estado de APIs Externas
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkApiStatus}
                    disabled={isCheckingApis}
                    className="flex items-center gap-2"
                  >
                    {isCheckingApis ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Wifi className="h-4 w-4" />
                    )}
                    {isCheckingApis ? 'Verificando...' : 'Verificar APIs'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {apiStatus ? (
                  <div className="space-y-4">
                    {apiStatus.error ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Error: {apiStatus.error}</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(apiStatus.apis).map(([apiName, apiData]: [string, any]) => (
                          <div key={apiName} className="p-3 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold capitalize">{apiName}</h4>
                              {apiData.configured ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <WifiOff className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Clave: {apiData.keyPresent}</div>
                              <div>Estado: {apiData.configured ? '✅ Configurada' : '❌ No configurada'}</div>
                              {apiData.testResult && (
                                <div>Prueba: {apiData.testResult === 'Success' ? '✅' : '❌'} {apiData.testResult}</div>
                              )}
                              {apiData.error && (
                                <div className="text-red-500">Error: {apiData.error}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <p className="font-semibold">¿Cómo configurar las APIs?</p>
                          <p>Visita <code className="bg-blue-100 px-1 rounded">/api/debug/ai-status</code> para ver el estado detallado, o revisa la guía de configuración en <code className="bg-blue-100 px-1 rounded">API_SETUP_GUIDE.md</code></p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Haz clic en "Verificar APIs" para ver el estado de las APIs externas
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Configuraciones Predefinidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Configuraciones Predefinidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(PRESET_CONFIGS).map(([key, preset]) => (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPreset === key 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handlePresetSelect(key)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{preset.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{preset.name}</h4>
                          <p className="text-sm text-gray-600">{preset.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Configuración Personalizada */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-green-500" />
                    Configuración Personalizada
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Ponderación de Factores */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Ponderación de Factores</h4>
                    <div className="space-y-4">
                      {Object.entries(config.weights).map(([factor, weight]) => (
                        <div key={factor}>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="capitalize">{factor}</Label>
                            <Badge variant="secondary">{Math.round(weight * 100)}%</Badge>
                          </div>
                          <Slider
                            value={[weight * 100]}
                            onValueChange={(value) => handleWeightChange(factor as keyof AIConfig['weights'], value)}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Radio de Búsqueda */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Radio de Búsqueda</h4>
                    <div className="space-y-4">
                      <div>
                        <Label>Distancia por defecto: {config.radius.default} km</Label>
                        <Slider
                          value={[config.radius.default]}
                          onValueChange={(value) => setConfig(prev => ({ 
                            ...prev, 
                            radius: { ...prev.radius, default: value[0] } 
                          }))}
                          max={50}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filtros */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Filtros Automáticos</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Score mínimo de compatibilidad: {config.filters.minCompatibilityScore}%</Label>
                      </div>
                      <Slider
                        value={[config.filters.minCompatibilityScore]}
                        onValueChange={(value) => setConfig(prev => ({ 
                          ...prev, 
                          filters: { ...prev.filters, minCompatibilityScore: value[0] } 
                        }))}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Excluir eventos pasados</Label>
                          <Switch
                            checked={config.filters.excludePastEvents}
                            onCheckedChange={(checked) => setConfig(prev => ({ 
                              ...prev, 
                              filters: { ...prev.filters, excludePastEvents: checked } 
                            }))}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Label>Priorizar organizaciones verificadas</Label>
                          <Switch
                            checked={config.filters.prioritizeVerifiedOrgs}
                            onCheckedChange={(checked) => setConfig(prev => ({ 
                              ...prev, 
                              filters: { ...prev.filters, prioritizeVerifiedOrgs: checked } 
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preferencias de Usuario */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Preferencias Personales</h4>
                    <div className="space-y-4">
                      <div>
                        <Label>Nivel de dificultad preferido</Label>
                        <Select
                          value={config.preferences.difficultyPreference}
                          onValueChange={(value: any) => setConfig(prev => ({ 
                            ...prev, 
                            preferences: { ...prev.preferences, difficultyPreference: value } 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Cualquiera</SelectItem>
                            <SelectItem value="beginner">Principiante</SelectItem>
                            <SelectItem value="intermediate">Intermedio</SelectItem>
                            <SelectItem value="advanced">Avanzado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Compromiso de tiempo preferido</Label>
                        <Select
                          value={config.preferences.timeCommitmentPreference}
                          onValueChange={(value: any) => setConfig(prev => ({ 
                            ...prev, 
                            preferences: { ...prev.preferences, timeCommitmentPreference: value } 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Cualquiera</SelectItem>
                            <SelectItem value="low">Bajo (1-2 horas)</SelectItem>
                            <SelectItem value="medium">Medio (3-6 horas)</SelectItem>
                            <SelectItem value="high">Alto (7+ horas)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restablecer
              </Button>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AIConfigPanel
