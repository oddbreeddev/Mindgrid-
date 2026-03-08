
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getAllSubscribers, getAdminDashboardStats, logBroadcast, getBroadcastHistory, downloadSubscribersCSV, deleteCuratedArticle, updateArticleStatus, seedStudyGroups } from '../services/dataService';
import { db } from '../src/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { GoogleGenAI, Type } from '@google/genai';
import Markdown from 'react-markdown';

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
  const [view, setView] = useState<'ledger' | 'intelligence' | 'history' | 'library'>('ledger');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
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
      
      const q = query(collection(db, 'newsletter_subscribers'), orderBy('created_at', 'desc'), limit(50));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newSubs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubscribers(newSubs);
        setStats(prev => ({ ...prev, subscribers: snapshot.size }));
        setIsLive(true);
      }, (error) => {
        console.error("Firestore Subscribe Error:", error);
        setIsLive(false);
      });

      const articlesQ = query(collection(db, 'curated_articles'), orderBy('created_at', 'desc'));
      const unsubscribeArticles = onSnapshot(articlesQ, (snapshot) => {
        const newArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArticles(newArticles);
      });

      return () => {
        unsubscribe();
        unsubscribeArticles();
      };
    }
  }, [isAdmin]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [dashboardStats, logs] = await Promise.all([
        getAdminDashboardStats(),
        getBroadcastHistory()
      ]);
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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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
      
      const text = response.text || '{}';
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanText);
      setDraft(data);
      showToast('AI Intelligence Draft ready!', 'success');
    } catch (err) {
      console.error("AI Generation Error:", err);
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

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    const success = await deleteCuratedArticle(id);
    if (success) {
      showToast('Article deleted from vault', 'success');
    } else {
      showToast('Failed to delete article', 'error');
    }
  };

  const handleApproveArticle = async (id: string) => {
    const success = await updateArticleStatus(id, 'approved');
    if (success) {
      showToast('Article approved and published!', 'success');
    } else {
      showToast('Failed to approve article', 'error');
    }
  };

  const handleRejectArticle = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this article?')) return;
    const success = await updateArticleStatus(id, 'rejected');
    if (success) {
      showToast('Article rejected', 'success');
    } else {
      showToast('Failed to reject article', 'error');
    }
  };

  const pendingArticles = useMemo(() => articles.filter(a => a.status === 'pending'), [articles]);
  const approvedArticles = useMemo(() => articles.filter(a => a.status === 'approved'), [articles]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [view]);

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
    <div className="bg-[#f8fafc] min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className={`md:w-64 bg-[#0f172a] text-slate-300 flex flex-col sticky top-0 md:h-screen z-50 transition-all duration-300 ${isMenuOpen ? 'h-screen' : 'h-auto md:h-screen'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-shield-halved"></i>
            </div>
            <span className="font-black text-white tracking-tighter text-lg">MindGrid <span className="text-blue-400">HQ</span></span>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-400 hover:text-white p-2">
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
        
        <nav className={`${isMenuOpen ? 'flex' : 'hidden md:flex'} flex-grow p-4 flex-col space-y-2 overflow-y-auto`}>
          <p className="text-[10px] font-black uppercase text-slate-500 px-4 mb-2 tracking-widest">Main Menu</p>
          {[
            { id: 'ledger', label: 'Student Registry', icon: 'fa-users' },
            { id: 'intelligence', label: 'Broadcast Center', icon: 'fa-tower-broadcast' },
            { id: 'library', label: 'Library Vault', icon: 'fa-vault' },
            { id: 'history', label: 'Broadcast Archive', icon: 'fa-clock-rotate-left' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                view === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              {item.label}
            </button>
          ))}

          <div className="pt-8">
            <p className="text-[10px] font-black uppercase text-slate-500 px-4 mb-2 tracking-widest">Data Management</p>
            <button onClick={() => downloadSubscribersCSV(subscribers)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-slate-800/50 transition-all">
              <i className="fas fa-file-csv w-5"></i>
              Export CSV
            </button>
            <button onClick={copyEmailsForBCC} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-slate-800/50 transition-all">
              <i className="fas fa-copy w-5"></i>
              Copy Emails
            </button>
            <button 
              onClick={async () => {
                const success = await seedStudyGroups();
                if (success) showToast('Study groups seeded successfully!', 'success');
                else showToast('Failed to seed study groups', 'error');
              }} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-slate-800/50 transition-all text-amber-400"
            >
              <i className="fas fa-database w-5"></i>
              Seed Study Groups
            </button>
          </div>
        </nav>

        <div className={`${isMenuOpen ? 'block' : 'hidden md:block'} p-4 border-t border-slate-800`}>
          <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-white truncate">Admin Terminal</p>
              <p className="text-[10px] text-slate-500 truncate">aminudaniel...</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow md:overflow-y-auto md:h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {view === 'ledger' && 'Student Registry'}
              {view === 'intelligence' && 'Broadcast Center'}
              {view === 'library' && 'Library Vault'}
              {view === 'history' && 'Broadcast Archive'}
            </h1>
            {isLive && (
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[8px] font-black uppercase text-green-600 tracking-widest">Live Signal</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs font-bold">
              <i className="fas fa-calendar"></i>
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Subscribers', val: stats.subscribers, icon: 'fa-rss', color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Students', val: stats.students, icon: 'fa-user-graduate', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Ops Pulse', val: stats.academicOperations, icon: 'fa-bolt', color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Knowledge', val: stats.knowledgeEntries, icon: 'fa-brain', color: 'text-purple-600', bg: 'bg-purple-50' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className={`${item.bg} ${item.color} w-10 h-10 rounded-xl flex items-center justify-center text-sm`}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">{loading ? '...' : item.val}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* View Content */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[60vh]">
            <div className="p-6 md:p-10">
              {view === 'ledger' && (
                <div className="space-y-8 animate-in">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Active <span className="text-slate-400">Network Nodes</span></h2>
                    
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      <div className="relative flex-grow md:flex-grow-0">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                        <input 
                          type="text"
                          placeholder="Search nodes..."
                          className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 transition-all"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <select 
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        value={platformFilter}
                        onChange={(e: any) => setPlatformFilter(e.target.value)}
                      >
                        <option value="all">All Platforms</option>
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto -mx-6 md:mx-0">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                          <th className="px-6 pb-4">Node Address</th>
                          <th className="px-6 pb-4">Protocol</th>
                          <th className="px-6 pb-4">Interests</th>
                          <th className="px-6 pb-4">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredSubscribers.length > 0 ? filteredSubscribers.map((s, i) => (
                          <tr key={s.id || i} className="group hover:bg-slate-50/50 transition-all">
                            <td className="px-6 py-4 font-bold text-slate-700 text-sm">{s.email}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${s.platform === 'whatsapp' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{s.platform}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {s.interests?.map((interest: string, j: number) => (
                                  <span key={j} className="text-[8px] bg-slate-50 border border-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">{interest}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[10px] text-slate-400 font-mono">{new Date(s.created_at).toLocaleDateString()}</td>
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
                <div className="space-y-10 animate-in max-w-4xl">
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Intelligence <span className="text-blue-600">Synthesis</span></h2>
                    <p className="text-slate-500 text-sm font-medium">Generate professional briefings for the student network.</p>
                  </div>

                  <div className="space-y-6">
                    <textarea 
                      rows={4}
                      placeholder="Brief: 'NNPC Scholarship results are out', 'UNILAG Post-UTME tips'..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-6 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700 shadow-inner"
                      value={newsletterBrief}
                      onChange={(e) => setNewsletterBrief(e.target.value)}
                    />
                    <button 
                      onClick={handleGenerateNewsletter}
                      disabled={isDrafting || !newsletterBrief}
                      className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3"
                    >
                      {isDrafting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sparkles"></i>}
                      {isDrafting ? 'Synthesizing...' : 'Generate AI Report'}
                    </button>
                  </div>

                  {draft.body && (
                    <div className="mt-12 space-y-8 border-t border-slate-100 pt-10">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Protocol Preview</h3>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                          <button onClick={() => setPreviewMode('email')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${previewMode === 'email' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Email</button>
                          <button onClick={() => setPreviewMode('whatsapp')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${previewMode === 'whatsapp' ? 'bg-white shadow-sm text-green-600' : 'text-slate-400 hover:text-slate-600'}`}>WhatsApp</button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Subject</label>
                            <input 
                              type="text"
                              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 font-bold text-slate-700"
                              value={draft.subject}
                              onChange={(e) => setDraft({...draft, subject: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Body (Markdown)</label>
                            <textarea 
                              rows={10}
                              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 font-medium text-slate-600 text-sm"
                              value={draft.body}
                              onChange={(e) => setDraft({...draft, body: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col shadow-2xl">
                           {previewMode === 'email' ? (
                             <div className="flex-grow flex flex-col h-full">
                                <div className="bg-white/5 p-4 rounded-2xl mb-6 space-y-2 border border-white/5">
                                  <p className="text-[10px] text-slate-500 font-black uppercase">From: MindGrid HQ</p>
                                  <p className="text-sm font-bold text-white"><span className="text-slate-500">Subject:</span> {draft.subject}</p>
                                </div>
                                <div className="flex-grow bg-white text-slate-800 p-8 rounded-2xl overflow-y-auto max-h-[400px] prose prose-sm">
                                  <Markdown>{draft.body}</Markdown>
                                </div>
                             </div>
                           ) : (
                             <div className="flex-grow flex flex-col h-full">
                                <div className="bg-white/5 p-6 rounded-3xl mb-6 font-medium text-sm leading-relaxed whitespace-pre-wrap border-l-4 border-green-500">
                                  <p className="font-black text-green-400 mb-2">*{draft.subject}*</p>
                                  {draft.body.replace(/[#*]/g, '')}
                                </div>
                                <div className="mt-auto flex justify-center">
                                  <button onClick={copyForWhatsApp} className="text-[10px] font-black uppercase bg-green-500/10 text-green-500 border border-green-500/20 px-6 py-3 rounded-xl hover:bg-green-500/20 transition-all">Copy for WhatsApp</button>
                                </div>
                             </div>
                           )}

                           <div className="mt-8 pt-6 border-t border-white/5">
                             {isBroadcasting ? (
                               <div className="space-y-4">
                                 <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                   <span>Transmitting...</span>
                                   <span>{progress}%</span>
                                 </div>
                                 <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                   <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                 </div>
                               </div>
                             ) : (
                               <button 
                                 onClick={handleBroadcast}
                                 className={`w-full font-black py-5 rounded-2xl transition-all shadow-xl uppercase text-xs tracking-[0.2em] active:scale-95 ${previewMode === 'email' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                               >
                                 Execute Broadcast
                               </button>
                             )}
                           </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {view === 'library' && (
                <div className="space-y-12 animate-in">
                  {/* Pending Reviews */}
                  {pendingArticles.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Pending <span className="text-amber-500">Reviews</span></h2>
                        <span className="bg-amber-100 text-amber-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">{pendingArticles.length} Awaiting</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {pendingArticles.map((article) => (
                          <div key={article.id} className="bg-white p-6 rounded-3xl border-2 border-amber-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:shadow-lg transition-all">
                            <div className="flex-grow pr-8">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[8px] font-black uppercase bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">{article.category}</span>
                                <p className="text-[10px] font-black text-slate-400 uppercase font-mono">{article.created_at?.seconds ? new Date(article.created_at.seconds * 1000).toLocaleString() : 'N/A'}</p>
                              </div>
                              <h4 className="font-bold text-slate-800">{article.title}</h4>
                              <p className="text-xs text-slate-500 line-clamp-1">{article.excerpt}</p>
                              <div className="mt-2">
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Contributor: {article.suggested_by}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                              <button 
                                onClick={() => handleApproveArticle(article.id)} 
                                className="flex-1 md:flex-none text-[10px] font-black uppercase text-white bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl transition-all"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleRejectArticle(article.id)} 
                                className="flex-1 md:flex-none text-[10px] font-black uppercase text-white bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Published Vault */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Published <span className="text-blue-600">Vault</span></h2>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{approvedArticles.length} Entries</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {approvedArticles.map((article) => (
                        <div key={article.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:shadow-lg transition-all">
                          <div className="flex-grow pr-8">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[8px] font-black uppercase bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{article.category}</span>
                              <p className="text-[10px] font-black text-slate-400 uppercase font-mono">{article.created_at?.seconds ? new Date(article.created_at.seconds * 1000).toLocaleString() : 'N/A'}</p>
                            </div>
                            <h4 className="font-bold text-slate-800">{article.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1">{article.excerpt}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[8px] font-bold text-slate-400 uppercase">By {article.suggested_by}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1"><i className="fas fa-heart text-red-400"></i> {article.likes_count || 0}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto">
                            <button 
                              onClick={() => { setDraft({ subject: `Check out: ${article.title}`, body: article.content }); setView('intelligence'); }} 
                              className="flex-1 md:flex-none text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 px-6 py-3 bg-blue-50 rounded-xl transition-all"
                            >
                              Broadcast
                            </button>
                            <button 
                              onClick={() => handleDeleteArticle(article.id)} 
                              className="flex-1 md:flex-none text-[10px] font-black uppercase text-red-600 hover:text-red-700 px-6 py-3 bg-red-50 rounded-xl transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {view === 'history' && (
                <div className="space-y-8 animate-in">
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Broadcast <span className="text-slate-400">Archive</span></h2>
                  <div className="grid grid-cols-1 gap-4">
                    {history.map((log) => (
                      <div key={log.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:shadow-lg transition-all">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1 font-mono">{new Date(log.sent_at).toLocaleString()}</p>
                          <h4 className="font-bold text-slate-800">{log.title}</h4>
                          <p className="text-xs text-slate-500">Reach: {log.reach} students</p>
                        </div>
                        <button onClick={() => { setDraft({ subject: log.title, body: log.content }); setView('intelligence'); }} className="w-full md:w-auto text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 px-6 py-3 bg-blue-50 rounded-xl transition-all">Reuse Draft</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
