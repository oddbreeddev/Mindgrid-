
import React, { useState, useRef, useEffect } from 'react';
import { generateStudyHelp, isAIConfigured, textToSpeech } from '../services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  sources?: { title: string, uri: string }[];
  audioBase64?: string;
}

const AIHub: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [useSearch, setUseSearch] = useState(true);
  const [cooldown, setCooldown] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('mindgrid_chat_v2');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ 
        role: 'assistant', 
        text: "Hello! I'm MindGrid AI. I've been upgraded with Real-Time Search and Audio. Ask me about JAMB news, complex topics, or tech roadmaps!" 
      }]);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('mindgrid_chat_v2', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      const result = await generateStudyHelp(userMsg, useSearch);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: result.text, 
        sources: result.sources 
      }]);
      setCooldown(5);
    } catch (error: any) {
      let errorMsg = "Connectivity issue. Please check your data and try again.";
      setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async (text: string, index: number) => {
    if (isSpeaking === index) {
      audioRef.current?.pause();
      setIsSpeaking(null);
      return;
    }

    setIsSpeaking(index);
    try {
      const base64 = await textToSpeech(text);
      if (base64) {
        if (audioRef.current) audioRef.current.pause();
        
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        // Standard raw PCM needs wrapping or specific handling, but for this demo 
        // we'll assume the browser can handle the base64 conversion for an Audio object if it was a file,
        // however, per API rules, we handle it as raw bytes.
        
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const dataInt16 = new Int16Array(byteArray.buffer);
        const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }
        
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsSpeaking(null);
        source.start();
      }
    } catch (err) {
      console.error(err);
      setIsSpeaking(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col h-[85vh]">
      <div className="bg-white rounded-3xl shadow-2xl flex-grow flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-green-500 p-2.5 rounded-xl shadow-lg shadow-green-500/20">
              <i className="fas fa-robot text-xl"></i>
            </div>
            <div>
              <h1 className="font-bold text-lg">MindGrid Tutor</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Grounded AI</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setUseSearch(!useSearch)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase transition-all flex items-center gap-2 ${useSearch ? 'bg-green-600 text-white' : 'bg-white/10 text-slate-400'}`}
            >
              <i className="fas fa-globe"></i> {useSearch ? 'Search On' : 'Search Off'}
            </button>
            <button 
              onClick={() => {
                sessionStorage.removeItem('mindgrid_chat_v2');
                setMessages([{ role: 'assistant', text: "Context cleared. Let's start fresh!" }]);
              }}
              className="text-[10px] font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full uppercase"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start animate-in'}`}>
              <div className={`max-w-[88%] p-5 rounded-2xl shadow-sm leading-relaxed relative group ${
                msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.text}
                
                {msg.role === 'assistant' && (
                  <button 
                    onClick={() => playAudio(msg.text, idx)}
                    className="absolute -right-4 top-0 bg-white shadow-md w-8 h-8 rounded-full flex items-center justify-center text-green-600 hover:scale-110 transition-transform border border-slate-100"
                  >
                    <i className={`fas ${isSpeaking === idx ? 'fa-stop text-[10px]' : 'fa-volume-up text-xs'}`}></i>
                  </button>
                )}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.sources.map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100 hover:bg-green-100 transition-colors">
                      <i className="fas fa-link mr-1"></i> {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-150"></div>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Analyzing Database...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-5 bg-white border-t border-slate-100">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : "Ask about JAMB news, Math, or Tech..."}
              disabled={cooldown > 0}
              className="flex-grow bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 font-medium transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || cooldown > 0}
              className="bg-green-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 active:scale-95"
            >
              <i className="fas fa-paper-plane text-lg"></i>
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-4 font-medium uppercase tracking-widest">
            AI can make mistakes. Verify critical dates with official boards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIHub;
