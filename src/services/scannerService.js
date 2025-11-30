import Quagga from '@ericblade/quagga2'

let onDetectedCallback = null

// configurazione quagga per isbn
const config = {
  inputStream: {
    name: 'Live',
    type: 'LiveStream',
    target: null, // viene settato dinamicamente
    constraints: {
      width: { min: 640 },
      height: { min: 480 },
      facingMode: 'environment', // usa fotocamera posteriore su mobile
      aspectRatio: { min: 1, max: 2 }
    }
  },
  locator: {
    patchSize: 'medium',
    halfSample: true
  },
  numOfWorkers: 2,
  decoder: {
    readers: ['ean_reader'] // ean-13 è lo standard per isbn
  },
  locate: true
}

function handleDetected(result) {
  if (result && result.codeResult && result.codeResult.code) {
    const code = result.codeResult.code
    // validazione base per evitare falsi positivi brevi
    if (code.length === 13 && (code.startsWith('978') || code.startsWith('979'))) {
      if (onDetectedCallback) {
        onDetectedCallback(code)
      }
    }
  }
}

export async function startScanner(domElement, callback) {
  config.inputStream.target = domElement
  onDetectedCallback = callback

  try {
    await new Promise((resolve, reject) => {
      Quagga.init(config, (err) => {
        if (err) {
          console.error('errore inizializzazione quagga', err)
          reject(err)
          return
        }
        Quagga.start()
        resolve()
      })
    })

    Quagga.onDetected(handleDetected)
    
  } catch (err) {
    throw new Error('impossibile avviare fotocamera')
  }
}

export async function stopScanner() {
  Quagga.offDetected(handleDetected)
  await Quagga.stop()
  onDetectedCallback = null
}