import React, { useState } from 'react';
import { subscribeToNewsletter } from '../services/dataService';
import { useToast } from '../context/ToastContext';
import { X, Mail, MessageCircle, Sparkles } from 'lucide-react';

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
        showToast('Success! You are now subscribed.', 'success');
        localStorage.setItem('mindgrid_subscribed', 'true');
        onClose();
      } else {
        showToast(result.error || 'Please check your connection.', 'error');
      }
    } catch (err) {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md p-0 md:p-4 transition-all duration-300 animate-in fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white w-full md:max-w-xl md:rounded-[2.5rem] rounded-t-[2.5rem] overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-all z-20"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-500/20">
              <Sparkles size={28} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Stay <span className="text-blue-500">Updated</span></h2>
            <p className="text-gray-500 text-sm mt-2 font-medium">Get JAMB alerts, scholarships, and school news first.</p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-6">
            <div className="flex bg-gray-100 p-1.5 rounded-2xl">
              <button 
                type="button"
                onClick={() => setPlatform('email')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${platform === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
              >
                <Mail size={14} /> Email
              </button>
              <button 
                type="button"
                onClick={() => setPlatform('whatsapp')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${platform === 'whatsapp' ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-400'}`}
              >
                <MessageCircle size={14} /> WhatsApp
              </button>
            </div>

            <input 
              type={platform === 'email' ? 'email' : 'tel'}
              required
              placeholder={platform === 'email' ? 'Your email address' : 'Your WhatsApp number'}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-gray-700 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button 
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-blue-500 text-white font-bold py-5 rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95 disabled:opacity-50 text-sm"
            >
              {isSubmitting ? 'Joining...' : 'Get Updates'}
            </button>

            <p className="text-[10px] text-center text-gray-400 font-medium">No spam, just helpful school info. Unsubscribe anytime.</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsletterModal;