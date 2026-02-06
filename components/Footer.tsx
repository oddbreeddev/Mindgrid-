
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToNewsletter } from '../services/dataService';
import { useToast } from '../context/ToastContext';

const Footer: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await subscribeToNewsletter(email, ['General Updates'], 'email');
      if (result.success) {
        setStatus('success');
        setEmail('');
        showToast('Successfully subscribed to MindGrid!', 'success');
      } else {
        setStatus('error');
        showToast(result.error || 'Failed to subscribe', 'error');
      }
    } catch (err) {
      setStatus('error');
      showToast('A network error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h4 className="text-white font-semibold mb-4">Newsletter</h4>
            <p className="text-sm mb-4">Get the latest exam updates and scholarship alerts.</p>
            
            {status === 'success' ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 animate-in">
                <div className="flex items-center gap-2 text-green-400 font-bold text-sm mb-1">
                  <i className="fas fa-check-circle"></i> Subscribed!
                </div>
                <p className="text-[10px] text-slate-400">Welcome to the inner circle.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
                <input 
                  type="email" 
                  required
                  placeholder="Email address" 
                  className="bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-600 outline-none transition-all placeholder:text-slate-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                <button 
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 active:scale-95"
                >
                  {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane text-xs"></i>}
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
                {status === 'error' && (
                  <p className="text-[10px] text-red-400 font-bold text-center mt-2">Failed to join. Please try again.</p>
                )}
              </form>
            )}
            <p className="text-[9px] text-slate-500 mt-4 uppercase tracking-widest font-bold">24,000+ Students Joined</p>
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
