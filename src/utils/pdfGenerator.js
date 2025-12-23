/**
 * genera un pdf dai contenuti html forniti
 * @param {string} htmlContent - contenuto da stampare
 * @param {string} fileName - nome del file
 */
export function downloadAsPDF(htmlContent, fileName) {
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <html>
      <head>
        <title>${fileName}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #495d63; line-height: 1.6; }
          h1 { color: #629677; }
          h2 { color: #495d63; border-bottom: 1px solid #98b6b1; }
          hr { border: 0; border-top: 1px solid #d7bcc8; margin: 20px 0; }
        </style>
      </head>
      <body>${htmlContent}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}