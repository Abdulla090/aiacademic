import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure the worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

export const readFileContent = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        if (!event.target?.result) {
          return reject(new Error('File reading failed.'));
        }

        const arrayBuffer = event.target.result as ArrayBuffer;

        if (file.type === 'application/pdf') {
          const pdf = await pdfjs.getDocument(arrayBuffer).promise;
          let textContent = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            textContent += text.items.map(item => ('str' in item ? item.str : '')).join(' ');
          }
          resolve(textContent);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } else {
          // For plain text and markdown
          const textDecoder = new TextDecoder('utf-8');
          resolve(textDecoder.decode(arrayBuffer));
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file.'));
    };

    reader.readAsArrayBuffer(file);
  });
};