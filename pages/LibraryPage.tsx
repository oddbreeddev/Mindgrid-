
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getCuratedArticles, saveCuratedArticle } from '../services/dataService';
import { generateFullArticle, isAIConfigured } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';

const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm animate-pulse flex flex-col h-full">
    <div className="flex justify-between items-start mb-5">
      <div className="bg-slate-100 w-10 h-10 rounded-xl"></div>
      <div className="h-4 bg-slate-100 rounded w-16"></div>
    </div>
    <div className="h-6 bg-slate-100 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-slate-100 rounded w-full mb-6"></div>
    <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between">
      <div className="h-3 bg-slate-100 rounded w-20"></div>
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

  useEffect(() => { loadArticles(); }, []);

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
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 overflow-x-hidden">
      <div className="mb-8 md:mb-12 text-center max-w-3xl mx-auto px-2">
        <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-4 tracking-tighter">Academic <span className="text-green-600">Archive</span></h1>
        <p className="text-slate-500 text-sm md:text-lg font-medium leading-relaxed">Nigeria's premier vault of educational wisdom. Every guide is permanently archived for future scholars.</p>
      </div>

      <div className="bg-slate-900 p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] text-white shadow-2xl mb-12 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-4">Add to the Vault</h2>
            <p className="text-slate-400 text-sm font-medium mb-6 md:mb-8">Request a specialized guide. Our AI will research, draft, and archive it.</p>
            <div className="flex flex-col sm:flex-row bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-lg gap-2">
              <input 
                type="text" 
                placeholder="e.g. Pass JAMB Physics" 
                className="flex-grow bg-transparent px-4 py-3 md:py-4 text-sm focus:outline-none text-white placeholder:text-slate-600 font-medium"
                value={suggestionTopic}
                onChange={(e) => setSuggestionTopic(e.target.value)}
                disabled={isGenerating}
              />
              <button 
                onClick={() => handleGenerate(suggestionTopic)}
                disabled={isGenerating || !suggestionTopic.trim()}
                className="bg-green-600 hover:bg-green-500 text-white font-black px-6 py-3 md:py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50"
              >
                {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-plus"></i>}
                {isGenerating ? 'Curating' : 'Request'}
              </button>
            </div>
            {isGenerating && (
              <div className="mt-4 flex items-center gap-2 animate-pulse justify-center md:justify-start">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-green-500">{genStatus}</p>
              </div>
            )}
          </div>
          <div className="bg-white/5 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><i className="fas fa-search text-green-500"></i> Explorer</h3>
            <input 
              type="text" 
              placeholder="Search keywords..." 
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {!searchQuery && activeCategory === 'All' && featured.length > 0 && (
        <section className="mb-12 md:mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-widest">New <span className="text-green-600">Discoveries</span></h2>
            <div className="h-px flex-grow bg-slate-200"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {featured.map((article, i) => (
              <DiscoveryCard key={article.id || i} article={article} onClick={() => setSelectedArticle(article)} i={i} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-widest">Archive <span className="text-slate-400">Records</span></h2>
          </div>
          <div className="w-full overflow-x-auto no-scrollbar py-2">
            <div className="flex gap-2 min-w-max">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 md:px-6 md:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-green-600 text-white shadow-xl shadow-green-200' : 'bg-white text-slate-400 border border-slate-100'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
          ) : archives.length > 0 ? (
            archives.map((article, i) => (
              <ArchiveCard key={article.id || i} article={article} onClick={() => setSelectedArticle(article)} i={i} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-slate-100">
              <i className="fas fa-inbox text-slate-100 text-6xl mb-4"></i>
              <p className="text-slate-400 font-bold">No archives match your search.</p>
            </div>
          )}
        </div>
      </section>

      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm animate-in p-0 md:p-4">
          <div className="bg-white w-full h-full md:h-auto md:max-w-5xl md:max-h-[95vh] md:rounded-[3.5rem] overflow-hidden flex flex-col shadow-2xl relative">
            <div className="p-6 md:p-12 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 sticky top-0 z-10">
              <div className="max-w-3xl pr-8">
                <span className="bg-green-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3 shadow-md">
                  {selectedArticle.category} Records
                </span>
                <h2 className="text-xl md:text-4xl font-black text-slate-800 leading-tight mb-2">{selectedArticle.title}</h2>
                <div className="flex items-center gap-3 text-[9px] md:text-[10px] text-slate-400 font-bold uppercase">
                  <span>Contributor: {selectedArticle.suggested_by?.split('@')[0]}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span>{new Date(selectedArticle.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedArticle(null)} 
                className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm shrink-0"
              >
                <i className="fas fa-times text-xl md:text-2xl"></i>
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 md:p-20 scroll-smooth bg-white">
              <div className="prose prose-sm md:prose-lg max-w-none 
                prose-h2:font-black prose-h2:text-slate-800 prose-h2:mb-4 prose-h2:mt-10 
                prose-h3:text-green-600 prose-h3:font-black prose-h3:mt-8
                prose-p:leading-relaxed prose-p:text-slate-600 prose-p:mb-6
                prose-strong:text-slate-900 prose-strong:font-black">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedArticle.content}
                </ReactMarkdown>
              </div>

              <div className="mt-16 p-8 md:p-12 bg-slate-900 rounded-[2rem] md:rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl hidden md:flex items-center justify-center text-white text-3xl shrink-0"><i className="fas fa-check-circle"></i></div>
                  <div>
                    <h4 className="text-xl font-black mb-1">Archival Integrity Verified</h4>
                    <p className="text-slate-400 text-xs">Stored in the MindGrid Library for all Nigerian scholars.</p>
                  </div>
                </div>
                <button onClick={() => setSelectedArticle(null)} className="w-full md:w-auto bg-white text-slate-900 px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest">Done Reading</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DiscoveryCard = ({ article, onClick, i }: any) => (
  <article onClick={onClick} className="bg-white p-6 md:p-8 rounded-[2rem] border-b-4 border-green-500 shadow-sm hover:shadow-xl transition-all cursor-pointer group animate-in h-full flex flex-col" style={{ animationDelay: `${i * 0.1}s` }}>
    <div className="flex justify-between items-start mb-4">
      <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center text-green-600"><CategoryIcon category={article.category} /></div>
      <span className="text-[8px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-full">New Entry</span>
    </div>
    <h3 className="text-lg md:text-2xl font-black text-slate-800 mb-3 leading-tight line-clamp-2">{article.title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">{article.excerpt}</p>
    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
      <span className="text-[9px] text-slate-400 font-black uppercase">By {article.suggested_by?.split('@')[0]}</span>
      <span className="text-green-600 font-black text-[9px] uppercase tracking-widest flex items-center gap-1">Read <i className="fas fa-arrow-right"></i></span>
    </div>
  </article>
);

const ArchiveCard = ({ article, onClick, i }: any) => (
  <article onClick={onClick} className="bg-white p-5 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group animate-in flex flex-col h-full" style={{ animationDelay: `${i * 0.05}s` }}>
    <div className="flex justify-between items-start mb-4">
      <div className="bg-slate-50 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400"><CategoryIcon category={article.category} /></div>
      <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 px-2 py-0.5 border border-slate-100 rounded-lg">{article.category}</span>
    </div>
    <h3 className="text-sm font-black text-slate-800 mb-2 line-clamp-2">{article.title}</h3>
    <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-3 flex-grow">{article.excerpt}</p>
    <div className="pt-3 mt-3 border-t border-slate-50 flex items-center justify-between">
      <span className="text-[7px] text-slate-400 font-bold uppercase truncate max-w-[70px]">By {article.suggested_by?.split('@')[0]}</span>
      <i className="fas fa-lock text-green-600 text-[8px]"></i>
    </div>
  </article>
);

export default LibraryPage;
