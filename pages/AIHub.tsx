
import React, { useState, useRef, useEffect } from 'react';
import { generateStudyHelp, isAIConfigured } from '../services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const AIHub: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [configError, setConfigError] = useState(!isAIConfigured());
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem('mindgrid_chat');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ role: 'assistant', text: "Hello! I'm MindGrid AI. I've been upgraded to help you solve JAMB problems, explain complex topics, and guide your tech journey. What are we studying today?" }]);
    }
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('mindgrid_chat', JSON.stringify(messages));
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || cooldown > 0) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await generateStudyHelp(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
      setCooldown(10); // 10 second cooldown between questions
    } catch (error: any) {
      let errorMsg = "I'm having trouble connecting to my brain right now.";
      if (error.status === 429) {
        errorMsg = "We're experiencing high traffic. Please wait 30 seconds and try again.";
        setCooldown(30);
      }
      setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col h-[80vh]">
      <div className="bg-white rounded-t-3xl shadow-xl flex-grow flex flex-col overflow-hidden border border-slate-100">
        <div className="bg-green-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg"><i className="fas fa-robot"></i></div>
            <div>
              <h1 className="font-bold">MindGrid Assistant</h1>
              <p className="text-[10px] text-green-100 uppercase tracking-widest">Optimized for Free Tier</p>
            </div>
          </div>
          <button 
            onClick={() => {
              sessionStorage.removeItem('mindgrid_chat');
              setMessages([{ role: 'assistant', text: "Chat history cleared. How can I help?" }]);
            }}
            className="text-[10px] font-bold bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full uppercase transition-colors"
          >
            Reset Chat
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">MindGrid Thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={cooldown > 0 ? `Please wait ${cooldown}s...` : "Ask a JAMB question..."}
              disabled={cooldown > 0}
              className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || cooldown > 0}
              className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {cooldown > 0 ? <span className="text-xs font-bold">{cooldown}</span> : <i className="fas fa-paper-plane"></i>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHub;
