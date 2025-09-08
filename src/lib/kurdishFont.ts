import { jsPDF } from 'jspdf';

// Kurdish font utility for PDF generation
let kurdishFontLoaded = false;
let kurdishFontBase64 = '';

// Unicode bidirectional text processing for RTL
const ARABIC_CHARS = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const RTL_CHARS = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;

/**
 * Load Kurdish font for PDF generation
 */
export async function loadKurdishFont(pdf: jsPDF): Promise<void> {
  if (kurdishFontLoaded) {
    return;
  }

  try {
    // Load Kurdish/Arabic font from public directory
    const response = await fetch('/NotoNaskhArabic-Regular.ttf');
    if (!response.ok) {
      console.warn('Kurdish font not found, using default font');
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64String = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Add font to jsPDF
    pdf.addFileToVFS('NotoNaskhArabic-Regular.ttf', base64String);
    pdf.addFont('NotoNaskhArabic-Regular.ttf', 'kurdish-font', 'normal');
    
    kurdishFontBase64 = base64String;
    kurdishFontLoaded = true;
  } catch (error) {
    console.warn('Failed to load Kurdish font:', error);
  }
}

/**
 * Set Kurdish font for PDF text
 */
export function setKurdishFont(pdf: jsPDF, fontSize: number = 12): void {
  if (kurdishFontLoaded) {
    pdf.setFont('kurdish-font');
  } else {
    // Fallback to Arial or similar
    pdf.setFont('helvetica');
  }
  pdf.setFontSize(fontSize);
}

/**
 * Process text for RTL display
 */
export function processRTLText(text: string): string {
  if (!text) return text;

  // Simple RTL processing - in a real app you might want to use a library like bidi-js
  const lines = text.split('\n');
  return lines.map(line => {
    // Check if line contains RTL characters
    if (RTL_CHARS.test(line)) {
      // For Kurdish/Arabic text, we might need to reverse certain parts
      // This is a simplified version - real bidirectional text processing is complex
      return line;
    }
    return line;
  }).join('\n');
}

/**
 * Add RTL text to PDF with proper positioning
 */
export function addRTLText(
  pdf: jsPDF, 
  text: string, 
  x: number, 
  y: number, 
  options: {
    align?: 'left' | 'center' | 'right';
    charSpace?: number;
    maxWidth?: number;
  } = {}
): void {
  const { align = 'right', charSpace = 0, maxWidth } = options;

  // Process the text for RTL if needed
  const processedText = processRTLText(text);

  // Split text into lines if maxWidth is specified
  let lines: string[];
  if (maxWidth) {
    lines = pdf.splitTextToSize(processedText, maxWidth);
  } else {
    lines = processedText.split('\n');
  }

  // Add each line
  lines.forEach((line, index) => {
    const lineY = y + (index * (pdf.getFontSize() * 1.2));
    
    if (charSpace > 0) {
      // Add character spacing for better readability
      pdf.text(line, x, lineY, { 
        align: align as any,
        charSpace: charSpace 
      });
    } else {
      pdf.text(line, x, lineY, { align: align as any });
    }
  });
}

/**
 * Get text width for proper positioning
 */
export function getTextWidth(pdf: jsPDF, text: string): number {
  return pdf.getTextWidth(text);
}

/**
 * Check if text contains RTL characters
 */
export function isRTLText(text: string): boolean {
  return RTL_CHARS.test(text);
}
