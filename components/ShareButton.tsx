import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Share2, Link as LinkIcon, Twitter, Facebook, MessageCircle, X as CloseIcon } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
  variant?: 'icon' | 'full' | 'outline' | 'ghost';
  iconOnly?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  title, 
  text, 
  url = window.location.href, 
  className = '', 
  variant = 'icon',
  iconOnly = false
}) => {
  const { showToast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleNativeShare = async () => {
    const shareData = { title, text, url };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShowMenu(false);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setShowMenu(true); // Fallback to custom menu
        }
      }
    } else {
      setShowMenu(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      const fullShareText = `${title}\n${text}\n${url}`;
      await navigator.clipboard.writeText(fullShareText);
      showToast('Link & info copied to clipboard!', 'success');
      setShowMenu(false);
    } catch (err) {
      showToast('Failed to copy info', 'error');
    }
  };

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + "\n" + text + "\n" + url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };

  const baseStyles = "flex items-center justify-center transition-all active:scale-95 shrink-0 relative";
  
  const variants = {
    icon: `w-10 h-10 bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl ${className}`,
    ghost: `text-slate-400 hover:text-blue-600 text-sm ${className}`,
    outline: `border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${className}`,
    full: `bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 ${className}`
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button 
        onClick={handleNativeShare} 
        className={`${baseStyles} ${variants[variant]}`}
        title="Share Platform"
      >
        <Share2 size={16} className={`${!iconOnly && variant !== 'icon' ? 'mr-2' : ''}`} />
        {!iconOnly && variant !== 'icon' && <span>Share</span>}
      </button>

      {showMenu && (
        <div className="absolute bottom-full mb-4 right-0 md:right-auto md:left-0 w-48 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-2 z-[100] animate-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center px-3 py-2 border-b border-white/5 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Share Node</span>
            <button onClick={() => setShowMenu(false)} className="text-gray-500 hover:text-white"><CloseIcon size={12} /></button>
          </div>
          <div className="space-y-1">
            <a 
              href={shareLinks.whatsapp} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm text-gray-300 font-bold group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <MessageCircle size={16} />
              </div>
              WhatsApp
            </a>
            <a 
              href={shareLinks.twitter} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm text-gray-300 font-bold group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-400 group-hover:text-white transition-all">
                <Twitter size={16} />
              </div>
              X (Twitter)
            </a>
            <a 
              href={shareLinks.facebook} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm text-gray-300 font-bold group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-400 group-hover:text-white transition-all">
                <Facebook size={16} />
              </div>
              Facebook
            </a>
            <button 
              onClick={copyToClipboard}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm text-gray-300 font-bold group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-500/10 text-slate-400 flex items-center justify-center group-hover:bg-slate-400 group-hover:text-white transition-all">
                <LinkIcon size={16} />
              </div>
              Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;