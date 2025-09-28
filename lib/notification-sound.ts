// Este archivo se puede usar para generar un sonido de notificación simple
// Se puede crear un archivo MP3 o usar la API Web Audio para generar sonidos

// Función para generar un sonido de notificación usando Web Audio API
export function generateNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Crear oscilador para el tono
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    // Conectar nodos
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Configurar frecuencia (tono agudo para notificación)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
    
    // Configurar volumen
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    // Reproducir sonido
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
    
  } catch (error) {
    console.log('No se pudo reproducir el sonido de notificación:', error)
  }
}
