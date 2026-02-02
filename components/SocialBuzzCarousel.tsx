
import React, { useState, useEffect } from 'react';
import { fetchSocialBuzz } from '../services/geminiService';

interface BuzzItem {
  platform: 'Twitter' | 'TikTok' | 'Instagram' | 'Facebook';
  topic: string;
  explanation: string;
  trendLevel: number;
}

const SocialBuzzCarousel: React.FC = () => {
  const [buzz, setBuzz] = useState<BuzzItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBuzz = async () => {
      const data = await fetchSocialBuzz();
      if (data && data.length > 0) setBuzz(data);
      setIsLoading(false);
    };
    loadBuzz();
  }, []);

  const getPlatformStyles = (platform: string) => {
    switch (platform) {
      case 'Twitter': return { icon: 'fa-x-twitter', color: 'bg-slate-900', text: 'text-white' };
      case 'TikTok': return { icon: 'fa-tiktok', color: 'bg-[#000000]', text: 'text-white' };
      case 'Instagram': return { icon: 'fa-instagram', color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600', text: 'text-white' };
      default: return { icon: 'fa-facebook', color: 'bg-blue-600', text: 'text-white' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden py-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="min-w-[280px] h-40 bg-slate-200 animate-pulse rounded-3xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 no-scrollbar snap-x scroll-smooth">
        {buzz.map((item, idx) => {
          const style = getPlatformStyles(item.platform);
          return (
            <div 
              key={idx} 
              className="min-w-[300px] md:min-w-[350px] bg-white rounded-3xl border border-slate-100 shadow-sm p-6 snap-center hover:shadow-xl transition-all hover:-translate-y-1 group/card"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`${style.color} ${style.text} w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm`}>
                  <i className={`fab ${style.icon}`}></i>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1 w-3 rounded-full ${i < Math.round(item.trendLevel / 2) ? 'bg-orange-400' : 'bg-slate-100'}`}></div>
                  ))}
                </div>
              </div>
              <h4 className="text-lg font-black text-slate-800 mb-2 line-clamp-1">#{item.topic.replace(/#/g, '')}</h4>
              <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
                {item.explanation}
              </p>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Trending on {item.platform}</span>
                <a 
                  href={`https://google.com/search?q=${encodeURIComponent(item.platform + ' ' + item.topic)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  Join <i className="fas fa-chevron-right text-[8px]"></i>
                </a>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Scroll Indicators for Desktop */}
      <div className="absolute top-1/2 -left-4 -translate-y-1/2 hidden group-hover:block">
        <div className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center border border-slate-100 text-slate-400">
           <i className="fas fa-chevron-left"></i>
        </div>
      </div>
      <div className="absolute top-1/2 -right-4 -translate-y-1/2 hidden group-hover:block">
        <div className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center border border-slate-100 text-slate-400">
           <i className="fas fa-chevron-right"></i>
        </div>
      </div>
    </div>
  );
};

export default SocialBuzzCarousel;
