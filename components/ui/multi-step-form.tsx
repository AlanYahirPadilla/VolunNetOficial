"use client"

import { ReactNode, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./button"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card"

interface Step {
  id: string
  title: string
  description?: string
  content: ReactNode
  optional?: boolean
}

interface MultiStepFormProps {
  steps: Step[]
  onComplete: () => void | Promise<void>
  onStepChange?: (stepIndex: number) => void
  className?: string
  showProgress?: boolean
}

export function MultiStepForm({ 
  steps, 
  onComplete, 
  onStepChange,
  className = "",
  showProgress = true 
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(new Set(completedSteps).add(currentStep))
      setCurrentStep(currentStep + 1)
      onStepChange?.(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      onStepChange?.(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      await onComplete()
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex <= currentStep || completedSteps.has(stepIndex - 1)) {
      setCurrentStep(stepIndex)
      onStepChange?.(stepIndex)
    }
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Progress Indicator */}
      {showProgress && (
        <div className="mb-6 md:mb-8">
          {/* Mobile: Compact progress */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">
                Paso {currentStep + 1} de {steps.length}
              </span>
              <span className="text-xs text-gray-500">
                {steps[currentStep].title}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Desktop: Full stepper */}
          <div className="hidden md:flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(index) || index < currentStep
              const isCurrent = index === currentStep
              const isClickable = index <= currentStep || completedSteps.has(index - 1)

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => isClickable && goToStep(index)}
                    disabled={!isClickable}
                    className={`
                      flex items-center gap-3 transition-all duration-200
                      ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                    `}
                  >
                    <div className={`
                      relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                      ${isCompleted 
                        ? 'bg-gradient-to-r from-blue-400 to-purple-400 border-transparent text-white' 
                        : isCurrent
                          ? 'border-blue-400 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-400'
                      }
                    `}>
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span className="font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <div className="text-left">
                      <div className={`text-sm font-medium transition-colors duration-200 ${
                        isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                      {step.optional && (
                        <span className="text-xs text-gray-400">(Opcional)</span>
                      )}
                    </div>
                  </button>
                  
                  {/* Línea conectora */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-4 bg-gray-200 relative overflow-hidden">
                      {isCompleted && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl md:text-2xl">
                {steps[currentStep].title}
              </CardTitle>
              {steps[currentStep].description && (
                <CardDescription className="text-sm md:text-base">
                  {steps[currentStep].description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {steps[currentStep].content}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
          className="w-full sm:w-auto min-h-touch"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        {isLastStep ? (
          <Button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 min-h-touch"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Completar
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 min-h-touch"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Mobile: Step indicators (dots) */}
      <div className="mt-4 flex justify-center gap-2 md:hidden">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => goToStep(index)}
            disabled={index > currentStep && !completedSteps.has(index - 1)}
            className={`
              h-2 rounded-full transition-all duration-200
              ${index === currentStep 
                ? 'w-8 bg-gradient-to-r from-blue-400 to-purple-400' 
                : index < currentStep || completedSteps.has(index)
                  ? 'w-2 bg-blue-300'
                  : 'w-2 bg-gray-300'
              }
            `}
          />
        ))}
      </div>
    </div>
  )
}


