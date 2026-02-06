
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getAllSubscribers, getAdminDashboardStats, logBroadcast, getBroadcastHistory, downloadSubscribersCSV } from '../services/dataService';
import { supabase } from '../services/supabase';
import { GoogleGenAI, Type } from '@google/genai';
import ReactMarkdown from 'react-markdown';

const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    subscribers: 0,
    students: 0,
    academicOperations: 0,
    knowledgeEntries: 0
  });
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [view, setView] = useState<'ledger' | 'intelligence' | 'history'>('ledger');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'email' | 'whatsapp'>('all');
  
  const [newsletterBrief, setNewsletterBrief] = useState('');
  const [draft, setDraft] = useState({ subject: '', body: '' });
  const [isDrafting, setIsDrafting] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deliveryStatus, setDeliveryStatus] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState<'email' | 'whatsapp'>('email');

  useEffect(() => {
    if (isAdmin) {
      loadInitialData();
      
      const channel = supabase
        .channel('admin-pulse')
        .on(
          'postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'newsletter_subscribers' }, 
          (payload) => {
            setSubscribers(prev => [payload.new, ...prev]);
            setStats(prev => ({ ...prev, subscribers: prev.subscribers + 1 }));
            showToast(`New ${payload.new.platform} node linked!`, 'info');
          }
        )
        .subscribe((status) => {
          setIsLive(status === 'SUBSCRIBED');
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [subs, dashboardStats, logs] = await Promise.all([
        getAllSubscribers(),
        getAdminDashboardStats(),
        getBroadcastHistory()
      ]);
      setSubscribers(subs);
      setStats(dashboardStats);
      setHistory(logs);
    } catch (e) {
      showToast('Database synchronization error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(s => {
      const emailMatch = s.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = platformFilter === 'all' || s.platform === platformFilter;
      return emailMatch && matchesPlatform;
    });
  }, [subscribers, searchQuery, platformFilter]);

  const handleGenerateNewsletter = async () => {
    if (!newsletterBrief.trim()) return;
    setIsDrafting(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: `Draft a professional yet engaging newsletter for Nigerian students based on this brief: "${newsletterBrief}".
        You must return a JSON object with 'subject' and 'body' fields.
        The body should use Markdown. Use local Nigerian context and student slang appropriately.` }]}],
        config: {
          systemInstruction: "You are the Lead Communications Officer for MindGrid. Your voice is encouraging, authoritative, and very 'Lagos-tech' savvy.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              body: { type: Type.STRING }
            },
            required: ['subject', 'body']
          }
        }
      });
      const data = JSON.parse(response.text || '{}');
      setDraft(data);
      showToast('AI Intelligence Draft ready!', 'success');
    } catch (err) {
      showToast('AI Synthesis Failed', 'error');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleBroadcast = async () => {
    if (!draft.body) return;
    setIsBroadcasting(true);
    setProgress(0);
    setDeliveryStatus([]);
    
    const targets = filteredSubscribers.filter(s => 
      previewMode === 'email' ? s.platform === 'email' : s.platform === 'whatsapp'
    );
    
    const total = targets.length;
    if (total === 0) {
      showToast(`No active ${previewMode} nodes to target!`, 'error');
      setIsBroadcasting(false);
      return;
    }

    // Step 1: Log the campaign
    await logBroadcast(draft.subject || "Academic Briefing", draft.body, total);

    // Step 2: Simulate delivery to each node
    for (let i = 0; i < total; i++) {
      const sub = targets[i];
      await new Promise(r => setTimeout(r, 100)); // Simulate API call to email/wa service
      setDeliveryStatus(prev => [`Node ${sub.email} transmitted via ${sub.platform.toUpperCase()}`, ...prev.slice(0, 50)]);
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    setTimeout(() => {
      setIsBroadcasting(false);
      showToast(`Intelligence Broadcast completed to ${total} nodes!`, 'success');
      loadInitialData(); // Refresh history
    }, 500);
  };

  const copyEmailsForBCC = () => {
    const emailList = filteredSubscribers.filter(s => s.platform === 'email').map(s => s.email).join(', ');
    navigator.clipboard.writeText(emailList);
    showToast('All email addresses copied to clipboard!', 'success');
  };

  const copyForWhatsApp = () => {
    const plainText = `*${draft.subject}*\n\n${draft.body.replace(/[#*]/g, '')}`;
    navigator.clipboard.writeText(plainText);
    showToast('Formatted for WhatsApp Bulk!', 'success');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mb-8">
          <i className="fas fa-lock text-slate-300 text-3xl"></i>
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Unauthorized Access</h1>
        <p className="text-slate-500 text-center max-w-sm font-medium">This terminal is restricted to MindGrid administrators. Access attempts are logged.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
        
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Network Reach', val: stats.subscribers, icon: 'fa-rss', color: 'bg-green-600' },
            { label: 'Registered Students', val: stats.students, icon: 'fa-user-graduate', color: 'bg-blue-600' },
            { label: 'Academic Pulse', val: stats.academicOperations, icon: 'fa-bolt', color: 'bg-amber-500' },
            { label: 'Knowledge Base', val: stats.knowledgeEntries, icon: 'fa-brain', color: 'bg-purple-600' }
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
              <div className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-${item.color.split('-')[1]}-200`}>
                <i className={`fas ${item.icon}`}></i>
              </div>
              <div>
                <p className="text-3xl font-black text-slate-800">{loading ? '...' : item.val}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Feed */}
          <aside className="lg:w-1/4 space-y-6">
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Live Signal</h2>
                {isLive && (
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[8px] font-black uppercase text-green-500 tracking-widest">Live</span>
                  </div>
                )}
              </div>
              <div className="space-y-6 relative z-10">
                {subscribers.slice(0, 4).map((s, i) => (
                  <div key={s.id || i} className="flex gap-4 items-start border-l-2 border-green-500/20 pl-4 py-1 animate-in">
                    <div className="shrink-0 w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">{new Date(s.created_at).toLocaleTimeString()}</p>
                      <p className="text-xs font-bold truncate max-w-[140px]">{s.email.split('@')[0]} joined</p>
                    </div>
                  </div>
                ))}
              </div>
              <i className="fas fa-satellite-dish absolute -right-4 -bottom-4 text-7xl text-white/5 transform -rotate-12"></i>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Tools</h3>
              <div className="space-y-3">
                <button onClick={() => setView('history')} className={`w-full text-left p-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${view === 'history' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                  Broadcast Archive <i className="fas fa-history"></i>
                </button>
                <button onClick={() => downloadSubscribersCSV(subscribers)} className="w-full text-left bg-slate-50 hover:bg-slate-100 p-4 rounded-xl text-xs font-bold text-slate-600 transition-all flex items-center justify-between">
                  Export Subscribers (CSV) <i className="fas fa-file-csv"></i>
                </button>
                <button onClick={copyEmailsForBCC} className="w-full text-left bg-slate-50 hover:bg-slate-100 p-4 rounded-xl text-xs font-bold text-slate-600 transition-all flex items-center justify-between">
                  Copy Email List <i className="fas fa-copy"></i>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Terminal */}
          <div className="lg:w-3/4 space-y-8">
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex bg-slate-50 border-b border-slate-100">
                <button 
                  onClick={() => setView('ledger')}
                  className={`flex-1 py-6 text-xs font-black uppercase tracking-[0.2em] transition-all ${view === 'ledger' ? 'bg-white text-green-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Newsletter Registry
                </button>
                <button 
                  onClick={() => setView('intelligence')}
                  className={`flex-1 py-6 text-xs font-black uppercase tracking-[0.2em] transition-all ${view === 'intelligence' ? 'bg-white text-green-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Broadcast Center
                </button>
              </div>

              <div className="p-8 md:p-12">
                {view === 'ledger' && (
                  <div className="space-y-8 animate-in">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <h2 className="text-2xl font-black text-slate-800">Student <span className="text-slate-400">Registry</span></h2>
                      
                      <div className="flex flex-wrap gap-2">
                        <div className="relative">
                          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                          <input 
                            type="text"
                            placeholder="Search nodes..."
                            className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-green-500 w-48 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <select 
                          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-green-500"
                          value={platformFilter}
                          onChange={(e: any) => setPlatformFilter(e.target.value)}
                        >
                          <option value="all">All Platforms</option>
                          <option value="email">Email Nodes</option>
                          <option value="whatsapp">WhatsApp Nodes</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                            <th className="pb-4">Node Address</th>
                            <th className="pb-4">Protocol</th>
                            <th className="pb-4">Interests</th>
                            <th className="pb-4">Joined On</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredSubscribers.length > 0 ? filteredSubscribers.map((s, i) => (
                            <tr key={s.id || i} className="group hover:bg-slate-50/50 transition-all animate-in">
                              <td className="py-4 font-bold text-slate-700 text-sm">{s.email}</td>
                              <td className="py-4">
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${s.platform === 'whatsapp' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{s.platform}</span>
                              </td>
                              <td className="py-4">
                                <div className="flex flex-wrap gap-1">
                                  {s.interests?.map((interest: string, j: number) => (
                                    <span key={j} className="text-[8px] bg-slate-50 border border-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">{interest}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 text-[10px] text-slate-400 font-bold">{new Date(s.created_at).toLocaleDateString()}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-bold text-sm">No student nodes found.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {view === 'intelligence' && (
                  <div className="space-y-10 animate-in">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-slate-800">Synthesis <span className="text-green-600">Engine</span></h2>
                      <p className="text-slate-500 text-sm font-medium">Draft news alerts for the network. MindGrid AI will generate the professional copy.</p>
                    </div>

                    <div className="space-y-6">
                      <textarea 
                        rows={4}
                        placeholder="Brief: 'NNPC Scholarship results are out', 'UNILAG Post-UTME tips'..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] px-8 py-6 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-medium text-slate-700 shadow-inner"
                        value={newsletterBrief}
                        onChange={(e) => setNewsletterBrief(e.target.value)}
                      />
                      <button 
                        onClick={handleGenerateNewsletter}
                        disabled={isDrafting || !newsletterBrief}
                        className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3"
                      >
                        {isDrafting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sparkles"></i>}
                        {isDrafting ? 'Synthesizing...' : 'Generate AI Report'}
                      </button>
                    </div>

                    {draft.body && (
                      <div className="mt-12 space-y-8 border-t border-slate-100 pt-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <h3 className="text-xl font-black text-slate-800">Final Protocol Preview</h3>
                          <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button onClick={() => setPreviewMode('email')} className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${previewMode === 'email' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Email Mode</button>
                            <button onClick={() => setPreviewMode('whatsapp')} className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${previewMode === 'whatsapp' ? 'bg-white shadow-sm text-green-600' : 'text-slate-400 hover:text-slate-600'}`}>WA Mode</button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Subject & Body Editor */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Subject Line</label>
                              <input 
                                type="text"
                                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-green-500 font-bold text-slate-700"
                                value={draft.subject}
                                onChange={(e) => setDraft({...draft, subject: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Message Body (Markdown)</label>
                              <textarea 
                                rows={10}
                                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-green-500 font-medium text-slate-600 text-sm"
                                value={draft.body}
                                onChange={(e) => setDraft({...draft, body: e.target.value})}
                              />
                            </div>
                          </div>

                          {/* Live Preview Display */}
                          <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col shadow-2xl">
                             {previewMode === 'email' ? (
                               <div className="flex-grow flex flex-col h-full">
                                  <div className="bg-white/5 p-4 rounded-2xl mb-6 space-y-2 border border-white/5">
                                    <p className="text-[10px] text-slate-500 font-black uppercase">From: MindGrid Intelligence Hub</p>
                                    <p className="text-sm font-bold text-white"><span className="text-slate-500">Subject:</span> {draft.subject}</p>
                                  </div>
                                  <div className="flex-grow bg-white text-slate-800 p-8 rounded-2xl overflow-y-auto max-h-[400px] prose prose-sm">
                                    <ReactMarkdown>{draft.body}</ReactMarkdown>
                                  </div>
                               </div>
                             ) : (
                               <div className="flex-grow flex flex-col h-full">
                                  <div className="bg-white/5 p-6 rounded-3xl mb-6 font-medium text-sm leading-relaxed whitespace-pre-wrap border-l-4 border-green-500">
                                    <p className="font-black text-green-400 mb-2">*{draft.subject}*</p>
                                    {draft.body.replace(/[#*]/g, '')}
                                  </div>
                                  <div className="mt-auto flex justify-center">
                                    <button onClick={copyForWhatsApp} className="text-[10px] font-black uppercase bg-green-500/10 text-green-500 border border-green-500/20 px-6 py-3 rounded-xl hover:bg-green-500/20 transition-all">Copy for Bulk WhatsApp</button>
                                  </div>
                               </div>
                             )}

                             <div className="mt-8 pt-6 border-t border-white/5">
                               {isBroadcasting ? (
                                 <div className="space-y-4">
                                   <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                     <span>Transmitting {filteredSubscribers.length} Nodes</span>
                                     <span>{progress}%</span>
                                   </div>
                                   <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                                     <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                   </div>
                                 </div>
                               ) : (
                                 <button 
                                   onClick={handleBroadcast}
                                   className={`w-full font-black py-6 rounded-3xl transition-all shadow-xl uppercase text-xs tracking-[0.3em] active:scale-95 ${previewMode === 'email' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/40' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/40'}`}
                                 >
                                   Execute {previewMode.toUpperCase()} Broadcast
                                 </button>
                               )}
                             </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {view === 'history' && (
                  <div className="space-y-8 animate-in">
                    <h2 className="text-2xl font-black text-slate-800">Broadcast Archive</h2>
                    <div className="grid grid-cols-1 gap-4">
                      {history.map((log) => (
                        <div key={log.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center group hover:shadow-lg transition-all">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{new Date(log.sent_at).toLocaleString()}</p>
                            <h4 className="font-bold text-slate-800">{log.title}</h4>
                            <p className="text-xs text-slate-500">Reach: {log.reach} students</p>
                          </div>
                          <button onClick={() => { setDraft({ subject: log.title, body: log.content }); setView('intelligence'); }} className="text-[10px] font-black uppercase text-green-600 hover:text-green-700 p-3 bg-green-50 rounded-xl">Reuse Draft</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
