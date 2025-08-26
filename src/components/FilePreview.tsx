import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

interface FilePreviewProps {
  file: File | null;
  fileContent: string | null;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, fileContent }) => {
  const [numPages, setNumPages] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="h-full w-full bg-white p-4 rounded-lg shadow-md overflow-auto">
      {file ? (
        <>
          <h3 className="text-lg font-semibold mb-2">{file.name}</h3>
          {file.type === 'application/pdf' ? (
            <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
              {Array.from(new Array(numPages), (el, index) => (
                <Page key={`page_${index + 1}`} pageNumber={index + 1} />
              ))}
            </Document>
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
              {fileContent || "No content to display."}
            </pre>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Select a file to preview
        </div>
      )}
    </div>
  );
};

export default FilePreview;