import mammoth from 'mammoth';
import { PDFTextExtractor } from '../utils/pdfExtractor';

export const readFileContent = async (file: File): Promise<string> => {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    try {
      const { text } = await PDFTextExtractor.extractTextFromFile(file);
      return text;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error('Failed to extract text from PDF. The file might be corrupted or protected.');
    }
  }

  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('Error parsing docx file:', error);
      throw new Error('Failed to parse .docx file.');
    }
  }

  // For plain text, markdown, etc.
  try {
    return await file.text();
  } catch (error) {
    console.error('Error reading text file:', error);
    throw new Error('Failed to read file as text.');
  }
};