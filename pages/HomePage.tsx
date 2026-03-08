import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Share2, Terminal, Cpu, Sparkles, ChevronRight, ArrowRight } from 'lucide-react';
import FeatureCarousel from '../components/FeatureCarousel';

const HomePage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-0 overflow-x-hidden bg-[#050505]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-[#050505] pt-10 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#1e40af 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }}>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">
            
            {/* SVG Illustration - Top on Mobile, Right on Desktop */}
            <div className="w-full max-w-[600px] lg:max-w-none order-1 lg:order-2 flex justify-center items-center relative animate-in">
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-600/10 blur-[100px] transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
              
              <svg 
                viewBox="0 0 140 120" 
                className="w-full h-auto drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] filter contrast-125"
              >
                <style>
                  {`
                    .draw-path {
                      stroke-dasharray: 600;
                      stroke-dashoffset: 600;
                      transition: stroke-dashoffset 2.5s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .animate-draw {
                      stroke-dashoffset: 0;
                    }
                    .flicker {
                      animation: laptopFlicker 6s infinite;
                    }
                    @keyframes laptopFlicker {
                      0%, 100% { opacity: 0.8; filter: brightness(1); }
                      50% { opacity: 1; filter: brightness(1.3); }
                    }
                  `}
                </style>

                {/* 3D DEPTH: Side walls of the laptop base */}
                <path 
                  className={`draw-path ${isLoaded ? 'animate-draw' : ''}`}
                  style={{ transitionDelay: '0.8s' }}
                  d="M5 95 L5 100 L135 100 L135 95" 
                  fill="none" 
                  stroke="#1d4ed8" 
                  strokeWidth="0.5" 
                />
                <path 
                  className={`draw-path ${isLoaded ? 'animate-draw' : ''}`}
                  style={{ transitionDelay: '0.9s' }}
                  d="M5 100 L135 100" 
                  fill="none" 
                  stroke="#1d4ed8" 
                  strokeWidth="0.2" 
                  strokeOpacity="0.5"
                />

                {/* Laptop Screen Frame */}
                <path 
                  className={`draw-path ${isLoaded ? 'animate-draw' : ''}`}
                  d="M25 20 H115 V75 H25 Z" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="1.2" 
                  strokeLinejoin="round"
                />
                
                {/* Screen Content Area */}
                <rect 
                  x="28" y="23" width="84" height="49" 
                  fill={isLoaded ? "rgba(59,130,246,0.08)" : "transparent"}
                  className="transition-all duration-1000 delay-[2000ms] flicker"
                />

                {/* Laptop Base / Top Deck */}
                <path 
                  className={`draw-path ${isLoaded ? 'animate-draw' : ''}`}
                  style={{ transitionDelay: '0.4s' }}
                  d="M25 75 L5 95 H135 L115 75 Z" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="1.2" 
                  strokeLinejoin="round"
                />

                {/* KEYBOARD GRID: High realism keys */}
                <g className={`draw-path ${isLoaded ? 'animate-draw' : ''}`} style={{ transitionDelay: '1.2s' }}>
                  <path d="M18 82 H122 M14 87 H126 M10 92 H130" fill="none" stroke="#3b82f6" strokeWidth="0.3" strokeOpacity="0.4" />
                  <path d="M35 78 L25 95 M50 78 L45 95 M65 78 L65 95 M80 78 L85 95 M95 78 L105 95 M110 78 L125 95" fill="none" stroke="#3b82f6" strokeWidth="0.3" strokeOpacity="0.4" />
                  <path d="M60 92 L58 95 H82 L80 92 Z" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.7" />
                </g>

                {/* Hinge detail */}
                <path 
                  className={`draw-path ${isLoaded ? 'animate-draw' : ''}`}
                  style={{ transitionDelay: '0.6s' }}
                  d="M30 75 H110" 
                  fill="none" 
                  stroke="#1e40af" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
                
                {/* Screen Graphics */}
                {isLoaded && (
                  <g className="opacity-0 animate-[fadeIn_1s_ease-out_2.5s_forwards]">
                    <rect x="35" y="30" width="20" height="2" rx="1" fill="#3b82f6" fillOpacity="0.6" />
                    <rect x="35" y="35" width="35" height="2" rx="1" fill="#3b82f6" fillOpacity="0.4" />
                    <rect x="35" y="40" width="15" height="2" rx="1" fill="#3b82f6" fillOpacity="0.5" />
                    
                    <text x="70" y="62" fontSize="5" fill="#3b82f6" textAnchor="middle" className="font-mono font-bold tracking-widest uppercase" style={{ fontFamily: 'monospace' }}>
                      MINDGRID OS v2.4
                    </text>
                    
                    <circle cx="70" cy="21.5" r="0.5" fill="#3b82f6" />
                  </g>
                )}
              </svg>
            </div>

            {/* Content - Bottom on Mobile, Left on Desktop */}
            <div className="flex-1 space-y-8 text-center lg:text-left order-2 lg:order-1 z-10 animate-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium animate-pulse">
                <Sparkles size={14} />
                <span>New: Tech Career Roadmaps for 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-8xl font-black leading-[1.1] tracking-tight text-white">
                Education <br />
                meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Innovation</span>
              </h1>

              <p className="text-gray-400 text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Nigeria's first hybrid platform for academic excellence and tech skills. 
                Master your degree while building your industry-standard tech stack.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link to="/study" className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25">
                  <Terminal size={18} />
                  Start Learning
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link to="/tools" className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                  Explore Tools
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* University Trust Marquee */}
      <section className="bg-[#0a0a0a] border-y border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-12">Championing Success in the Top Institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-20 font-black text-sm uppercase tracking-widest text-white grayscale">
            <span>UNILAG</span>
            <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
            <span>U.I Ibadan</span>
            <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
            <span>ABU Zaria</span>
            <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
            <span>Covenant Uni</span>
            <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
            <span>FUTA Akure</span>
          </div>
        </div>
      </section>

      {/* Pathways */}
      <section className="py-32 bg-[#050505] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-white">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">Your Dual <span className="text-blue-600">Roadmap.</span></h2>
            <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">Excel in your degree. Dominate the tech industry.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Academic Path */}
            <Link to="/study" className="group relative bg-white/5 rounded-[4rem] border border-white/5 p-14 overflow-hidden shadow-2xl hover:shadow-blue-900/20 transition-all duration-500 hover:-translate-y-2">
              <div className="relative z-10 space-y-10">
                <div className="w-24 h-24 bg-blue-600 text-white rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl shadow-blue-900/40 group-hover:rotate-6 transition-transform">
                  <i className="fas fa-book-bookmark"></i>
                </div>
                <div>
                  <h3 className="text-5xl font-black text-white tracking-tight">CramZone</h3>
                  <p className="text-slate-400 text-lg mt-4 font-medium leading-relaxed">JAMB syllabus coverage, WAEC prep, and university honors tracking.</p>
                </div>
                <div className="pt-8">
                  <span className="bg-white text-slate-950 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all">Launch Hub</span>
                </div>
              </div>
              <i className="fas fa-graduation-cap absolute -right-16 -bottom-16 text-[22rem] text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none"></i>
            </Link>

            {/* Tech Career Path */}
            <Link to="/study" className="group relative bg-blue-700 rounded-[4rem] p-14 overflow-hidden shadow-2xl shadow-blue-900/40 hover:-translate-y-2 transition-all duration-500">
              <div className="relative z-10 space-y-10 text-white">
                <div className="w-24 h-24 bg-[#050505] text-white rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl group-hover:rotate-6 transition-transform">
                  <Terminal size={48} />
                </div>
                <div>
                  <h3 className="text-5xl font-black tracking-tight">Tech Career</h3>
                  <p className="text-blue-100/70 text-lg mt-4 font-medium leading-relaxed">Step-by-step roadmaps for Software Engineering, UI/UX, and AI.</p>
                </div>
                <div className="pt-8">
                  <span className="bg-[#050505] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-white group-hover:text-slate-950 transition-all">Start Coding</span>
                </div>
              </div>
              <i className="fas fa-microchip absolute -right-16 -bottom-16 text-[22rem] text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Showcase Components */}
      <section className="bg-[#0a0a0a] py-40 border-y border-white/5">
        <div className="text-center mb-24 space-y-4">
          <span className="text-blue-500 font-black text-[10px] uppercase tracking-[0.5em] block">Core Intelligence</span>
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">Everything to <span className="text-blue-600 italic">Win.</span></h2>
        </div>
        <FeatureCarousel />
      </section>

      {/* Footer CTA */}
      <section className="max-w-7xl mx-auto px-4 py-20 md:py-40">
        <div className="bg-blue-600 rounded-[3rem] md:rounded-[5rem] p-12 md:p-32 text-center text-white relative overflow-hidden shadow-[0_0_100px_-10px_rgba(37,99,235,0.4)]">
          <div className="relative z-10 space-y-8 md:space-y-12">
            <h2 className="text-5xl md:text-9xl font-black tracking-tighter leading-none text-white">Ready for the <br/><span className="text-[#050505] italic">Grid?</span></h2>
            <p className="text-blue-100 text-lg md:text-xl max-w-xl mx-auto font-medium opacity-80">Join 50,000+ Nigerian scholars building their legacy on MindGrid today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="bg-[#050505] text-white px-10 md:px-14 py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all active:scale-95 shadow-2xl">
                Join Now
              </Link>
              <button className="bg-white/10 border border-white/20 text-white px-10 md:px-14 py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[30rem] h-[30rem] bg-white/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[30rem] h-[30rem] bg-[#050505]/20 rounded-full blur-[120px]"></div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;