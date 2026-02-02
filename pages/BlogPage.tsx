
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdPlaceholder from '../components/AdPlaceholder';
import SocialBuzzCarousel from '../components/SocialBuzzCarousel';
import { fetchLatestNews } from '../services/geminiService';

const BlogPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const categories = ['All', 'JAMB', 'WAEC', 'Scholarships', 'University', 'Tech', 'Career'];

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      const queryCategory = activeCategory === 'All' ? 'Nigerian Education and Tech news' : `Nigerian ${activeCategory} news`;
      const data = await fetchLatestNews(queryCategory);
      setArticles(data);
      setIsLoading(false);
    };

    loadNews();
  }, [activeCategory]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Social Buzz Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            Social Buzz
          </div>
          <h2 className="text-xl font-black text-slate-800">What's Trending <span className="text-slate-400 font-normal">Among Students</span></h2>
        </div>
        <SocialBuzzCarousel />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 mb-2 flex items-center gap-3">
            MindGrid <span className="text-green-600">Daily</span>
            <span className="bg-red-500 text-white text-[10px] uppercase px-2 py-1 rounded animate-pulse">Live</span>
          </h1>
          <p className="text-slate-500">Verified academic and tech updates, pulled fresh every few hours.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeCategory === cat ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
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
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex flex-col md:flex-row gap-6 bg-white p-6 rounded-2xl border border-slate-100">
                  <div className="w-full md:w-64 h-48 bg-slate-200 rounded-xl"></div>
                  <div className="flex-grow space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-20 bg-slate-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            articles.map((post, i) => (
              <article key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row border border-slate-100 group">
                <div className="w-full md:w-64 h-52 bg-slate-100 relative overflow-hidden flex-shrink-0">
                  <img 
                    src={`https://picsum.photos/seed/${encodeURIComponent(post.title)}/600/400`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt="Post thumbnail" 
                  />
                  <div className="absolute top-4 left-4">
                     <span className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold shadow-sm">
                       {post.category}
                     </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold mb-3">
                      <span className="text-slate-400">{post.date || 'Today'}</span>
                      <span className="text-green-600">• Verified Article</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-green-600 cursor-pointer">
                      <a href={post.url} target="_blank" rel="noopener noreferrer">{post.title}</a>
                    </h2>
                    <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <a 
                      href={post.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 font-bold text-sm hover:translate-x-1 transition-transform inline-flex items-center gap-2"
                    >
                      Read on Original Site <i className="fas fa-external-link-alt text-[10px]"></i>
                    </a>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <i className="fas fa-newspaper text-slate-200 text-6xl mb-4"></i>
              <p className="text-slate-500 font-medium">No live updates found for this category right now. Try another!</p>
            </div>
          )}
          
          <div className="flex justify-center py-8">
             <button 
               onClick={() => window.location.reload()}
               className="bg-white border border-slate-200 px-8 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
             >
               <i className="fas fa-sync-alt"></i> Force Refresh News
             </button>
          </div>
        </div>

        <aside className="space-y-8">
          <AdPlaceholder slot="sidebar-top" className="h-[250px]" />
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg mb-4 border-b pb-2 flex items-center gap-2">
               <i className="fas fa-bolt text-orange-400"></i> Local Tech Buzz
            </h3>
            <div className="space-y-4">
              {[
                { t: 'Nigerian Startup funding trends Q1 2024', u: 'https://techpoint.africa' },
                { t: 'New NITDA regulations for digital economy', u: 'https://nitda.gov.ng' },
                { t: 'Top 5 Tech hubs in Lagos to visit this week', u: 'https://google.com' },
              ].map((news, i) => (
                <div key={i} className="group cursor-pointer">
                  <p className="text-xs text-slate-400 mb-1">Trending Source</p>
                  <a href={news.u} target="_blank" className="font-semibold text-sm group-hover:text-blue-600 line-clamp-2">
                    {news.t}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-xl mb-2">Verified Content</h3>
              <p className="text-xs text-slate-400 mb-6">Our news is grounded in real-time Google Search data to ensure accuracy for JAMB and WAEC updates.</p>
              <Link to="/tools" className="w-full bg-green-500 text-white px-4 py-3 rounded-xl font-bold text-sm block text-center hover:bg-green-400 transition-colors">More Tools</Link>
            </div>
            <i className="fas fa-shield-alt absolute -right-4 -bottom-4 text-white/5 text-8xl transform -rotate-12"></i>
          </div>

          <AdPlaceholder slot="sidebar-bottom" className="h-[400px]" />
        </aside>
      </div>
    </div>
  );
};

export default BlogPage;
