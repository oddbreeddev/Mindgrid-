
import React, { useState } from 'react';
import { subscribeToNewsletter } from '../services/dataService';

const NewsletterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [platform, setPlatform] = useState('email');
  const [interests, setInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const categories = [
    { id: 'JAMB', icon: 'fa-pen-nib', label: 'JAMB Updates' },
    { id: 'Scholarships', icon: 'fa-graduation-cap', label: 'Scholarship Alerts' },
    { id: 'University', icon: 'fa-university', label: 'Campus News' },
    { id: 'Tech', icon: 'fa-code', label: 'Tech Internships' },
    { id: 'Career', icon: 'fa-briefcase', label: 'Job Opportunities' }
  ];

  const toggleInterest = (id: string) => {
    setInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    const result = await subscribeToNewsletter(email, interests, platform);
    
    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
    }
    setIsSubmitting(false);
  };

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center text-green-600 text-4xl mx-auto mb-8 shadow-inner animate-bounce">
          <i className="fas fa-check"></i>
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">You're in the <span className="text-green-600">Vault!</span></h1>
        <p className="text-slate-500 text-lg mb-8">We've added your preferences to our database. Watch your {platform} for the next MindGrid Intelligence report.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
        >
          Adjust Preferences
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-800 mb-6 leading-tight tracking-tighter">
            Academic <span className="text-green-600">Intelligence.</span> Delivered.
          </h1>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed max-w-lg">
            Join 24,000+ Nigerian students receiving personalized weekly briefs on scholarships, career pivots, and exam strategies.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-8 bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 border-b-8 border-b-green-600">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-2">Preferred Destination</label>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setPlatform('email')}
                  className={`flex-1 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold ${platform === 'email' ? 'border-green-600 bg-green-50 text-green-700 shadow-inner' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  <i className="fas fa-envelope"></i> Email
                </button>
                <button 
                  type="button"
                  onClick={() => setPlatform('whatsapp')}
                  className={`flex-1 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold ${platform === 'whatsapp' ? 'border-green-600 bg-green-50 text-green-700 shadow-inner' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  <i className="fab fa-whatsapp"></i> WhatsApp
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-2">Contact Info</label>
              <input 
                type={platform === 'email' ? 'email' : 'tel'} 
                required
                placeholder={platform === 'email' ? 'you@university.edu.ng' : '+234 ...'}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-2">Personalize your feed</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleInterest(cat.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${interests.includes(cat.id) ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'}`}
                  >
                    <i className={`fas ${cat.icon} text-sm`}></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white font-black py-5 rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-200 active:scale-95 disabled:opacity-50 uppercase text-xs tracking-[0.2em]"
            >
              {isSubmitting ? <i className="fas fa-spinner fa-spin mr-2"></i> : 'Activate Intelligence Feed'}
            </button>
          </form>
        </div>

        <div className="hidden lg:block">
          <div className="bg-slate-50 rounded-[4rem] p-12 border border-slate-100 relative overflow-hidden">
             <div className="relative z-10">
                <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full mb-8 inline-block shadow-lg">Last Week's Summary</span>
                <div className="space-y-8">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-in">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">#1 Scholarship Insight</p>
                    <h4 className="font-black text-slate-800 text-lg mb-2">How to bypass the 3.5 CGPA requirement for the NNPC Award.</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">It turns out certain states of origin have different merit cutoff levels. Our community verified this for the 2024 cycle...</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-in" style={{ animationDelay: '0.1s' }}>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">#2 Tech Career Hack</p>
                    <h4 className="font-black text-slate-800 text-lg mb-2">3 Remote Startups in Lagos looking for Student UI Interns.</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">Paystack and Moniepoint aren't the only ones. We found three stealth-mode startups currently hiring from UNILAG and FUTA...</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 animate-in" style={{ animationDelay: '0.2s' }}>
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">#3 AI Discovery</p>
                    <h4 className="font-black text-slate-800 text-lg mb-2">Mastering Python by building JAMB CBT practice tools.</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">Kill two birds with one stone. Use your prep time to build a tool that actually helps others while you learn to code...</p>
                  </div>
                </div>
             </div>
             <i className="fas fa-paper-plane absolute -right-20 -bottom-20 text-[20rem] text-slate-200/50 -rotate-12 pointer-events-none"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPage;
