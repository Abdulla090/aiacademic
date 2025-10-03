import { useState, FC, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PDFDocumentProxy } from 'pdfjs-dist';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface SimplePdfViewerProps {
  file: File;
  onTextExtracted: (text: string) => void;
}

const SimplePdfViewer: FC<SimplePdfViewerProps> = ({ file, onTextExtracted }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | undefined>();

  const onContainerResize = () => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
  };

  useEffect(() => {
    onContainerResize();
    window.addEventListener("resize", onContainerResize);
    return () => {
      window.removeEventListener("resize", onContainerResize);
    };
  }, []);

  async function onDocumentLoadSuccess(pdf: PDFDocumentProxy) {
    setNumPages(pdf.numPages);
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: unknown) => (item as { str: string }).str).join(' ');
        fullText += pageText + '\n\n';
      } catch (error) {
        console.error(`Error extracting text from page ${i}:`, error);
      }
    }

    try {
      const { KurdishPDFService } = await import('../services/kurdishPdfService');
      const kurdishService = new KurdishPDFService();
      if (await kurdishService.isKurdish(fullText)) {
        console.log("Kurdish text detected. Using OCR for better accuracy.");
        fullText = await kurdishService.extractTextWithOCR(file);
      }
    } catch (error) {
      console.error("Error during Kurdish language detection or OCR:", error);
    }

    onTextExtracted(fullText);
  }

  return (
    <div className="w-full h-full overflow-auto bg-gray-100 p-4" ref={containerRef}>
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div>Loading PDF...</div>}
        error={<div>Failed to load PDF</div>}
      >
        {numPages &&
          Array.from(new Array(numPages), (el, index) => (
            <div
              key={`page_${index + 1}`}
              className="mb-4 bg-white p-4 rounded-lg shadow-md"
              style={{ maxWidth: '800px', margin: '0 auto 24px auto' }}
            >
              <p className="text-center text-sm text-gray-500 mb-2">
                Page {index + 1} of {numPages}
              </p>
              <Page
                pageNumber={index + 1}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                width={containerWidth}
              />
            </div>
          ))}
      </Document>
    </div>
  );
};

export default SimplePdfViewer;