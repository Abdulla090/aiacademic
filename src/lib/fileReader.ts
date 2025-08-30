import mammoth from 'mammoth';

export const readFileContent = async (file: File): Promise<string | Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        if (!event.target?.result) {
          return reject(new Error('File reading failed.'));
        }

        // For PDFs, we resolve directly with the File object (which is a Blob)
        if (file.type === 'application/pdf') {
          resolve(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const arrayBuffer = event.target.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } else {
          // For plain text and markdown
          const arrayBuffer = event.target.result as ArrayBuffer;
          const textDecoder = new TextDecoder('utf-8');
          resolve(textDecoder.decode(arrayBuffer));
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        reject(new Error('Failed to parse file. The format may not be supported.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file.'));
    };

    // For non-PDFs, read as ArrayBuffer to process content
    if (file.type !== 'application/pdf') {
      reader.readAsArrayBuffer(file);
    } else {
      // For PDFs, we don't need to read the content into ArrayBuffer/Text for react-pdf.
      // We just need to trigger the onload event for the promise to resolve with the File object.
      // A dummy read, or simply resolving with the file directly is needed.
      // The `onload` handler relies on `event.target.result`, so we need a read operation.
      // `readAsDataURL` is safe as it doesn't detach the underlying buffer for `file`
      // and still populates `event.target.result`.
      reader.readAsDataURL(file);
    }
  });
};