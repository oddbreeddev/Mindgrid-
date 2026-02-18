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
    description: 'Get fast answers to any JAMB or WAEC question. It is like having a private teacher in your pocket.',
    icon: Cpu,
    color: 'from-blue-500 to-indigo-600',
    path: '/ai-hub',
    tag: 'Intelligence'
  },
  {
    title: 'Student Chat',
    description: 'See what other students are talking about. Share tips and school news with everyone.',
    icon: MessageSquare,
    color: 'from-pink-500 to-rose-600',
    path: '/feed',
    tag: 'Community'
  },
  {
    title: 'Grade Tracker',
    description: 'Easily check your GPA. Works for all Nigerian schools on both 5.0 and 4.0 scales.',
    icon: Calculator,
    color: 'from-emerald-500 to-teal-600',
    path: '/tools/cgpa',
    tag: 'Academic'
  },
  {
    title: 'Study Plan',
    description: 'Tell us your goal and we will make a personalized reading plan just for you.',
    icon: Calendar,
    color: 'from-orange-500 to-amber-600',
    path: '/tools/timetable',
    tag: 'Planning'
  },
  {
    title: 'Course Finder',
    description: 'Find out the subjects and marks you need for any course in any Nigerian university.',
    icon: Compass,
    color: 'from-violet-500 to-purple-600',
    path: '/tools/course-finder',
    tag: 'Admission'
  },
  {
    title: 'The Study Vault',
    description: 'A large collection of reading guides and academic resources hand-picked by our team.',
    icon: BookOpen,
    color: 'from-sky-500 to-blue-700',
    path: '/library',
    tag: 'Resources'
  },
  {
    title: 'Tech Roadmaps',
    description: 'Start your tech career. We have easy-to-follow plans for Python, Web Design, and Data Science.',
    icon: Code,
    color: 'from-slate-700 to-slate-900',
    path: '/study',
    tag: 'Careers'
  },
  {
    title: 'Daily News',
    description: 'Keep up with the latest school news, scholarships, and campus updates in Nigeria.',
    icon: Newspaper,
    color: 'from-cyan-500 to-blue-600',
    path: '/blog',
    tag: 'Live'
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
    <div className="relative w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 px-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-blue-500" size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">MindGrid Core Features</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Everything you <span className="text-blue-500">need</span></h2>
          <p className="text-gray-400 text-sm font-medium mt-2 max-w-md">Our tools are built specifically for Nigerian students to help you excel in school and tech.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={back} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative h-[480px] md:h-[400px]">
        {ITEMS.map((item, idx) => {
          const isActive = idx === active;
          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                isActive ? 'opacity-100 scale-100 translate-y-0 z-10' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
              }`}
            >
              <div className={`w-full h-full bg-gradient-to-br ${item.color} rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10 md:gap-16 border border-white/10`}>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 blur-[100px] pointer-events-none -rotate-12 translate-x-1/2"></div>
                
                <div className="w-28 h-28 md:w-44 md:h-44 bg-white/10 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center shrink-0 border border-white/20 shadow-2xl transform hover:scale-105 transition-transform duration-500">
                  <item.icon size={56} className="md:w-20 md:h-20" strokeWidth={1.5} />
                </div>
                
                <div className="text-center md:text-left flex-grow">
                  <span className="inline-block bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-white/10">
                    {item.tag} Hub
                  </span>
                  <h3 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">{item.title}</h3>
                  <p className="text-white/80 text-base md:text-xl mb-10 max-w-xl leading-relaxed font-medium">
                    {item.description}
                  </p>
                  <Link 
                    to={item.path} 
                    className="inline-flex items-center gap-3 bg-white text-gray-900 px-10 py-4 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-all shadow-xl active:scale-95 group/btn"
                  >
                    Go to Tool
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <item.icon className="absolute -right-16 -bottom-16 text-white/5 w-[30rem] h-[30rem] rotate-12 pointer-events-none" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-3 mt-10">
        {ITEMS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            className={`h-2 rounded-full transition-all duration-500 ${idx === active ? 'w-12 bg-blue-500' : 'w-2 bg-white/10 hover:bg-white/20'}`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeatureCarousel;