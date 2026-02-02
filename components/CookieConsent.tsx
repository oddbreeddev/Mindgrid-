import React, { useState, useEffect } from 'react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('mindgrid_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('mindgrid_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-slate-900 text-white p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-auto border border-white/10">
        <div className="text-sm">
          <p className="font-semibold mb-1">We value your privacy 🍪</p>
          <p className="text-slate-400">We use cookies to enhance your experience, serve personalized ads (via Google AdSense), and analyze our traffic. By clicking "Accept", you consent to our use of cookies.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={accept}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;