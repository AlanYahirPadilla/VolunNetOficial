# 💬 Sistema de Chat y Notificaciones - VolunNet

## 📋 Tabla de Contenidos

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Arquitectura del Chat](#arquitectura-del-chat)
3. [Sistema de Notificaciones](#sistema-de-notificaciones)
4. [Componentes Principales](#componentes-principales)
5. [APIs y Endpoints](#apis-y-endpoints)
6. [Base de Datos](#base-de-datos)
7. [Configuración y Setup](#configuración-y-setup)
8. [Funcionalidades Implementadas](#funcionalidades-implementadas)
9. [Próximas Funcionalidades](#próximas-funcionalidades)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Resumen del Sistema

VolunNet implementa un sistema completo de chat estilo WhatsApp con notificaciones emergentes en tiempo real, diseñado para facilitar la comunicación entre voluntarios y organizaciones.

### ✨ Características Principales
- **Chat estilo WhatsApp** con interfaz moderna y responsive
- **Notificaciones emergentes** cuando llegan mensajes nuevos
- **Reacciones a mensajes** con emojis (👍, ❤️, 😂, 😢, 😡, 😮)
- **Menú de emojis** integrado para envío de mensajes
- **Sincronización en tiempo real** entre usuarios
- **Persistencia completa** de conversaciones y reacciones
- **Soporte para múltiples tipos de chat** (individual y grupal)

---

## 🏗️ Arquitectura del Chat

### Estructura de Componentes

```
components/chat/
├── WhatsAppStyleChat.tsx          # Chat principal estilo WhatsApp
├── WhatsAppStyleChatList.tsx      # Lista de conversaciones
├── WhatsAppStyleMenu.tsx          # Menú superior del chat
├── EmojiPicker.tsx                # Selector de emojis
├── MessageReactions.tsx           # Reacciones a mensajes
├── ChatInterface.tsx              # Interfaz de chat original
├── ChatList.tsx                   # Lista de chats original
└── ChatInvitations.tsx            # Invitaciones a chats
```

### Flujo de Datos

```mermaid
graph TD
    A[Usuario] --> B[WhatsAppStyleChat]
    B --> C[API /chat/[chatId]/messages]
    C --> D[ChatService.getChatMessages]
    D --> E[Base de Datos]
    
    F[Usuario] --> G[MessageReactions]
    G --> H[API /chat/reactions]
    H --> I[Base de Datos]
    
    J[Polling cada 3s] --> C
    K[Notificaciones] --> L[useChatNotifications]
    L --> M[NotificationProvider]
```

---

## 🔔 Sistema de Notificaciones

### Componentes de Notificaciones

```
components/notifications/
├── NotificationProvider.tsx       # Contexto global de notificaciones
├── NotificationToast.tsx          # Toast individual de notificación
├── ChatNotificationManager.tsx   # Gestor de notificaciones de chat
├── NotificationTest.tsx           # Componente de testing
├── NotificationDebugPanel.tsx    # Panel de debug
└── MessageSimulator.tsx          # Simulador de mensajes
```

### Hook de Notificaciones

```typescript
// hooks/useChatNotifications.ts
- Detecta mensajes nuevos cada 3 segundos
- Filtra mensajes de otros usuarios
- Muestra notificaciones emergentes
- Maneja estados de página (visible/oculta)
- Incluye manejo de errores robusto
```

### Flujo de Notificaciones

1. **Detección**: Hook detecta mensajes nuevos via polling
2. **Filtrado**: Solo muestra mensajes de otros usuarios
3. **Notificación**: Crea toast emergente con información del remitente
4. **Acción**: Botón "Responder" lleva directamente al chat
5. **Persistencia**: Notificaciones se mantienen hasta ser cerradas

---

## 🧩 Componentes Principales

### WhatsAppStyleChat.tsx
**Propósito**: Chat principal con interfaz estilo WhatsApp

**Características**:
- Header con información del contacto
- Área de mensajes con burbujas diferenciadas
- Input de mensaje con emojis y archivos
- Reacciones a mensajes
- Scroll automático inteligente
- Polling cada 3 segundos para sincronización

**Props**:
```typescript
interface WhatsAppStyleChatProps {
  chat: Chat
  user: User
}
```

### WhatsAppStyleChatList.tsx
**Propósito**: Lista lateral de conversaciones

**Características**:
- Búsqueda de chats
- Filtrado de chats con mensajes
- Indicadores de estado (en línea)
- Preview del último mensaje
- Timestamps relativos

### MessageReactions.tsx
**Propósito**: Sistema de reacciones a mensajes

**Características**:
- Reacciones rápidas (👍, ❤️, 😂, 😢, 😡, 😮)
- Botón "+" para más opciones
- Toggle inteligente (agregar/remover)
- Sincronización en tiempo real
- Persistencia en base de datos

### EmojiPicker.tsx
**Propósito**: Selector de emojis para mensajes

**Características**:
- Categorías de emojis
- Búsqueda de emojis
- Grid responsive
- Animaciones suaves
- Integración con input de mensaje

---

## 🔌 APIs y Endpoints

### Chat APIs

#### `GET /api/chat`
Obtiene todos los chats del usuario autenticado.

**Respuesta**:
```json
{
  "success": true,
  "chats": [
    {
      "id": "chat_id",
      "type": "INDIVIDUAL",
      "participants": [...],
      "messages": [...],
      "lastMessageAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### `GET /api/chat/[chatId]/messages`
Obtiene mensajes de un chat específico.

**Parámetros**:
- `limit`: Número de mensajes (default: 50)
- `offset`: Offset para paginación (default: 0)

**Respuesta**:
```json
{
  "success": true,
  "messages": [
    {
      "id": "message_id",
      "content": "Hola mundo",
      "sender": {...},
      "reactions": {"❤️": ["user1", "user2"]},
      "metadata": {...},
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /api/chat/[chatId]/messages`
Envía un nuevo mensaje.

**Body**:
```json
{
  "content": "Mensaje de prueba",
  "type": "DIRECT"
}
```

### Reactions API

#### `POST /api/chat/reactions`
Agrega o remueve una reacción a un mensaje.

**Body**:
```json
{
  "messageId": "message_id",
  "emoji": "❤️"
}
```

**Respuesta**:
```json
{
  "success": true,
  "action": "added", // o "removed"
  "reactions": {"❤️": ["user1", "user2"]}
}
```

#### `GET /api/chat/reactions`
Obtiene reacciones de un mensaje específico.

**Parámetros**:
- `messageId`: ID del mensaje

### Notifications API

#### `GET /api/chat/recent-messages`
Obtiene mensajes recientes para el sistema de notificaciones.

**Respuesta**:
```json
{
  "success": true,
  "messages": [
    {
      "id": "message_id",
      "chatId": "chat_id",
      "senderId": "sender_id",
      "content": "Mensaje",
      "sender": {...},
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

## 🗄️ Base de Datos

### Modelo ChatMessage

```prisma
model ChatMessage {
  id        String      @id @default(cuid())
  chatId    String
  chat      Chat        @relation(fields: [chatId], references: [id], onDelete: Cascade)
  senderId  String
  sender    User        @relation("ChatMessages", fields: [senderId], references: [id], onDelete: Cascade)
  content   String
  type      MessageType @default(DIRECT)
  metadata  Json?       // Para archivos, imágenes, etc.
  reactions Json?       // Para reacciones: { "emoji": ["userId1", "userId2"] }
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  
  // Para mensajes editados o eliminados
  editedAt   DateTime?
  deletedAt DateTime?
  
  @@map("chat_messages")
}
```

### Estructura de Reacciones

```json
{
  "reactions": {
    "❤️": ["user1", "user2"],
    "👍": ["user3"],
    "😂": ["user1", "user4", "user5"]
  }
}
```

### Fallback System

El sistema implementa un mecanismo de fallback robusto:

1. **Primera opción**: Usa el campo `reactions` (si existe)
2. **Fallback**: Usa `metadata.reactions` (si `reactions` no existe)
3. **Procesamiento**: El frontend maneja ambos casos automáticamente

---

## ⚙️ Configuración y Setup

### Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL="postgresql://user:password@host:port/database"

# Autenticación
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Configuración
NODE_ENV="development"
```

### Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Configurar base de datos**:
```bash
npx prisma generate
npx prisma db push
```

3. **Iniciar servidor**:
```bash
npm run dev
```

### Migración de Base de Datos

Si encuentras errores relacionados con el campo `reactions`:

```bash
# Verificar estado de la base de datos
npx prisma db push

# Si hay problemas, forzar sincronización
npx prisma db push --force-reset
```

---

## ✅ Funcionalidades Implementadas

### Chat Básico
- ✅ **Interfaz estilo WhatsApp** con diseño moderno
- ✅ **Mensajes en tiempo real** con polling cada 3 segundos
- ✅ **Burbujas diferenciadas** (propias vs otros)
- ✅ **Timestamps** con formato relativo
- ✅ **Scroll automático** inteligente
- ✅ **Estados de carga** y manejo de errores

### Reacciones
- ✅ **6 reacciones rápidas** (👍, ❤️, 😂, 😢, 😡, 😮)
- ✅ **Toggle inteligente** (agregar/remover)
- ✅ **Persistencia** en base de datos
- ✅ **Sincronización** entre usuarios
- ✅ **Fallback robusto** (reactions → metadata.reactions)

### Emojis
- ✅ **Menú de emojis** integrado
- ✅ **Categorías** organizadas
- ✅ **Búsqueda** de emojis
- ✅ **Integración** con input de mensaje

### Notificaciones
- ✅ **Notificaciones emergentes** estilo toast
- ✅ **Detección automática** de mensajes nuevos
- ✅ **Filtrado inteligente** (solo otros usuarios)
- ✅ **Información del remitente** (avatar, nombre)
- ✅ **Botón de acción** (Responder)
- ✅ **Manejo de estados** (página visible/oculta)

### Persistencia
- ✅ **Conversaciones completas** guardadas
- ✅ **Reacciones persistentes** al recargar
- ✅ **Sincronización** entre sesiones
- ✅ **Manejo de errores** robusto

---

## 🚀 Próximas Funcionalidades

### En Desarrollo
- 🔄 **Envío de archivos e imágenes**
- 🔄 **Estados de escritura** (typing indicators)
- 🔄 **Mensajes de voz**
- 🔄 **Mensajes editados/eliminados**
- 🔄 **Respuestas a mensajes específicos**
- 🔄 **Búsqueda en el chat**

### Futuras Mejoras
- 📱 **Notificaciones push** del navegador
- 🔊 **Sonidos de notificación**
- 🌙 **Modo oscuro** para el chat
- 📎 **Compartir archivos** de diferentes tipos
- 🎨 **Temas personalizables**
- 📊 **Estadísticas de chat**

---

## 🔧 Troubleshooting

### Problemas Comunes

#### Error 500 en `/api/chat/[chatId]/messages`
**Causa**: Campo `reactions` no existe en la base de datos
**Solución**:
```bash
npx prisma db push
```

#### Reacciones no se muestran
**Causa**: Conflicto entre polling y estado local
**Solución**: Verificar logs del servidor para confirmar que se están guardando

#### Notificaciones no aparecen
**Causa**: Problema con autenticación o polling
**Solución**: 
1. Verificar que el usuario esté autenticado
2. Revisar logs de `useChatNotifications`
3. Confirmar que la página no tiene foco

#### Mensajes no se sincronizan
**Causa**: Problema con el polling o la API
**Solución**:
1. Verificar conectividad de red
2. Revisar logs del servidor
3. Confirmar que el chat existe y el usuario tiene acceso

### Logs de Debug

El sistema incluye logging extensivo:

```javascript
// Servidor
🔍 Obteniendo mensajes para chat: chat_id
📨 Mensajes encontrados: 50
📊 Reacciones del campo metadata: {❤️: ["user1"]}
✅ Mensajes procesados: 50

// Cliente
📨 Mensajes cargados del servidor: 5
✅ Mensajes procesados con reacciones: 5
Reacción actualizada: {success: true, action: 'added'}
✅ Estado local actualizado con reacciones: {❤️: ["user1"]}
```

### Comandos de Debug

```bash
# Verificar estado de la base de datos
npx prisma studio

# Ver logs del servidor
npm run dev

# Verificar migraciones
npx prisma migrate status
```

---

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades:

1. **Revisar logs** del servidor y cliente
2. **Verificar configuración** de variables de entorno
3. **Confirmar estado** de la base de datos
4. **Documentar** pasos para reproducir el problema

---

## 🎉 Conclusión

El sistema de Chat y Notificaciones de VolunNet proporciona una experiencia de comunicación moderna y robusta, con características avanzadas como reacciones, notificaciones emergentes y sincronización en tiempo real. La arquitectura modular permite fácil extensión y mantenimiento, mientras que el sistema de fallback garantiza estabilidad incluso en casos de migración de base de datos.

**Estado actual**: ✅ **Completamente funcional**
**Próximo milestone**: 🚀 **Envío de archivos e imágenes**
