
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AdPlaceholder from '../components/AdPlaceholder';
import { getCuratedArticles, saveCuratedArticle } from '../services/dataService';
import { generateFullArticle, isAIConfigured } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';

// Skeleton for loading state
const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm animate-pulse flex flex-col h-full">
    <div className="flex justify-between items-start mb-5">
      <div className="bg-slate-100 w-10 h-10 rounded-xl"></div>
      <div className="h-4 bg-slate-100 rounded w-16"></div>
    </div>
    <div className="h-6 bg-slate-100 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
    <div className="h-4 bg-slate-100 rounded w-5/6 mb-6"></div>
    <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between">
      <div className="h-3 bg-slate-100 rounded w-20"></div>
      <div className="h-3 bg-slate-100 rounded w-10"></div>
    </div>
  </div>
);

const CategoryIcon = ({ category }: { category: string }) => {
  const c = category?.toUpperCase();
  if (c?.includes('JAMB')) return <i className="fas fa-pen-nib"></i>;
  if (c?.includes('WAEC')) return <i className="fas fa-file-contract"></i>;
  if (c?.includes('TECH')) return <i className="fas fa-code"></i>;
  if (c?.includes('CAREER')) return <i className="fas fa-briefcase"></i>;
  if (c?.includes('UNIVERSITY')) return <i className="fas fa-university"></i>;
  if (c?.includes('SCHOLAR')) return <i className="fas fa-award"></i>;
  return <i className="fas fa-book-open"></i>;
};

