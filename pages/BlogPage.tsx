
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdPlaceholder from '../components/AdPlaceholder';
import SocialBuzzCarousel from '../components/SocialBuzzCarousel';
import { fetchLatestNews } from '../services/geminiService';

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
  const [visibleCount, setVisibleCount] = useState(3);
  const [refreshCooldown, setRefreshCooldown] = useState(0);
  
  const categories = ['All', 'JAMB', 'WAEC', 'Scholarships', 'University', 'Tech', 'Career'];

  const loadNews = async (isRefresh = false) => {
    if (isRefresh && refreshCooldown > 0) return;
    
    setIsLoading(true);
    try {
      const data = await fetchLatestNews(activeCategory === 'All' ? 'Nigerian Education' : activeCategory, isRefresh);
      setArticles(data);
      if (isRefresh) setRefreshCooldown(60); // 1 minute cooldown for manual refresh
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [activeCategory]);

  useEffect(() => {
    if (refreshCooldown > 0) {
      const timer = setTimeout(() => setRefreshCooldown(refreshCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [refreshCooldown]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <SocialBuzzCarousel />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">MindGrid <span className="text-green-600">Daily</span></h1>
          <p className="text-slate-500">Live academic and tech updates with smart caching.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeCategory === cat ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200'}`}
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
                <article key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row border border-slate-100 group">
                  <div className="w-full md:w-64 h-48 bg-slate-100 flex-shrink-0">
                    <img src={`https://picsum.photos/seed/${post.title}/600/400`} className="w-full h-full object-cover" alt="news" />
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2">{post.title}</h2>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                    <a href={post.url} target="_blank" className="text-green-600 font-bold text-sm">Read More</a>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="flex flex-col items-center gap-4 py-8">
            {visibleCount < articles.length && (
              <button onClick={() => setVisibleCount(v => v + 3)} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold">Load More</button>
            )}
            <button 
              onClick={() => loadNews(true)}
              disabled={refreshCooldown > 0 || isLoading}
              className="text-slate-400 text-sm font-bold hover:text-green-600 disabled:opacity-50 flex items-center gap-2"
            >
              <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i>
              {refreshCooldown > 0 ? `Wait ${refreshCooldown}s to refresh` : 'Force Refresh News'}
            </button>
          </div>
        </div>

        <aside className="space-y-8">
          <AdPlaceholder slot="sidebar-top" className="h-[250px]" />
          <div className="bg-slate-900 p-8 rounded-3xl text-white">
             <h3 className="font-bold text-xl mb-4">Smart Cache Active</h3>
             <p className="text-xs text-slate-400 leading-relaxed">To keep this platform free, we refresh news every 4 hours. Manual refreshes are limited to once per minute.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogPage;
