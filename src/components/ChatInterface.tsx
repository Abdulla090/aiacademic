import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChatMessage from './ChatMessage';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  messages: { text: string; sender: 'user' | 'ai' }[];
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, messages, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const quickActions = [
    "Summarize the document",
    "Explain the main points",
    "What are the key takeaways?",
    "Generate 3 quiz questions",
  ];

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 rounded-2xl shadow-lg">
      <div className="flex-grow p-6 overflow-y-auto">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Chat with your document</h2>
            <p className="text-gray-500 mb-6">Ask anything or use a quick action to start.</p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => onSendMessage(action)}
                  className="p-3 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors text-sm text-gray-700"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && <ChatMessage message={{ text: '', sender: 'ai' }} isTyping />}
        <div ref={messagesEndRef} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 bg-white border-t border-gray-200"
      >
        <div className="flex items-center">
          <input
            type="text"
            className="w-full px-4 py-2 text-sm text-black bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            className="ml-3 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatInterface;