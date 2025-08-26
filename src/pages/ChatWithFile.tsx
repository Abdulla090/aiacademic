import React, { useState, useCallback } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';
import FilePreview from '../components/FilePreview';
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
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setError(null);
      setSelectedFile(file);
      setFileContent(null);
      setMessages([]);
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

  const handleSendMessage = useCallback(async (message: string) => {
    if (!fileContent) {
      setMessages((prevMessages) => [...prevMessages, { text: "Please upload a file first.", sender: 'ai' }]);
      return;
    }

    setMessages((prevMessages) => [...prevMessages, { text: message, sender: 'user' }]);
    setIsLoading(true);

    try {
      const aiResponse = await geminiService.chatWithFile(fileContent, message);
      setMessages((prevMessages) => [...prevMessages, { text: aiResponse, sender: 'ai' }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages((prevMessages) => [...prevMessages, { text: 'Error getting response from AI.', sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  }, [fileContent]);

  return (
    <div className="flex flex-col h-full p-4">
      <h1 className="text-3xl font-bold mb-6">Chat with Your Files</h1>
      <div className="mb-4 flex items-center space-x-4">
        <Input
          type="file"
          onChange={handleFileChange}
          className="flex-grow"
        />
        {selectedFile && (
          <span className="text-gray-600">Selected: {selectedFile.name}</span>
        )}
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}
      
      <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-lg border">
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-6">
            <FilePreview file={selectedFile} fileContent={fileContent} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
           <div className="flex h-full items-center justify-center p-6">
            <ChatInterface onSendMessage={handleSendMessage} messages={messages} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      {isLoading && <p className="text-center text-gray-500 mt-2">Processing...</p>}
    </div>
  );
};

export default ChatWithFile;