import { jsPDF } from 'jspdf';

export class EnglishPDFService {
  private doc: jsPDF;
  private y: number;
  private readonly pageHeight: number;
  private readonly margin: number;

  constructor() {
    this.doc = new jsPDF();
    this.y = 0;
    this.pageHeight = this.doc.internal.pageSize.height;
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

  private addText(text: string, size: number, options: { align?: 'left' | 'center' | 'right'; isBold?: boolean } = {}) {
    this.doc.setFontSize(size);
    this.doc.setFont(undefined, options.isBold ? 'bold' : 'normal');
    
    const lines = this.doc.splitTextToSize(text, this.doc.internal.pageSize.width - this.margin * 2);
    const lineHeight = this.doc.getLineHeight() / this.doc.internal.scaleFactor;

    lines.forEach((line: string) => {
      this.checkPageBreak(lineHeight);
      this.doc.text(line, this.margin, this.y, { align: options.align || 'left' });
      this.y += lineHeight;
    });
  }

  addTitle(title: string) {
    this.y = this.margin;
    this.addText(title, 22, { align: 'center', isBold: true });
    this.y += 10;
  }

  addSectionTitle(title: string) {
    this.y += 10;
    this.addText(title, 16, { isBold: true });
    this.y += 5;
  }

  addParagraph(text: string) {
    this.addText(text, 12);
    this.y += 5;
  }

  save(filename: string) {
    this.doc.save(filename);
  }
}