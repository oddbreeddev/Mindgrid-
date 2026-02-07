
import React, { useState, useEffect } from 'react';
import { subscribeToNewsletter } from '../services/dataService';
import { useToast } from '../context/ToastContext';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewsletterModal: React.FC<NewsletterModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [platform, setPlatform] = useState<'email' | 'whatsapp'>('email');
  const [interests, setInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'JAMB', label: 'JAMB' },
    { id: 'Scholarships', label: 'Scholarships' },
    { id: 'University', label: 'University' },
    { id: 'Tech', label: 'Tech' },
    { id: 'Career', label: 'Careers' }
  ];

  const toggleInterest = (id: string) => {
    setInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    try {
      const result = await subscribeToNewsletter(email, interests, platform);
      if (result.success) {
        showToast('You are in the Vault! Welcome.', 'success');
        localStorage.setItem('mindgrid_subscribed', 'true');
        onClose();
      } else {
        showToast(result.error || 'Check your connection.', 'error');
      }
    } catch (err) {
      showToast('Connection error.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in">
      <div 
        className="bg-white w-full md:max-w-xl md:rounded-[3rem] rounded-t-[2.5rem] overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom md:slide-in-from-bottom-0"
        style={{ animationDuration: '0.4s' }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-all z-20"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="bg-green-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-xl shadow-green-200">
              <i className="fas fa-paper-plane"></i>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Join the <span className="text-green-600">Inner Circle</span></h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">Get JAMB alerts, scholarships, and tech jobs first.</p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-6">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button 
                type="button"
                onClick={() => setPlatform('email')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${platform === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                Email
              </button>
              <button 
                type="button"
                onClick={() => setPlatform('whatsapp')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${platform === 'whatsapp' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}
              >
                WhatsApp
              </button>
            </div>

            <input 
              type={platform === 'email' ? 'email' : 'tel'}
              required
              placeholder={platform === 'email' ? 'Enter your email' : '+234 Phone Number'}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 font-medium text-slate-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">I am interested in:</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleInterest(cat.id)}
                    className={`px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all ${interests.includes(cat.id) ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-green-600 text-white font-black py-5 rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-200 active:scale-95 disabled:opacity-50 uppercase text-xs tracking-[0.2em]"
            >
              {isSubmitting ? <i className="fas fa-spinner fa-spin mr-2"></i> : 'Activate Alerts'}
            </button>

            <p className="text-[9px] text-center text-slate-400 font-medium">Join 24,000+ students. Unsubscribe at any time.</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsletterModal;
