// Script para verificar que los avatares se cargan correctamente
console.log('🔍 Verificando carga de avatares en la página de calificación...')

// Función para verificar si una imagen se carga correctamente
function checkImageLoad(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ src, status: 'loaded', width: img.width, height: img.height })
    img.onerror = () => resolve({ src, status: 'error' })
    img.src = src
  })
}

// Verificar avatares comunes
const avatarPaths = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png', 
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
  '/avatars/avatar5.png',
  '/avatars/avatar6.png',
  '/avatars/avatar7.png',
  '/avatars/avatar8.png',
  '/avatars/avatar9.png',
  '/avatars/avatar10.png',
  '/avatars/avatar11.png',
  '/avatars/avatar12.png',
  '/avatars/avatar13.png',
  '/avatars/avatar14.png',
  '/avatars/avatar15.png',
  '/avatars/avatar16.png'
]

async function checkAllAvatars() {
  console.log('📸 Verificando disponibilidad de avatares...')
  
  const results = await Promise.all(avatarPaths.map(checkImageLoad))
  
  const loaded = results.filter(r => r.status === 'loaded')
  const errors = results.filter(r => r.status === 'error')
  
  console.log(`✅ Avatares disponibles: ${loaded.length}`)
  console.log(`❌ Avatares no disponibles: ${errors.length}`)
  
  if (loaded.length > 0) {
    console.log('\n📋 Avatares disponibles:')
    loaded.forEach(avatar => {
      console.log(`   ${avatar.src} (${avatar.width}x${avatar.height})`)
    })
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Avatares no disponibles:')
    errors.forEach(avatar => {
      console.log(`   ${avatar.src}`)
    })
  }
  
  return { loaded, errors }
}

// Ejecutar verificación
checkAllAvatars().then(result => {
  console.log('\n🎯 Resultado:')
  if (result.loaded.length > 0) {
    console.log('✅ Los avatares están disponibles y se pueden cargar correctamente')
    console.log('💡 Si los avatares no se muestran en la página, el problema está en el código del componente Avatar')
  } else {
    console.log('❌ No se encontraron avatares disponibles')
    console.log('💡 Verificar que los archivos de avatar existan en la carpeta public/avatars/')
  }
})







