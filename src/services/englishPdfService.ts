import { jsPDF } from 'jspdf';

interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

export class EnglishPDFService {
  private doc: jsPDF;
  private y: number;
  private readonly pageHeight: number;
  private readonly margin: number;
  private readonly pageWidth: number;

  constructor() {
    this.doc = new jsPDF();
    this.y = 0;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.margin = 20;
  }

  private addPage() {
    this.doc.addPage();
    this.y = this.margin;
  }

  private checkPageBreak(height: number) {
    if (this.y + height > this.pageHeight - this.margin) {
      this.addPage();
    }
  }

  private parseMarkdownLine(text: string): TextSegment[] {
    const segments: TextSegment[] = [];
    let currentText = text;
    
    // Match patterns: ***text*** (bold+italic), **text** (bold), *text* (italic)
    const pattern = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match;
    
    while ((match = pattern.exec(currentText)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        segments.push({ text: currentText.substring(lastIndex, match.index) });
      }
      
      // Add the formatted text
      const matchedText = match[0];
      if (matchedText.startsWith('***') && matchedText.endsWith('***')) {
        segments.push({ text: matchedText.slice(3, -3), bold: true, italic: true });
      } else if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
        segments.push({ text: matchedText.slice(2, -2), bold: true });
      } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
        segments.push({ text: matchedText.slice(1, -1), italic: true });
      }
      
      lastIndex = pattern.lastIndex;
    }
    
    // Add remaining text
    if (lastIndex < currentText.length) {
      segments.push({ text: currentText.substring(lastIndex) });
    }
    
    return segments.length > 0 ? segments : [{ text: currentText }];
  }

  private addFormattedText(segments: TextSegment[], size: number, options: { align?: 'left' | 'center' | 'right'; indent?: number } = {}) {
    const maxWidth = this.pageWidth - this.margin * 2 - (options.indent || 0);
    const lineHeight = size * 0.5;
    let currentX = this.margin + (options.indent || 0);
    const startX = currentX;
    
    this.checkPageBreak(lineHeight);
    
    segments.forEach((segment) => {
      this.doc.setFontSize(size);
      const fontStyle = segment.bold && segment.italic ? 'bolditalic' : segment.bold ? 'bold' : segment.italic ? 'italic' : 'normal';
      this.doc.setFont('helvetica', fontStyle);
      
      const words = segment.text.split(' ');
      words.forEach((word, index) => {
        const wordWithSpace = index === 0 ? word : ' ' + word;
        const wordWidth = this.doc.getTextWidth(wordWithSpace);
        
        // Check if word fits on current line
        if (currentX + wordWidth > this.margin + maxWidth && currentX > startX) {
          // Move to next line
          this.y += lineHeight;
          this.checkPageBreak(lineHeight);
          currentX = startX;
          this.doc.text(word, currentX, this.y);
          currentX += this.doc.getTextWidth(word);
        } else {
          this.doc.text(wordWithSpace, currentX, this.y);
          currentX += wordWidth;
        }
      });
    });
    
    this.y += lineHeight;
  }

  private addText(text: string, size: number, options: { align?: 'left' | 'center' | 'right'; isBold?: boolean; indent?: number } = {}) {
    this.doc.setFontSize(size);
    this.doc.setFont('helvetica', options.isBold ? 'bold' : 'normal');
    
    const maxWidth = this.pageWidth - this.margin * 2 - (options.indent || 0);
    const lines = this.doc.splitTextToSize(text, maxWidth);
    const lineHeight = size * 0.5;

    lines.forEach((line: string) => {
      this.checkPageBreak(lineHeight);
      const xPos = options.align === 'center' ? this.pageWidth / 2 : this.margin + (options.indent || 0);
      this.doc.text(line, xPos, this.y, { align: options.align || 'left' });
      this.y += lineHeight;
    });
  }

  private parseAndAddMarkdownContent(content: string) {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        this.y += 3;
        continue;
      }
      
      // Headers
      if (line.startsWith('######')) {
        this.y += 5;
        this.addText(line.substring(6).trim(), 12, { isBold: true });
      } else if (line.startsWith('#####')) {
        this.y += 5;
        this.addText(line.substring(5).trim(), 13, { isBold: true });
      } else if (line.startsWith('####')) {
        this.y += 6;
        this.addText(line.substring(4).trim(), 14, { isBold: true });
      } else if (line.startsWith('###')) {
        this.y += 7;
        this.addText(line.substring(3).trim(), 15, { isBold: true });
      } else if (line.startsWith('##')) {
        this.y += 8;
        this.addText(line.substring(2).trim(), 16, { isBold: true });
      } else if (line.startsWith('#')) {
        this.y += 10;
        this.addText(line.substring(1).trim(), 18, { isBold: true });
      }
      // Bullet points
      else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('+ ')) {
        const segments = this.parseMarkdownLine(line.substring(2).trim());
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('•', this.margin + 5, this.y);
        this.addFormattedText(segments, 12, { indent: 15 });
        this.y += 2;
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.+)$/);
        if (match) {
          const segments = this.parseMarkdownLine(match[2]);
          this.doc.setFontSize(12);
          this.doc.setFont('helvetica', 'normal');
          this.doc.text(match[1] + '.', this.margin + 5, this.y);
          this.addFormattedText(segments, 12, { indent: 15 });
          this.y += 2;
        }
      }
      // Blockquotes
      else if (line.startsWith('> ')) {
        this.checkPageBreak(20);
        const quoteText = line.substring(2).trim();
        this.doc.setDrawColor(100, 100, 100);
        this.doc.setLineWidth(2);
        this.doc.line(this.margin, this.y - 3, this.margin, this.y + 15);
        this.addText(quoteText, 11, { indent: 10 });
        this.y += 3;
      }
      // Regular paragraphs with inline formatting
      else {
        const segments = this.parseMarkdownLine(line);
        this.addFormattedText(segments, 12);
        this.y += 3;
      }
    }
  }

  addTitle(title: string) {
    this.y = this.margin;
    const segments = this.parseMarkdownLine(title);
    this.addFormattedText(segments, 22, { align: 'center' });
    this.y += 10;
  }

  addSectionTitle(title: string) {
    this.y += 10;
    const segments = this.parseMarkdownLine(title);
    this.addFormattedText(segments, 16);
    this.y += 5;
  }

  addParagraph(text: string) {
    this.parseAndAddMarkdownContent(text);
    this.y += 5;
  }

  save(filename: string) {
    this.doc.save(filename);
  }
}