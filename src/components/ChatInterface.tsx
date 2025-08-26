import React, { useState } from 'react';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  messages: { text: string; sender: 'user' | 'ai' }[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, messages }) => {
  const [input, setInput] = useState('');

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

  return (
    <div className="flex flex-col h-full w-full bg-white p-4 rounded-lg shadow-md">
      <div className="flex-grow overflow-y-auto mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Start chatting with your file!
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <span className={`inline-block max-w-xs lg:max-w-md p-2 rounded-lg ${
                msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
              }`}>
                {msg.text}
              </span>
            </div>
          ))
        )}
      </div>
      <div className="flex-shrink-0 flex">
        <input
          type="text"
          className="flex-grow border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;