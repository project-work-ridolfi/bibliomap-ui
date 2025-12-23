/**
 * genera un pdf tramite la funzione di stampa del browser
 */
export function downloadAsPDF(htmlContent, fileName) {
  const printWindow = window.open('', '_blank')
  
  // scrive il contenuto html nella nuova finestra
  printWindow.document.write(`
    <html>
      <head>
        <title>${fileName}</title>
        <style>
          body { 
            font-family: 'Quicksand', sans-serif; 
            padding: 50px; 
            color: #495d63; 
            line-height: 1.6; 
          }
          h1 { color: #629677; text-align: center; text-transform: uppercase; }
          h2 { color: #495d63; border-bottom: 2px solid #98b6b1; padding-bottom: 5px; margin-top: 30px; }
          p { margin-bottom: 15px; text-align: justify; }
          hr { border: 0; border-top: 1px solid #d7bcc8; margin: 20px 0; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `)

  printWindow.document.close()
  
  // attende il caricamento per avviare la stampa
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
    printWindow.close() // chiude la finestra dopo la stampa
  }, 250)
}