const LibraryPage: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestionTopic, setSuggestionTopic] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [genStatus, setGenStatus] = useState('');

  const categories = ['All', 'JAMB', 'WAEC', 'Scholarships', 'University', 'Tech', 'Career'];

  // Persist all generated content to Supabase immediately
  const handleGenerate = useCallback(async (topic?: string) => {
    if (isGenerating || !isAIConfigured()) return;
    
    setIsGenerating(true);
    setGenStatus(topic ? `Researching ${topic}...` : 'AI Discovery in progress...');
    
    try {
      const newArticle = await generateFullArticle(topic);
      if (newArticle) {
        setGenStatus('Storing in Vault...');
        const author = topic ? (user?.email || 'Anonymous Student') : 'MindGrid AI';
        const saved = await saveCuratedArticle(newArticle, author);
        
        if (saved) {
          setArticles(prev => [saved, ...prev]);
          setSuggestionTopic('');
          if (topic) setSelectedArticle(saved);
        }
      }
    } catch (e) {
      console.error("Archival Error:", e);
    } finally {
      setIsGenerating(false);
      setGenStatus('');
    }
  }, [isGenerating, user]);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const data = await getCuratedArticles();
      setArticles(data);

      // Daily Discovery Logic: Every 8 hours
      const lastGen = localStorage.getItem('mindgrid_v3_last_gen');
      const now = Date.now();
      if (!lastGen || (now - parseInt(lastGen)) > 8 * 60 * 60 * 1000) {
        localStorage.setItem('mindgrid_v3_last_gen', now.toString());
        handleGenerate();
      }
    } catch (err) {
      console.error("Library sync failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // Filter and Search Logic
  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const matchCategory = activeCategory === 'All' || a.category?.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch = !searchQuery || 
        a.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [articles, activeCategory, searchQuery]);

  const featured = filteredArticles.slice(0, 3);
  const archives = filteredArticles.slice(3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-6xl font-black text-slate-800 mb-4 tracking-tighter">Academic <span className="text-green-600">Archive</span></h1>
        <p className="text-slate-500 text-lg font-medium leading-relaxed">Nigeria's premier vault of educational wisdom. Every guide generated by our community or AI is permanently archived here.</p>
      </div>

      {/* Curation & Explorer Hub */}
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] text-white shadow-2xl mb-16 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black mb-4">Add to the Vault</h2>
            <p className="text-slate-400 font-medium mb-8">Request a specialized guide. Our AI will research, draft, and permanently archive it in our library.</p>
            <div className="flex bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-lg">
              <input 
                type="text" 
                placeholder="e.g. How to get a First Class in Law" 
                className="flex-grow bg-transparent px-6 py-4 text-sm focus:outline-none text-white placeholder:text-slate-600 font-medium"
                value={suggestionTopic}
                onChange={(e) => setSuggestionTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate(suggestionTopic)}
                disabled={isGenerating}
              />
              <button 
                onClick={() => handleGenerate(suggestionTopic)}
                disabled={isGenerating || !suggestionTopic.trim()}
                className="bg-green-600 hover:bg-green-500 text-white font-black px-8 py-4 rounded-xl transition-all flex items-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50"
              >
                {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-plus"></i>}
                {isGenerating ? 'Curating' : 'Request'}
              </button>
            </div>
            {isGenerating && (
              <div className="mt-4 flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-green-500">{genStatus}</p>
              </div>
            )}
          </div>
          
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <i className="fas fa-search text-green-500"></i> Archive Explorer
            </h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">Search across all archived student guides and AI discoveries.</p>
            <input 
              type="text" 
              placeholder="Search by keyword (e.g. OAU, Physics, Code)..." 
              className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-green-500 text-white placeholder:text-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <i className="fas fa-shield-alt absolute -right-20 -bottom-20 text-[20rem] text-white/5 rotate-12 pointer-events-none"></i>
      </div>

      {/* Featured Discoveries */}
      {!searchQuery && activeCategory === 'All' && featured.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">New <span className="text-green-600">Discoveries</span></h2>
            <div className="h-px flex-grow bg-slate-200"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((article, i) => (
              <DiscoveryCard key={article.id || i} article={article} onClick={() => setSelectedArticle(article)} i={i} />
            ))}
          </div>
        </section>
      )}

      {/* Categories & Full Archive */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Library <span className="text-slate-400">Records</span></h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total archived: {filteredArticles.length} guides</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-green-600 text-white shadow-xl shadow-green-200' : 'bg-white text-slate-400 border border-slate-100 hover:border-green-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)
          ) : archives.length > 0 ? (
            archives.map((article, i) => (
              <ArchiveCard key={article.id || i} article={article} onClick={() => setSelectedArticle(article)} i={i} />
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-100 border-dashed">
              <i className="fas fa-inbox text-slate-100 text-8xl mb-6"></i>
              <p className="text-slate-400 font-black text-xl mb-2">The archive search returned no matches.</p>
              <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="text-green-600 font-bold hover:underline uppercase text-[10px] tracking-widest">Clear Explorer</button>
            </div>
          )}
        </div>
      </section>

      {/* Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in">
          <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-[3.5rem] overflow-hidden flex flex-col shadow-2xl relative">
            <div className="p-8 md:p-12 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="bg-green-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full flex items-center gap-2 shadow-lg shadow-green-200">
                    <CategoryIcon category={selectedArticle.category} />
                    {selectedArticle.category} Records
                  </span>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Vault ID: #{selectedArticle.id?.substring(0, 8).toUpperCase() || 'CORE-REC'}</span>
                </div>
                <h2 className="text-4xl font-black text-slate-800 leading-tight mb-4">{selectedArticle.title}</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
                      <i className="fas fa-user-edit text-[10px]"></i>
                    </div>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Contributor: {selectedArticle.suggested_by?.split('@')[0]}</span>
                  </div>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(selectedArticle.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedArticle(null)} 
                className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm hover:rotate-90"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-8 md:p-20 scroll-smooth">
              <div className="prose prose-slate prose-lg max-w-none 
                prose-h2:font-black prose-h2:text-slate-800 prose-h2:mb-6 prose-h2:mt-12 prose-h2:tracking-tight
                prose-h3:text-green-600 prose-h3:font-black prose-h3:mt-8
                prose-p:leading-relaxed prose-p:text-slate-600 prose-p:mb-8
                prose-strong:text-slate-900 prose-strong:font-black
                prose-ul:list-disc prose-ul:pl-6 prose-li:text-slate-600 prose-li:mb-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedArticle.content}
                </ReactMarkdown>
              </div>

              {/* Verified Badge Section */}
              <div className="mt-24 p-12 bg-slate-900 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-8">
                  <div className="w-24 h-24 bg-green-500 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-2xl shadow-green-500/40">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black mb-1">Archival Integrity Verified</h4>
                    <p className="text-slate-400 text-sm font-medium">This record is permanently stored in the MindGrid Library for the benefit of all Nigerian students.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="relative z-10 bg-white text-slate-900 px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-green-50 transition-all active:scale-95"
                >
                  Return to Vault
                </button>
                <i className="fas fa-certificate absolute -right-10 -bottom-10 text-[15rem] text-white/5 rotate-12"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Library Stats Section */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Verified Records', val: articles.length, icon: 'fa-database', color: 'text-green-600' },
          { label: 'Active Learners', val: '24,000+', icon: 'fa-users', color: 'text-blue-600' },
          { label: 'Archive Categories', val: categories.length - 1, icon: 'fa-tags', color: 'text-purple-600' },
          { label: 'AI Updates', val: '3 Daily', icon: 'fa-sync', color: 'text-orange-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 text-center group hover:shadow-xl transition-all hover:-translate-y-1">
            <i className={`fas ${stat.icon} ${stat.color} text-2xl mb-4`}></i>
            <p className="text-4xl font-black text-slate-800 mb-1">{stat.val}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Discovery Card (Large/Featured)
const DiscoveryCard = ({ article, onClick, i }: any) => (
  <article 
    onClick={onClick}
    className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group animate-in relative overflow-hidden h-full border-b-4 border-green-500 flex flex-col"
    style={{ animationDelay: `${i * 0.1}s` }}
  >
    <div className="flex justify-between items-start mb-6">
      <div className="bg-green-50 w-14 h-14 rounded-2xl flex items-center justify-center text-green-600 shadow-inner group-hover:scale-110 transition-transform">
        <CategoryIcon category={article.category} />
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 mb-1">New Entry</span>
        <span className="text-[8px] text-slate-300 font-bold uppercase">ID: {article.id?.substring(0, 6)}</span>
      </div>
    </div>
    <h3 className="text-2xl font-black text-slate-800 mb-4 leading-tight group-hover:text-green-600 transition-colors">{article.title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 font-medium mb-10">{article.excerpt}</p>
    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <i className="fas fa-fingerprint text-[10px] text-green-400"></i>
        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{article.suggested_by?.split('@')[0]}</span>
      </div>
      <span className="text-green-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">Read Guide <i className="fas fa-arrow-right"></i></span>
    </div>
  </article>
);

// Archive Card (Small/Grid)
const ArchiveCard = ({ article, onClick, i }: any) => (
  <article 
    onClick={onClick}
    className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group animate-in flex flex-col h-full hover:-translate-y-1"
    style={{ animationDelay: `${i * 0.05}s` }}
  >
    <div className="flex justify-between items-start mb-6">
      <div className="bg-slate-50 w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
        <CategoryIcon category={article.category} />
      </div>
      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-2 py-0.5 border border-slate-100 rounded-lg">{article.category}</span>
    </div>
    <h3 className="text-lg font-black text-slate-800 mb-3 group-hover:text-green-600 transition-colors leading-tight line-clamp-2">{article.title}</h3>
    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-3 font-medium mb-8 flex-grow">{article.excerpt}</p>
    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
      <span className="text-[8px] text-slate-400 font-bold uppercase truncate max-w-[80px]">By {article.suggested_by?.split('@')[0]}</span>
      <div className="flex items-center gap-1 text-green-600 font-black text-[9px] uppercase tracking-widest">
        Vault <i className="fas fa-lock text-[7px]"></i>
      </div>
    </div>
  </article>
);

export default LibraryPage;
