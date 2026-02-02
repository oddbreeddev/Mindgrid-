
import React, { useState, useRef, useEffect } from 'react';
import { generateStudyHelp } from '../services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const AIHub: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hello! I'm MindGrid AI. How can I help you with your studies today? Whether it's JAMB preparations, WAEC past questions, or university assignments, I've got your back." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await generateStudyHelp(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', text: aiResponse || "I'm sorry, I couldn't process that. Please try again." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Error: Could not connect to the AI service. Please check your internet and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col h-[80vh]">
      <div className="bg-white rounded-t-3xl shadow-xl flex-grow flex flex-col overflow-hidden border border-slate-100">
        <div className="bg-green-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <i className="fas fa-robot"></i>
            </div>
            <div>
              <h1 className="font-bold">MindGrid Study Assistant</h1>
              <p className="text-xs text-green-100">Always online to help</p>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-green-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 animate-pulse flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask anything (e.g. Explain photosynthesis, Solve for x in 2x+5=15...)"
              className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-2">MindGrid AI can make mistakes. Verify important facts.</p>
        </div>
      </div>
    </div>
  );
};

export default AIHub;
