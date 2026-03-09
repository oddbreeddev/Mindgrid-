import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getStudyRooms, createStudyRoom, joinRoomWithCode, getRoomTopics, createRoomTopic, sendTopicMessage } from '../services/dataService';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../src/firebase';
import { MessageSquare, Users, Send, Sparkles, Hash, Plus, Settings, LogOut, Search, Lock, Globe, ChevronRight } from 'lucide-react';

const StudyGroupsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: '', description: '', isPrivate: false });
  const [joinCode, setJoinCode] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchRooms = async () => {
      const data = await getStudyRooms(user.uid);
      setRooms(data);
      if (data.length > 0) {
        setSelectedRoom(data[0]);
      }
      setLoading(false);
    };
    fetchRooms();
  }, [user]);

  useEffect(() => {
    if (!selectedRoom) return;
    const fetchTopics = async () => {
      const data = await getRoomTopics(selectedRoom.id);
      setTopics(data);
      if (data.length > 0) setSelectedTopic(data[0]);
    };
    fetchTopics();
  }, [selectedRoom]);

  useEffect(() => {
    if (!selectedRoom || !selectedTopic) return;

    const q = query(
      collection(db, 'study_rooms', selectedRoom.id, 'topics', selectedTopic.id, 'messages'),
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
  }, [selectedRoom, selectedTopic]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const result = await createStudyRoom(roomForm.name, roomForm.description, roomForm.isPrivate, user.uid);
    if (result) {
      showToast(`Room created! Join code: ${result.joinCode}`, 'success');
      setShowCreateModal(false);
      setRoomForm({ name: '', description: '', isPrivate: false });
      // Refresh rooms
      const data = await getStudyRooms(user.uid);
      setRooms(data);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const room = await joinRoomWithCode(joinCode, user.uid);
      showToast(`Joined ${room.name}!`, 'success');
      setShowJoinModal(false);
      setJoinCode('');
      // Refresh rooms
      const data = await getStudyRooms(user.uid);
      setRooms(data);
      setSelectedRoom(room);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedRoom || !selectedTopic) return;

    const content = newMessage.trim();
    setNewMessage('');

    await sendTopicMessage(selectedRoom.id, selectedTopic.id, user.uid, user.displayName || user.email || 'Student', content);

    if (content.toLowerCase().includes('gemini') || content.toLowerCase().includes('ai')) {
      handleAiResponse(content);
    }
  };

  const handleAiResponse = async (userPrompt: string) => {
    if (!selectedRoom || !selectedTopic) return;
    setIsAiThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a study guide in the "${selectedTopic.name}" topic of the "${selectedRoom.name}" study room. 
        The students are discussing: "${userPrompt}". 
        Provide a helpful, concise, and academic response to guide their discussion. 
        Keep it under 100 words.`,
        config: {
          systemInstruction: "You are a helpful academic assistant for Nigerian university students."
        }
      });

      const response = await model;
      const aiText = response.text || "I'm sorry, I couldn't process that.";

      await sendTopicMessage(selectedRoom.id, selectedTopic.id, 'gemini-ai', 'Gemini AI', aiText, true);
    } catch (error) {
      console.error("AI Response Error:", error);
    } finally {
      setIsAiThinking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050505] flex overflow-hidden text-slate-200">
      {/* Rooms Sidebar (Discord style narrow) */}
      <div className="w-20 bg-[#0a0a0a] border-r border-white/5 flex flex-col items-center py-4 gap-4 overflow-y-auto no-scrollbar">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black mb-2 shadow-lg shadow-blue-900/20">
          MG
        </div>
        <div className="w-8 h-[2px] bg-white/10 rounded-full mb-2" />
        
        {rooms.map(room => (
          <button
            key={room.id}
            onClick={() => setSelectedRoom(room)}
            className={`relative group w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              selectedRoom?.id === room.id 
              ? 'bg-blue-600 text-white rounded-xl' 
              : 'bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white hover:rounded-xl'
            }`}
            title={room.name}
          >
            {selectedRoom?.id === room.id && (
              <div className="absolute -left-4 w-2 h-8 bg-white rounded-r-full" />
            )}
            <span className="font-bold text-xs">{room.name.substring(0, 2).toUpperCase()}</span>
          </button>
        ))}

        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-12 h-12 bg-slate-800 text-blue-500 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
          title="Create Room"
        >
          <Plus size={24} />
        </button>
        <button 
          onClick={() => setShowJoinModal(true)}
          className="w-12 h-12 bg-slate-800 text-blue-500 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
          title="Join Room"
        >
          <Search size={20} />
        </button>
      </div>

      {/* Topics Sidebar */}
      <div className="w-64 bg-[#0a0a0a]/50 border-r border-white/5 flex flex-col">
        {selectedRoom ? (
          <>
            <div className="p-6 border-b border-white/5">
              <h2 className="text-sm font-black text-white flex items-center justify-between uppercase tracking-widest">
                {selectedRoom.name}
                {selectedRoom.is_private ? <Lock size={12} className="text-slate-500" /> : <Globe size={12} className="text-slate-500" />}
              </h2>
              <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-tighter">Join Code: {selectedRoom.join_code}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-2">Topics</p>
              {topics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 group ${
                    selectedTopic?.id === topic.id 
                    ? 'bg-white/10 text-white' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <Hash size={16} className={selectedTopic?.id === topic.id ? 'text-blue-400' : 'text-slate-600'} />
                  <span className="text-sm font-bold">{topic.name}</span>
                </button>
              ))}
              
              {selectedRoom.owner_id === user?.uid && (
                <button 
                  onClick={() => {
                    const name = prompt("Topic Name:");
                    if (name) createRoomTopic(selectedRoom.id, name, "");
                  }}
                  className="w-full text-left px-3 py-2 text-slate-500 hover:text-slate-300 flex items-center gap-2 text-xs font-bold mt-4"
                >
                  <Plus size={14} /> Add Topic
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-slate-600">
            <p className="text-xs font-black uppercase tracking-widest">No Room Selected</p>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#050505]">
        {selectedTopic ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Hash size={20} className="text-slate-500" />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">{selectedTopic.name}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{selectedTopic.description || 'Discussion channel'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                  <Sparkles size={12} className="text-blue-400 animate-pulse" />
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">AI Guide</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth no-scrollbar"
            >
              {messages.map((msg, idx) => {
                const isMe = msg.user_id === user?.uid;
                const isAi = msg.is_ai;

                return (
                  <motion.div
                    initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={msg.id || idx}
                    className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xs ${
                      isAi ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isAi ? 'AI' : msg.user_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className={`max-w-[70%] ${isMe ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {isAi ? 'Gemini AI' : msg.user_name}
                        </span>
                        <span className="text-[8px] text-slate-700 font-bold">
                          {msg.created_at?.seconds ? new Date(msg.created_at.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isMe 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : isAi 
                        ? 'bg-white/5 border border-blue-500/30 text-blue-50 rounded-tl-none'
                        : 'bg-white/5 text-slate-200 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {isAiThinking && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs">AI</div>
                  <div className="bg-white/5 border border-blue-500/30 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-[#0a0a0a] border-t border-white/5">
              <form onSubmit={handleSendMessage} className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message #${selectedTopic.name}`}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white outline-none focus:border-blue-500 transition-all font-medium text-sm"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-600">
                    <Sparkles size={16} />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
              <MessageSquare size={40} className="opacity-20" />
            </div>
            <p className="font-black uppercase tracking-widest text-xs">Select a topic to start studying</p>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Create Room</h3>
                <p className="text-slate-500 text-sm mb-8 font-bold uppercase tracking-widest">Build your study community</p>
                
                <form onSubmit={handleCreateRoom} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Room Name</label>
                    <input 
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white outline-none focus:border-blue-500 font-bold"
                      value={roomForm.name}
                      onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Description</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white outline-none focus:border-blue-500 font-medium text-sm"
                      value={roomForm.description}
                      onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      {roomForm.isPrivate ? <Lock size={18} className="text-amber-500" /> : <Globe size={18} className="text-blue-500" />}
                      <div>
                        <p className="text-xs font-black text-white uppercase">{roomForm.isPrivate ? 'Private Room' : 'Public Room'}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{roomForm.isPrivate ? 'Join via code only' : 'Visible to everyone'}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setRoomForm({...roomForm, isPrivate: !roomForm.isPrivate})}
                      className={`w-12 h-6 rounded-full transition-all relative ${roomForm.isPrivate ? 'bg-amber-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${roomForm.isPrivate ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Join Room Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Join Room</h3>
                <p className="text-slate-500 text-sm mb-8 font-bold uppercase tracking-widest">Enter a join code to enter</p>
                
                <form onSubmit={handleJoinRoom} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Join Code</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. AB12CD"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white outline-none focus:border-blue-500 font-black text-center text-xl tracking-[0.5em] uppercase"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowJoinModal(false)}
                      className="flex-1 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                    >
                      Join Room
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyGroupsPage;

