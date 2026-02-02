import React, { useState, useRef, useEffect } from 'react';
import { generateStudyHelp, isAIConfigured } from '../services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const AIHub: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hello! I'm MindGrid AI. I've been upgraded to help you solve JAMB problems, explain complex topics, and guide your tech journey. What are we studying today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [configError, setConfigError] = useState(!isAIConfigured());
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!isAIConfigured()) {
      setConfigError(true);
      return;
    }

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await generateStudyHelp(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', text: aiResponse || "I'm sorry, I couldn't process that. Please try again." }]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      let errorMsg = "I'm having trouble connecting to my brain right now. Please check your internet connection.";
      
      if (error.message === 'API_KEY_MISSING') {
        errorMsg = "System Error: The AI Key is missing from the environment. Please contact support.";
        setConfigError(true);
      } else if (error.status === 403 || error.status === 401) {
        errorMsg = "Access Denied: The AI Key might be invalid or expired.";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col h-[80vh]">
      {configError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-bounce">
          <i className="fas fa-exclamation-triangle text-xl"></i>
          <div>
            <p className="font-bold text-sm">AI Connection Warning</p>
            <p className="text-xs">The application cannot find a valid API Key. If you are the owner, please set the <code className="bg-red-100 px-1 rounded">API_KEY</code> environment variable in your Vercel/Netlify dashboard.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-t-3xl shadow-xl flex-grow flex flex-col overflow-hidden border border-slate-100">
        <div className="bg-green-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <i className="fas fa-robot"></i>
            </div>
            <div>
              <h1 className="font-bold">MindGrid Study Assistant Pro</h1>
              <p className="text-xs text-green-100">Online and ready to tutor</p>
            </div>
          </div>
          <button 
            onClick={() => setMessages([{ role: 'assistant', text: "Chat history cleared. How can I help you now?" }])}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
          >
            Clear Chat
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
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
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MindGrid is thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Explain the Nitrogen cycle in simple terms..."
              className={`flex-grow bg-slate-50 border ${configError ? 'border-red-200' : 'border-slate-200'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 shadow-md active:scale-95"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-2 uppercase tracking-tighter">AI may generate inaccurate information. Use official JAMB/WAEC materials as primary source.</p>
        </div>
      </div>
    </div>
  );
};

export default AIHub;