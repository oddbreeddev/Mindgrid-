
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-white font-bold text-xl">MindGrid</h3>
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
              <li><Link to="/privacy" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Newsletter</h4>
            <p className="text-sm mb-4">Get the latest exam updates and scholarship alerts.</p>
            <form className="flex flex-col space-y-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-slate-800 border-none rounded px-4 py-2 text-sm focus:ring-2 focus:ring-green-600 outline-none"
              />
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">
                Subscribe
              </button>
            </form>
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
