
import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onOpenNewsletter: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenNewsletter }) => {
  return (
    <footer className="bg-slate-950 text-slate-500 py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
          <div className="space-y-6">
            <h3 className="text-white font-black text-2xl flex items-center gap-3 tracking-tighter uppercase">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <i className="fas fa-brain"></i>
              </div>
              MindGrid
            </h3>
            <p className="text-sm leading-relaxed">The ultimate intelligence operating system for Nigerian scholars. Excellence starts at the Grid.</p>
            <div className="flex space-x-6 text-xl">
              <a href="#" className="hover:text-blue-500 transition-colors"><i className="fab fa-x-twitter"></i></a>
              <a href="#" className="hover:text-blue-500 transition-colors"><i className="fab fa-instagram"></i></a>
              <a href="#" className="hover:text-blue-500 transition-colors"><i className="fab fa-linkedin-in"></i></a>
              <a href="#" className="hover:text-blue-500 transition-colors"><i className="fab fa-tiktok"></i></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Ecosystem</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/study" className="hover:text-blue-500 transition-colors">Study Hub</Link></li>
              <li><Link to="/ai-hub" className="hover:text-blue-500 transition-colors">AI Research Hub</Link></li>
              <li><Link to="/tools" className="hover:text-blue-500 transition-colors">Calculators</Link></li>
              <li><Link to="/library" className="hover:text-blue-500 transition-colors">Academic Archive</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Authority</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/about" className="hover:text-blue-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-500 transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-500 transition-colors">Data Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-500 transition-colors">Rules of Entry</Link></li>
            </ul>
          </div>

          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-4">MindGrid Intel</h4>
            <p className="text-xs mb-8 leading-relaxed">Join 24k+ scholars. Activate the intelligence feed for scholarships and exam hacks.</p>
            
            <button 
              onClick={onOpenNewsletter}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-4 rounded-2xl transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95"
            >
              <i className="fas fa-bolt text-[10px]"></i>
              Activate Intel
            </button>
            <p className="text-[9px] text-slate-600 mt-6 uppercase tracking-[0.3em] font-black text-center">Encrypted Protocol</p>
          </div>
        </div>
        <div className="mt-24 pt-8 border-t border-white/5 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">
          <p>&copy; {new Date().getFullYear()} MindGrid Nigeria Core. Built for 2026.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
