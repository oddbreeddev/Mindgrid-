import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getStudyGroups, sendGroupMessage, getGroupMessages } from '../services/dataService';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../src/firebase';
import { MessageSquare, Users, Send, Sparkles, Hash } from 'lucide-react';

const StudyGroupsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      const data = await getStudyGroups();
      setGroups(data);
      if (data.length > 0) setSelectedGroup(data[0]);
      setLoading(false);
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroup) return;

    const q = query(
      collection(db, 'study_groups', selectedGroup.id, 'messages'),
      orderBy('created_at', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [selectedGroup]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedGroup) return;

    const content = newMessage.trim();
    setNewMessage('');

    await sendGroupMessage(selectedGroup.id, user.uid, user.displayName || user.email || 'Student', content);

    // Check if AI should respond (e.g. if message mentions "Gemini" or "AI")
    if (content.toLowerCase().includes('gemini') || content.toLowerCase().includes('ai')) {
      handleAiResponse(content);
    }
  };

  const handleAiResponse = async (userPrompt: string) => {
    if (!selectedGroup) return;
    setIsAiThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a study guide in a ${selectedGroup.name} study group. 
        The students are discussing: "${userPrompt}". 
        Provide a helpful, concise, and academic response to guide their discussion. 
        Keep it under 100 words.`,
        config: {
          systemInstruction: "You are a helpful academic assistant for Nigerian university students."
        }
      });

      const response = await model;
      const aiText = response.text || "I'm sorry, I couldn't process that.";

      await sendGroupMessage(selectedGroup.id, 'gemini-ai', 'Gemini AI', aiText, true);
    } catch (error) {
      console.error("AI Response Error:", error);
    } finally {
      setIsAiThinking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/50 backdrop-blur-xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="text-blue-500" />
            STUDY <span className="text-blue-500">ROOMS</span>
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-3 group ${
                selectedGroup?.id === group.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className={`p-2 rounded-xl ${selectedGroup?.id === group.id ? 'bg-blue-500' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                <Hash size={18} />
              </div>
              <div>
                <p className="font-bold text-sm">{group.name}</p>
                <p className={`text-[10px] uppercase tracking-widest font-black opacity-60`}>{group.department}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {selectedGroup ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">{selectedGroup.name}</h2>
                <p className="text-xs text-slate-500 font-medium">{selectedGroup.description || 'Collaborative study space.'}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <Sparkles size={14} className="text-blue-400 animate-pulse" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">AI Guide Active</span>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
              {messages.map((msg, idx) => {
                const isMe = msg.user_id === user?.uid;
                const isAi = msg.is_ai;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id || idx}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isMe ? 'order-2' : ''}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isMe ? 'justify-end' : ''}`}>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {isAi ? 'Gemini AI' : msg.user_name}
                        </span>
                        {isAi && <Sparkles size={10} className="text-blue-400" />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isMe 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : isAi 
                        ? 'bg-slate-800 border border-blue-500/30 text-blue-50 text-slate-200 rounded-tl-none'
                        : 'bg-slate-800 text-slate-200 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-blue-500/30 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Gemini is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-slate-900/50 border-t border-slate-800">
              <form onSubmit={handleSendMessage} className="flex gap-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask Gemini or discuss with friends..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                  <Send size={20} />
                </button>
              </form>
              <p className="text-[10px] text-slate-600 mt-3 text-center uppercase font-black tracking-widest">
                Mention "Gemini" or "AI" to get help from the guide
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="font-black uppercase tracking-widest text-xs">Select a study room to begin</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyGroupsPage;
