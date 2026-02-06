
import React, { useState, useEffect } from 'react';
// Added missing import for Link
import { Link } from 'react-router-dom';
import AdPlaceholder from '../components/AdPlaceholder';
import SocialBuzzCarousel from '../components/SocialBuzzCarousel';
import { getNews } from '../services/dataService';

const SkeletonArticle: React.FC = () => (
  <div className="animate-pulse flex flex-col md:flex-row gap-6 bg-white p-6 rounded-2xl border border-slate-100">
    <div className="w-full md:w-64 h-52 bg-slate-200 rounded-xl"></div>
    <div className="flex-grow space-y-4">
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      <div className="h-8 bg-slate-200 rounded w-3/4"></div>
      <div className="h-20 bg-slate-200 rounded w-full"></div>
    </div>
  </div>
);

const BlogPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);
  
  const categories = ['All', 'JAMB', 'WAEC', 'Scholarships', 'University', 'Tech', 'Career'];

  const loadNews = async () => {
    setIsLoading(true);
    try {
      const data = await getNews(activeCategory);
      setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <SocialBuzzCarousel />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <h1 className="text-4xl font-black text-slate-800">MindGrid <span className="text-green-600">Live</span></h1>
             {articles.some(a => a.isRealtime) && (
               <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded animate-pulse uppercase">Live AI Search</span>
             )}
          </div>
          <p className="text-slate-500 font-medium">Verified updates from the web, curated by AI.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => {
                setActiveCategory(cat);
                setVisibleCount(5);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeCategory === cat ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-green-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map(i => <SkeletonArticle key={i} />)}
            </div>
          ) : (
            <div className="space-y-10">
              {articles.slice(0, visibleCount).map((post, i) => (
                <article key={i} className="bg-white rounded-[2rem] overflow-hidden shadow-sm flex flex-col md:flex-row border border-slate-100 group animate-in relative" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-full md:w-64 h-52 bg-slate-100 flex-shrink-0 relative overflow-hidden">
                    <img 
                      src={`https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=600&category=${post.category}&sig=${i}`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt="news" 
                    />
                    <div className="absolute top-4 left-4">
                       <span className="bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-lg">{post.category}</span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{post.date}</span>
                      {post.isRealtime && <i className="fas fa-bolt text-amber-400 text-xs" title="Real-time update"></i>}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-3 leading-tight group-hover:text-green-600 transition-colors">{post.title}</h2>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 font-medium">{post.excerpt}</p>
                    <a href={post.url} target="_blank" className="inline-flex items-center gap-3 text-green-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-all">
                      Read Source <i className="fas fa-arrow-right text-[10px]"></i>
                    </a>
                  </div>
                </article>
              ))}
              
              {articles.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                   <div className="mb-4 text-slate-200 text-6xl"><i className="fas fa-search"></i></div>
                   <p className="text-slate-400 font-bold">No live updates found in "{activeCategory}" right now.</p>
                   <button onClick={loadNews} className="mt-4 text-green-600 font-bold hover:underline">Try Refreshing</button>
                </div>
              )}
            </div>
          )}

          {!isLoading && visibleCount < articles.length && (
            <div className="flex justify-center py-8">
              <button onClick={() => setVisibleCount(v => v + 5)} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                Load More Updates
              </button>
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
             <h3 className="text-slate-800 font-black text-lg mb-6 flex items-center gap-2">
               <i className="fas fa-info-circle text-green-600"></i> Why Gemini?
             </h3>
             <p className="text-slate-500 text-sm leading-relaxed mb-4">
               MindGrid uses <strong>Google Search Grounding</strong> to verify all news items. Our AI scans millions of pages to bring you only what matters for Nigerian students.
             </p>
             <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
               <p className="text-xs text-green-700 font-bold italic">"Information is the currency of excellence."</p>
             </div>
          </div>

          <AdPlaceholder slot="sidebar-top" className="h-[250px]" />
          
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
             <div className="relative z-10">
               <h3 className="font-black text-xl mb-4">Exam Countdown</h3>
               <p className="text-sm text-slate-400 mb-6">Stay ahead of JAMB and WAEC deadlines. Never miss a registration date again.</p>
               <Link to="/ai-hub" className="w-full bg-green-600 text-white font-black py-4 rounded-xl hover:bg-green-500 transition-colors block text-center uppercase text-xs tracking-widest">
                 Ask AI for Deadlines
               </Link>
             </div>
             <i className="fas fa-clock absolute -right-4 -bottom-4 text-8xl text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform"></i>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogPage;
