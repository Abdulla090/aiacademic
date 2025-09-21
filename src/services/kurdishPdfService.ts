import { jsPDF } from 'jspdf';
import * as ArabicReshaper from 'arabic-reshaper';

// Kurdish character mapping for proper rendering
const KURDISH_CHAR_MAP = {
  // Kurdish specific characters
  'ڕ': '\u0695', // Kurdish R
  'ۆ': '\u06C6', // Kurdish O  
  'ڤ': '\u06A4', // Kurdish V
  'ڵ': '\u06B5', // Kurdish L
  'ێ': '\u06CE', // Kurdish E
  'ە': '\u06D5', // Kurdish AE
  'چ': '\u0686', // Kurdish CH
  'پ': '\u067E', // Kurdish P
  'گ': '\u06AF', // Kurdish G
  'ژ': '\u0698', // Kurdish ZH
  // Arabic numerals to Persian/Kurdish numerals
  '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
  '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
};

export class KurdishPDFService {
  private doc: jsPDF;
  private fontLoaded = false;

  constructor(options?: { orientation?: 'portrait' | 'landscape'; format?: string }) {
    this.doc = new jsPDF({
      orientation: options?.orientation || 'portrait',
      format: options?.format || 'a4'
    });
  }

  async extractTextWithOCR(file: File): Promise<string> {
    const { geminiService } = await import('./geminiService');
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64 = btoa(String.fromCharCode(...uint8Array));
    return await geminiService.extractTextFromImage(base64, 'ku');
  }

  async isKurdish(text: string): Promise<boolean> {
    const { geminiService } = await import('./geminiService');
    const prompt = `Is the following text primarily in Kurdish? Answer with "yes" or "no".\n\n"${text.substring(0, 500)}"`;
    const response = await geminiService.translateText(prompt);
    return response.toLowerCase().includes('yes');
  }

  async loadKurdishFontsWithFallback(): Promise<boolean> {
    return await this.loadKurdishFont();
  }

  testKurdishSupport(): boolean {
    return this.fontLoaded;
  }

  // Process Kurdish text for proper rendering
  processKurdishText(text: string): string {
    if (!text) return '';
    
    console.log('Original text:', text);
    
    // Normalize the text using Unicode Normalization Form C
    let processedText = text.normalize('NFC');
    console.log('Normalized text:', processedText);
    
    // Ensure all Kurdish characters are properly encoded
    processedText = processedText.split('').map(char => {
      return KURDISH_CHAR_MAP[char] || char;
    }).join('');
    console.log('Mapped text:', processedText);
    
    // Use Arabic reshaper to handle contextual forms and connections
    try {
      const reshaped = ArabicReshaper(processedText, {
        ligatures: true,
        harakat: true,
        // Support Kurdish specific characters
        support: {
          persian: true,
          urdu: true
        }
      });
      console.log('Reshaped text:', reshaped);
      
      // Reverse the text for proper RTL display in jsPDF
      const reversed = reshaped.split('').reverse().join('');
      console.log('Final processed text:', reversed);
      
      return reversed;
    } catch (error) {
      console.warn('Arabic reshaper failed, using fallback:', error);
      // Fallback to simple RTL processing
      return '\u202B' + processedText + '\u202C';
    }
  }

  async loadKurdishFont(): Promise<boolean> {
    try {
      // Try Amiri font first (better Arabic script support)
      let response = await fetch('/kurdish-font/amiri-regular.ttf');
      let fontName = 'amiri-regular.ttf';
      let fontFamily = 'Amiri';
      
      // Fallback to NotoSansArabic if Amiri fails
      if (!response.ok) {
        response = await fetch('/kurdish-font/NotoSansArabic-Regular.ttf');
        fontName = 'NotoSansArabic-Regular.ttf';
        fontFamily = 'NotoSansArabic';
      }
      
      // Final fallback to new-ku-font
      if (!response.ok) {
        response = await fetch('/kurdish-font/new-ku-font.ttf');
        fontName = 'new-ku-font.ttf';
        fontFamily = 'NewKuFont';
      }
      
      const fontBuffer = await response.arrayBuffer();
      
      const base64 = btoa(
        new Uint8Array(fontBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte), ''
        )
      );

      this.doc.addFileToVFS(fontName, base64);
      this.doc.addFont(fontName, fontFamily, 'normal');
      this.doc.setFont(fontFamily);
      
      console.log(`✅ Kurdish font loaded: ${fontFamily} (${fontName})`);
      console.log(`Font size: ${fontBuffer.byteLength} bytes`);
      
      this.fontLoaded = true;
      return true;
    } catch (error) {
      console.error('❌ Font loading failed:', error);
      return false;
    }
  }

  async createKurdishReport(
    title: string,
    sections: Array<{ title: string; content: string }>,
    options?: {
      showHeader?: boolean;
      headerText?: { kurdish?: string; english?: string };
    }
  ): Promise<void> {
    await this.loadKurdishFont();
    
    const pageWidth = this.doc.internal.pageSize.getWidth();
    let y = 20;

    // Add header if requested
    if (options?.showHeader && options?.headerText?.kurdish) {
      this.doc.setFontSize(10);
      const processedHeader = this.processKurdishText(options.headerText.kurdish);
      this.doc.text(processedHeader, pageWidth - 20, y, { align: 'right' });
      y += 15;
    }

    if (title) {
      this.doc.setFontSize(18);
      const processedTitle = this.processKurdishText(title);
      this.doc.text(processedTitle, pageWidth - 20, y, { align: 'right' });
      y += 20;
    }

    for (const section of sections) {
      if (section.title) {
        this.doc.setFontSize(16);
        const processedSectionTitle = this.processKurdishText(section.title);
        this.doc.text(processedSectionTitle, pageWidth - 20, y, { align: 'right' });
        y += 15;
      }

      if (section.content) {
        this.doc.setFontSize(14);
        const lines = section.content.split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            const processedLine = this.processKurdishText(line.trim());
            this.doc.text(processedLine, pageWidth - 20, y, { align: 'right' });
          }
          y += 8;
        }
        y += 10;
      }
    }
  }

  save(filename: string): void {
    this.doc.save(filename);
  }

  getBlob(): Blob {
    return this.doc.output('blob');
  }
}

export async function createKurdishPDF(
  title: string,
  sections: Array<{ title: string; content: string }>,
  filename?: string
): Promise<Blob> {
  const pdf = new KurdishPDFService();
  await pdf.createKurdishReport(title, sections);
  
  if (filename) {
    pdf.save(filename);
  }
  
  return pdf.getBlob();
}