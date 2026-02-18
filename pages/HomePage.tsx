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
            <div className="w-full max-w-[400px] lg:max-w-none order-1 lg:order-2 flex justify-center items-center relative animate-in">
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-600/10 blur-[100px] transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
              
              <svg 
                viewBox="0 0 140 120" 
                className="w-full h-auto drop-shadow-[0_0_20px_rgba(59,130,246,0.3)] filter contrast-125"
              >
                <style>
                  {`
                    .draw-path {
                      stroke-dasharray: 600;
                      stroke-dashoffset: 600;
                      transition: stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .animate-draw { stroke-dashoffset: 0; }
                    .flicker { animation: laptopFlicker 5s infinite; }
                    @keyframes laptopFlicker {
                      0%, 100% { opacity: 0.7; }
                      50% { opacity: 1; }
                    }
                  `}
                </style>
                <path className={`draw-path ${isLoaded ? 'animate-draw' : ''}`} d="M25 20 H115 V75 H25 Z" fill="none" stroke="#3b82f6" strokeWidth="1.2" />
                <rect x="28" y="23" width="84" height="49" fill={isLoaded ? "rgba(59,130,246,0.08)" : "transparent"} className="flicker" />
                <path className={`draw-path ${isLoaded ? 'animate-draw' : ''}`} d="M25 75 L5 95 H135 L115 75 Z" fill="none" stroke="#3b82f6" strokeWidth="1.2" />
                <path d="M30 75 H110" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Content - Bottom on Mobile, Left on Desktop */}
            <div className="flex-1 space-y-6 text-center lg:text-left order-2 lg:order-1 z-10 animate-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Learn Tech Skills for 2026</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-8xl font-black leading-tight tracking-tight text-white">
                Study better. <br />
                Learn <span className="text-blue-500">Faster.</span>
              </h1>

              <p className="text-gray-400 text-base md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                The easiest way for Nigerian students to pass JAMB, WAEC, and build a career in technology.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link to="/study" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25">
                  <Terminal size={18} />
                  Start Studying
                  <ChevronRight size={16} />
                </Link>
                
                <Link to="/tools" className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                  View Tools
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pathways */}
      <section className="py-20 bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Two Ways to <span className="text-blue-600">Win</span></h2>
            <p className="text-gray-400 text-sm md:text-base font-medium">Excel in school or start your tech journey today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            <Link to="/study" className="group relative bg-white/5 rounded-[2.5rem] border border-white/5 p-8 md:p-12 overflow-hidden hover:border-blue-500/30 transition-all duration-300">
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  <i className="fas fa-book"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Academic Help</h3>
                  <p className="text-gray-500 text-sm mt-2">Study for JAMB, WAEC, and track your uni grades easily.</p>
                </div>
                <div className="pt-4">
                  <span className="text-blue-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                    Open Hub <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/study" className="group relative bg-blue-600 rounded-[2.5rem] p-8 md:p-12 overflow-hidden hover:scale-[1.02] transition-all duration-300">
              <div className="relative z-10 space-y-6 text-white">
                <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  <Terminal size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Tech Career</h3>
                  <p className="text-white/70 text-sm mt-2">Step-by-step plans for Coding, UI/UX Design, and Data.</p>
                </div>
                <div className="pt-4">
                  <span className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                    Start Coding <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-[#050505] py-20">
        <div className="text-center mb-10">
          <span className="text-blue-500 font-bold text-[10px] uppercase tracking-[0.3em] block mb-2">Helpful Tools</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Built for <span className="text-blue-600">You</span></h2>
        </div>
        <FeatureCarousel />
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight">Ready to <span className="text-black">start?</span></h2>
            <p className="text-white/80 text-lg max-w-lg mx-auto font-medium">Join thousands of Nigerian students studying on MindGrid.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="bg-black text-white px-10 py-4 rounded-xl font-bold text-sm uppercase transition-all hover:bg-white hover:text-black">
                Join Today
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;