
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface CarouselItem {
  title: string;
  description: string;
  icon: string;
  color: string;
  path: string;
  tag?: string;
}

const ITEMS: CarouselItem[] = [
  {
    title: 'AI Study Assistant',
    description: 'Get instant answers to complex academic questions using our Gemini-powered tutor.',
    icon: 'fa-robot',
    color: 'from-emerald-500 to-green-600',
    path: '/ai-hub',
    tag: 'Popular'
  },
  {
    title: 'CGPA Calculator',
    description: 'Accurately track your academic progress with our 5.0 and 4.0 scale calculators.',
    icon: 'fa-calculator',
    color: 'from-blue-500 to-indigo-600',
    path: '/tools/cgpa',
    tag: 'Essential'
  },
  {
    title: 'Study Timetable',
    description: 'Let AI generate a balanced weekly schedule for your JAMB or WAEC exams.',
    icon: 'fa-calendar-check',
    color: 'from-orange-500 to-red-600',
    path: '/tools/timetable',
    tag: 'New'
  },
  {
    title: 'Daily News Feed',
    description: 'Verified updates on scholarships, university admissions, and Nigerian tech buzz.',
    icon: 'fa-newspaper',
    color: 'from-purple-500 to-pink-600',
    path: '/blog',
    tag: 'Live'
  },
  {
    title: 'Tech Careers',
    description: 'Find internship opportunities and graduate trainee programs in Lagos and beyond.',
    icon: 'fa-briefcase',
    color: 'from-slate-700 to-slate-900',
    path: '/careers'
  }
];

const FeatureCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ITEMS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % ITEMS.length);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + ITEMS.length) % ITEMS.length);

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-800">Explore <span className="text-green-600">MindGrid</span></h2>
        <div className="flex gap-2">
          <button onClick={prevSlide} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button onClick={nextSlide} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="relative h-[320px] md:h-[280px]">
        {ITEMS.map((item, idx) => {
          const isActive = idx === activeIndex;
          const isPrev = idx === (activeIndex - 1 + ITEMS.length) % ITEMS.length;
          const isNext = idx === (activeIndex + 1) % ITEMS.length;

          return (
            <div
              key={idx}
              className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ease-in-out transform ${
                isActive ? 'opacity-100 scale-100 z-20 translate-x-0' : 
                isPrev ? 'opacity-0 -translate-x-full scale-95 z-10' : 
                'opacity-0 translate-x-full scale-95 z-10'
              }`}
            >
              <div className={`w-full h-full bg-gradient-to-br ${item.color} rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden group`}>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 h-full">
                  <div className="bg-white/20 backdrop-blur-md w-20 h-20 md:w-32 md:h-32 rounded-3xl flex items-center justify-center text-3xl md:text-5xl shrink-0">
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <div className="text-center md:text-left flex-grow">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                       {item.tag && <span className="bg-white/20 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full w-fit mx-auto md:mx-0">{item.tag}</span>}
                       <h3 className="text-2xl md:text-4xl font-black">{item.title}</h3>
                    </div>
                    <p className="text-white/80 text-sm md:text-lg max-w-xl mb-6">{item.description}</p>
                    <Link 
                      to={item.path} 
                      className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors"
                    >
                      Get Started <i className="fas fa-arrow-right text-xs"></i>
                    </Link>
                  </div>
                </div>
                {/* Decorative background icon */}
                <i className={`fas ${item.icon} absolute -right-10 -bottom-10 text-[15rem] text-white/5 transform rotate-12 pointer-events-none`}></i>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {ITEMS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all ${idx === activeIndex ? 'w-8 bg-green-600' : 'w-2 bg-slate-200'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeatureCarousel;
