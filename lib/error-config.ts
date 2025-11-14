// Configuración de manejo de errores para VolunNet

export const ERROR_CONFIG = {
  // Rutas de error personalizadas
  ERROR_ROUTES: {
    404: '/not-found',
    500: '/error',
    403: '/unauthorized',
    OFFLINE: '/offline'
  },

  // Configuración de timeouts
  TIMEOUTS: {
    NETWORK_CHECK: 2000, // 2 segundos antes de mostrar error de red
    API_TIMEOUT: 10000,  // 10 segundos para timeouts de API
    RETRY_DELAY: 3000    // 3 segundos entre reintentos
  },

  // Configuración de reintentos
  RETRY_CONFIG: {
    MAX_RETRIES: 3,
    BACKOFF_MULTIPLIER: 2,
    INITIAL_DELAY: 1000
  },

  // Errores que deben redirigir automáticamente
  AUTO_REDIRECT_ERRORS: [
    'ChunkLoadError',
    'Loading chunk',
    'Network request failed',
    'Failed to fetch'
  ],

  // Errores que deben mostrar página específica
  SPECIFIC_ERROR_PAGES: {
    'UNAUTHORIZED': '/unauthorized',
    'FORBIDDEN': '/unauthorized',
    'NOT_FOUND': '/not-found',
    'SERVER_ERROR': '/error',
    'NETWORK_ERROR': '/offline'
  }
}

// Función para determinar el tipo de error
export function getErrorType(error: Error | string): '404' | '500' | '403' | 'offline' | 'generic' {
  const errorMessage = typeof error === 'string' ? error : error.message

  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return '404'
  }
  
  if (errorMessage.includes('403') || errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
    return '403'
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('offline') || errorMessage.includes('fetch')) {
    return 'offline'
  }
  
  if (errorMessage.includes('500') || errorMessage.includes('server error')) {
    return '500'
  }
  
  return 'generic'
}

// Función para obtener el código de error apropiado
export function getErrorCode(error: Error | string): number {
  const errorMessage = typeof error === 'string' ? error : error.message

  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return 404
  }
  
  if (errorMessage.includes('403') || errorMessage.includes('unauthorized')) {
    return 403
  }
  
  if (errorMessage.includes('500') || errorMessage.includes('server error')) {
    return 500
  }
  
  return 500 // Default para errores no específicos
}

