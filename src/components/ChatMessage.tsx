import React from 'react';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  message: {
    text: string;
    sender: 'user' | 'ai';
  };
  isTyping?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isTyping }) => {
  const { text, sender } = message;
  const isUser = sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
      )}
      <div
        className={`relative max-w-lg px-4 py-3 rounded-2xl shadow-md ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white text-gray-800 rounded-bl-none'
        }`}
      >
        {isTyping ? (
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-fast"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-fast delay-100"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-fast delay-200"></span>
          </div>
        ) : (
          <p className="text-sm">{text}</p>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0"></div>
      )}
    </motion.div>
  );
};

export default ChatMessage;