import React, { useState } from 'react';
import { MessageSquareText, Send, Lock } from 'lucide-react';

interface AiAssistantProps {
  onAuthRequired: () => void;
  isAuthenticated: boolean;
}

function AiAssistant({ onAuthRequired, isAuthenticated }: AiAssistantProps) {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: isAuthenticated 
        ? "Hello! I'm your security manual assistant. How can I help you today?"
        : "Please sign in to use the AI assistant and access the manual database.",
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    // Add user message to chat
    setChat((prev) => [...prev, { role: 'user', content: message }]);
    
    // Simulate AI response (this would be replaced with actual OpenAI API call)
    setTimeout(() => {
      setChat((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I understand your question. Let me check the manual database for relevant information...',
        },
      ]);
    }, 1000);

    setMessage('');
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow h-[calc(100vh-12rem)]">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chat.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === 'assistant'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="border-t dark:border-gray-700 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isAuthenticated ? "Ask me anything about the security manuals..." : "Sign in to ask questions"}
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!isAuthenticated}
            />
            <button
              type="submit"
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                isAuthenticated
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-gray-400 cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              disabled={!isAuthenticated}
            >
              {isAuthenticated ? <Send className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AiAssistant;