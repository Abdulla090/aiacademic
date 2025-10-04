import { jsPDF } from 'jspdf';
import ArabicReshaper from 'arabic-reshaper';

// Kurdish character mapping for proper rendering
const KURDISH_CHAR_MAP: { [key: string]: string } = {
  // Kurdish specific characters - ensure they are in NFC normalization
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

  // Process Kurdish text for proper rendering with RTL and character connections
  processKurdishText(text: string): string {
    if (!text) return '';
    
    // Normalize the text using Unicode Normalization Form C for consistency
    let processedText = text.normalize('NFC');
    
    // Ensure all Kurdish characters are properly encoded
    processedText = processedText.split('').map(char => {
      return KURDISH_CHAR_MAP[char as keyof typeof KURDISH_CHAR_MAP] || char;
    }).join('');
    
    try {
      // Use Arabic reshaper to handle contextual forms and character connections
      // This makes characters connect properly (isolated, initial, medial, final forms)
      const reshaped = ArabicReshaper.convert(processedText);
      
      // Reverse the text for proper RTL display in jsPDF
      // jsPDF renders LTR, so we reverse the string to simulate RTL
      const reversed = reshaped.split('').reverse().join('');
      
      return reversed;
    } catch (error) {
      console.error('Arabic reshaper failed:', error);
      // Fallback: just reverse the text
      return processedText.split('').reverse().join('');
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

  // Remove markdown formatting from text
  private stripMarkdown(text: string): string {
    return text
      .replace(/\*\*\*(.+?)\*\*\*/g, '$1') // Bold + Italic
      .replace(/\*\*(.+?)\*\*/g, '$1')     // Bold
      .replace(/\*(.+?)\*/g, '$1')         // Italic
      .replace(/^#+\s+/gm, '')             // Headers
      .replace(/^[-*+]\s+/gm, '')          // Bullet points
      .replace(/^\d+\.\s+/gm, '')          // Numbered lists
      .replace(/^>\s+/gm, '');             // Blockquotes
  }

  // Check if text contains markdown bold
  private isBold(text: string): boolean {
    return /\*\*(.+?)\*\*/.test(text);
  }

  private parseAndAddKurdishContent(content: string, language: 'ku' | 'en', pageWidth: number, y: number): number {
    const lines = content.split('\n');
    const isRTL = language === 'ku';
    const margin = 20;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        y += 5;
        continue;
      }
      
      // Check page break
      if (y > this.doc.internal.pageSize.getHeight() - margin) {
        this.doc.addPage();
        y = margin;
      }
      
      // Headers
      if (trimmedLine.startsWith('######')) {
        this.doc.setFontSize(12);
        const text = this.stripMarkdown(trimmedLine.substring(6).trim());
        const processedText = isRTL ? this.processKurdishText(text) : text;
        this.doc.text(processedText, isRTL ? pageWidth - margin : margin, y, { align: isRTL ? 'right' : 'left' });
        y += 8;
      } else if (trimmedLine.startsWith('#####')) {
        this.doc.setFontSize(13);
        const text = this.stripMarkdown(trimmedLine.substring(5).trim());
        const processedText = isRTL ? this.processKurdishText(text) : text;
        this.doc.text(processedText, isRTL ? pageWidth - margin : margin, y, { align: isRTL ? 'right' : 'left' });
        y += 9;
      } else if (trimmedLine.startsWith('####')) {
        this.doc.setFontSize(14);
        const text = this.stripMarkdown(trimmedLine.substring(4).trim());
        const processedText = isRTL ? this.processKurdishText(text) : text;
        this.doc.text(processedText, isRTL ? pageWidth - margin : margin, y, { align: isRTL ? 'right' : 'left' });
        y += 10;
      } else if (trimmedLine.startsWith('###')) {
        this.doc.setFontSize(15);
        const text = this.stripMarkdown(trimmedLine.substring(3).trim());
        const processedText = isRTL ? this.processKurdishText(text) : text;
        this.doc.text(processedText, isRTL ? pageWidth - margin : margin, y, { align: isRTL ? 'right' : 'left' });
        y += 11;
      } else if (trimmedLine.startsWith('##')) {
        this.doc.setFontSize(16);
        const text = this.stripMarkdown(trimmedLine.substring(2).trim());
        const processedText = isRTL ? this.processKurdishText(text) : text;
        this.doc.text(processedText, isRTL ? pageWidth - margin : margin, y, { align: isRTL ? 'right' : 'left' });
        y += 12;
      } else if (trimmedLine.startsWith('#')) {
        this.doc.setFontSize(18);
        const text = this.stripMarkdown(trimmedLine.substring(1).trim());
        const processedText = isRTL ? this.processKurdishText(text) : text;
        this.doc.text(processedText, isRTL ? pageWidth - margin : margin, y, { align: isRTL ? 'right' : 'left' });
        y += 14;
      }
      // Bullet points
      else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || trimmedLine.startsWith('+ ')) {
        this.doc.setFontSize(12);
        const text = this.stripMarkdown(trimmedLine.substring(2).trim());
        const processedText = isRTL ? this.processKurdishText(text) : text;
        
        // Add bullet
        this.doc.text('•', isRTL ? pageWidth - margin - 5 : margin + 5, y);
        
        // Split text if too long
        const splitLines = this.doc.splitTextToSize(processedText, pageWidth - 2 * margin - 20);
        for (const splitLine of splitLines) {
          if (y > this.doc.internal.pageSize.getHeight() - margin) {
            this.doc.addPage();
            y = margin;
          }
          this.doc.text(splitLine, isRTL ? pageWidth - margin - 15 : margin + 15, y, { align: isRTL ? 'right' : 'left' });
          y += 7;
        }
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(trimmedLine)) {
        this.doc.setFontSize(12);
        const match = trimmedLine.match(/^(\d+)\.\s(.+)$/);
        if (match) {
          const number = match[1];
          const text = this.stripMarkdown(match[2]);
          const processedText = isRTL ? this.processKurdishText(text) : text;
          
          // Add number
          this.doc.text(number + '.', isRTL ? pageWidth - margin - 5 : margin + 5, y);
          
          // Split text if too long
          const splitLines = this.doc.splitTextToSize(processedText, pageWidth - 2 * margin - 20);
          for (const splitLine of splitLines) {
            if (y > this.doc.internal.pageSize.getHeight() - margin) {
              this.doc.addPage();
              y = margin;
            }
            this.doc.text(splitLine, isRTL ? pageWidth - margin - 15 : margin + 15, y, { align: isRTL ? 'right' : 'left' });
            y += 7;
          }
        }
      }
      // Blockquotes
      else if (trimmedLine.startsWith('> ')) {
        this.doc.setFontSize(11);
        this.doc.setDrawColor(100, 100, 100);
        this.doc.setLineWidth(2);
        
        const text = this.stripMarkdown(trimmedLine.substring(2).trim());
        const processedText = isRTL ? this.processKurdishText(text) : text;
        
        // Draw quote line
        const quoteX = isRTL ? pageWidth - margin - 10 : margin + 10;
        this.doc.line(quoteX, y - 3, quoteX, y + 12);
        
        // Split text if too long
        const splitLines = this.doc.splitTextToSize(processedText, pageWidth - 2 * margin - 20);
        for (const splitLine of splitLines) {
          if (y > this.doc.internal.pageSize.getHeight() - margin) {
            this.doc.addPage();
            y = margin;
          }
          this.doc.text(splitLine, isRTL ? pageWidth - margin - 15 : margin + 15, y, { align: isRTL ? 'right' : 'left' });
          y += 7;
        }
        y += 5;
      }
      // Regular paragraphs
      else {
        this.doc.setFontSize(12);
        const text = this.stripMarkdown(trimmedLine);
        const processedText = isRTL ? this.processKurdishText(text) : text;
        
        // Split text if too long
        const splitLines = this.doc.splitTextToSize(processedText, pageWidth - 2 * margin);
        for (const splitLine of splitLines) {
          if (y > this.doc.internal.pageSize.getHeight() - margin) {
            this.doc.addPage();
            y = margin;
          }
          this.doc.text(splitLine, isRTL ? pageWidth - margin : margin, y, { align: isRTL ? 'right' : 'left' });
          y += 7;
        }
        y += 3;
      }
    }
    
    return y;
  }

  async createKurdishReport(
    title: string,
    sections: Array<{ title: string; content: string }>,
    language: 'ku' | 'en' = 'ku',
    options?: {
      showHeader?: boolean;
      headerText?: { kurdish?: string; english?: string };
    }
  ): Promise<void> {
    if (language === 'ku') {
      await this.loadKurdishFont();
    } else {
      this.doc.setFont('helvetica');
    }

    const pageWidth = this.doc.internal.pageSize.getWidth();
    let y = 20;
    const isRTL = language === 'ku';

    // Add header if requested
    if (options?.showHeader) {
      this.doc.setFontSize(10);
      const headerText = language === 'ku' ? options.headerText?.kurdish : options.headerText?.english;
      if (headerText) {
        const processedHeader = language === 'ku' ? this.processKurdishText(headerText) : headerText;
        this.doc.text(processedHeader, isRTL ? pageWidth - 20 : 20, y, { align: isRTL ? 'right' : 'left' });
        y += 15;
      }
    }

    if (title) {
      this.doc.setFontSize(20);
      const strippedTitle = this.stripMarkdown(title);
      const processedTitle = language === 'ku' ? this.processKurdishText(strippedTitle) : strippedTitle;
      this.doc.text(processedTitle, isRTL ? pageWidth - 20 : 20, y, { align: isRTL ? 'right' : 'left' });
      y += 20;
    }

    for (const section of sections) {
      if (section.title) {
        this.doc.setFontSize(16);
        const strippedSectionTitle = this.stripMarkdown(section.title);
        const processedSectionTitle = language === 'ku' ? this.processKurdishText(strippedSectionTitle) : strippedSectionTitle;
        this.doc.text(processedSectionTitle, isRTL ? pageWidth - 20 : 20, y, { align: isRTL ? 'right' : 'left' });
        y += 15;
      }

      if (section.content) {
        y = this.parseAndAddKurdishContent(section.content, language, pageWidth, y);
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
  language: 'ku' | 'en' = 'ku',
  filename?: string
): Promise<Blob> {
  const pdf = new KurdishPDFService();
  await pdf.createKurdishReport(title, sections, language);
  
  if (filename) {
    pdf.save(filename);
  }
  
  return pdf.getBlob();
}