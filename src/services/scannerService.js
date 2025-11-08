import { Html5Qrcode } from 'html5-qrcode'

let scanner = null

export async function startScanner(containerId, onSuccess, onError) {
  try {
    scanner = new Html5Qrcode(containerId)
    
    await scanner.start(
      { facingMode: 'environment' }, // Camera posteriore
      {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.777778 // 16:9
      },
      (decodedText) => {
        // Verifica che sia un ISBN (EAN-13)
        if (/^97[89]\d{10}$/.test(decodedText)) {
          onSuccess(decodedText)
          stopScanner()
        }
      },
      (errorMessage) => {
        // Ignora errori di scan continui (normale durante la scansione)
        if (!errorMessage.includes('NotFoundException')) {
          console.warn('Scanner error:', errorMessage)
        }
      }
    )
  } catch (err) {
    console.error('Failed to start scanner:', err)
    if (onError) onError(err)
  }
}

export async function stopScanner() {
  if (scanner) {
    try {
      await scanner.stop()
      scanner.clear()
      scanner = null
    } catch (err) {
      console.error('Error stopping scanner:', err)
    }
  }
}

export function isScanning() {
  return scanner !== null
}