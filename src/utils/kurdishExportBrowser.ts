/**
 * Browser-Compatible Kurdish PDF Export
 * Uses html2pdf with enhanced Kurdish support
 */

export interface KurdishPDFExportOptions {
  title: string;
  subtitle?: string;
  sections: Array<{ title: string; content: string }>;
  fileName?: string;
}

/**
 * Convert markdown to HTML for Kurdish text with proper RTL support
 */
function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown;
  
  // First, escape any HTML entities to prevent issues
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Convert headers (must be done before other formatting)
  html = html.replace(/^######\s+(.+)$/gm, '<h6 dir="rtl">$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 dir="rtl">$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 dir="rtl">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 dir="rtl">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 dir="rtl">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 dir="rtl">$1</h1>');
  
  // Convert bold and italic (handle both * and ** properly)
  // Must handle *** before ** before *
  html = html.replace(/\*\*\*(.+?)\*\*\*/gs, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/gs, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/gs, '<em>$1</em>');
  
  // Convert code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre dir="ltr"><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code dir="ltr">$1</code>');
  
  // Convert blockquotes with RTL support
  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote dir="rtl">$1</blockquote>');
  
  // Convert unordered lists with RTL support
  const lines = html.split('\n');
  let inList = false;
  let listHtml = '';
  const processedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const listMatch = line.match(/^\s*([-*+])\s+(.+)$/);
    
    if (listMatch) {
      if (!inList) {
        listHtml = '<ul dir="rtl" style="list-style-position: inside; text-align: right;">';
        inList = true;
      }
      listHtml += `<li dir="rtl" style="text-align: right;">${listMatch[2]}</li>`;
    } else {
      if (inList) {
        listHtml += '</ul>';
        processedLines.push(listHtml);
        listHtml = '';
        inList = false;
      }
      processedLines.push(line);
    }
  }
  
  // Close any open list
  if (inList) {
    listHtml += '</ul>';
    processedLines.push(listHtml);
  }
  
  html = processedLines.join('\n');
  
  // Convert numbered lists with RTL support
  const numberedLines = html.split('\n');
  inList = false;
  listHtml = '';
  const finalLines: string[] = [];
  
  for (let i = 0; i < numberedLines.length; i++) {
    const line = numberedLines[i];
    const numListMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
    
    if (numListMatch) {
      if (!inList) {
        listHtml = '<ol dir="rtl" style="list-style-position: inside; text-align: right;">';
        inList = true;
      }
      listHtml += `<li dir="rtl" style="text-align: right;">${numListMatch[2]}</li>`;
    } else {
      if (inList) {
        listHtml += '</ol>';
        finalLines.push(listHtml);
        listHtml = '';
        inList = false;
      }
      finalLines.push(line);
    }
  }
  
  // Close any open numbered list
  if (inList) {
    listHtml += '</ol>';
    finalLines.push(listHtml);
  }
  
  html = finalLines.join('\n');
  
  // Convert line breaks to paragraphs with RTL support
  html = html.split('\n\n').map(paragraph => {
    const trimmed = paragraph.trim();
    if (trimmed && 
        !trimmed.startsWith('<h') && 
        !trimmed.startsWith('<ul') && 
        !trimmed.startsWith('<ol') && 
        !trimmed.startsWith('<blockquote') && 
        !trimmed.startsWith('<pre>')) {
      return `<p dir="rtl" style="text-align: right; text-align: justify;">${trimmed.replace(/\n/g, '<br>')}</p>`;
    }
    return trimmed;
  }).filter(p => p).join('\n');
  
  // Unescape HTML entities that were part of the actual content
  html = html.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  
  return html;
}

/**
 * Export Kurdish report as PDF using html2pdf (browser-compatible)
 */
