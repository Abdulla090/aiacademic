import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js';

// Set the worker path for PDF.js
if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export interface PDFExtractionResult {
  text: string;
  totalPages: number;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
}

export class PDFTextExtractor {
  static validatePDFFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return {
        isValid: false,
        error: 'File must be a PDF document.'
      };
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'PDF file is too large. Maximum size is 50MB.'
      };
    }

    // Check if file is empty
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'PDF file is empty.'
      };
    }

    return { isValid: true };
  }

  static formatExtractedText(text: string): string {
    // Clean up common PDF extraction artifacts
    const cleanedText = text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Fix line breaks
      .replace(/\n\s*\n/g, '\n\n')
      // Remove page numbers (simple pattern)
      .replace(/^\d+\s*$/gm, '')
      // Remove common header/footer patterns
      .replace(/^[A-Z\s]+$/gm, '')
      // Fix hyphenated words that were split across lines
      .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
      // Clean up bullet points
      .replace(/^\s*[•·▪▫‣⁃]\s*/gm, '• ')
      // Fix spacing around punctuation
      .replace(/\s+([,.;:!?])/g, '$1')
      .replace(/([,.;:!?])\s+/g, '$1 ')
      // Remove orphaned single characters
      .replace(/\s+[a-zA-Z]\s+/g, ' ')
      .trim();

    return cleanedText;
  }

  static async extractTextFromFile(file: File): Promise<PDFExtractionResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const pdf = await getDocument({ data: uint8Array }).promise;
      const totalPages = pdf.numPages;
      let extractedText = '';

      // Extract metadata
      const metadata = await pdf.getMetadata();
      const metadataInfo = metadata.info as Record<string, unknown>;

      // Extract text from all pages
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: unknown) => (item as { str: string }).str)
          .join(' ');
        
        extractedText += pageText + '\n\n';
      }

      return {
        text: extractedText.trim(),
        totalPages,
        metadata: {
          title: String(metadataInfo?.Title || ''),
          author: String(metadataInfo?.Author || ''),
          subject: String(metadataInfo?.Subject || ''),
          creator: String(metadataInfo?.Creator || ''),
          producer: String(metadataInfo?.Producer || ''),
          creationDate: metadataInfo?.CreationDate ? new Date(String(metadataInfo.CreationDate)) : undefined,
          modificationDate: metadataInfo?.ModDate ? new Date(String(metadataInfo.ModDate)) : undefined,
        }
      };
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF. The file might be corrupted or protected.');
    }
  }

  static async extractTextFromURL(url: string): Promise<PDFExtractionResult> {
    try {
      const pdf = await getDocument(url).promise;
      const totalPages = pdf.numPages;
      let extractedText = '';

      // Extract metadata
      const metadata = await pdf.getMetadata();
      const metadataInfo = metadata.info as Record<string, unknown>;

      // Extract text from all pages
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: unknown) => (item as { str: string }).str)
          .join(' ');
        
        extractedText += pageText + '\n\n';
      }

      return {
        text: extractedText.trim(),
        totalPages,
        metadata: {
          title: String(metadataInfo?.Title || ''),
          author: String(metadataInfo?.Author || ''),
          subject: String(metadataInfo?.Subject || ''),
          creator: String(metadataInfo?.Creator || ''),
          producer: String(metadataInfo?.Producer || ''),
          creationDate: metadataInfo?.CreationDate ? new Date(String(metadataInfo.CreationDate)) : undefined,
          modificationDate: metadataInfo?.ModDate ? new Date(String(metadataInfo.ModDate)) : undefined,
        }
      };
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF URL.');
    }
  }
}

export default PDFTextExtractor;