
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  const [configError, setConfigError] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAIConfigured()) {
      setConfigError(true);
    }

    const saved = sessionStorage.getItem('mindgrid_chat_v3');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ 
        role: 'assistant', 
        text: "Welcome back! I am MindGrid AI, your dedicated academic tutor. How can I help you excel in your studies today?" 
      }]);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('mindgrid_chat_v3', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || cooldown > 0 || configError) return;

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
      setCooldown(3); 
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "I'm having trouble connecting to my academic database. Please ensure your internet connection is stable and try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async (text: string, index: number) => {
    if (isSpeaking === index) {
      setIsSpeaking(null);
      return;
    }

    setIsSpeaking(index);
    try {
      const base64 = await textToSpeech(text);
      if (base64) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
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
      {configError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-800 flex items-center gap-4 shadow-sm animate-in">
          <i className="fas fa-exclamation-triangle text-2xl"></i>
          <div>
            <p className="font-black text-sm uppercase tracking-widest">Configuration Warning</p>
            <p className="text-sm">The AI service is currently unavailable. Please check if your <strong>API_KEY</strong> is properly set in the environment variables.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-2xl flex-grow flex flex-col overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 p-3 rounded-2xl shadow-lg shadow-green-500/30">
              <i className="fas fa-graduation-cap text-xl"></i>
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight">MindGrid <span className="text-green-500">Tutor</span></h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Academic Mode</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setUseSearch(!useSearch)}
              className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase transition-all flex items-center gap-2 ${useSearch ? 'bg-green-600 text-white shadow-lg' : 'bg-white/10 text-slate-400'}`}
            >
              <i className="fas fa-globe"></i> {useSearch ? 'Grounding On' : 'Search Off'}
            </button>
            <button 
              onClick={() => {
                sessionStorage.removeItem('mindgrid_chat_v3');
                setMessages([{ role: 'assistant', text: "Chat history cleared. How can I help you today?" }]);
              }}
              className="text-[10px] font-black bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl uppercase transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-slate-50/30">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start animate-in'}`}>
              <div className={`max-w-[85%] p-6 rounded-3xl shadow-sm leading-relaxed relative group ${
                msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                <div className={`prose prose-sm md:prose-base max-w-none ${msg.role === 'user' ? 'prose-invert text-white' : 'text-slate-800'}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
                
                {msg.role === 'assistant' && (
                  <button 
                    onClick={() => playAudio(msg.text, idx)}
                    className="absolute -right-4 -bottom-4 bg-white shadow-xl w-10 h-10 rounded-2xl flex items-center justify-center text-green-600 hover:scale-110 transition-transform border border-slate-100 z-10"
                    title="Read aloud"
                  >
                    <i className={`fas ${isSpeaking === idx ? 'fa-pause text-xs' : 'fa-volume-up text-sm'}`}></i>
                  </button>
                )}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase py-1 px-1">Sources:</span>
                  {msg.sources.map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" className="text-[10px] font-black text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 hover:bg-green-100 transition-all flex items-center gap-1">
                      <i className="fas fa-link text-[8px]"></i> {s.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Researching...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-8 bg-white border-t border-slate-100">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder={cooldown > 0 ? `Please wait ${cooldown}s...` : "Ask about JAMB Syllabus, Physics, or Career paths..."}
              disabled={cooldown > 0 || configError}
              className="flex-grow bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-5 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 disabled:opacity-50 font-medium transition-all text-slate-700 shadow-inner"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || cooldown > 0 || configError}
              className="bg-slate-900 text-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center hover:bg-green-600 transition-all shadow-xl disabled:opacity-50 active:scale-95 group"
            >
              <i className="fas fa-paper-plane text-xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-6">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Verified Academic AI</p>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Privacy Shield Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIHub;
