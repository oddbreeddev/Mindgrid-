
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdPlaceholder from '../components/AdPlaceholder';
import SocialBuzzCarousel from '../components/SocialBuzzCarousel';
import { getNews } from '../services/dataService';
import ShareButton from '../components/ShareButton';

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

  const cleanText = (text: string) => {
    if (!text) return "";
    return text.replace(/[\*\#\_\~\`\>]/g, '').replace(/\[.*\]\(.*\)/g, '').replace(/\s+/g, ' ').trim();
  };

  const getBlogImage = (category: string, index: number) => {
    const cat = category?.toLowerCase() || 'general';
    const images: Record<string, string[]> = {
      jamb: ['1434030216411-0b793f4b4173', '1516321318423-f06f85e504b3', '1454165833222-d1d44d60ed67'],
      waec: ['1503676260728-1c00da096a0b', '1521587760476-6c120c2d309d', '1546410531-bb4caa6b424d'],
      scholarships: ['1523050335392-93851179ae09', '1541339907198-e08756ebafe3', '1519389950473-47ba0277781c'],
      university: ['1562774053-701939374585', '1523580494863-d97976f990a6', '1492176861649-430f8249a46c'],
      tech: ['1498050108023-c5249f4df085', '1461749280664-7a9d2a7c5c2a', '1550751827-4bd374c3f58b'],
      career: ['1521791136668-7a43f7558f39', '1552664730-d307ca884978', '1517245386807-bb43f82c33c4'],
      general: ['1488190211464-844cb1a1c5b0', '1522202176988-66273c2fd55f', '1491840681634-70a91ae7340d']
    };
    const pool = images[cat] || images['general'];
    const imageId = pool[index % pool.length];
    return `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&q=80&w=800`;
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const newsData = await getNews(activeCategory);
      setArticles(newsData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <SocialBuzzCarousel />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h1 className="text-4xl font-black text-slate-800">MindGrid <span className="text-green-600">Live</span></h1>
             {articles.some(a => a.isRealtime) && (
               <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded animate-pulse uppercase tracking-widest">Live Search</span>
             )}
          </div>
          <p className="text-slate-500 font-medium">Real-time educational updates and news verified by AI.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => { setActiveCategory(cat); setVisibleCount(5); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeCategory === cat ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:border-green-300'}`}
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
                <article key={i} className="bg-white rounded-[2rem] overflow-hidden shadow-sm flex flex-col md:flex-row border border-slate-100 group animate-in">
                  <div className="w-full md:w-64 h-52 bg-slate-100 flex-shrink-0 relative overflow-hidden">
                    <img src={getBlogImage(post.category, i)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={post.category} />
                    <div className="absolute top-4 left-4">
                       <span className="bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-lg">{post.category || 'News'}</span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{post.date}</span>
                      <ShareButton 
                        variant="ghost" 
                        title={cleanText(post.title)} 
                        text={`Latest Update from MindGrid: ${cleanText(post.title)}`}
                        url={post.url}
                        iconOnly
                      />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-3 leading-tight group-hover:text-green-600 transition-colors">{cleanText(post.title)}</h2>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 font-medium">{cleanText(post.excerpt)}</p>
                    <div className="flex items-center gap-6">
                      <a href={post.url} target="_blank" className="inline-flex items-center gap-3 text-green-600 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-all">
                        Read Source <i className="fas fa-arrow-right text-[10px]"></i>
                      </a>
                      <ShareButton 
                        variant="outline"
                        title={post.title}
                        text={`Important student update: ${post.title}`}
                        url={post.url}
                      />
                    </div>
                  </div>
                </article>
              ))}
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
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
             <div className="relative z-10">
               <h3 className="font-black text-xl mb-4 text-green-400">Deep Dives?</h3>
               <p className="text-sm text-slate-400 mb-6 leading-relaxed">Looking for long-form academic guides and student-suggested topics?</p>
               <Link to="/library" className="w-full bg-white text-slate-900 font-black py-4 rounded-xl hover:bg-slate-100 transition-colors block text-center uppercase text-xs tracking-widest">
                 Visit The Library
               </Link>
             </div>
             <i className="fas fa-book-open absolute -right-4 -bottom-4 text-8xl text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform"></i>
          </div>

          <AdPlaceholder slot="sidebar-top" className="h-[250px]" />
          
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
             <h3 className="text-slate-800 font-black text-lg mb-6 flex items-center gap-2">
               <i className="fas fa-info-circle text-green-600"></i> AI Verification
             </h3>
             <p className="text-slate-500 text-sm leading-relaxed mb-6">
               MindGrid uses <strong>Google Search Grounding</strong> to verify all news items. Our AI scans millions of pages to bring you only what matters.
             </p>
             <ShareButton 
               variant="outline"
               title="MindGrid Intelligence"
               text="Check out MindGrid for real-time Nigerian academic news and AI study tools!"
               className="w-full"
             />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogPage;
