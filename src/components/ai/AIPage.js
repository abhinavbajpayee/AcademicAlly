import React, { useState } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

const AIPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const chatHistory = messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

  const callGeminiAPI = async (prompt) => {
    setIsLoading(true);
    setError('');

    let retryCount = 0;
    const maxRetries = 5;
    const initialDelay = 1000;

    while (retryCount < maxRetries) {
      try {
        const payload = { contents: [...chatHistory, { role: "user", parts: [{ text: prompt }] }] };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          if (response.status === 429) {
            const delay = initialDelay * Math.pow(2, retryCount);
            console.warn(`Rate limit hit, retrying in ${delay}ms...`);
            await new Promise(res => setTimeout(res, delay));
            retryCount++;
            continue;
          }
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
          const text = result.candidates[0].content.parts[0].text;
          return text;
        } else {
          throw new Error('Unexpected API response format.');
        }

      } catch (e) {
        console.error("Failed to fetch from API:", e);
        setError("Something went wrong. Please try again.");
        break;
      }
    }
    
    setIsLoading(false);
    return null;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const aiResponse = await callGeminiAPI(input);

    if (aiResponse) {
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <h2 className="text-4xl font-bold text-gray-800 mb-6">AI Tutor</h2>
      <div className="bg-white rounded-xl shadow-2xl flex-grow flex flex-col overflow-hidden">
        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
              <MessageSquare size={48} className="mx-auto mb-2" />
              Start a conversation with your AI tutor.
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xl p-4 rounded-3xl ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xl p-4 rounded-3xl bg-gray-200 text-gray-800 rounded-bl-none animate-pulse">
                <Loader2 size={20} className="animate-spin" />
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ask your AI tutor a question..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
            disabled={isLoading || !input.trim()}
          >
            <Send size={24} />
          </button>
        </form>
        {error && createPortal(<div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-xl">{error}</div>, document.body)}
      </div>
    </div>
  );
};

export default AIPage;
