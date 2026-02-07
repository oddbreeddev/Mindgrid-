
import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onOpenNewsletter: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenNewsletter }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-white font-bold text-xl flex items-center gap-2">
              <div className="bg-green-600 p-1.5 rounded-md text-white">
                <i className="fas fa-brain text-xs"></i>
              </div>
              MindGrid
            </h3>
            <p className="text-sm">Empowering Nigerian students with the tools and knowledge to excel academically and professionally.</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-green-500 transition-colors"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="hover:text-green-500 transition-colors"><i className="fab fa-twitter"></i></a>
              <a href="#" className="hover:text-green-500 transition-colors"><i className="fab fa-instagram"></i></a>
              <a href="#" className="hover:text-green-500 transition-colors"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/blog" className="hover:text-white transition-colors">JAMB News</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Scholarship Board</Link></li>
              <li><Link to="/tools" className="hover:text-white transition-colors">CGPA Calculator</Link></li>
              <li><Link to="/ai-hub" className="hover:text-white transition-colors">AI Study Assistant</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">MindGrid Intelligence</h4>
            <p className="text-sm mb-6">Join 24,000+ students. Get the latest exam updates and scholarship alerts delivered to your feed.</p>
            
            <button 
              onClick={onOpenNewsletter}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 px-4 rounded-2xl transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-900/40 active:scale-95"
            >
              <i className="fas fa-paper-plane text-[10px]"></i>
              Activate Alerts
            </button>
            <p className="text-[9px] text-slate-500 mt-4 uppercase tracking-[0.2em] font-bold text-center">Verified by AI</p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} MindGrid Nigeria. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