export async function exportKurdishPDFBrowser(
  options: KurdishPDFExportOptions
): Promise<void> {
  const { title, subtitle, sections, fileName = 'kurdish-report' } = options;

  // Create HTML content with enhanced Kurdish support
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ku" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap');
        
        * {
          font-family: 'Noto Naskh Arabic', 'Arial Unicode MS', Arial, sans-serif;
          box-sizing: border-box;
        }
        
        body {
          font-size: 16px;
          line-height: 1.8;
          color: #1a1a1a;
          max-width: 100%;
          margin: 0;
          padding: 40px;
          direction: rtl;
          text-align: right;
          background: white;
        }
        
        h1 {
          font-size: 28px;
          font-weight: bold;
          text-align: center;
          margin: 0 0 20px 0;
          color: #2c3e50;
          border-bottom: 4px solid #3498db;
          padding-bottom: 20px;
          line-height: 1.4;
        }
        
        .subtitle {
          font-size: 20px;
          text-align: center;
          color: #555;
          margin: 0 0 30px 0;
          font-style: italic;
        }
        
        h2 {
          font-size: 22px;
          font-weight: bold;
          margin-top: 35px;
          margin-bottom: 15px;
          color: #2c3e50;
          border-right: 5px solid #3498db;
          padding-right: 15px;
          page-break-after: avoid;
        }
        
        h3 {
          font-size: 20px;
          font-weight: bold;
          margin-top: 25px;
          margin-bottom: 12px;
          color: #34495e;
        }
        
        h4, h5, h6 {
          font-size: 18px;
          font-weight: bold;
          margin-top: 20px;
          margin-bottom: 10px;
          color: #34495e;
        }
        
        p {
          margin-bottom: 15px;
          text-align: justify;
          line-height: 2;
          word-spacing: 2px;
          direction: rtl;
        }
        
        ul, ol {
          margin-bottom: 20px;
          padding-right: 40px;
          padding-left: 0;
          line-height: 2;
          direction: rtl;
          text-align: right;
          list-style-position: inside;
        }
        
        li {
          margin-bottom: 10px;
          direction: rtl;
          text-align: right;
          list-style-position: inside;
        }
        
        blockquote {
          border-right: 4px solid #3498db;
          border-left: none;
          padding-right: 20px;
          padding-left: 0;
          margin: 20px 0;
          background-color: #f8f9fa;
          padding: 15px 20px;
          font-style: italic;
          direction: rtl;
          text-align: right;
        }
        
        code {
          background-color: #f4f4f4;
          padding: 3px 8px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
        }
        
        pre {
          background-color: #f4f4f4;
          padding: 20px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 20px 0;
          direction: ltr;
          text-align: left;
        }
        
        pre code {
          background: none;
          padding: 0;
        }
        
        strong {
          font-weight: bold;
        }
        
        em {
          font-style: italic;
        }
        
        hr {
          border: none;
          height: 2px;
          background-color: #ddd;
          margin: 30px 0;
        }
        
        .header-info {
          text-align: center;
          font-size: 12px;
          color: #888;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .section {
          margin-bottom: 50px;
          page-break-inside: avoid;
        }
        
        .section-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
        }
        
        .section-content {
          padding: 0 10px;
        }
        
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #eee;
          text-align: center;
          font-size: 13px;
          color: #666;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          .section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header-info">
        <strong>AI Academic Hub</strong> • Kurdish Report Generator
      </div>
      
      <h1>${title}</h1>
      ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
      
      ${sections.map(section => `
        <div class="section">
          <div class="section-title">
            <h2 style="margin: 0; color: white; border: none; padding: 0;">${section.title}</h2>
          </div>
          <div class="section-content">
            ${convertMarkdownToHtml(section.content || '')}
          </div>
        </div>
      `).join('')}
      
      <div class="footer">
        <strong>بەروار:</strong> ${new Date().toLocaleDateString('ku-Arab-IQ', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
    </body>
    </html>
  `;

  // Configure enhanced html2pdf options
  const options_pdf = {
    margin: [15, 15, 15, 15],
    filename: `${fileName}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      allowTaint: true,
      scrollY: 0,
      scrollX: 0,
      windowWidth: 800,
      windowHeight: 1200,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  // Generate PDF using html2pdf
  try {
    const html2pdf = (await import('html2pdf.js')).default;
    await html2pdf().set(options_pdf).from(htmlContent).save();
  } catch (error) {
    console.error('html2pdf error:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Export Kurdish report as DOCX (browser-compatible using HTML to Word)
 * Creates a proper Word document with UTF-8 Kurdish text support
 */
export async function exportKurdishDOCXBrowser(
  options: KurdishPDFExportOptions
): Promise<void> {
  const { title, subtitle, sections, fileName = 'kurdish-report' } = options;

  // Create HTML content with proper Kurdish styling
  let bodyContent = `
    <h1 style="text-align: center; font-size: 22pt; font-weight: bold; color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; margin-bottom: 20px;">${title}</h1>
  `;
  
  if (subtitle) {
    bodyContent += `
    <p style="text-align: center; font-size: 16pt; color: #7f8c8d; margin-bottom: 30px;">${subtitle}</p>
    `;
  }
  
  sections.forEach(section => {
    bodyContent += `
    <div style="margin-bottom: 30px; page-break-inside: avoid;">
      <h2 style="font-size: 18pt; font-weight: bold; color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 10px; border-radius: 5px; margin-top: 20px; margin-bottom: 10px;">${section.title}</h2>
      <div style="text-align: justify; line-height: 1.8;">
        ${convertMarkdownToHtml(section.content || '')}
      </div>
    </div>
    `;
  });
  
  bodyContent += `
    <p style="text-align: center; margin-top: 40px; color: #7f8c8d;">
      <strong>بەروار:</strong> ${new Date().toLocaleDateString('ku-Arab-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </p>
  `;

  // Create HTML with proper Word document structure and UTF-8 encoding
  const htmlContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Kurdish Report</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Noto Naskh Arabic', 'Arial Unicode MS', Arial, sans-serif;
      direction: rtl;
      text-align: right;
      font-size: 14pt;
      line-height: 1.8;
      margin: 40px;
    }
    p {
      margin: 10px 0;
      direction: rtl;
      text-align: right;
    }
    ul, ol {
      margin: 10px 0;
      padding-right: 30px;
      padding-left: 0;
      direction: rtl;
      text-align: right;
      list-style-position: inside;
    }
    li {
      margin: 5px 0;
      direction: rtl;
      text-align: right;
      list-style-position: inside;
    }
    ul {
      list-style-type: disc;
    }
    ol {
      list-style-type: decimal;
    }
    blockquote {
      border-right: 4px solid #3498db;
      border-left: none;
      padding-right: 15px;
      padding-left: 0;
      margin: 15px 0;
      color: #555;
      font-style: italic;
      direction: rtl;
      text-align: right;
    }
    strong {
      font-weight: bold;
      color: #2c3e50;
    }
    em {
      font-style: italic;
    }
    h3, h4, h5, h6 {
      font-weight: bold;
      color: #34495e;
      margin: 15px 0 10px 0;
      direction: rtl;
      text-align: right;
    }
    h3 { font-size: 16pt; }
    h4 { font-size: 14pt; }
    h5 { font-size: 13pt; }
    h6 { font-size: 12pt; }
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      direction: ltr;
      display: inline-block;
    }
    pre {
      background-color: #f4f4f4;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
      direction: ltr;
      text-align: left;
    }
  </style>
</head>
<body>
${bodyContent}
</body>
</html>
  `.trim();

  // Create blob with UTF-8 BOM for proper encoding
  const BOM = '\ufeff'; // UTF-8 BOM ensures proper character encoding
  const blob = new Blob([BOM + htmlContent], {
    type: 'application/msword;charset=utf-8'
  });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.doc`; // Use .doc extension (HTML-based Word format with full UTF-8 support)
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
