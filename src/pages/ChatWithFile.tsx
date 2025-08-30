import React, { useState, useCallback, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';
import SimplePdfViewer from '../components/SimplePdfViewer';
import useIsMobile from '../hooks/use-is-mobile';
import ChatInterface from '../components/ChatInterface';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { geminiService } from '../services/geminiService';
import { readFileContent } from '../lib/fileReader';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const ChatWithFile: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | Blob | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPdfText, setSelectedPdfText] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pdfDocument, setPdfDocument] = useState<any>(null); // State to store pdfDocument
  const [extractedImages, setExtractedImages] = useState<string[]>([]); // State to store extracted image Data URLs
  const [showPreview, setShowPreview] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setShowPreview(false);
    } else {
      setShowPreview(true);
    }
  }, [isMobile]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setSelectedFile(file);
      setFileContent(null);
      setExtractedText(null);
      setMessages([]);
      setSelectedPdfText(''); // Clear selected text on new file
      setSearchTerm(''); // Clear search term on new file
      setPdfDocument(null); // Clear pdfDocument on new file
      setExtractedImages([]); // Clear extracted images on new file
      try {
        const content = await readFileContent(file);
        setFileContent(content);
      } catch (err) {
        setError((err as Error).message);
        setFileContent(null);
        setSelectedFile(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTextSelect = useCallback((text: string) => {
    setSelectedPdfText(text);
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    const contentForChat = selectedFile?.type === 'application/pdf' ? extractedText : fileContent;

    if (typeof contentForChat !== 'string' || !contentForChat) {
      setMessages((prevMessages) => [...prevMessages, { text: "The file content is not available for chat.", sender: 'ai' }]);
      return;
    }

    setMessages((prevMessages) => [...prevMessages, { text: message, sender: 'user' }]);
    setIsLoading(true);

    try {
      const aiResponse = await geminiService.chatWithFile(contentForChat, message);
      setMessages((prevMessages) => [...prevMessages, { text: aiResponse, sender: 'ai' }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages((prevMessages) => [...prevMessages, { text: 'Error getting response from AI.', sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  }, [fileContent, extractedText, selectedFile]);

  const handleAskAboutSelection = useCallback(() => {
    if (selectedPdfText) {
      const question = `Explain or elaborate on the following text from the document: "${selectedPdfText}"`;
      handleSendMessage(question);
      setSelectedPdfText(''); // Clear selection after sending
    }
  }, [selectedPdfText, handleSendMessage]);

  const handleSearch = useCallback(() => {
    if (typeof fileContent !== 'string') {
      setMessages((prevMessages) => [...prevMessages, { text: "Search is currently only supported for text-based files.", sender: 'ai' }]);
      return;
    }
    if (!searchTerm.trim()) {
      setMessages((prevMessages) => [...prevMessages, { text: "Please enter a search term.", sender: 'ai' }]);
      return;
    }

    const lines = fileContent.split('\n');
    const results: string[] = [];
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(lowerCaseSearchTerm)) {
        results.push(`Line ${index + 1}: ${line}`);
      }
    });

    if (results.length > 0) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `Found ${results.length} occurrences of "${searchTerm}":\n${results.join('\n')}`, sender: 'ai' }
      ]);
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `No occurrences of "${searchTerm}" found in the document.`, sender: 'ai' }
      ]);
    }
  }, [fileContent, searchTerm]);

  const handleSummarize = useCallback(async () => {
    if (typeof fileContent !== 'string') {
      setMessages((prevMessages) => [...prevMessages, { text: "Summarization is currently only supported for text-based files.", sender: 'ai' }]);
      return;
    }

    setIsLoading(true);
    setMessages((prevMessages) => [...prevMessages, { text: "Summarizing the document...", sender: 'ai' }]);

    try {
      const summaryPrompt = "Please provide a concise summary of the following document:";
      const aiResponse = await geminiService.chatWithFile(fileContent, summaryPrompt);
      setMessages((prevMessages) => [...prevMessages, { text: `Summary:\n${aiResponse}`, sender: 'ai' }]);
    } catch (error) {
      console.error('Error getting summary:', error);
      setMessages((prevMessages) => [...prevMessages, { text: 'Error getting summary from AI.', sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  }, [fileContent]);

  const handleExtractImages = useCallback(async () => {
    if (!pdfDocument) {
      setMessages((prevMessages) => [...prevMessages, { text: "Please upload a PDF file first to extract images.", sender: 'ai' }]);
      return;
    }

    setIsLoading(true);
    setMessages((prevMessages) => [...prevMessages, { text: "Extracting images...", sender: 'ai' }]);
    setExtractedImages([]); // Clear previous images

    const images: string[] = [];
    try {
      for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // Scale up for better quality
        const canvas = document.createElement('canvas');
        const canvasContext = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext,
          viewport,
        };
        await page.render(renderContext).promise;

        images.push(canvas.toDataURL('image/png'));
        canvas.remove(); // Clean up the canvas element
      }

      setExtractedImages(images);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `Extracted ${images.length} images from the PDF.`, sender: 'ai' }
      ]);
    } catch (error) {
      console.error('Error extracting images:', error);
      setMessages((prevMessages) => [...prevMessages, { text: 'Error extracting images from PDF.', sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  }, [pdfDocument]);

  return (
    <div className="flex flex-col h-screen p-2 sm:p-4 bg-gray-100">
      <header className="pb-3 sm:pb-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Chat with Your Files</h1>
          <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-4">
            <Input
              type="file"
              onChange={handleFileChange}
              className="w-full sm:flex-grow max-w-md"
            />
            {selectedFile && (
              <span className="text-gray-600 text-sm sm:text-base truncate max-w-xs">Selected: {selectedFile.name}</span>
            )}
          </div>
        </div>
        {isMobile && selectedFile && (
          <Button onClick={() => setShowPreview(!showPreview)} className="w-full sm:w-auto">
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        )}
      </header>

      <div className="flex-grow flex mt-3 sm:mt-4 overflow-hidden">
        {isMobile ? (
          <div className="w-full h-full">
            {showPreview ? (
              <div className="h-full overflow-y-auto p-2 bg-white rounded-lg border">
                {selectedFile && selectedFile.type === 'application/pdf' ? (
                  <SimplePdfViewer file={selectedFile} onTextExtracted={setExtractedText} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 p-4">
                    <p className="text-center">Preview for non-PDF files will be shown here.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col bg-white rounded-lg border">
                <ChatInterface onSendMessage={handleSendMessage} messages={messages} isLoading={isLoading} />
              </div>
            )}
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-lg border bg-white">
            <ResizablePanel defaultSize={50}>
              <div className="h-full overflow-y-auto p-2">
                {selectedFile && selectedFile.type === 'application/pdf' ? (
                  <SimplePdfViewer file={selectedFile} onTextExtracted={setExtractedText} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 p-4">
                    <p className="text-center">Preview for non-PDF files will be shown here.</p>
                  </div>
                )}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className="h-full flex flex-col">
                <ChatInterface onSendMessage={handleSendMessage} messages={messages} isLoading={isLoading} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      {error && <p className="text-red-500 text-center mt-2 text-sm">{error}</p>}
      {isLoading && !messages.length && <p className="text-center text-gray-500 mt-2 text-sm">Processing...</p>}
    </div>
  );
};

export default ChatWithFile;