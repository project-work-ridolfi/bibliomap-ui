/**
 * scarica il contenuto come file html formattato (leggibile come documento)
 * evita l'apertura della finestra di stampa del browser
 */
export function downloadAsPDF(htmlContent, fileName) {
  const fullHtml = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>${fileName}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #495d63; line-height: 1.6; }
          h1 { color: #629677; text-align: center; }
          h2 { color: #495d63; border-bottom: 2px solid #98b6b1; }
          hr { border: 0; border-top: 1px solid #d7bcc8; margin: 20px 0; }
        </style>
      </head>
      <body>${htmlContent}</body>
    </html>
  `;

  const blob = new Blob([fullHtml], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.html`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}