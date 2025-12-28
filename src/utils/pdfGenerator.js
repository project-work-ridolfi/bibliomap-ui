import html2pdf from 'html2pdf.js';

/**
 * scarica il contenuto html come pdf con layout professionale
 * ottimizzato per tabelle, titoli numerati e gestione interruzioni di pagina
 */
export function downloadAsPDF(htmlContent, fileName) {
  const container = document.createElement('div');

  container.innerHTML = `
    <style>
      .pdf-wrapper {
        font-family: 'Helvetica', 'Arial', sans-serif;
        padding: 10mm;
        color: #2c3e50;
        line-height: 1.5;
        background: white;
      }
      h1 { 
        color: #629677; 
        text-align: center; 
        font-size: 18pt; 
        margin-bottom: 20pt;
        text-transform: uppercase;
      }
      /* risolto il problema della linea troppo vicina */
      h2 { 
        color: #495d63; 
        border-bottom: 1.5pt solid #98b6b1; 
        font-size: 13pt;
        margin-top: 20pt;
        margin-bottom: 10pt;
        padding-bottom: 6pt; /* spazio aumentato per non coprire il testo */
        display: block;
      }
      p, li { 
        text-align: justify; 
        margin-bottom: 10pt;
        font-size: 10pt;
      }
      /* stile tabelle con bordi */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 15pt 0;
        font-size: 9pt;
        page-break-inside: avoid; /* evita tagli a meta tabella */
      }
      th, td {
        border: 1pt solid #bdc3c7;
        padding: 8pt;
        text-align: left;
        vertical-align: top;
      }
      th {
        background-color: #f8f9fa;
        color: #495d63;
        font-bold: true;
      }
      /* gestione interruzioni di pagina */
      h2, h3 { page-break-after: avoid; }
      p, tr, li { page-break-inside: avoid; }
      
      hr { border: 0; border-top: 1px solid #d7bcc8; margin: 15pt 0; }
    </style>
    <div class="pdf-wrapper">
      ${htmlContent}
    </div>
  `;

  const options = {
    margin: 10,
    filename: `${fileName}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      logging: false,
      letterRendering: true
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    // 'avoid-all' cerca di non spezzare mai i tag indicati nel css
    pagebreak: { mode: ['css', 'legacy'] } 
  };

  html2pdf()
    .set(options)
    .from(container)
    .save();
}