import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, 
  Calculator, 
  Calendar, 
  Newspaper, 
  MessageSquare, 
  BookOpen, 
  Compass,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Code,
  Sparkles
} from 'lucide-react';

const ITEMS = [
  {
    title: 'AI Study Friend',
    description: 'Ask any JAMB or WAEC question and get fast answers.',
    icon: Cpu,
    color: 'from-blue-500 to-indigo-600',
    path: '/ai-hub',
    tag: 'Helper'
  },
  {
    title: 'Student Chat',
    description: 'Connect with other students and share school gist.',
    icon: MessageSquare,
    color: 'from-pink-500 to-rose-600',
    path: '/feed',
    tag: 'Community'
  },
  {
    title: 'Grade Tracker',
    description: 'Check your GPA on both 5.0 and 4.0 scales easily.',
    icon: Calculator,
    color: 'from-emerald-500 to-teal-600',
    path: '/tools/cgpa',
    tag: 'Grades'
  },
  {
    title: 'Study Plan',
    description: 'Get a personalized reading plan made just for you.',
    icon: Calendar,
    color: 'from-orange-500 to-amber-600',
    path: '/tools/timetable',
    tag: 'Reading'
  },
  {
    title: 'Course Finder',
    description: 'Find subject and mark needs for any course.',
    icon: Compass,
    color: 'from-violet-500 to-purple-600',
    path: '/tools/course-finder',
    tag: 'Admission'
  },
  {
    title: 'Study Vault',
    description: 'A big library of reading guides and school resources.',
    icon: BookOpen,
    color: 'from-sky-500 to-blue-700',
    path: '/library',
    tag: 'Books'
  },
  {
    title: 'Tech Roadmaps',
    description: 'Start your career with simple plans for coding and design.',
    icon: Code,
    color: 'from-slate-700 to-slate-900',
    path: '/study',
    tag: 'Careers'
  },
  {
    title: 'Daily News',
    description: 'Keep up with school news and scholarships in Nigeria.',
    icon: Newspaper,
    color: 'from-cyan-500 to-blue-600',
    path: '/blog',
    tag: 'News'
  }
];

const FeatureCarousel: React.FC = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((p) => (p + 1) % ITEMS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setActive((p) => (p + 1) % ITEMS.length);
  const back = () => setActive((p) => (p - 1 + ITEMS.length) % ITEMS.length);

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 py-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 px-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="text-blue-500" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Core Tools</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">Everything you <span className="text-blue-500">need</span></h2>
        </div>
        <div className="flex gap-2">
          <button onClick={back} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <ChevronLeft size={18} />
          </button>
          <button onClick={next} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="relative h-[380px] md:h-[300px]">
        {ITEMS.map((item, idx) => {
          const isActive = idx === active;
          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${
                isActive ? 'opacity-100 scale-100 translate-y-0 z-10' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
              }`}
            >
              <div className={`w-full h-full bg-gradient-to-br ${item.color} rounded-[2rem] p-6 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6 md:gap-10 border border-white/10`}>
                <div className="w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                  <item.icon size={40} className="md:w-16 md:h-16" strokeWidth={1.5} />
                </div>
                
                <div className="text-center md:text-left flex-grow">
                  <span className="inline-block bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 border border-white/10">
                    {item.tag} Hub
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-white/80 text-sm md:text-lg mb-6 max-w-lg leading-snug font-medium">
                    {item.description}
                  </p>
                  <Link 
                    to={item.path} 
                    className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-xs hover:bg-blue-50 transition-all shadow-lg active:scale-95"
                  >
                    Open Tool
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {ITEMS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === active ? 'w-10 bg-blue-500' : 'w-1.5 bg-white/10'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeatureCarousel;