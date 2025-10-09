# Sistema de Páginas de Error - VolunNet (Producción)

Este sistema proporciona páginas de error animadas y personalizadas que se activan automáticamente en toda la aplicación VolunNet.

## 🚀 Activación Automática

El sistema está configurado para activarse automáticamente en los siguientes casos:

### 📱 **Errores de Navegación (404)**
- **Activación**: Cuando se accede a una URL que no existe
- **Archivo**: `app/not-found.tsx`
- **Características**: 
  - Búsqueda integrada de eventos
  - Animaciones temáticas azul-púrpura
  - Botones de navegación inteligentes

### ⚠️ **Errores del Servidor (500)**
- **Activación**: Errores internos del servidor o JavaScript
- **Archivo**: `app/error.tsx`
- **Características**:
  - Botón de reintento automático
  - Animaciones temáticas rojo-naranja
  - Detección de errores de chunks

### 🔒 **Errores de Autorización (403)**
- **Activación**: Acceso denegado o sin permisos
- **Archivo**: `app/unauthorized.tsx`
- **Características**:
  - Redirección automática a login
  - Animaciones temáticas naranja-amarillo
  - Mensajes de seguridad claros

### 📶 **Errores de Conexión (Offline)**
- **Activación**: Pérdida de conexión a internet
- **Archivo**: `app/offline.tsx`
- **Características**:
  - Detección automática de conexión
  - Botón inteligente que se activa cuando hay conexión
  - Animaciones temáticas grises

## 🎨 Características Visuales Únicas

### ✨ **Animaciones Temáticas**
- **404**: `volunteer-wave`, `floating-icons` - Búsqueda y exploración
- **500**: `error-storm`, `error-bounce` - Alerta y acción
- **403**: `community-pulse`, `sparkle` - Seguridad y comunidad
- **Offline**: `wave-motion`, `ripple-effect` - Conexión y comunicación

### 🌈 **Efectos Visuales**
- **Fondos animados** con partículas temáticas
- **Iconos interactivos** con múltiples capas de animación
- **Texto animado** con efectos de brillo
- **Botones con hover** mejorados y efectos de deslizamiento
- **Gradientes dinámicos** que cambian continuamente

### 🎭 **Componentes Únicos**
- **AnimatedBackground**: Fondos temáticos por tipo de error
- **AnimatedErrorIcon**: Iconos con animaciones complejas
- **AnimatedErrorText**: Texto con efectos dinámicos
- **ErrorHandlerProvider**: Manejo automático de errores

## 🔧 Configuración Automática

### 📋 **ErrorHandlerProvider**
Integrado en `app/layout.tsx` para capturar errores globalmente:

```tsx
<ErrorHandlerProvider>
  <NotificationProvider>
    {children}
  </NotificationProvider>
</ErrorHandlerProvider>
```

### 🌐 **Detección de Red**
Hook `useNetworkErrorHandler` que:
- Detecta cambios de conexión automáticamente
- Redirige a página offline cuando no hay conexión
- Restaura funcionalidad cuando se recupera la conexión

### 🛡️ **Error Boundary Global**
Captura errores de JavaScript y:
- Muestra página de error 500 para errores críticos
- Maneja errores de chunks de carga
- Registra errores para debugging

## 📱 Responsive y Accesible

### 📱 **Mobile-First**
- Optimizado para dispositivos móviles
- Animaciones suaves en todos los tamaños
- Botones con tamaño táctil apropiado

### ♿ **Accesibilidad**
- Compatible con lectores de pantalla
- Contraste adecuado en modo claro/oscuro
- Navegación por teclado funcional

### 🌙 **Modo Oscuro**
- Adaptación automática al tema del sistema
- Colores optimizados para ambos modos
- Efectos de brillo ajustados

## 🎯 Casos de Uso Reales

### 🔍 **Error 404 - Página No Encontrada**
```
URL: /pagina-inexistente
→ Redirige automáticamente a /not-found
→ Muestra animaciones de búsqueda
→ Ofrece búsqueda de eventos
```

### ⚠️ **Error 500 - Servidor**
```
Error de JavaScript no capturado
→ ErrorBoundary captura el error
→ Redirige a /error
→ Muestra botón de reintento
```

### 🔒 **Error 403 - Sin Permisos**
```
Acceso a ruta protegida sin autorización
→ Middleware detecta falta de token
→ Redirige a /unauthorized
→ Ofrece login directo
```

### 📶 **Error Offline**
```
Pérdida de conexión detectada
→ Hook de red detecta cambio
→ Redirige a /offline después de 2 segundos
→ Botón se activa cuando hay conexión
```

## 🛠️ Personalización

### 🎨 **Colores Temáticos**
Cada tipo de error tiene su paleta de colores:
- **404**: Azul-Púrpura (exploración)
- **500**: Rojo-Naranja (alerta)
- **403**: Naranja-Amarillo (seguridad)
- **Offline**: Gris (conexión)

### ⚡ **Animaciones Personalizadas**
Todas las animaciones están en `app/globals.css`:
- `animate-heart-beat`
- `animate-volunteer-wave`
- `animate-community-pulse`
- `animate-error-storm`
- `animate-gradient-shift`
- Y muchas más...

### 🔧 **Configuración**
Archivo `lib/error-config.ts` permite:
- Configurar timeouts
- Personalizar rutas de error
- Ajustar comportamiento de reintentos
- Definir errores específicos

## 📊 Monitoreo y Debugging

### 🔍 **Logging Automático**
- Errores se registran en consola
- Información detallada para debugging
- Preparado para integración con servicios de monitoreo

### 🎯 **Identificación de Errores**
Función `getErrorType()` clasifica automáticamente:
- Errores de red → tipo "offline"
- Errores 404 → tipo "404"
- Errores 403 → tipo "403"
- Errores de servidor → tipo "500"

## 🚀 Rendimiento

### ⚡ **Optimizado**
- Animaciones con `transform` y `opacity`
- Lazy loading de componentes pesados
- Debounce en detección de red
- Memoización de componentes

### 📱 **Mobile Optimized**
- Animaciones reducidas en dispositivos lentos
- Touch-friendly interactions
- Gestos nativos respetados

---

**¡El sistema de errores está completamente integrado y funcionando automáticamente en toda la aplicación VolunNet!** 🎉

Cada error se maneja de manera elegante y profesional, proporcionando una experiencia de usuario excepcional incluso en situaciones de error.


