# 🎓 Guía del Sistema de Certificados - VolunNet

## 📋 Tabla de Contenidos
- [Generación Automática](#generación-automática)
- [Generación Manual para Eventos Históricos](#generación-manual-para-eventos-históricos)
- [Acceso a Certificados](#acceso-a-certificados)
- [Características](#características)

---

## ✨ Generación Automática

Los certificados se generan **automáticamente** cuando una organización marca un evento como completado.

### Proceso Automático:
1. Organización va a **"Gestionar Evento"**
2. Hace clic en **"Marcar como Completado"**
3. El sistema automáticamente:
   - ✅ Marca el evento como COMPLETED
   - ✅ Actualiza todas las aplicaciones aceptadas a COMPLETED
   - ✅ **Genera certificados para todos los voluntarios**
   - ✅ Calcula las horas completadas
   - ✅ Asigna un código único de verificación

### Información del Certificado:
- **Nombre del voluntario**
- **Nombre de la organización**
- **Título del evento**
- **Fecha del evento**
- **Horas completadas** (calculadas automáticamente)
- **Código de verificación único** (Formato: VN-XXXX-XXXX-XXXX)
- **Fecha de emisión**

---

## 🔄 Generación Manual para Eventos Históricos

Si tienes eventos ya completados que **no tienen certificados**, puedes generarlos manualmente usando el script de migración.

### Comando:
```bash
npm run certificates:generate
```

O directamente:
```bash
node scripts/generate-historical-certificates.js
```

### ¿Qué hace el script?
1. 🔍 Busca todos los eventos con estado `COMPLETED`
2. 📋 Identifica voluntarios con aplicaciones `COMPLETED`
3. ✅ Genera certificados para los que no tienen uno
4. ⏭️ Omite certificados que ya existen (no duplica)
5. 📊 Muestra estadísticas del proceso

### Ejemplo de salida:
```
🎓 Iniciando generación de certificados históricos...

📋 Se encontraron 14 eventos completados

📅 Evento: "Taller de Arte para Adultos Mayores"
   Organización: EcoMar Jalisco
   Voluntarios completados: 2
   ✅ Certificado generado para Juan Pérez (24h) - VN-1HJT-9D23-R6O5
   ✅ Certificado generado para María García (24h) - VN-PB5Q-W63X-OMGB

======================================================================
✨ Resumen de Generación de Certificados:
======================================================================
✅ Certificados generados: 7
⏭️ Certificados omitidos (ya existían): 0
📊 Total de eventos procesados: 14
======================================================================

📊 Certificados generados por voluntario:
   👤 Juan Pérez: 3 certificado(s)
   👤 María García: 4 certificado(s)

✅ Proceso completado exitosamente!
```

### Características del Script:
- ✅ **Seguro**: No duplica certificados existentes
- ✅ **Inteligente**: Calcula horas automáticamente
- ✅ **Completo**: Procesa todos los eventos históricos
- ✅ **Informativo**: Muestra progreso y estadísticas
- ✅ **Idempotente**: Se puede ejecutar múltiples veces sin problemas

---

## 👀 Acceso a Certificados

Los voluntarios pueden ver y descargar sus certificados desde **3 lugares**:

### 1. Header del Dashboard (Desktop)
```
Inicio → Eventos → Comunidad → 📄 Certificados → Notificaciones
```

### 2. Menú Móvil
Al abrir el menú hamburguesa:
```
- 🏠 Inicio
- 📅 Eventos
- 📄 Certificados  ← AQUÍ
- 👥 Comunidad
- 🔔 Notificaciones
```

### 3. URL Directa
```
https://tu-dominio.com/certificados
```

### Funcionalidades en la Página de Certificados:
- 📚 **Vista de todos los certificados** en tarjetas visuales
- 🔍 **Búsqueda** por nombre de evento u organización
- 📅 **Filtro por año**
- 📥 **Descarga individual** de cada certificado en PDF
- 📊 **Estadísticas completas**:
  - Total de certificados obtenidos
  - Horas totales acumuladas
  - Organizaciones con las que ha trabajado
  - Años activo como voluntario

---

## 🎨 Características del Certificado PDF

### Diseño Profesional:
- ✅ Orientación horizontal (A4)
- ✅ Colores del gradiente de VolunNet (azul y púrpura)
- ✅ Borde decorativo
- ✅ Logo y marca VolunNet
- ✅ Marca de agua de seguridad
- ✅ Código QR de verificación (futuro)

### Información Incluida:
1. **Header**: Logo y título VolunNet
2. **Cuerpo Principal**:
   - Nombre del voluntario (destacado)
   - Título del evento
   - Nombre de la organización
   - Fecha del evento
   - Horas completadas
3. **Footer**:
   - Código de verificación único
   - Fecha de emisión
   - Firmas decorativas

### Seguridad:
- 🔐 Código único por certificado
- 🔐 No se pueden duplicar
- 🔐 Registrados en base de datos
- 🔐 Verificables (futuro: sistema de verificación online)

---

## 📊 Base de Datos

### Modelo Certificate:
```prisma
model Certificate {
  id               String   @id @default(cuid())
  volunteerId      String   // ID del perfil Volunteer
  eventId          String   // ID del evento
  organizationName String   // Nombre de la organización
  eventTitle       String   // Título del evento
  eventDate        DateTime // Fecha del evento
  hoursCompleted   Int      // Horas completadas
  certificateCode  String   @unique // Código único
  issuedAt         DateTime @default(now()) // Fecha de emisión
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

---

## 🔧 Mantenimiento

### Regenerar certificados para un evento específico:
Si necesitas regenerar certificados para un evento específico, puedes modificar el script `generate-historical-certificates.js` para filtrar por ID de evento.

### Verificar certificados en la base de datos:
```bash
npx prisma studio
```
Luego navega a la tabla `certificates`.

### Verificar eventos completados:
```sql
SELECT * FROM events WHERE status = 'COMPLETED';
```

---

## 🆘 Solución de Problemas

### El script no genera certificados:
1. Verifica que el evento tenga estado `COMPLETED`
2. Verifica que las aplicaciones tengan estado `COMPLETED`
3. Verifica que los voluntarios tengan perfil creado
4. Revisa los logs del script para más detalles

### Los certificados no aparecen en la página:
1. Actualiza la página (F5)
2. Cierra sesión y vuelve a iniciar
3. Verifica en Prisma Studio que los certificados existan
4. Revisa la consola del navegador para errores

### Error al descargar PDF:
1. Verifica que jsPDF esté instalado: `npm list jspdf`
2. Limpia caché: `npm cache clean --force`
3. Reinstala dependencias: `npm install`

---

## 📝 Notas Importantes

1. **Los certificados se generan una sola vez** por evento/voluntario
2. **No se pueden editar** después de generados (garantía de integridad)
3. **El código de verificación es único** y no se repite
4. **Las horas se calculan automáticamente** basadas en la duración del evento
5. **El script es seguro** y no duplicará certificados existentes

---

## 🚀 Futuras Mejoras

- [ ] Sistema de verificación online con código QR
- [ ] Plantillas personalizables por organización
- [ ] Compartir en redes sociales
- [ ] Blockchain para verificación descentralizada
- [ ] Firma digital de la organización
- [ ] Exportar todos los certificados en un ZIP

---

## 📞 Contacto

Si tienes problemas o sugerencias, contacta al equipo de desarrollo de VolunNet.

---

**VolunNet** - Conectando voluntarios con oportunidades de cambio 💙💜


